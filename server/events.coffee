uuid = require 'node-uuid'
winston = require 'winston'

module.exports = (socket, db) ->

  models = require('./models.js')(db) # Include DB here

  clientUUID = uuid.v1()
  socket.emit 'handshake',
    uuid: clientUUID
  winston.info 'client is connected'

  socket.on 'disconnect', models.disconnect()

  ##data={name: 'name', password:'password'}
  socket.on 'login', models.login()

  ###
  {
    title: '',
    description: '',
    date: '', tags:'',
    skills:'',comp: '',
    location:'',
    expire:'',
    remarks:'',
    accessToken:'', uuid:''
  }
  ###
  socket.on 'post', models.post()

  socket.on 'ping', models.ping()

  socket.on 'error', models.error()
