uuid = require 'node-uuid'
winston = require 'winston'

module.exports = (socket,db) ->

  self = { }

  self.connect = ->
    ->
      clientUUID = uuid.v1()
      socket.emit 'handshake',
        uuid: clientUUID
      winston.info 'client is connected'

  self.disconnect = ->
    ->
      winston.info 'client disconnected.'

  self.login = ->
    (data) ->
      winston.info 'client trying to login.'

  self.post = ->
    (data) ->
      winston.info 'user post'

  self.ping = ->
    ->
      winston.info 'recieved ping from MotionDex/Mocha, keep alive.'

  self.error = ->
    (error) ->
      raygunClient.send error

  return self
