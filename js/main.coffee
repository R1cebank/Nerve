if process.env.NODETIME_ACCOUNT_KEY?
  require('nodetime').profile
    accountKey: process.env.NODETIME_ACCOUNT_KEY,
    appName: 'nerved'

raygun = require 'raygun'
raygunClient = new raygun.Client().init
  apiKey: 'MJqfCmhfsVzK8wR3TML/Fw=='

d = require('domain').create()
d.on 'error', (err) ->
  raygunClient.send err, {}, ->
    process.exit()

port = process.env.PORT || 3939

express = require 'express'
app = express()
http = require('http').Server(app)
io = require('socket.io')(http)
uuid = require 'node-uuid'


app.use '/css', express.static process.cwd() + '/www/css'
app.use '/img', express.static process.cwd() + '/www/img'
app.use '/js', express.static process.cwd() + '/www/js'
app.use (err, req, res, next) ->
  raygunClient.send err,
    request: req
    response: res
    next: next

app.get '/', (req, res) ->
  res.sendFile process.cwd() + '/www/index.html'

server = http.listen port, ->
  host = server.address().address
  port = server.address().port
  console.log 'server started at http://%s:%s', host, port

server.on 'error', (err) ->
  raygunClient.send err

io.on 'connection', (socket) ->
  socket.emit 'handshake', 'welcome to nerve'
  socket.on 'error', (err) ->
    raygunClient.send err
