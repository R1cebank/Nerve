###
 # nerve
 # http://r1cebank.github.io/Nerve/
 #
 # Copyright (c) 2014 r1cebank
 # Licensed under the MIT license.
###

newrelic = require 'newrelic'
express = require 'express'
app = express()
path = require 'path'
http = require('http').Server(app)
io = require('socket.io')(http)
bodyParser = require 'body-parser'
mongo = require('mongodb').MongoClient
chalk = require 'chalk'
winston = require 'winston'
winston.cli()

##Setup log levels

#winston.level = 'error'

config = require './config/server-config.json'

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

guest =
  name: "guest"
  email: "nerve-guest@gmail.com"
  profession: "guest"
  talents: "guesting"

app.use bodyParser.urlencoded extended: false
app.use express.static path.join __dirname, '/www'
app.use (err, req, res, next) ->
  raygunClient.send err,
    request: req
    response: res
    next: next

##Connect to mongodb server
mongo.connect config.mongoUrl, (err, db) ->
  if err

    winston.error 'filed to connect nerve database'
    raygunClient.send err
    process.exit()

  winston.info 'connected to database.'

  server = exports.server = http.listen port, ->
    host = server.address().address
    port = server.address().port
    winston.info "server started at http://#{host}:#{port}"

  ###
  post {
    author: "",
    title: "",
    description: "",

    //tags and requirement are automatically generated as user input
    tags: {},
    requirement: {},

    status: "",
    comp: "",
    location: "",
    remark: "",
    date: "",
  }
  ###

  server.on 'error', (err) ->
    raygunClient.send err
    winston.error err

  io.on 'connection', (socket) ->
    newrelic.recordMetric 'Custom/Connection/ConnectionAmount', 1
    require('./events.js')(socket, db, winston, raygunClient, newrelic, io)
