var redis = require('redis')

var REDIS_PORT = process.env.REDIS_PORT || 6379
var REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1'
var REDIS_AUTH_PASS = process.env.REDIS_AUTH_PASS

var client = redis.createClient(REDIS_PORT, REDIS_HOST, {
  auth_pass: REDIS_AUTH_PASS
})

module.exports = client
