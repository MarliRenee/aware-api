const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const { makeIcebergsArray } = require('./icebergs.fixtures')
const supertest = require('supertest')
const { makeUsersArray } = require('./users.fixtures')

describe('Iceberg Endpoints', function() {
    
    let db
  
    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATAASE_URL,
        })
    
        app.set('db', db)
    })

     after('disconnect from db', () => db.destroy())

  
    before('clean the table', () => 
        db.raw('TRUNCATE icebergs, aware_users RESTART IDENTITY CASCADE')
    )

    afterEach('cleanup', () => 
        db.raw('TRUNCATE icebergs, aware_users RESTART IDENTITY CASCADE')
    )

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
                .expect(200, testIcebergs)
            })
    
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
                .expect(404, {error: { message: `Iceberg doesn't exist`} })
            })
        })

        context('Given there are icebergs in the database', () => {
            it('GET /api/icebergs/:iceberg_id responds with 200 and the specified iceberg', () => {
                const icebergId = 2
                const expectedIceberg = testIcebergs[icebergId - 1]
                return supertest(app)
                .get(`/api/icebergs/${icebergId}`)
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

        it(`creates a iceberg, responding with 201 and the new iceberg`, function() {
            const newIceberg = { 
                userid: 1 
            }

            return supertest(app)
                .post('/api/icebergs')
                .send(newIceberg)
                .expect(res => {
                    expect(res.body.userid).to.eql(newIceberg.userid)
                })
                .then(postRes =>
                    supertest(app)
                    .get(`/api/icebergs/${postRes.body.id}`)
                    .expect(postRes.body)
                )
        })


        //hmm not sure about this. test is passing, but trying to POST a userid that doesn't exist in Postman returns 500 
            // "message": "insert into \"icebergs\" (\"userid\") values ($1) returning * - insert or update on table \"icebergs\" violates foreign key constraint \"iceberg_userid_fkey\"",
            // "error": {
            //     "length": 255,
            //     "name": "error",
            //     "severity": "ERROR",
            //     "code": "23503",
            //     "detail": "Key (userid)=(5) is not present in table \"aware_users\".",
            //     "schema": "public",
            //     "table": "icebergs",
            //     "constraint": "iceberg_userid_fkey",
            //     "file": "ri_triggers.c",
            //     "line": "2474",
            //     "routine": "ri_ReportViolation"
            // }
        it(`responds with 400 and an error message when the 'userid' is missing`, () => {
            return supertest(app)
            .post('/api/icebergs')
            .send({
                userid: null,
            })
            .expect(400, {
                error: { message: `Missing 'userid' in request body` }
            })
        })

    })

    describe(`DELETE /api/icebergs/:iceberg_id`, () => {

        context(`Given no icebergs`, () => {
            it(`responds with 404`, () => {
            const icebergId = 123456
            return supertest(app)
                .delete(`/api/icebergs/${icebergId}`)
                .expect(404, { error: { message: `Iceberg doesn't exist` } })
            })
        })

        context('Given there are icebergs in the database', () => {
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

            it('responds with 204 and removes the iceberg', () => {
                const idToRemove = 2
                const expectedIcebergs = testIcebergs.filter(iceberg => iceberg.id !== idToRemove)
                return supertest(app)
                    .delete(`/api/icebergs/${idToRemove}`)
                    .expect(204)
                    .then(res =>
                    supertest(app)
                        .get(`/api/icebergs`)
                        .expect(expectedIcebergs)
                    )
            })
        })
    })

    describe(`PATCH /api/icebergs/:iceberg_id`, () => {
        context(`Given no icebergs`, () => {
            it(`responds with 404`, () => {
                const icebergId = 123456
                return supertest(app)
                    .patch(`/api/icebergs/${icebergId}`)
                    .expect(404, { error: { message: `Iceberg doesn't exist`} })
            })
        })

        context(`Given there are icebergs in the database`, () => {
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

            it(`responds with 204 and updates the iceberg`, () => {
                const idToUpdate = 2

                const updateIcebergs = {
                    userid: 1,
                }
                const expectedIceberg = {
                    ...testIcebergs[idToUpdate - 1],
                    ...updateIcebergs
                }

                return supertest(app)
                    .patch(`/api/icebergs/${idToUpdate}`)
                    .send(updateIcebergs)
                    .expect(204)
                    .then(res =>
                        supertest(app)
                            .get(`/api/icebergs/${idToUpdate}`)
                            .expect(expectedIceberg)                            
                    )
            })

            it(`responds with 400 when no required fields supplied`, () => {
                const idToUpdate = 2
                return supertest(app)
                .patch(`/api/icebergs/${idToUpdate}`)
                .send({ irrelevantField: 'foo' })
                .expect(400, {
                    error: {
                    message: `Request body must contain 'userid'`
                    }
                })
            })

        })
    })

})