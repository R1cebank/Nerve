module.exports = (socket, db, winston, raygunClient, newrelic, io) ->

  models =
    require('./models.js')(socket, db, winston, raygunClient, newrelic, io)
  # Include DB here

  models.connect()()

  socket.on 'populate', models.populate()

  socket.on 'disconnect', models.disconnect()

  socket.on 'register', models.register()

  socket.on 'login', models.login()

  socket.on 'getmyposts', models.getmyposts()

  socket.on 'reauth', models.reauth()

  socket.on 'edit', models.edit()

  socket.on 'whoami', models.whoami()

  socket.on 'emailhash', models.emailhash()

  socket.on 'geosearch', models.geosearch()

  socket.on 'accept', models.accept()

  socket.on 'changepass', models.changePass()

  socket.on 'uuid2phone', models.uuid2phone()

  socket.on 'postfromid', models.postfromid()

  socket.on 'withdraw', models.withdraw()

  socket.on 'editprofile', models.editprofile()

  socket.on 'post', models.post()

  socket.on 'searchbykey', models.searchbykey()

  socket.on 'delete', models.delete()

  socket.on 'queryall', models.queryall()

  socket.on 'ping', models.ping()

  socket.on 'error', models.error()
