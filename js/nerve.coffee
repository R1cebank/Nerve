###
 # nerve
 # http://r1cebank.github.io/Nerve/
 #
 # Copyright (c) 2014 r1cebank
 # Licensed under the MIT license.
###
require 'newrelic'
express = require 'express'
app = express()
http = require('http').Server(app)
io = require('socket.io')(http)
bodyParser = require 'body-parser'
mongo = require('mongodb').MongoClient
chalk = require 'chalk'
winston = require 'winston'
winston.cli()

if not process.env.PRODUCTION
  chalk.enabled = yes
  chalk.supportsColor = yes
  winston.info 'Forcing chalk color support.'

if process.env.PRODUCTION?
  raygun = require 'raygun'
  raygunClient = new raygun.Client().init
    apiKey: 'MJqfCmhfsVzK8wR3TML/Fw=='

d = require('domain').create()
d.on 'error', (err) ->
  raygunClient.send err, {}, ->
    process.exit()

port = process.env.PORT || 3939

module.exports = (options) ->
  VERBOSE = options

mongourl = 'mongodb://nerved:CphV7caUpdYRR9@ds041561.mongolab.com:41561/heroku_app33695157'

guest =
  name: "guest"
  email: "nerve-guest@gmail.com"
  profession: "guest"
  talents: "guesting"

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


##Connect to mongodb server
mongo.connect mongourl, (err, db) ->
  if err?

    winston.error 'filed to connect nerve database'
    raygunClient.send err
    process.exit()

  winston.info 'connected to database.'
  users = db.collection('users')
  profiles = db.collection('profiles')

  server = exports.server = http.listen port, ->
    host = server.address().address
    port = server.address().port
    winston.info 'server started at http://' + host + ':' + port

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
    require('./events.js')(socket)
