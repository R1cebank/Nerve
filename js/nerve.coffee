###
 # nerve
 # http://r1cebank.github.io/Nerve/
 #
 # Copyright (c) 2014 r1cebank
 # Licensed under the MIT license.
###

if process.env.PRODUCTION?
  raygun = require 'raygun'
  raygunClient = new raygun.Client().init
    apiKey: 'MJqfCmhfsVzK8wR3TML/Fw=='

d = require('domain').create()
d.on 'error', (err) ->
  raygunClient.send err, {}, ->
    process.exit()

port = process.env.PORT || 3939

require 'newrelic'
express = require 'express'
app = express()
http = require('http').Server(app)
io = require('socket.io')(http)
uuid = require 'node-uuid'
bodyParser = require 'body-parser'
mongo = require('mongodb').MongoClient
chalk = require 'chalk'

VERBOSE = yes
LOG = yes
INFO = yes
ERROR = yes

module.exports = (options) ->
  VERBOSE = options

log = (message) ->
  if(VERBOSE and LOG)
    console.log chalk.cyan message
error = (message) ->
  if(VERBOSE and ERROR)
    console.log chalk.red message
info = (message) ->
  if(VERBOSE and INFO)
    console.log chalk.green message

mongourl = 'mongodb://nerved:CphV7caUpdYRR9@ds041561.mongolab.com:41561/heroku_app33695157'

connectedClients = []
authorizedClients = []

guest =
  name: "guest"
  email: "nerve-guest@gmail.com"
  profession: "guest"
  talents: "guesting"

##Connect to mongodb server
mongo.connect mongourl, (err, db) ->
  if err?

    error 'filed to connect nerve database'
    raygunClient.send err
    process.exit()

  log 'connected to database.'


app.use bodyParser.urlencoded extended: false
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

##must use x-www-form-urlencoded
app.post '/login', (req, res) ->
  res.send "user: " + req.body.user + " pass: " + req.body.pass

server = exports.server = http.listen port, ->
  host = server.address().address
  port = server.address().port
  info 'server started at http://' + host + ':' + port

###
post {
  author: "",
  title: "",
  description: "",
  tags: {},
  requirement: {}, //tags and requirement are automatically generated as user input
  status: "",
  comp: "",
  location: "",
  remark: "",
  date: "",
}
###

getClient = (type, element) ->
  for client in connectedClients
    if client[type] is element
      return client
  return null

validateClient = (accessToken, uuid) ->
  for client in authorizedClients
    if client['accessToken'] is accessToken
      return client['uuid']
  return null

server.on 'error', (err) ->
  raygunClient.send err

io.on 'connection', (socket) ->
  clientUUID = uuid.v1()
  connectedClients.push socket: socket, uuid: clientUUID, profile: guest, enabled: no
  socket.emit 'handshake',
    uuid: clientUUID
  log 'client is connected'
  info 'currently connected users: ' + connectedClients.length
  socket.on 'disconnect', ->
    currentClient = getClient 'socket', socket
    if currentClient?
      i = connectedClients.indexOf currentClient
      if i != -1
        connectedClients.splice i, 1
        log 'user disconnected:'
        info JSON.stringify currentClient.profile
        info 'currently connected users: ' + connectedClients.length
  socket.on 'login', (data) -> ##data={name: 'name', password:'password'}
    ##MongoDb action here
    ##Access token is generated using the userID + currentTime + device identifier
    ##
    authorizedClients.push uuid: 'A2wE002-10481E-21048F', accessToken: 'A0204E-D30EC-9201E', profile: guest
    log 'client trying to login.'
  socket.on 'post', (data) -> ##{title: '', description: '', date: '', tags:'', skills:'',comp: '', location:'', expire:'', remarks:'', accessToken:'', uuid:''}
    clientUUID = validateClient data.accessToken
    if clientUUID?
      ##Post stuff
      info 'user ' + clientUUID + ' is allowed for action: post'
    else
      error 'client is not authorized for such action'
  socket.on 'ping', ->
    log 'recieved ping from MotionDex/Mocha, keep alive.'
  socket.on 'error', (err) ->
    raygunClient.send err
