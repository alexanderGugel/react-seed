var express = require('express')
var bodyParser = require('body-parser')

var api = express.Router()
api.use(bodyParser.json())
api.use('/accounts', require('./accounts'))

api.use(function (err, req, res, next) {
  res.status(500).json({
    error: {
      name: 'InternalServerError'
    }
  })
  next(err)
})

module.exports = api
