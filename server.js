var path = require('path')
var express = require('express')
var api = require('./api')

var app = express()

app.use(express.static(path.join(__dirname, 'web/dist')))

function serveIndex (req, res) {
  res.sendFile(path.join(__dirname, 'web/dist/index.html'))
}

app.get('/signin', serveIndex)
app.get('/signup', serveIndex)
app.get('/signout', serveIndex)
app.get('/settings', serveIndex)

app.use('/api', api)

var PORT = process.env.PORT || 1337

app.listen(PORT, function (err) {
  if (err) throw err
  console.log('Listening on port ' + PORT)
})
