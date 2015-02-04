(function() {
  var app, d, express, port, raygun, raygunClient, server;

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

  port = process.env.PORT || 8080;

  express = require('express');

  app = express();

  app.get('/', function(req, res) {
    return res.send('hello world!');
  });

  server = app.listen(port, function() {
    var host;
    host = server.address().address;
    port = server.address().port;
    return console.log('server started at http://%s:%s', host, port);
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxtREFBQTs7QUFBQSxFQUFBLElBQUcsd0NBQUg7QUFDRSxJQUFBLE9BQUEsQ0FBUyxVQUFULENBQW1CLENBQUMsT0FBcEIsQ0FDRTtBQUFBLE1BQUEsVUFBQSxFQUFZLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0JBQXhCO0FBQUEsTUFDQSxPQUFBLEVBQVUsUUFEVjtLQURGLENBQUEsQ0FERjtHQUFBOztBQUFBLEVBS0EsTUFBQSxHQUFTLE9BQUEsQ0FBUyxRQUFULENBTFQsQ0FBQTs7QUFBQSxFQU1BLFlBQUEsR0FBbUIsSUFBQSxNQUFNLENBQUMsTUFBUCxDQUFBLENBQWUsQ0FBQyxJQUFoQixDQUNqQjtBQUFBLElBQUEsTUFBQSxFQUFTLDBCQUFUO0dBRGlCLENBTm5CLENBQUE7O0FBQUEsRUFTQSxDQUFBLEdBQUksT0FBQSxDQUFTLFFBQVQsQ0FBaUIsQ0FBQyxNQUFsQixDQUFBLENBVEosQ0FBQTs7QUFBQSxFQVVBLENBQUMsQ0FBQyxFQUFGLENBQU0sT0FBTixFQUFjLFNBQUMsR0FBRCxHQUFBO1dBQ1osWUFBWSxDQUFDLElBQWIsQ0FBa0IsR0FBbEIsRUFBdUIsRUFBdkIsRUFBMkIsU0FBQSxHQUFBO2FBQ3pCLE9BQU8sQ0FBQyxJQUFSLENBQUEsRUFEeUI7SUFBQSxDQUEzQixFQURZO0VBQUEsQ0FBZCxDQVZBLENBQUE7O0FBQUEsRUFjQSxJQUFBLEdBQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFaLElBQW9CLElBZDNCLENBQUE7O0FBQUEsRUFnQkEsT0FBQSxHQUFVLE9BQUEsQ0FBUyxTQUFULENBaEJWLENBQUE7O0FBQUEsRUFrQkEsR0FBQSxHQUFNLE9BQUEsQ0FBQSxDQWxCTixDQUFBOztBQUFBLEVBb0JBLEdBQUcsQ0FBQyxHQUFKLENBQVMsR0FBVCxFQUFhLFNBQUMsR0FBRCxFQUFNLEdBQU4sR0FBQTtXQUNYLEdBQUcsQ0FBQyxJQUFKLENBQVUsY0FBVixFQURXO0VBQUEsQ0FBYixDQXBCQSxDQUFBOztBQUFBLEVBdUJBLE1BQUEsR0FBUyxHQUFHLENBQUMsTUFBSixDQUFXLElBQVgsRUFBaUIsU0FBQSxHQUFBO0FBQ3hCLFFBQUEsSUFBQTtBQUFBLElBQUEsSUFBQSxHQUFPLE1BQU0sQ0FBQyxPQUFQLENBQUEsQ0FBZ0IsQ0FBQyxPQUF4QixDQUFBO0FBQUEsSUFDQSxJQUFBLEdBQU8sTUFBTSxDQUFDLE9BQVAsQ0FBQSxDQUFnQixDQUFDLElBRHhCLENBQUE7V0FFQSxPQUFPLENBQUMsR0FBUixDQUFhLGdDQUFiLEVBQThDLElBQTlDLEVBQW9ELElBQXBELEVBSHdCO0VBQUEsQ0FBakIsQ0F2QlQsQ0FBQTtBQUFBIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyJpZiBwcm9jZXNzLmVudi5OT0RFVElNRV9BQ0NPVU5UX0tFWT9cclxuICByZXF1aXJlKCdub2RldGltZScpLnByb2ZpbGVcclxuICAgIGFjY291bnRLZXk6IHByb2Nlc3MuZW52Lk5PREVUSU1FX0FDQ09VTlRfS0VZLFxyXG4gICAgYXBwTmFtZTogJ25lcnZlZCdcclxuXHJcbnJheWd1biA9IHJlcXVpcmUgJ3JheWd1bidcclxucmF5Z3VuQ2xpZW50ID0gbmV3IHJheWd1bi5DbGllbnQoKS5pbml0XHJcbiAgYXBpS2V5OiAnTUpxZkNtaGZzVnpLOHdSM1RNTC9Gdz09J1xyXG5cclxuZCA9IHJlcXVpcmUoJ2RvbWFpbicpLmNyZWF0ZSgpXHJcbmQub24gJ2Vycm9yJywgKGVycikgLT5cclxuICByYXlndW5DbGllbnQuc2VuZCBlcnIsIHt9LCAtPlxyXG4gICAgcHJvY2Vzcy5leGl0KClcclxuXHJcbnBvcnQgPSBwcm9jZXNzLmVudi5QT1JUIHx8IDgwODBcclxuXHJcbmV4cHJlc3MgPSByZXF1aXJlICdleHByZXNzJ1xyXG5cclxuYXBwID0gZXhwcmVzcygpXHJcblxyXG5hcHAuZ2V0ICcvJywgKHJlcSwgcmVzKSAtPlxyXG4gIHJlcy5zZW5kICdoZWxsbyB3b3JsZCEnXHJcblxyXG5zZXJ2ZXIgPSBhcHAubGlzdGVuIHBvcnQsIC0+XHJcbiAgaG9zdCA9IHNlcnZlci5hZGRyZXNzKCkuYWRkcmVzc1xyXG4gIHBvcnQgPSBzZXJ2ZXIuYWRkcmVzcygpLnBvcnRcclxuICBjb25zb2xlLmxvZyAnc2VydmVyIHN0YXJ0ZWQgYXQgaHR0cDovLyVzOiVzJywgaG9zdCwgcG9ydFxyXG4iXX0=