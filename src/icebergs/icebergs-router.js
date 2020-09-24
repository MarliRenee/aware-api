const path = require('path')
const express = require('express')
const xss = require('xss')
const IcebergsService = require('./icebergs-service')
const { requireAuth } = require('../middleware/basic-auth')


const icebergsRouter = express.Router()
const jsonParser = express.json()

icebergsRouter
  .route('/')
  .all(requireAuth)
  .get((req, res, next) => {
    IcebergsService.getAllIcebergs(
      req.app.get('db'), 
      req.user.id
    )
      .then(icebergs => {
        res.json(icebergs) 
      })
      .catch(next)
  })

  .post(requireAuth, jsonParser, (req, res, next) => {
    // const { icebergid } = req.body
    const newIceberg = { }

    for (const [key, value] of Object.entries(newIceberg)) {
        if (value == null) {
            return res.status(400).json({
                error: { message: `Missing '${key}' in request body` }
            })
        }
    }

    newIceberg.userid = req.user.id

    IcebergsService.insertIceberg(
      req.app.get('db'),
      newIceberg
    )
      .then(iceberg => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${iceberg.id}`))
          .json(iceberg)
      })
      .catch(next)
  })

icebergsRouter
  .route('/:iceberg_id')
  .all(requireAuth)
  .all((req, res, next) => {
      IcebergsService.getById(
          req.app.get('db'),
          req.params.iceberg_id
      )
          .then(iceberg => {
              if(!iceberg) {
                  return res.status(404).json({
                      error: { message: `Iceberg doesn't exist` }
                  })
              }
              res.iceberg = iceberg
              next()
          })
          .catch(next)
  })

  .get((req, res, next) => {
      res.json({
          id: res.iceberg.id,
          modified: res.iceberg.modified, 
          // userid: res.iceberg.userid, 
      })
  })

  .delete((req, res, next) => {
      IcebergsService.deleteIceberg(
          req.app.get('db'),
          req.params.iceberg_id
      )
      .then(() => {
          res.status(204).end()
      })
      .catch(next)
  })

  .patch(jsonParser, (req,res, next) => {
    const { userid } = req.body
    const icebergToUpdate = { userid }

    const numberOfValues = Object.values(icebergToUpdate).filter(Boolean).length
      if (numberOfValues === 0) {
        return res.status(400).json({
          error: {
            message: `Request body must contain 'userid'`
          }
        })
    }

    IcebergsService.updateIceberg(
      req.app.get('db'),
      req.params.iceberg_id,
      icebergToUpdate
    )
      .then(() => {
          res.status(204).end()
      })
      .catch(next)
  })


module.exports = icebergsRouter
    
   