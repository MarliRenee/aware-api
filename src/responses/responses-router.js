const path = require('path')
const express = require('express')
const xss = require('xss')
const ResponsesService = require('./responses-service')

const responsesRouter = express.Router()
const jsonParser = express.json()
const { requireAuth } = require('../middleware/basic-auth')

responsesRouter
  .route('/')
  .get((req, res, next) => {
    ResponsesService.getAllResponses(
      req.app.get('db')
    )
      .then(responses => {
        res.json(responses)
      })
      .catch(next)
  })

  .post(requireAuth, jsonParser, (req, res, next) => {
    const { userid, icebergid, q1, q2, q3, q4, q5, q6, q7, q8 } = req.body
    const newResponses = { userid, icebergid, q1, q2, q3, q4, q5, q6, q7, q8 }

    for (const [key, value] of Object.entries(newResponses)) {
        if (value == null) {
            return res.status(400).json({
                error: { message: `Missing '${key}' in request body` }
            })
        }
    }

    ResponsesService.insertResponses(
      req.app.get('db'),
      newResponses
    )
      .then(responses => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${responses.id}`))
          .json(responses)
      })
      .catch(next)
  })

responsesRouter
    .route('/:responses_id')

    .all((req, res, next) => {
        ResponsesService.getById(
            req.app.get('db'),
            req.params.responses_id
        )
            .then(responses => {
                if(!responses) {
                    return res.status(404).json({
                        error: { message: `Response doesn't exist` }
                    })
                }
                res.responses = responses
                next()
            })
            .catch(next)
    })

    .get((req, res, next) => {
        res.json({
           id: res.responses.id,
           userid: res.responses.userid,
           icebergid: res.responses.icebergid, 
           q1: res.responses.q1, 
           q2: res.responses.q2, 
           q3: res.responses.q3, 
           q4: res.responses.q4, 
           q5: res.responses.q5, 
           q6: res.responses.q6, 
           q7: res.responses.q7, 
           q8: res.responses.q8, 
        })
    })

    .delete((req, res, next) => {
        ResponsesService.deleteResponses(
            req.app.get('db'),
            req.params.responses_id
        )
        .then(() => {
            res.status(204).end()
        })
        .catch(next)
    })

    .patch(jsonParser, (req,res, next) => {
        const { icebergid, q1, q2, q3, q4, q5, q6, q7, q8 } = req.body
        const responsesToUpdate = { icebergid, q1, q2, q3, q4, q5, q6, q7, q8 }

        const numberOfValues = Object.values(responsesToUpdate).filter(Boolean).length
           if (numberOfValues === 0) {
             return res.status(400).json({
               error: {
                 message: `Request body must contain 'icebergid', 'q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8',`
               }
             })
        }

        ResponsesService.updateResponses(
            req.app.get('db'),
            req.params.responses_id,
            responsesToUpdate
        )
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    })


module.exports = responsesRouter
    
   