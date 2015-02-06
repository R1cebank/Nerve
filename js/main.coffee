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
bodyParser = require 'body-parser'
mongo = require('mongodb').MongoClient

mongourl = 'mongodb://nerved:CphV7caUpdYRR9@ds041561.mongolab.com:41561/heroku_app33695157'

##Connect to mongodb server
mongo.connect mongourl, (err, db) ->
  if err?
    raygunClient.send err
    process.exit()

  console.log 'connected to database.'


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

server = http.listen port, ->
  host = server.address().address
  port = server.address().port
  console.log 'server started at http://%s:%s', host, port

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

server.on 'error', (err) ->
  raygunClient.send err

io.on 'connection', (socket) ->
  socket.emit 'handshake', 'welcome to nerve'
  socket.on 'error', (err) ->
    raygunClient.send err
