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

port = process.env.PORT || 8080

express = require 'express'

app = express()

app.get '/', (req, res) ->
  res.send 'hello world!'

server = app.listen port, ->
  host = server.address().address
  port = server.address().port
  console.log 'server started at http://%s:%s', host, port
