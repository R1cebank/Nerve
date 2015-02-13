(function() {
  var app, authorizedClients, bodyParser, chalk, connectedClients, d, express, getClient, guest, http, io, mongo, mongourl, port, raygun, raygunClient, server, uuid, validateClient;

  if (process.env.NODETIME_ACCOUNT_KEY != null) {
    require('nodetime').profile({
      accountKey: process.env.NODETIME_ACCOUNT_KEY,
      appName: 'nerved'
    });
  }

  raygun = require('raygun');

  raygunClient = new raygun.Client().init({
    apiKey: 'MJqfCmhfsVzK8wR3TML/Fw=='
  });

  d = require('domain').create();

  d.on('error', function(err) {
    return raygunClient.send(err, {}, function() {
      return process.exit();
    });
  });

  port = process.env.PORT || 3939;

  express = require('express');

  app = express();

  http = require('http').Server(app);

  io = require('socket.io')(http);

  uuid = require('node-uuid');

  bodyParser = require('body-parser');

  mongo = require('mongodb').MongoClient;

  chalk = require('chalk');

  mongourl = 'mongodb://nerved:CphV7caUpdYRR9@ds041561.mongolab.com:41561/heroku_app33695157';

  connectedClients = [];

  authorizedClients = [];

  guest = {
    name: "guest",
    email: "nerve-guest@gmail.com",
    profession: "guest",
    talents: "guesting"
  };

  mongo.connect(mongourl, function(err, db) {
    if (err != null) {
      console.log(chalk.red('filed to connect nerve database'));
      raygunClient.send(err);
      process.exit();
    }
    return console.log(chalk.green('connected to database.'));
  });

  app.use(bodyParser.urlencoded({
    extended: false
  }));

  app.use('/css', express["static"](process.cwd() + '/www/css'));

  app.use('/img', express["static"](process.cwd() + '/www/img'));

  app.use('/js', express["static"](process.cwd() + '/www/js'));

  app.use(function(err, req, res, next) {
    return raygunClient.send(err, {
      request: req,
      response: res,
      next: next
    });
  });

  app.get('/', function(req, res) {
    return res.sendFile(process.cwd() + '/www/index.html');
  });

  app.post('/login', function(req, res) {
    return res.send("user: " + req.body.user + " pass: " + req.body.pass);
  });

  server = http.listen(port, function() {
    var host;
    host = server.address().address;
    port = server.address().port;
    return console.log(chalk.green('server started at http://', host, port));
  });


  /*
  post {
    author: "",
    title: "",
    description: "",
    tags: {},
    requirement: {}, //tags and requirement are automatically generated as user input
    status: "",
    comp: "",
    location: "",
    remark: "",
    date: "",
  }
   */

  getClient = function(type, element) {
    var client, _i, _len;
    for (_i = 0, _len = connectedClients.length; _i < _len; _i++) {
      client = connectedClients[_i];
      if (client[type] === element) {
        return client;
      }
    }
    return null;
  };

  validateClient = function(accessToken, uuid) {
    var client, _i, _len;
    for (_i = 0, _len = authorizedClients.length; _i < _len; _i++) {
      client = authorizedClients[_i];
      if (client['accessToken'] === accessToken) {
        return client['uuid'];
      }
    }
    return null;
  };

  server.on('error', function(err) {
    return raygunClient.send(err);
  });

  io.on('connection', function(socket) {
    var clientUUID;
    clientUUID = uuid.v1();
    connectedClients.push({
      socket: socket,
      uuid: clientUUID,
      profile: guest,
      enabled: false
    });
    socket.emit('handshake', {
      uuid: clientUUID
    });
    console.log(chalk.cyan('client is connected'));
    console.log(chalk.green('currently connected users: ' + connectedClients.length));
    socket.on('disconnect', function() {
      var currentClient, i;
      currentClient = getClient('socket', socket);
      if (currentClient != null) {
        i = connectedClients.indexOf(currentClient);
        if (i !== -1) {
          connectedClients.splice(i, 1);
          console.log(chalk.cyan('user disconnected:'));
          console.log(chalk.green(JSON.stringify(currentClient.profile)));
          return console.log(chalk.green('currently connected users: ' + connectedClients.length));
        }
      }
    });
    socket.on('login', function(data) {
      authorizedClients.push({
        uuid: 'A2wE002-10481E-21048F',
        accessToken: 'A0204E-D30EC-9201E',
        profile: guest
      });
      return console.log(chalk.cyan('client trying to login.'));
    });
    socket.on('post', function(data) {
      clientUUID = validateClient(data.accessToken);
      if (clientUUID != null) {
        return console.log(chalk.green('user ' + clientUUID + ' is allowed for action: post'));
      } else {
        return console.log(chalk.red('client is not authorized for such action'));
      }
    });
    return socket.on('error', function(err) {
      return raygunClient.send(err);
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,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LEVBQW1CLFNBQUMsR0FBRCxHQUFBO2FBQ2pCLFlBQVksQ0FBQyxJQUFiLENBQWtCLEdBQWxCLEVBRGlCO0lBQUEsQ0FBbkIsRUE3QmtCO0VBQUEsQ0FBcEIsQ0FuR0EsQ0FBQTtBQUFBIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJpZiBwcm9jZXNzLmVudi5OT0RFVElNRV9BQ0NPVU5UX0tFWT9cbiAgcmVxdWlyZSgnbm9kZXRpbWUnKS5wcm9maWxlXG4gICAgYWNjb3VudEtleTogcHJvY2Vzcy5lbnYuTk9ERVRJTUVfQUNDT1VOVF9LRVksXG4gICAgYXBwTmFtZTogJ25lcnZlZCdcblxucmF5Z3VuID0gcmVxdWlyZSAncmF5Z3VuJ1xucmF5Z3VuQ2xpZW50ID0gbmV3IHJheWd1bi5DbGllbnQoKS5pbml0XG4gIGFwaUtleTogJ01KcWZDbWhmc1Z6Szh3UjNUTUwvRnc9PSdcblxuZCA9IHJlcXVpcmUoJ2RvbWFpbicpLmNyZWF0ZSgpXG5kLm9uICdlcnJvcicsIChlcnIpIC0+XG4gIHJheWd1bkNsaWVudC5zZW5kIGVyciwge30sIC0+XG4gICAgcHJvY2Vzcy5leGl0KClcblxucG9ydCA9IHByb2Nlc3MuZW52LlBPUlQgfHwgMzkzOVxuXG5leHByZXNzID0gcmVxdWlyZSAnZXhwcmVzcydcbmFwcCA9IGV4cHJlc3MoKVxuaHR0cCA9IHJlcXVpcmUoJ2h0dHAnKS5TZXJ2ZXIoYXBwKVxuaW8gPSByZXF1aXJlKCdzb2NrZXQuaW8nKShodHRwKVxudXVpZCA9IHJlcXVpcmUgJ25vZGUtdXVpZCdcbmJvZHlQYXJzZXIgPSByZXF1aXJlICdib2R5LXBhcnNlcidcbm1vbmdvID0gcmVxdWlyZSgnbW9uZ29kYicpLk1vbmdvQ2xpZW50XG5jaGFsayA9IHJlcXVpcmUgJ2NoYWxrJ1xuXG5tb25nb3VybCA9ICdtb25nb2RiOi8vbmVydmVkOkNwaFY3Y2FVcGRZUlI5QGRzMDQxNTYxLm1vbmdvbGFiLmNvbTo0MTU2MS9oZXJva3VfYXBwMzM2OTUxNTcnXG5cbmNvbm5lY3RlZENsaWVudHMgPSBbXVxuYXV0aG9yaXplZENsaWVudHMgPSBbXVxuXG5ndWVzdCA9XG4gIG5hbWU6IFwiZ3Vlc3RcIlxuICBlbWFpbDogXCJuZXJ2ZS1ndWVzdEBnbWFpbC5jb21cIlxuICBwcm9mZXNzaW9uOiBcImd1ZXN0XCJcbiAgdGFsZW50czogXCJndWVzdGluZ1wiXG5cbiMjQ29ubmVjdCB0byBtb25nb2RiIHNlcnZlclxubW9uZ28uY29ubmVjdCBtb25nb3VybCwgKGVyciwgZGIpIC0+XG4gIGlmIGVycj9cblxuICAgIGNvbnNvbGUubG9nIGNoYWxrLnJlZCAnZmlsZWQgdG8gY29ubmVjdCBuZXJ2ZSBkYXRhYmFzZSdcbiAgICByYXlndW5DbGllbnQuc2VuZCBlcnJcbiAgICBwcm9jZXNzLmV4aXQoKVxuXG4gIGNvbnNvbGUubG9nIGNoYWxrLmdyZWVuICdjb25uZWN0ZWQgdG8gZGF0YWJhc2UuJ1xuXG5cbmFwcC51c2UgYm9keVBhcnNlci51cmxlbmNvZGVkIGV4dGVuZGVkOiBmYWxzZVxuYXBwLnVzZSAnL2NzcycsIGV4cHJlc3Muc3RhdGljIHByb2Nlc3MuY3dkKCkgKyAnL3d3dy9jc3MnXG5hcHAudXNlICcvaW1nJywgZXhwcmVzcy5zdGF0aWMgcHJvY2Vzcy5jd2QoKSArICcvd3d3L2ltZydcbmFwcC51c2UgJy9qcycsIGV4cHJlc3Muc3RhdGljIHByb2Nlc3MuY3dkKCkgKyAnL3d3dy9qcydcbmFwcC51c2UgKGVyciwgcmVxLCByZXMsIG5leHQpIC0+XG4gIHJheWd1bkNsaWVudC5zZW5kIGVycixcbiAgICByZXF1ZXN0OiByZXFcbiAgICByZXNwb25zZTogcmVzXG4gICAgbmV4dDogbmV4dFxuXG5hcHAuZ2V0ICcvJywgKHJlcSwgcmVzKSAtPlxuICByZXMuc2VuZEZpbGUgcHJvY2Vzcy5jd2QoKSArICcvd3d3L2luZGV4Lmh0bWwnXG5cbiMjbXVzdCB1c2UgeC13d3ctZm9ybS11cmxlbmNvZGVkXG5hcHAucG9zdCAnL2xvZ2luJywgKHJlcSwgcmVzKSAtPlxuICByZXMuc2VuZCBcInVzZXI6IFwiICsgcmVxLmJvZHkudXNlciArIFwiIHBhc3M6IFwiICsgcmVxLmJvZHkucGFzc1xuXG5zZXJ2ZXIgPSBodHRwLmxpc3RlbiBwb3J0LCAtPlxuICBob3N0ID0gc2VydmVyLmFkZHJlc3MoKS5hZGRyZXNzXG4gIHBvcnQgPSBzZXJ2ZXIuYWRkcmVzcygpLnBvcnRcbiAgY29uc29sZS5sb2cgY2hhbGsuZ3JlZW4gJ3NlcnZlciBzdGFydGVkIGF0IGh0dHA6Ly8nLCBob3N0LCBwb3J0XG5cbiMjI1xucG9zdCB7XG4gIGF1dGhvcjogXCJcIixcbiAgdGl0bGU6IFwiXCIsXG4gIGRlc2NyaXB0aW9uOiBcIlwiLFxuICB0YWdzOiB7fSxcbiAgcmVxdWlyZW1lbnQ6IHt9LCAvL3RhZ3MgYW5kIHJlcXVpcmVtZW50IGFyZSBhdXRvbWF0aWNhbGx5IGdlbmVyYXRlZCBhcyB1c2VyIGlucHV0XG4gIHN0YXR1czogXCJcIixcbiAgY29tcDogXCJcIixcbiAgbG9jYXRpb246IFwiXCIsXG4gIHJlbWFyazogXCJcIixcbiAgZGF0ZTogXCJcIixcbn1cbiMjI1xuXG5nZXRDbGllbnQgPSAodHlwZSwgZWxlbWVudCkgLT5cbiAgZm9yIGNsaWVudCBpbiBjb25uZWN0ZWRDbGllbnRzXG4gICAgaWYgY2xpZW50W3R5cGVdIGlzIGVsZW1lbnRcbiAgICAgIHJldHVybiBjbGllbnRcbiAgcmV0dXJuIG51bGxcblxudmFsaWRhdGVDbGllbnQgPSAoYWNjZXNzVG9rZW4sIHV1aWQpIC0+XG4gIGZvciBjbGllbnQgaW4gYXV0aG9yaXplZENsaWVudHNcbiAgICBpZiBjbGllbnRbJ2FjY2Vzc1Rva2VuJ10gaXMgYWNjZXNzVG9rZW5cbiAgICAgIHJldHVybiBjbGllbnRbJ3V1aWQnXVxuICByZXR1cm4gbnVsbFxuXG5zZXJ2ZXIub24gJ2Vycm9yJywgKGVycikgLT5cbiAgcmF5Z3VuQ2xpZW50LnNlbmQgZXJyXG5cbmlvLm9uICdjb25uZWN0aW9uJywgKHNvY2tldCkgLT5cbiAgY2xpZW50VVVJRCA9IHV1aWQudjEoKVxuICBjb25uZWN0ZWRDbGllbnRzLnB1c2ggc29ja2V0OiBzb2NrZXQsIHV1aWQ6IGNsaWVudFVVSUQsIHByb2ZpbGU6IGd1ZXN0LCBlbmFibGVkOiBub1xuICBzb2NrZXQuZW1pdCAnaGFuZHNoYWtlJyxcbiAgICB1dWlkOiBjbGllbnRVVUlEXG4gIGNvbnNvbGUubG9nIGNoYWxrLmN5YW4gJ2NsaWVudCBpcyBjb25uZWN0ZWQnXG4gIGNvbnNvbGUubG9nIGNoYWxrLmdyZWVuICdjdXJyZW50bHkgY29ubmVjdGVkIHVzZXJzOiAnICsgY29ubmVjdGVkQ2xpZW50cy5sZW5ndGhcbiAgc29ja2V0Lm9uICdkaXNjb25uZWN0JywgLT5cbiAgICBjdXJyZW50Q2xpZW50ID0gZ2V0Q2xpZW50ICdzb2NrZXQnLCBzb2NrZXRcbiAgICBpZiBjdXJyZW50Q2xpZW50P1xuICAgICAgaSA9IGNvbm5lY3RlZENsaWVudHMuaW5kZXhPZiBjdXJyZW50Q2xpZW50XG4gICAgICBpZiBpICE9IC0xXG4gICAgICAgIGNvbm5lY3RlZENsaWVudHMuc3BsaWNlIGksIDFcbiAgICAgICAgY29uc29sZS5sb2cgY2hhbGsuY3lhbiAndXNlciBkaXNjb25uZWN0ZWQ6J1xuICAgICAgICBjb25zb2xlLmxvZyBjaGFsay5ncmVlbiBKU09OLnN0cmluZ2lmeSBjdXJyZW50Q2xpZW50LnByb2ZpbGVcbiAgICAgICAgY29uc29sZS5sb2cgY2hhbGsuZ3JlZW4gJ2N1cnJlbnRseSBjb25uZWN0ZWQgdXNlcnM6ICcgKyBjb25uZWN0ZWRDbGllbnRzLmxlbmd0aFxuICBzb2NrZXQub24gJ2xvZ2luJywgKGRhdGEpIC0+ICMjZGF0YT17bmFtZTogJ25hbWUnLCBwYXNzd29yZDoncGFzc3dvcmQnfVxuICAgICMjTW9uZ29EYiBhY3Rpb24gaGVyZVxuICAgICMjQWNjZXNzIHRva2VuIGlzIGdlbmVyYXRlZCB1c2luZyB0aGUgdXNlcklEICsgY3VycmVudFRpbWUgKyBkZXZpY2UgaWRlbnRpZmllclxuICAgICMjXG4gICAgYXV0aG9yaXplZENsaWVudHMucHVzaCB1dWlkOiAnQTJ3RTAwMi0xMDQ4MUUtMjEwNDhGJywgYWNjZXNzVG9rZW46ICdBMDIwNEUtRDMwRUMtOTIwMUUnLCBwcm9maWxlOiBndWVzdFxuICAgIGNvbnNvbGUubG9nIGNoYWxrLmN5YW4gJ2NsaWVudCB0cnlpbmcgdG8gbG9naW4uJ1xuICBzb2NrZXQub24gJ3Bvc3QnLCAoZGF0YSkgLT4gIyN7dGl0bGU6ICcnLCBkZXNjcmlwdGlvbjogJycsIGRhdGU6ICcnLCB0YWdzOicnLCBza2lsbHM6JycsY29tcDogJycsIGxvY2F0aW9uOicnLCBleHBpcmU6JycsIHJlbWFya3M6JycsIGFjY2Vzc1Rva2VuOicnLCB1dWlkOicnfVxuICAgIGNsaWVudFVVSUQgPSB2YWxpZGF0ZUNsaWVudCBkYXRhLmFjY2Vzc1Rva2VuXG4gICAgaWYgY2xpZW50VVVJRD9cbiAgICAgICMjUG9zdCBzdHVmZlxuICAgICAgY29uc29sZS5sb2cgY2hhbGsuZ3JlZW4gJ3VzZXIgJyArIGNsaWVudFVVSUQgKyAnIGlzIGFsbG93ZWQgZm9yIGFjdGlvbjogcG9zdCdcbiAgICBlbHNlXG4gICAgICBjb25zb2xlLmxvZyBjaGFsay5yZWQgJ2NsaWVudCBpcyBub3QgYXV0aG9yaXplZCBmb3Igc3VjaCBhY3Rpb24nXG4gIHNvY2tldC5vbiAnZXJyb3InLCAoZXJyKSAtPlxuICAgIHJheWd1bkNsaWVudC5zZW5kIGVyclxuIl19