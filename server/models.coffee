uuid = require 'node-uuid'
winston = require 'winston'
crypto = require 'crypto'

module.exports = (socket,db) ->

  profiles = db.collection('profiles')
  posts = db.collection('posts')

  self = { }

  self.connect = ->
    ->
      clientUUID = uuid.v1()
      socket.emit 'handshake',
        uuid: clientUUID
      winston.info 'client is connected'

  self.register = ->
    (data) ->
      #check against existing email

      profiles.find(email: data.email).toArray (err, docs) ->
        if docs.length > 0
          winston.info 'trying to insert existing user'
          socket.emit 'response',
            code: 201
            message: 'user exist'
            errorcode: 400
          return
        else
          h1 = crypto.createHash 'sha256'
            .update data.uuid
            .digest 'hex'
          h2 = crypto.createHash 'sha256'
            .update new Date().toISOString()
            .digest 'hex'
          key = crypto.createHash 'sha256'
            .update h1 + h2
            .digest 'hex'
          hmac = crypto.createHmac 'sha256', key
          userPass = hmac.update(data.pass).digest('hex')
          profiles.insert
            name:         data.name
            email:        data.email
            profession:   data.profession
            talents:      data.talents
            uuid:         data.uuid
            password:     userPass
            secret:       key
            , (err, docs) ->
              winston.info 'new user inserted :#{data.name}:#{data.uuid}'
              socket.emit 'response',
                code: 200
                message: 'user created'
                errorcode: 0

  ###response codes
    200 - OK
    201 - ERROR
  error codes
    400 - USER EXIST
  ###

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
      if process.env.PRODUCTION
        raygunClient.send error
      winston.error error

  return self
