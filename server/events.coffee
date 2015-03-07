module.exports = (socket, db, winston, raygunClient) ->

  models = require('./models.js')(socket, db, winston, raygunClient)
  # Include DB here

  models.connect()()

  socket.on 'disconnect', models.disconnect()

  socket.on 'register', models.register()

  ##data={name: 'name', password:'password'}
  socket.on 'login', models.login()

  socket.on 'reauth', models.reauth()


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

  socket.on 'edit', models.edit()

  socket.on 'whoami', models.whoami()

  socket.on 'emailhash', models.emailhash()

  socket.on 'accept', models.accept()

  socket.on 'editprofile', models.editprofile()

  socket.on 'post', models.post()

  socket.on 'delete', models.delete()

  socket.on 'queryall', models.queryall()

  socket.on 'ping', models.ping()

  socket.on 'error', models.error()
