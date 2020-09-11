const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const { makeIcebergsArray } = require('./icebergs.fixtures')
const supertest = require('supertest')

//**NOTE TO SELF ABOUT TEST TABLE NAMES */
//the test "icebergs" table is called "iceberg" SINGULAR because of the renaming snafu. Figure this out later.

describe.only('Iceberg Endpoints', function() {
    
    let db
  
    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
    
        app.set('db', db)
    })
  
    after('disconnect from db', () => db.destroy())

    before('clean the table', () => 
        db.raw('TRUNCATE icebergs RESTART IDENTITY CASCADE')
    );

    afterEach('cleanup', () => 
    db.raw('TRUNCATE icebergs RESTART IDENTITY CASCADE')
    );

    describe(`GET /api/icebergs`, () => {

        context('Given there are no icebergs in the database', () => {
            it(`responds with 200 and an empty list`, () => {
                return supertest(app)
                .get('/api/icebergs')
                .expect(200, [])
            })
        })

        context('Given there are icebergs in the database', () => {

            const testIcebergs = makeIcebergsArray()
    
            beforeEach('insert icebergs', () => {
                return db
                .into('icebergs')
                .insert(testIcebergs)
            })
    
            it('GET /api/icebergs responds with 200 and all of the icebergs', () => {
                return supertest(app)
                .get('/api/icebergs')
                .expect(200, testIcebergs)
            })
    
        })

    })
    
    // describe(`GET /users/:user_id`, () => {

    //     const testUsers = makeUsersArray()

    //     beforeEach('insert users', () => {
    //         return db
    //         .into('aware_users')
    //         .insert(testUsers)
    //     })
        
    //     context('Given there are no users in the database', () => {
    //         it('GET /api/users/:user_id responds with 404', () => {
    //             const userId = 123456
    //             const expectedUser = testUsers[userId - 1]
    //             return supertest(app)
    //             .get(`/api/users/${userId}`)
    //             .expect(404, {error: { message: `User doesn't exist`} })
    //         })
    //     })

    //     context('Given there are users in the database', () => {
    //         it('GET /api/users/:user_id responds with 200 and the specified user', () => {
    //             const userId = 2
    //             const expectedUser = testUsers[userId - 1]
    //             return supertest(app)
    //             .get(`/api/users/${userId}`)
    //             .expect(200, expectedUser)
    //         })
    //     })



    // })

    // describe(`POST /api/users`, () => {
    //     it(`creates a user, responding with 201 and the new user`, function() {
    //         const newUser = {
    //             username: 'TestNewUser',
    //             password: 'Password10'
    //         }
    //         return supertest(app)
    //             .post('/api/users')
    //             .send(newUser)
    //             .expect(res => {
    //                 expect(res.body.username).to.eql(newUser.username)
    //                 expect(res.body.password).to.eql(newUser.password)
    //                 expect(res.headers.location).to.eql(`/api/users/${res.body.id}`)
    //             })
    //             .then(postRes =>
    //                 supertest(app)
    //                 .get(`/api/users/${postRes.body.id}`)
    //                 .expect(postRes.body)
    //             )
    //     })

    //     //next two are a bit repetetive, consider refactoring and putting them in a loop
    //     it(`responds with 400 and an error message when the 'username' is missing`, () => {
    //         return supertest(app)
    //         .post('/api/users')
    //         .send({
    //             password: 'Spacey10',
    //         })
    //         .expect(400, {
    //             error: { message: `Missing 'username' in request body` }
    //         })
    //     })

    //     it(`responds with 400 and an error message when the 'password' is missing`, () => {
    //         return supertest(app)
    //         .post('/api/users')
    //         .send({
    //             username: 'SpaceyUser',
    //         })
    //         .expect(400, {
    //             error: { message: `Missing 'password' in request body` }
    //         })
    //     })
    // })

    // describe(`DELETE /api/users/:user_id`, () => {

    //     context(`Given no users`, () => {
    //         it(`responds with 404`, () => {
    //         const userId = 123456
    //         return supertest(app)
    //             .delete(`/api/users/${userId}`)
    //             .expect(404, { error: { message: `User doesn't exist` } })
    //         })
    //     })

    //     context('Given there are users in the database', () => {
    //         const testUsers = makeUsersArray()

    //         beforeEach('insert users', () => {
    //         return db
    //             .into('aware_users')
    //             .insert(testUsers)
    //         })

    //         it('responds with 204 and removes the user', () => {
    //             const idToRemove = 2
    //             const expectedUsers = testUsers.filter(user => user.id !== idToRemove)
    //             return supertest(app)
    //                 .delete(`/api/users/${idToRemove}`)
    //                 .expect(204)
    //                 .then(res =>
    //                 supertest(app)
    //                     .get(`/api/users`)
    //                     .expect(expectedUsers)
    //                 )
    //         })
    //     })
    // })

    // describe(`PATCH /api/users/:user_id`, () => {
    //     context(`Given no users`, () => {
    //         it(`responds with 404`, () => {
    //             const userId = 123456
    //             return supertest(app)
    //                 .patch(`/api/users/${userId}`)
    //                 .expect(404, { error: { message: `User doesn't exist`} })
    //         })
    //     })

    //     context(`Given there are users in the database`, () => {
    //         const testUsers = makeUsersArray()

    //         beforeEach('insert users', () => {
    //             return db
    //                 .into('aware_users')
    //                 .insert(testUsers)
    //         })

    //         it(`responds with 204 and updates the user`, () => {
    //             const idToUpdate = 2

    //             const updateUser = {
    //                 username: 'MyUpdatedUser',
    //                 password: 'MyUpdatedPassword'
    //             }
    //             const expectedUser = {
    //                 ...testUsers[idToUpdate - 1],
    //                 ...updateUser
    //             }

    //             return supertest(app)
    //                 .patch(`/api/users/${idToUpdate}`)
    //                 .send(updateUser)
    //                 .expect(204)
    //                 .then(res =>
    //                     supertest(app)
    //                         .get(`/api/users/${idToUpdate}`)
    //                         .expect(expectedUser)                            
    //                 )
    //         })

    //         it(`responds with 400 when no required fields supplied`, () => {
    //             const idToUpdate = 2
    //             return supertest(app)
    //             .patch(`/api/users/${idToUpdate}`)
    //             .send({ irrelevantField: 'foo' })
    //             .expect(400, {
    //                 error: {
    //                 message: `Request body must contain either 'username' or 'password'`
    //                 }
    //             })
    //         })

    //         it(`responds with 204 when updating only a subset of fields`, () => {
    //             const idToUpdate = 2
    //             const updateUser = {
    //                 username: 'updatedHobbit',
    //             }
    //             const expectedUser = {
    //                 ...testUsers[idToUpdate - 1],
    //                 ...updateUser
    //             }
        
    //             return supertest(app)
    //             .patch(`/api/users/${idToUpdate}`)
    //             .send({
    //                 ...updateUser,
    //                 fieldToIgnore: 'should not be in GET response'
    //             })
    //             .expect(204)
    //             .then(res =>
    //                 supertest(app)
    //                 .get(`/api/users/${idToUpdate}`)
    //                 .expect(expectedUser)
    //             )
    //         })
    //     })
    // })

})