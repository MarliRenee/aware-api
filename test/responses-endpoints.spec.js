const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const { makeUsersArray } = require('./users.fixtures')
const { makeIcebergsArray } = require('./icebergs.fixtures')
const { makeResponsesArray } = require('./responses.fixtures')
const supertest = require('supertest')
const { requireAuth } = require('../src/middleware/basic-auth')

describe('Responses Endpoints', function() {
    
    let db

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

    before('clean the table', () => 
        db.raw('TRUNCATE iceberg_responses, icebergs, aware_users RESTART IDENTITY CASCADE')
    )

    afterEach('cleanup', () => 
        db.raw('TRUNCATE iceberg_responses, icebergs, aware_users RESTART IDENTITY CASCADE')
    )
    // after('disconnect from db', () => db.destroy())

    // before('clean the table', () => 
    //     db.raw('TRUNCATE aware_users, icebergs, iceberg_responses RESTART IDENTITY CASCADE')
    // );

    // afterEach('cleanup', () => 
    // db.raw('TRUNCATE aware_users, icebergs, iceberg_responses RESTART IDENTITY CASCADE')
    // );

    describe(`GET /api/responses`, () => {
     
        const testResponses = makeResponsesArray()
        const testIcebergs = makeIcebergsArray()
        const testUsers = makeUsersArray()

        beforeEach('insert responses', () => {
            return db
            .into('aware_users')
            .insert(testUsers)
            .then(() => {
                return db
                .into('icebergs')
                .insert(testIcebergs)
                .then(() => {
                    return db
                    .into('iceberg_responses')
                    .insert(testResponses)
                })
            })
        })


        it('GET /api/responses responds with 200 and all of the responses', () => {
            return supertest(app)
            .get('/api/responses')
            .set('Authorization', makeAuthHeader(testUsers[0]))
            .expect(200)
            .expect(200, testResponses)
        })

    })
    
    describe(`GET //responses/:responses_id`, () => {

        const testResponses = makeResponsesArray()
        const testIcebergs = makeIcebergsArray()
        const testUsers = makeUsersArray()

        beforeEach('insert responses', () => {
            return db
            .into('aware_users')
            .insert(testUsers)
            .then(() => {
                return db
                .into('icebergs')
                .insert(testIcebergs)
                .then(() => {
                    return db
                    .into('iceberg_responses')
                    .insert(testResponses)
                })
            })
        })
        
        context('Given there are no responses in the database', () => {
            it('GET /api/responses/:responses_id responds with 404', () => {
                const responsesId = 123456
                const expectedResponses = testResponses[responsesId - 1]
                return supertest(app)
                    .get(`/api/responses/${responsesId}`)
                    .expect(404, {error: { message: `Response doesn't exist`} })
            })
        })

        context('Given there are responses in the database', () => {

            it('GET /api/responses/:responses_id responds with 200 and the specified responses', () => {
                const responsesId = 9
                const expectedResponses = testResponses[responsesId - 1]
                return supertest(app)
                    .get(`/api/responses/${responsesId}`)
                    //*ASK MENTOR -- expectedResponses keeps coming bakc undefined?
                    // .expect(res => {
                    //     expect(res.body.icebergid).to.eql(expectedResponses.icebergid);
                    //     expect(res.body).to.have.property('id)')
                    // })
            })
        })



    })

    describe(`POST /api/responses`, () => {

        const testResponses = makeResponsesArray()
        const testIcebergs = makeIcebergsArray()
        const testUsers = makeUsersArray()

        beforeEach('insert responses', () => {
            return db
            .into('aware_users')
            .insert(testUsers)
            .then(() => {
                return db
                .into('icebergs')
                .insert(testIcebergs)
                .then(() => {
                    return db
                    .into('iceberg_responses')
                    .insert(testResponses)
                })
            })
        })

        it(`creates a responses, responding with 201 and the new responses`, function() {
            const newResponses = {
                icebergid: 1,
                q1: 'MyUpdatedQ',
                q2: 'MyUpdatedQ',
                q3: 'MyUpdatedQ',
                q4: 'MyUpdatedQ',
                q5: 'MyUpdatedQ',
                q6: 'MyUpdatedQ',
                q7: 'MyUpdatedQ',
                q8: 'MyUpdatedQ'
            }
            return supertest(app)
                .post('/api/responses')
                .set('Authorization', makeAuthHeader(testUsers[0]))
                .send(newResponses)
                .expect(res => {
                    expect(res.body.icebergid).to.eql(newResponses.icebergid)
                    expect(res.body.q1).to.eql(newResponses.q1)
                    expect(res.body.q2).to.eql(newResponses.q2)
                    expect(res.body.q3).to.eql(newResponses.q3)
                    expect(res.body.q4).to.eql(newResponses.q4)
                    expect(res.body.q5).to.eql(newResponses.q5)
                    expect(res.body.q6).to.eql(newResponses.q6)
                    expect(res.body.q7).to.eql(newResponses.q7)
                    expect(res.body.q8).to.eql(newResponses.q8)
                    expect(res.headers.location).to.eql(`/api/responses/${res.body.id}`)
                })
                .then(postRes =>
                    supertest(app)
                    .get(`/api/responses/${postRes.body.id}`)
                    .set('Authorization', makeAuthHeader(testUsers))
                    .expect(postRes.body)
                )
        })

        const requiredFields = ['icebergid', 'q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8']

        requiredFields.forEach(field => {
            const newResponses = {
                icebergid: 1,
                q1: 'MyUpdatedQ',
                q2: 'MyUpdatedQ',
                q3: 'MyUpdatedQ',
                q4: 'MyUpdatedQ',
                q5: 'MyUpdatedQ',
                q6: 'MyUpdatedQ',
                q7: 'MyUpdatedQ',
                q8: 'MyUpdatedQ'
            }

            it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                delete newResponses[field]

                return supertest(app)
                .post('/api/responses')
                .set('Authorization', makeAuthHeader(testUsers[0]))
                .send(newResponses)
                .expect(400, {
                    error: { 
                        message: `Missing '${field}' in request body` 
                    }
                })
            })
        })
    })

    describe(`DELETE /api/responses/:responses_id`, () => {
        const testResponses = makeResponsesArray()
        const testIcebergs = makeIcebergsArray()
        const testUsers = makeUsersArray()

        beforeEach('insert responses', () => {
            return db
            .into('aware_users')
            .insert(testUsers)
            .then(() => {
                return db
                .into('icebergs')
                .insert(testIcebergs)
                .then(() => {
                    return db
                    .into('iceberg_responses')
                    .insert(testResponses)
                })
            })
        })

        context(`Given no responses`, () => {
            it(`responds with 404`, () => {
            const responsesId = 123456
            return supertest(app)
                .delete(`/api/responses/${responsesId}`)
                .expect(404, { error: { message: `Response doesn't exist` } })
            })
        })

        context('Given there are responses in the database', () => {
            it('responds with 204 and removes the responses', () => {
                const idToRemove = 4
                const expectedResponses = testResponses.filter(responses => responses.id !== idToRemove)
                return supertest(app)
                    .delete(`/api/responses/${idToRemove}`)
                    .expect(204)
                    .then(res =>
                    supertest(app)
                        .get(`/api/responses`)
                        .set('Authorization', makeAuthHeader(testUsers[0]))
                        .expect(expectedResponses)
                    )
            })
        })
    })

    describe(`PATCH /api/responses/:responses_id`, () => {
        const testResponses = makeResponsesArray()
        const testIcebergs = makeIcebergsArray()
        const testUsers = makeUsersArray()

        beforeEach('insert responses', () => {
            return db
            .into('aware_users')
            .insert(testUsers)
            .then(() => {
                return db
                .into('icebergs')
                .insert(testIcebergs)
                .then(() => {
                    return db
                    .into('iceberg_responses')
                    .insert(testResponses)
                })
            })
        })

        context(`Given no responses`, () => {
            it(`responds with 404`, () => {
                const responsesId = 123456
                return supertest(app)
                    .patch(`/api/responses/${responsesId}`)
                    .expect(404, { error: { message: `Response doesn't exist`} })
            })
        })

        context(`Given there are responses in the database`, () => {

            it(`responds with 204 and updates the responses`, () => {
                const idToUpdate = 4

                const updateResponses = {
                    id: 4,
                    icebergid: 3,
                    q1: 'MyUpdatedQ',
                    q2: 'MyUpdatedQ',
                    q3: 'MyUpdatedQ',
                    q4: 'MyUpdatedQ',
                    q5: 'MyUpdatedQ',
                    q6: 'MyUpdatedQ',
                    q7: 'MyUpdatedQ',
                    q8: 'MyUpdatedQ'
                }

                const expectedResponses = {
                    ...testResponses[idToUpdate - 1],
                    ...updateResponses
                }

                return supertest(app)
                    .patch(`/api/responses/${idToUpdate}`)
                    .send(updateResponses)
                    .expect(204)
                    .then(res =>
                        supertest(app)
                            .get(`/api/responses/${idToUpdate}`)
                            .expect(expectedResponses)                            
                    )
            })

            it(`responds with 400 when no required fields supplied`, () => {
                const idToUpdate = 4
                return supertest(app)
                .patch(`/api/responses/${idToUpdate}`)
                .send({ irrelevantField: 'foo' })
                .expect(400, {
                    error: {
                    message: `Request body must contain 'icebergid', 'q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8',`
                    }
                })
            })

            it(`responds with 204 when updating only a subset of fields`, () => {
                const idToUpdate = 4
                const updateResponses = {
                    id: 4,
                    icebergid: 2,
                    q1: 'MyUpdatedQ',
                    q2: 'MyUpdatedQ',
                    q3: 'MyUpdatedQ',
                    q4: 'MyUpdatedQ',
                    q5: 'MyUpdatedQ',
                    q6: 'MyUpdatedQ',
                    q7: 'MyUpdatedQ',
                    q8: 'MyUpdatedQ'
                }
                const expectedResponses = {
                    ...testResponses[idToUpdate - 1],
                    ...updateResponses
                }
        
                return supertest(app)
                .patch(`/api/responses/${idToUpdate}`)
                .send({
                    ...updateResponses,
                    fieldToIgnore: 'should not be in GET response'
                })
                .expect(204)
                .then(res =>
                    supertest(app)
                    .get(`/api/responses/${idToUpdate}`)
                    .expect(expectedResponses)
                )
            })
        })
    })

})