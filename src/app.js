require('dotenv').config()
const knex = require('knex')
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV } = require('./config')
const {CLIENT_ORIGIN} = require('./config');
const { PORT, DATABASE_URL } = require('./config')
const usersRouter = require('./users/users-router')
const icebergsRouter = require('./icebergs/icebergs-router')
const responsesRouter = require('./responses/responses-router')

const app = express()

const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'common'
app.use(morgan(morganSetting))

app.use(helmet())
app.use(
    cors({
        origin: CLIENT_ORIGIN
    })
);

app.use('/api/users', usersRouter)
app.use('/api/icebergs', icebergsRouter)
app.use('/api/responses', responsesRouter)

app.get('/', (req, res) => {
    res.send('Hello, world!')
})

app.use(function errorHandler(error, req, res, next) {
    let response
    if (process.env.NODE_ENV === 'production') {
        response = { error: { message: 'server error' } }
    } else {
        console.error(error)
        response = { message: error.message, error }
    }
    res.status(500).json(response)
})

module.exports = app



