const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const { makeIcebergsArray } = require('./icebergs.fixtures')
const supertest = require('supertest')
const { makeUsersArray } = require('./users.fixtures')
const { requireAuth } = require('../src/middleware/basic-auth')

describe('Iceberg Endpoints', function() {
    
    let db;
    //IN PROGRESS
    //let authToken;

    function makeAuthHeader(user) {
       const token = Buffer.from(`${user.username}:${user.password}`).toString('base64')
       return `Basic ${token}`
    }
        
  
    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    //IN PROGRESS
    // beforeEach('create and login', () => {
    //     return supertest(app).post('/api/users').send({}).then(res=>{
    //         return supertest(app).post('/api/auth/login').send({}).then(res2=>{
    //             authToken = res2.authToken;
    //         })
    //     })
    // })
  
    before('clean the table', () => 
        db.raw('TRUNCATE icebergs, aware_users RESTART IDENTITY CASCADE')
    )

    afterEach('cleanup', () => 
        db.raw('TRUNCATE icebergs, aware_users RESTART IDENTITY CASCADE')
    )

    describe(`Protected endpoints`, () => {
        const testUsers = makeUsersArray();
        const testIcebergs = makeIcebergsArray();

        beforeEach('insert icebergs', () => {
            return db
            .into('aware_users')
            .insert(testUsers)
            .then(() => {
                return db
                .into('icebergs')
                .insert(testIcebergs)
            })
        })
        
        describe(`GET /api/icebergs/:iceberg_id`, () => {
            it(`responds with 401 'Missing basic token' when no basic token`, () => {
            return supertest(app)
                .get(`/api/icebergs/123`)
                .expect(401, { error: `Missing basic token` })
            })
        })
    })

    describe(`GET /api/icebergs`, () => {
            
        const testIcebergs = makeIcebergsArray()
        const testUsers = makeUsersArray()

        beforeEach('insert users', () => {
            return db
            .into('aware_users')
            .insert(testUsers)
            .then(() => {
                return db
                .into('icebergs')
                .insert(testIcebergs)
            })
        })

        it('GET /api/icebergs responds with 200 and all of the icebergs', () => {
            return supertest(app)
            .get('/api/icebergs')
            .set('Authorization', makeAuthHeader(testUsers[0]))
            .expect(200)
            .expect(200, testIcebergs)
        })
    

    })
    
    describe(`GET /icebergs/:iceberg_id`, () => {

        const testUsers = makeUsersArray();
        const testIcebergs = makeIcebergsArray();

        beforeEach('insert icebergs', () => {
            return db
            .into('aware_users')
            .insert(testUsers)
            .then(() => {
                return db
                .into('icebergs')
                .insert(testIcebergs)
            })
        })
        
        context('Given there are no icebergs in the database', () => {

            it('GET /api/icebergs/:iceberg_id responds with 404', () => {
                const icebergId = 123456
                const expectedIceberg = testIcebergs[icebergId - 1]
                return supertest(app)
                .get(`/api/icebergs/${icebergId}`)
                .set('Authorization', makeAuthHeader(testUsers[0]))
                .expect(404, {error: { message: `Iceberg doesn't exist`} })
            })
        })

        context('Given there are icebergs in the database', () => {
            it('GET /api/icebergs/:iceberg_id responds with 200 and the specified iceberg', () => {
                const icebergId = 2
                const expectedIceberg = testIcebergs[icebergId - 1]
                return supertest(app)
                .get(`/api/icebergs/${icebergId}`)
                .set('Authorization', makeAuthHeader(testUsers[0]))
                .expect(200, expectedIceberg)
            })
        })

    })

    describe(`POST /api/icebergs`, () => {

        const testUsers = makeUsersArray();
        const testIceberg = makeIcebergsArray();

        beforeEach('insert related users', () => {
            return db
                .into('aware_users')
                .insert(testUsers)
        })

        it(`creates a iceberg, responding with 201 and the new iceberg`, () => {
            const newIceberg = { 
                userid: 1, 
            }

            return supertest(app)
                .post('/api/icebergs')
                .set('Authorization', makeAuthHeader(testUsers))
                .send(testIceberg)
                .expect(res => {
                    expect(res.body.userid).to.eql(newIceberg.userid[0])
                })
                .then(postRes =>
                    supertest(app)
                    .get(`/api/icebergs/${postRes.body.id}`)
                    .expect(postRes.body)
                )
        })

    })

    //Currently no DELETE functionality client side, considering adding this
    // describe.only(`DELETE /api/icebergs/:iceberg_id`, () => {

    //     context(`Given no icebergs`, () => {
    //         it(`responds with 404`, () => {
    //         const icebergId = 123456
    //         return supertest(app)
    //             .delete(`/api/icebergs/${icebergId}`)
    //             .expect(404, { error: { message: `Iceberg doesn't exist` } })
    //         })
    //     })

    //     context('Given there are icebergs in the database', () => {
    //         const testUser = makeUsersArray();
    //         const testIcebergs = makeIcebergsArray();
    
    //         beforeEach('insert icebergs', () => {
    //             return db
    //             .into('aware_users')
    //             .insert(testUser)
    //             .then(() => {
    //                 return db
    //                 .into('icebergs')
    //                 .insert(testIcebergs)
    //             })
    //         })

    //         it('responds with 204 and removes the iceberg', () => {
    //             const idToRemove = 2
    //             const expectedIcebergs = testIcebergs.filter(iceberg => iceberg.id !== idToRemove)
    //             return supertest(app)
    //                 .delete(`/api/icebergs/${idToRemove}`)
    //                 .set('Authorization', makeAuthHeader(testUser))
    //                 .expect(204)
    //                 .then(res =>
    //                 supertest(app)
    //                     .get(`/api/icebergs`)
    //                     .expect(expectedIcebergs)
    //                 )
    //         })
    //     })
    // })

    //Currently no PATCH functionality on client-side, considering adding this:
    // describe.only(`PATCH /api/icebergs/:iceberg_id`, () => {
    //     context(`Given no icebergs`, () => {
    //         it(`responds with 404`, () => {
    //             const icebergId = 123456
    //             return supertest(app)
    //                 .patch(`/api/icebergs/${icebergId}`)
    //                 .expect(404, { error: { message: `Iceberg doesn't exist`} })
    //         })
    //     })

    //     context(`Given there are icebergs in the database`, () => {
    //         const testUsers = makeUsersArray();
    //         const testIcebergs = makeIcebergsArray();
    
    //         beforeEach('insert icebergs', () => {
    //             return db
    //             .into('aware_users')
    //             .insert(testUsers)
    //             .then(() => {
    //                 return db
    //                 .into('icebergs')
    //                 .insert(testIcebergs)
    //             })
    //         })

    //         it(`responds with 204 and updates the iceberg`, () => {
    //             const idToUpdate = 2

    //             const updateIcebergs = {
    //                 userid: 1,
    //             }
    //             const expectedIceberg = {
    //                 ...testIcebergs[idToUpdate - 1],
    //                 ...updateIcebergs
    //             }

    //             return supertest(app)
    //                 .patch(`/api/icebergs/${idToUpdate}`)
    //                 .set('Authorization', makeAuthHeader(testUsers[0]))
    //                 .send(updateIcebergs)
    //                 .expect(204)
    //                 .then(res =>
    //                     supertest(app)
    //                         .get(`/api/icebergs/${idToUpdate}`)
    //                         .expect(expectedIceberg)                            
    //                 )
    //         })

    //         it(`responds with 400 when no required fields supplied`, () => {
    //             const idToUpdate = 2
    //             return supertest(app)
    //             .patch(`/api/icebergs/${idToUpdate}`)
    //             .set('Authorization', makeAuthHeader(testUsers[0]))
    //             .send({ irrelevantField: 'foo' })
    //             .expect(400, {
    //                 error: {
    //                 message: `Request body must contain 'userid'`
    //                 }
    //             })
    //         })

    //     })
    // })

})