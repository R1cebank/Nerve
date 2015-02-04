if process.env.NODETIME_ACCOUNT_KEY?
  require('nodetime').profile
    accountKey: process.env.NODETIME_ACCOUNT_KEY,
    appName: 'nerved'

port = process.env.PORT || 8080

express = require 'express'

app = express()

app.get '/', (req, res) ->
  res.send 'hello world!'

server = app.listen port, ->
  host = server.address().address
  port = server.address().port
  console.log 'server started at http://%s:%s', host, port
