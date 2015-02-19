winston = require 'winston'

module.exports = (socket, db) ->

  models = require('./models.js')(socket, db) # Include DB here

  models.connect()()

  socket.on 'disconnect', models.disconnect()

  socket.on 'register', models.register()

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
