module.exports = (db) ->

  self = { }


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
