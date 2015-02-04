if process.env.NODETIME_ACCOUNT_KEY?
  require('nodetime').profile
    accountKey: process.env.NODETIME_ACCOUNT_KEY,
    appName: 'nerved'

express = require 'express'

app = express()

app.get '/', (req, res) ->
  res.send 'hello world!'

server = app.listen 80, ->
  host = server.address().address
  port = server.address().port
  console.log 'server started at http://%s:%s', host, port
