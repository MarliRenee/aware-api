const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const { makeUsersArray } = require('./users.fixtures')
const supertest = require('supertest')

describe('Users Endpoints', function() {
    
    //create the Knex instance to connect to the test database and clear any data so that we know we have clean tables... 
    let db
  
    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
      //We need this inside our tests, it's inaccessible in the server file
        app.set('db', db)
    })
  
    after('disconnect from db', () => db.destroy())
  
    before('clean the table', () => db('aware_users').truncate())
    //and then disconnect from the database so that the tests don't "hang".

    //clean up after each test so the next test has a clean start
    afterEach('cleanup', () => db('aware_users').truncate())
    //********DON'T FORGET TO POPULATE DATABASE WITH 'NPM RUN MIGRATE:TEST'

    //insert some rows into the aware_users table before the test
    //make a context to describe the app in a state where the db has users
    //use beforeEach in that context to insert testUsers

    describe(`GET /api/users`, () => {

        context('Given there are no users in the database', () => {
            it(`responds with 200 and an empty list`, () => {
                return supertest(app)
                .get('/api/users')
                .expect(200, [])
            })
        })

        context('Given there are users in the database', () => {

            const testUsers = makeUsersArray()
    
            beforeEach('insert users', () => {
                return db
                .into('aware_users')
                .insert(testUsers)
            })
    
    
            //The request we want to make is for GET /users and it should respond with all of the users in the database. Let's add this test in our context!
            it('GET /api/users responds with 200 and all of the users', () => {
                return supertest(app)
                .get('/api/users')
                .expect(200)
                // TODO: add more assertions about the body
                //second arrgumentcan be a response to the body we expect
                .expect(200, testUsers)
            })
    
        })

    })
    
    describe(`GET /users/:user_id`, () => {

        const testUsers = makeUsersArray()

        beforeEach('insert users', () => {
            return db
            .into('aware_users')
            .insert(testUsers)
        })
        
        context('Given there are no users in the database', () => {
            it('GET /api/users/:user_id responds with 404', () => {
                const userId = 123456
                const expectedUser = testUsers[userId - 1]
                return supertest(app)
                .get(`/api/users/${userId}`)
                .expect(404, {error: { message: `User doesn't exist`} })
            })
        })

        context('Given there are users in the database', () => {
            it('GET /api/users/:user_id responds with 200 and the specified user', () => {
                const userId = 2
                const expectedUser = testUsers[userId - 1]
                return supertest(app)
                .get(`/api/users/${userId}`)
                .expect(200, expectedUser)
            })
        })



    })

    describe(`POST /api/users`, () => {
        it(`creates a user, responding with 201 and the new user`, function() {
            const newUser = {
                username: 'TestNewUser',
                password: 'Password10'
            }
            return supertest(app)
                .post('/api/users')
                .send(newUser)
                .expect(res => {
                    expect(res.body.username).to.eql(newUser.username)
                    expect(res.body.password).to.eql(newUser.password)
                    expect(res.headers.location).to.eql(`/api/users/${res.body.id}`)
                })
                .then(postRes =>
                    supertest(app)
                    .get(`/api/users/${postRes.body.id}`)
                    .expect(postRes.body)
                )
        })

        //next two are a bit repetetive, consider refactoring and putting them in a loop
        it(`responds with 400 and an error message when the 'username' is missing`, () => {
            return supertest(app)
            .post('/api/users')
            .send({
                password: 'Spacey10',
            })
            .expect(400, {
                error: { message: `Missing 'username' in request body` }
            })
        })

        it(`responds with 400 and an error message when the 'password' is missing`, () => {
            return supertest(app)
            .post('/api/users')
            .send({
                username: 'SpaceyUser',
            })
            .expect(400, {
                error: { message: `Missing 'password' in request body` }
            })
        })
    })

    describe(`DELETE /api/users/:user_id`, () => {

        context(`Given no users`, () => {
            it(`responds with 404`, () => {
            const userId = 123456
            return supertest(app)
                .delete(`/api/users/${userId}`)
                .expect(404, { error: { message: `User doesn't exist` } })
            })
        })

        context('Given there are users in the database', () => {
            const testUsers = makeUsersArray()

            beforeEach('insert users', () => {
            return db
                .into('aware_users')
                .insert(testUsers)
            })

            it('responds with 204 and removes the user', () => {
                const idToRemove = 2
                const expectedUsers = testUsers.filter(user => user.id !== idToRemove)
                return supertest(app)
                    .delete(`/api/users/${idToRemove}`)
                    .expect(204)
                    .then(res =>
                    supertest(app)
                        .get(`/api/users`)
                        .expect(expectedUsers)
                    )
            })
        })
    })

    describe(`PATCH /api/users/:user_id`, () => {
        context(`Given no users`, () => {
            it(`responds with 404`, () => {
                const userId = 123456
                return supertest(app)
                    .patch(`/api/users/${userId}`)
                    .expect(404, { error: { message: `User doesn't exist`} })
            })
        })

        context(`Given there are users in the database`, () => {
            const testUsers = makeUsersArray()

            beforeEach('insert users', () => {
                return db
                    .into('aware_users')
                    .insert(testUsers)
            })

            it(`responds with 204 and updates the user`, () => {
                const idToUpdate = 2

                const updateUser = {
                    username: 'MyUpdatedUser',
                    password: 'MyUpdatedPassword'
                }
                const expectedUser = {
                    ...testUsers[idToUpdate - 1],
                    ...updateUser
                }

                return supertest(app)
                    .patch(`/api/users/${idToUpdate}`)
                    .send(updateUser)
                    .expect(204)
                    .then(res =>
                        supertest(app)
                            .get(`/api/users/${idToUpdate}`)
                            .expect(expectedUser)                            
                    )
            })

            it(`responds with 400 when no required fields supplied`, () => {
                const idToUpdate = 2
                return supertest(app)
                .patch(`/api/users/${idToUpdate}`)
                .send({ irrelevantField: 'foo' })
                .expect(400, {
                    error: {
                    message: `Request body must contain either 'username' or 'password'`
                    }
                })
            })

            it(`responds with 204 when updating only a subset of fields`, () => {
                const idToUpdate = 2
                const updateUser = {
                    username: 'updatedHobbit',
                }
                const expectedUser = {
                    ...testUsers[idToUpdate - 1],
                    ...updateUser
                }
        
                return supertest(app)
                .patch(`/api/users/${idToUpdate}`)
                .send({
                    ...updateUser,
                    fieldToIgnore: 'should not be in GET response'
                })
                .expect(204)
                .then(res =>
                    supertest(app)
                    .get(`/api/users/${idToUpdate}`)
                    .expect(expectedUser)
                )
            })
        })
    })

})