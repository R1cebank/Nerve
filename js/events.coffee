uuid = require 'node-uuid'
winston = require 'winston'

module.exports = (socket) ->
  clientUUID = uuid.v1()
  socket.emit 'handshake',
    uuid: clientUUID
  winston.info 'client is connected'
  socket.on 'disconnect', ->
    winston.info 'client disconnected'
  socket.on 'login', (data) -> ##data={name: 'name', password:'password'}
    ##MongoDb action here
    ##Access token is generated using the userID + currentTime + device identifier
    ##
    winston.info 'client trying to login.'
  socket.on 'post', (data) -> ##{title: '', description: '', date: '', tags:'', skills:'',comp: '', location:'', expire:'', remarks:'', accessToken:'', uuid:''}
    clientUUID = validateClient data.accessToken
    if clientUUID?
      ##Post stuff
      winston.info 'user ' + clientUUID + ' is allowed for action: post'
    else
      winston.error 'client is not authorized for such action'
  socket.on 'ping', ->
    winston.info 'recieved ping from MotionDex/Mocha, keep alive.'
  socket.on 'error', (err) ->
    raygunClient.send err
