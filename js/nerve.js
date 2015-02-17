
/*
  * nerve
  * http://r1cebank.github.io/Nerve/
 #
  * Copyright (c) 2014 r1cebank
  * Licensed under the MIT license.
 */

(function() {
  var ERROR, INFO, LOG, VERBOSE, app, authorizedClients, bodyParser, chalk, connectedClients, d, error, express, getClient, guest, http, info, io, log, mongo, mongourl, port, raygun, raygunClient, server, uuid, validateClient;

  if (process.env.NODETIME_ACCOUNT_KEY != null) {
    require('nodetime').profile({
      accountKey: process.env.NODETIME_ACCOUNT_KEY,
      appName: 'nerved'
    });
  }

  if (process.env.PRODUCTION != null) {
    raygun = require('raygun');
    raygunClient = new raygun.Client().init({
      apiKey: 'MJqfCmhfsVzK8wR3TML/Fw=='
    });
  }

  d = require('domain').create();

  d.on('error', function(err) {
    return raygunClient.send(err, {}, function() {
      return process.exit();
    });
  });

  port = process.env.PORT || 3939;

  require('newrelic');

  express = require('express');

  app = express();

  http = require('http').Server(app);

  io = require('socket.io')(http);

  uuid = require('node-uuid');

  bodyParser = require('body-parser');

  mongo = require('mongodb').MongoClient;

  chalk = require('chalk');

  VERBOSE = true;

  LOG = true;

  INFO = true;

  ERROR = true;

  module.exports = function(options) {
    return VERBOSE = options;
  };

  log = function(message) {
    if (VERBOSE && LOG) {
      return console.log(chalk.cyan(message));
    }
  };

  error = function(message) {
    if (VERBOSE && ERROR) {
      return console.log(chalk.red(message));
    }
  };

  info = function(message) {
    if (VERBOSE && INFO) {
      return console.log(chalk.green(message));
    }
  };

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
      error('filed to connect nerve database');
      raygunClient.send(err);
      process.exit();
    }
    return log('connected to database.');
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

  server = exports.server = http.listen(port, function() {
    var host;
    host = server.address().address;
    port = server.address().port;
    return info('server started at http://' + host + ':' + port);
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
    log('client is connected');
    info('currently connected users: ' + connectedClients.length);
    socket.on('disconnect', function() {
      var currentClient, i;
      currentClient = getClient('socket', socket);
      if (currentClient != null) {
        i = connectedClients.indexOf(currentClient);
        if (i !== -1) {
          connectedClients.splice(i, 1);
          log('user disconnected:');
          info(JSON.stringify(currentClient.profile));
          return info('currently connected users: ' + connectedClients.length);
        }
      }
    });
    socket.on('login', function(data) {
      authorizedClients.push({
        uuid: 'A2wE002-10481E-21048F',
        accessToken: 'A0204E-D30EC-9201E',
        profile: guest
      });
      return log('client trying to login.');
    });
    socket.on('post', function(data) {
      clientUUID = validateClient(data.accessToken);
      if (clientUUID != null) {
        return info('user ' + clientUUID + ' is allowed for action: post');
      } else {
        return error('client is not authorized for such action');
      }
    });
    socket.on('ping', function() {
      return log('recieved ping from MotionDex/Mocha, keep alive.');
    });
    return socket.on('error', function(err) {
      return raygunClient.send(err);
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,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QU8sdUJBQVA7QUFBQSxRQUErQixXQUFBLEVBQWMsb0JBQTdDO0FBQUEsUUFBa0UsT0FBQSxFQUFTLEtBQTNFO09BQXZCLENBQUEsQ0FBQTthQUNBLEdBQUEsQ0FBSyx5QkFBTCxFQUxpQjtJQUFBLENBQW5CLENBZkEsQ0FBQTtBQUFBLElBcUJBLE1BQU0sQ0FBQyxFQUFQLENBQVcsTUFBWCxFQUFrQixTQUFDLElBQUQsR0FBQTtBQUNoQixNQUFBLFVBQUEsR0FBYSxjQUFBLENBQWUsSUFBSSxDQUFDLFdBQXBCLENBQWIsQ0FBQTtBQUNBLE1BQUEsSUFBRyxrQkFBSDtlQUVFLElBQUEsQ0FBTSxPQUFBLEdBQVMsVUFBVCxHQUF1Qiw4QkFBN0IsRUFGRjtPQUFBLE1BQUE7ZUFJRSxLQUFBLENBQU8sMENBQVAsRUFKRjtPQUZnQjtJQUFBLENBQWxCLENBckJBLENBQUE7QUFBQSxJQTRCQSxNQUFNLENBQUMsRUFBUCxDQUFXLE1BQVgsRUFBa0IsU0FBQSxHQUFBO2FBQ2hCLEdBQUEsQ0FBSyxpREFBTCxFQURnQjtJQUFBLENBQWxCLENBNUJBLENBQUE7V0E4QkEsTUFBTSxDQUFDLEVBQVAsQ0FBVyxPQUFYLEVBQW1CLFNBQUMsR0FBRCxHQUFBO2FBQ2pCLFlBQVksQ0FBQyxJQUFiLENBQWtCLEdBQWxCLEVBRGlCO0lBQUEsQ0FBbkIsRUEvQmtCO0VBQUEsQ0FBcEIsQ0EvSEEsQ0FBQTtBQUFBIiwiZmlsZSI6Im5lcnZlLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXHJcbiAjIG5lcnZlXHJcbiAjIGh0dHA6Ly9yMWNlYmFuay5naXRodWIuaW8vTmVydmUvXHJcbiAjXHJcbiAjIENvcHlyaWdodCAoYykgMjAxNCByMWNlYmFua1xyXG4gIyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuXHJcbiMjI1xyXG5cclxuaWYgcHJvY2Vzcy5lbnYuTk9ERVRJTUVfQUNDT1VOVF9LRVk/XHJcbiAgcmVxdWlyZSgnbm9kZXRpbWUnKS5wcm9maWxlXHJcbiAgICBhY2NvdW50S2V5OiBwcm9jZXNzLmVudi5OT0RFVElNRV9BQ0NPVU5UX0tFWSxcclxuICAgIGFwcE5hbWU6ICduZXJ2ZWQnXHJcblxyXG5pZiBwcm9jZXNzLmVudi5QUk9EVUNUSU9OP1xyXG4gIHJheWd1biA9IHJlcXVpcmUgJ3JheWd1bidcclxuICByYXlndW5DbGllbnQgPSBuZXcgcmF5Z3VuLkNsaWVudCgpLmluaXRcclxuICAgIGFwaUtleTogJ01KcWZDbWhmc1Z6Szh3UjNUTUwvRnc9PSdcclxuXHJcbmQgPSByZXF1aXJlKCdkb21haW4nKS5jcmVhdGUoKVxyXG5kLm9uICdlcnJvcicsIChlcnIpIC0+XHJcbiAgcmF5Z3VuQ2xpZW50LnNlbmQgZXJyLCB7fSwgLT5cclxuICAgIHByb2Nlc3MuZXhpdCgpXHJcblxyXG5wb3J0ID0gcHJvY2Vzcy5lbnYuUE9SVCB8fCAzOTM5XHJcblxyXG5yZXF1aXJlICduZXdyZWxpYydcclxuZXhwcmVzcyA9IHJlcXVpcmUgJ2V4cHJlc3MnXHJcbmFwcCA9IGV4cHJlc3MoKVxyXG5odHRwID0gcmVxdWlyZSgnaHR0cCcpLlNlcnZlcihhcHApXHJcbmlvID0gcmVxdWlyZSgnc29ja2V0LmlvJykoaHR0cClcclxudXVpZCA9IHJlcXVpcmUgJ25vZGUtdXVpZCdcclxuYm9keVBhcnNlciA9IHJlcXVpcmUgJ2JvZHktcGFyc2VyJ1xyXG5tb25nbyA9IHJlcXVpcmUoJ21vbmdvZGInKS5Nb25nb0NsaWVudFxyXG5jaGFsayA9IHJlcXVpcmUgJ2NoYWxrJ1xyXG5cclxuVkVSQk9TRSA9IHllc1xyXG5MT0cgPSB5ZXNcclxuSU5GTyA9IHllc1xyXG5FUlJPUiA9IHllc1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSAob3B0aW9ucykgLT5cclxuICBWRVJCT1NFID0gb3B0aW9uc1xyXG5cclxubG9nID0gKG1lc3NhZ2UpIC0+XHJcbiAgaWYoVkVSQk9TRSBhbmQgTE9HKVxyXG4gICAgY29uc29sZS5sb2cgY2hhbGsuY3lhbiBtZXNzYWdlXHJcbmVycm9yID0gKG1lc3NhZ2UpIC0+XHJcbiAgaWYoVkVSQk9TRSBhbmQgRVJST1IpXHJcbiAgICBjb25zb2xlLmxvZyBjaGFsay5yZWQgbWVzc2FnZVxyXG5pbmZvID0gKG1lc3NhZ2UpIC0+XHJcbiAgaWYoVkVSQk9TRSBhbmQgSU5GTylcclxuICAgIGNvbnNvbGUubG9nIGNoYWxrLmdyZWVuIG1lc3NhZ2VcclxuXHJcbm1vbmdvdXJsID0gJ21vbmdvZGI6Ly9uZXJ2ZWQ6Q3BoVjdjYVVwZFlSUjlAZHMwNDE1NjEubW9uZ29sYWIuY29tOjQxNTYxL2hlcm9rdV9hcHAzMzY5NTE1NydcclxuXHJcbmNvbm5lY3RlZENsaWVudHMgPSBbXVxyXG5hdXRob3JpemVkQ2xpZW50cyA9IFtdXHJcblxyXG5ndWVzdCA9XHJcbiAgbmFtZTogXCJndWVzdFwiXHJcbiAgZW1haWw6IFwibmVydmUtZ3Vlc3RAZ21haWwuY29tXCJcclxuICBwcm9mZXNzaW9uOiBcImd1ZXN0XCJcclxuICB0YWxlbnRzOiBcImd1ZXN0aW5nXCJcclxuXHJcbiMjQ29ubmVjdCB0byBtb25nb2RiIHNlcnZlclxyXG5tb25nby5jb25uZWN0IG1vbmdvdXJsLCAoZXJyLCBkYikgLT5cclxuICBpZiBlcnI/XHJcblxyXG4gICAgZXJyb3IgJ2ZpbGVkIHRvIGNvbm5lY3QgbmVydmUgZGF0YWJhc2UnXHJcbiAgICByYXlndW5DbGllbnQuc2VuZCBlcnJcclxuICAgIHByb2Nlc3MuZXhpdCgpXHJcblxyXG4gIGxvZyAnY29ubmVjdGVkIHRvIGRhdGFiYXNlLidcclxuXHJcblxyXG5hcHAudXNlIGJvZHlQYXJzZXIudXJsZW5jb2RlZCBleHRlbmRlZDogZmFsc2VcclxuYXBwLnVzZSAnL2NzcycsIGV4cHJlc3Muc3RhdGljIHByb2Nlc3MuY3dkKCkgKyAnL3d3dy9jc3MnXHJcbmFwcC51c2UgJy9pbWcnLCBleHByZXNzLnN0YXRpYyBwcm9jZXNzLmN3ZCgpICsgJy93d3cvaW1nJ1xyXG5hcHAudXNlICcvanMnLCBleHByZXNzLnN0YXRpYyBwcm9jZXNzLmN3ZCgpICsgJy93d3cvanMnXHJcbmFwcC51c2UgKGVyciwgcmVxLCByZXMsIG5leHQpIC0+XHJcbiAgcmF5Z3VuQ2xpZW50LnNlbmQgZXJyLFxyXG4gICAgcmVxdWVzdDogcmVxXHJcbiAgICByZXNwb25zZTogcmVzXHJcbiAgICBuZXh0OiBuZXh0XHJcblxyXG5hcHAuZ2V0ICcvJywgKHJlcSwgcmVzKSAtPlxyXG4gIHJlcy5zZW5kRmlsZSBwcm9jZXNzLmN3ZCgpICsgJy93d3cvaW5kZXguaHRtbCdcclxuXHJcbiMjbXVzdCB1c2UgeC13d3ctZm9ybS11cmxlbmNvZGVkXHJcbmFwcC5wb3N0ICcvbG9naW4nLCAocmVxLCByZXMpIC0+XHJcbiAgcmVzLnNlbmQgXCJ1c2VyOiBcIiArIHJlcS5ib2R5LnVzZXIgKyBcIiBwYXNzOiBcIiArIHJlcS5ib2R5LnBhc3NcclxuXHJcbnNlcnZlciA9IGV4cG9ydHMuc2VydmVyID0gaHR0cC5saXN0ZW4gcG9ydCwgLT5cclxuICBob3N0ID0gc2VydmVyLmFkZHJlc3MoKS5hZGRyZXNzXHJcbiAgcG9ydCA9IHNlcnZlci5hZGRyZXNzKCkucG9ydFxyXG4gIGluZm8gJ3NlcnZlciBzdGFydGVkIGF0IGh0dHA6Ly8nICsgaG9zdCArICc6JyArIHBvcnRcclxuXHJcbiMjI1xyXG5wb3N0IHtcclxuICBhdXRob3I6IFwiXCIsXHJcbiAgdGl0bGU6IFwiXCIsXHJcbiAgZGVzY3JpcHRpb246IFwiXCIsXHJcbiAgdGFnczoge30sXHJcbiAgcmVxdWlyZW1lbnQ6IHt9LCAvL3RhZ3MgYW5kIHJlcXVpcmVtZW50IGFyZSBhdXRvbWF0aWNhbGx5IGdlbmVyYXRlZCBhcyB1c2VyIGlucHV0XHJcbiAgc3RhdHVzOiBcIlwiLFxyXG4gIGNvbXA6IFwiXCIsXHJcbiAgbG9jYXRpb246IFwiXCIsXHJcbiAgcmVtYXJrOiBcIlwiLFxyXG4gIGRhdGU6IFwiXCIsXHJcbn1cclxuIyMjXHJcblxyXG5nZXRDbGllbnQgPSAodHlwZSwgZWxlbWVudCkgLT5cclxuICBmb3IgY2xpZW50IGluIGNvbm5lY3RlZENsaWVudHNcclxuICAgIGlmIGNsaWVudFt0eXBlXSBpcyBlbGVtZW50XHJcbiAgICAgIHJldHVybiBjbGllbnRcclxuICByZXR1cm4gbnVsbFxyXG5cclxudmFsaWRhdGVDbGllbnQgPSAoYWNjZXNzVG9rZW4sIHV1aWQpIC0+XHJcbiAgZm9yIGNsaWVudCBpbiBhdXRob3JpemVkQ2xpZW50c1xyXG4gICAgaWYgY2xpZW50WydhY2Nlc3NUb2tlbiddIGlzIGFjY2Vzc1Rva2VuXHJcbiAgICAgIHJldHVybiBjbGllbnRbJ3V1aWQnXVxyXG4gIHJldHVybiBudWxsXHJcblxyXG5zZXJ2ZXIub24gJ2Vycm9yJywgKGVycikgLT5cclxuICByYXlndW5DbGllbnQuc2VuZCBlcnJcclxuXHJcbmlvLm9uICdjb25uZWN0aW9uJywgKHNvY2tldCkgLT5cclxuICBjbGllbnRVVUlEID0gdXVpZC52MSgpXHJcbiAgY29ubmVjdGVkQ2xpZW50cy5wdXNoIHNvY2tldDogc29ja2V0LCB1dWlkOiBjbGllbnRVVUlELCBwcm9maWxlOiBndWVzdCwgZW5hYmxlZDogbm9cclxuICBzb2NrZXQuZW1pdCAnaGFuZHNoYWtlJyxcclxuICAgIHV1aWQ6IGNsaWVudFVVSURcclxuICBsb2cgJ2NsaWVudCBpcyBjb25uZWN0ZWQnXHJcbiAgaW5mbyAnY3VycmVudGx5IGNvbm5lY3RlZCB1c2VyczogJyArIGNvbm5lY3RlZENsaWVudHMubGVuZ3RoXHJcbiAgc29ja2V0Lm9uICdkaXNjb25uZWN0JywgLT5cclxuICAgIGN1cnJlbnRDbGllbnQgPSBnZXRDbGllbnQgJ3NvY2tldCcsIHNvY2tldFxyXG4gICAgaWYgY3VycmVudENsaWVudD9cclxuICAgICAgaSA9IGNvbm5lY3RlZENsaWVudHMuaW5kZXhPZiBjdXJyZW50Q2xpZW50XHJcbiAgICAgIGlmIGkgIT0gLTFcclxuICAgICAgICBjb25uZWN0ZWRDbGllbnRzLnNwbGljZSBpLCAxXHJcbiAgICAgICAgbG9nICd1c2VyIGRpc2Nvbm5lY3RlZDonXHJcbiAgICAgICAgaW5mbyBKU09OLnN0cmluZ2lmeSBjdXJyZW50Q2xpZW50LnByb2ZpbGVcclxuICAgICAgICBpbmZvICdjdXJyZW50bHkgY29ubmVjdGVkIHVzZXJzOiAnICsgY29ubmVjdGVkQ2xpZW50cy5sZW5ndGhcclxuICBzb2NrZXQub24gJ2xvZ2luJywgKGRhdGEpIC0+ICMjZGF0YT17bmFtZTogJ25hbWUnLCBwYXNzd29yZDoncGFzc3dvcmQnfVxyXG4gICAgIyNNb25nb0RiIGFjdGlvbiBoZXJlXHJcbiAgICAjI0FjY2VzcyB0b2tlbiBpcyBnZW5lcmF0ZWQgdXNpbmcgdGhlIHVzZXJJRCArIGN1cnJlbnRUaW1lICsgZGV2aWNlIGlkZW50aWZpZXJcclxuICAgICMjXHJcbiAgICBhdXRob3JpemVkQ2xpZW50cy5wdXNoIHV1aWQ6ICdBMndFMDAyLTEwNDgxRS0yMTA0OEYnLCBhY2Nlc3NUb2tlbjogJ0EwMjA0RS1EMzBFQy05MjAxRScsIHByb2ZpbGU6IGd1ZXN0XHJcbiAgICBsb2cgJ2NsaWVudCB0cnlpbmcgdG8gbG9naW4uJ1xyXG4gIHNvY2tldC5vbiAncG9zdCcsIChkYXRhKSAtPiAjI3t0aXRsZTogJycsIGRlc2NyaXB0aW9uOiAnJywgZGF0ZTogJycsIHRhZ3M6JycsIHNraWxsczonJyxjb21wOiAnJywgbG9jYXRpb246JycsIGV4cGlyZTonJywgcmVtYXJrczonJywgYWNjZXNzVG9rZW46JycsIHV1aWQ6Jyd9XHJcbiAgICBjbGllbnRVVUlEID0gdmFsaWRhdGVDbGllbnQgZGF0YS5hY2Nlc3NUb2tlblxyXG4gICAgaWYgY2xpZW50VVVJRD9cclxuICAgICAgIyNQb3N0IHN0dWZmXHJcbiAgICAgIGluZm8gJ3VzZXIgJyArIGNsaWVudFVVSUQgKyAnIGlzIGFsbG93ZWQgZm9yIGFjdGlvbjogcG9zdCdcclxuICAgIGVsc2VcclxuICAgICAgZXJyb3IgJ2NsaWVudCBpcyBub3QgYXV0aG9yaXplZCBmb3Igc3VjaCBhY3Rpb24nXHJcbiAgc29ja2V0Lm9uICdwaW5nJywgLT5cclxuICAgIGxvZyAncmVjaWV2ZWQgcGluZyBmcm9tIE1vdGlvbkRleC9Nb2NoYSwga2VlcCBhbGl2ZS4nXHJcbiAgc29ja2V0Lm9uICdlcnJvcicsIChlcnIpIC0+XHJcbiAgICByYXlndW5DbGllbnQuc2VuZCBlcnJcclxuIl19