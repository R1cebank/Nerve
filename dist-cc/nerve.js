
/*
  * nerve
  * http://r1cebank.github.io/Nerve/
 #
  * Copyright (c) 2014 r1cebank
  * Licensed under the MIT license.
 */

(function() {
  var app, bodyParser, chalk, config, d, express, guest, http, io, mongo, path, port, raygun, raygunClient, winston;

  if (process.env.PRODUCTION != null) {
    require('newrelic');
  }

  express = require('express');

  app = express();

  path = require('path');

  http = require('http').Server(app);

  io = require('socket.io')(http);

  bodyParser = require('body-parser');

  mongo = require('mongodb').MongoClient;

  chalk = require('chalk');

  winston = require('winston');

  winston.cli();

  config = require('./config/server-config.json');

  chalk.enabled = true;

  chalk.supportsColor = true;

  winston.info('Forcing chalk color support.');

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

  module.exports = function(options) {
    var VERBOSE;
    return VERBOSE = options;
  };

  guest = {
    name: "guest",
    email: "nerve-guest@gmail.com",
    profession: "guest",
    talents: "guesting"
  };

  app.use(bodyParser.urlencoded({
    extended: false
  }));

  app.use(express["static"](path.join(__dirname, '/www')));

  app.use(function(err, req, res, next) {
    return raygunClient.send(err, {
      request: req,
      response: res,
      next: next
    });
  });

  mongo.connect(config.mongoUrl, function(err, db) {
    var server;
    if (err) {
      winston.error('filed to connect nerve database');
      raygunClient.send(err);
      process.exit();
    }
    winston.info('connected to database.');
    server = exports.server = http.listen(port, function() {
      var host;
      host = server.address().address;
      port = server.address().port;
      return winston.info("server started at http://" + host + ":" + port);
    });

    /*
    post {
      author: "",
      title: "",
      description: "",
    
      //tags and requirement are automatically generated as user input
      tags: {},
      requirement: {},
    
      status: "",
      comp: "",
      location: "",
      remark: "",
      date: "",
    }
     */
    server.on('error', function(err) {
      raygunClient.send(err);
      return winston.error(err);
    });
    return io.on('connection', function(socket) {
      return require('./events.js')(socket, db, winston, raygunClient);
    });
  });

}).call(this);
