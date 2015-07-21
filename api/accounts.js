var redis = require('./redis')
var xtend = require('xtend')
var express = require('express')
var uuid = require('uuid')
var bcrypt = require('bcrypt-nodejs')
var Joi = require('joi')
var jwt = require('jsonwebtoken')
var expressJwt = require('express-jwt')
var accounts = new express.Router()
var auth = expressJwt({ secret: process.env.JWS_SECRET })

var ACCOUNT_SCHEMA = Joi.object().keys({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  name: Joi.string().required()
})

var TOKEN_CREATE_SCHEMA = Joi.object().keys({
  email: Joi.string().email().required(),
  password: Joi.string().required()
})

var ACCOUNT_UPDATE_SCHEMA = Joi.object().keys({
  email: Joi.string().email().optional(),
  password: Joi.string().optional(),
  name: Joi.string().optional()
})

/**
 * Middleware used for validating the user's request body.
 *
 * @param  {Object}   schema Joi schema validation object
 * @param  {Object}   req
 * @param  {Object}   res
 * @param  {Function} next
 */
function validateSchema (schema, req, res, next) {
  Joi.validate(req.body, schema, function (err, val) {
    if (err) return res.status(422).json(err.details[0])
    next()
  })
}

/**
 * Middleware used for ensuring that the user supplied email address is not
 * already taken.
 *
 * @param  {Object}   req
 * @param  {Object}   res
 * @param  {Function} next
 */
function validateEmailUnique (req, res, next) {
  redis.get('account.email->account.id:' + req.body.email, function (err, id) {
    if (err) return next(err)
    if (id && req.user.id !== id) {
      return res.status(422).json({
        error: {
          context: {
            key: 'email'
          },
          message: '\"email\" already in use',
          path: 'email',
          type: 'any.unique'
        }
      })
    }
    next()
  })
}

/**
 * Sign Up: Creates a new user account
 *
 * Endpoint: POST /api/accounts
 *
 * Request: { email: ..., password: ... }
 * Response: { email: ..., token: ... }
 */
accounts.post('/', validateSchema.bind(null, ACCOUNT_SCHEMA), validateEmailUnique, function (req, res, next) {
  req.body.id = uuid()
  bcrypt.hash(req.body.password, null, null, function (err, hash) {
    req.body.password = hash
    next(err)
  })
}, function (req, res, next) {
  var account = req.body
  var multi = redis.multi()
  multi.set('account.email->account.id:' + account.email, account.id)
  for (var key in account) {
    if (key === 'id') continue
    multi.set('account.id->account.' + key + ':' + account.id, account[key])
  }
  multi.exec(function (err) {
    next(err)
  })
}, function (req, res, next) {
  var account = req.body
  delete account.password
  var token = jwt.sign({ id: account.id }, process.env.JWS_SECRET)
  res.json(xtend({ token: token }, account))
})

/**
 * Sign In: Creates a new token
 *
 * Endpoint: POST /api/accounts/me/tokens
 *
 * Request: { email: ..., password: ... }
 * Response: { token: ... }
 */
accounts.post('/me/tokens', validateSchema.bind(null, TOKEN_CREATE_SCHEMA), function (req, res, next) {
  redis.get('account.email->account.id:' + req.body.email, function (err, id) {
    if (err) return next(err)
    req.body.id = id
    if (!id) {
      return res.status(422).json({
        error: {
          context: {
            key: 'email'
          },
          message: '\"email\" not associated with an account',
          path: 'email',
          type: 'any.exists'
        }
      })
    }
    next()
  })
}, function (req, res, next) {
  redis.get('account.id->account.password:' + req.body.id, function (err, password) {
    if (err) return next(err)
    if (!password) return next(new Error('Missing password for account ' + req.body.id))
    req.body.correctPassword = password
    next()
  })
}, function (req, res, next) {
  bcrypt.compare(req.body.password, req.body.correctPassword, function (err, ok) {
    if (err) return next(err)
    if (!ok) {
      return res.status(422).json({
        error: {
          context: {
            key: 'password'
          },
          message: '\"password\" is incorrect',
          path: 'password',
          type: 'any.correct'
        }
      })
    }
    var token = jwt.sign({ id: req.body.id }, process.env.JWS_SECRET)
    res.json({
      token: token
    })
  })
})

/**
 * Profile: Retrieves the user's account settings
 *
 * Endpoint: GET /api/accounts/me
 *
 * Request: {  }
 * Response: { email: ..., name: ..., id: ... }
 */
accounts.get('/me', auth, function (req, res, next) {
  var multi = redis.multi()

  multi.get('account.id->account.name:' + req.user.id)
  multi.get('account.id->account.email:' + req.user.id)

  multi.exec(function (err, results) {
    if (err) return next(err)
    res.json({
      id: req.user.id,
      name: results[0],
      email: results[1]
    })
  })
})

/**
 * Prefernces: Updates the user's settings
 *
 * Endpoint: PUT /api/accounts/me
 *
 * Request: { email: ..., password: ..., name: ... }
 * Response: { id: ..., email: ..., name: ... } (updated fields)
 */
accounts.put('/me', auth, validateSchema.bind(null, ACCOUNT_UPDATE_SCHEMA), function (req, res, next) {
  if (!req.body.email) return next()
  validateEmailUnique(req, res, next)
  next()
}, function (req, res, next) {
  if (!req.body.password) return next()
  bcrypt.hash(req.body.password, null, null, function (err, hash) {
    req.body.password = hash
    next(err)
  })
}, function (req, res, next) {
  var multi = redis.multi()
  var account = req.body
  account.id = req.user.id

  for (var key in account) {
    if (key === 'id') continue
    multi.set('account.id->account.' + key + ':' + account.id, account[key])
  }

  multi.exec(function (err) {
    if (err) return next(err)
    delete account.password
    res.status(200).json(account)
  })
})

module.exports = accounts
