(function() {
  var assert, expect, io, should;

  io = require('socket.io-client');

  expect = require('chai').expect;

  assert = require('chai').assert;

  should = require('chai').should();

  describe("uuid", function() {
    var options;
    options = {
      transports: ['websocket'],
      'force new connection': true
    };
    beforeEach(function(done) {
      var server;
      server = require('../js/nerve.js')(false).server;
      return done();
    });
    return it('should get uuid', function(done) {
      var client;
      client = io.connect('http://localhost:3939', options);
      return client.once('connect', function() {
        client.once('handshake', function(message) {
          expect(message.uuid).to.be.a('string');
          client.disconnect();
          return done();
        });
        return client.emit('ping');
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRlc3QuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSwwQkFBQTs7QUFBQSxFQUFBLEVBQUEsR0FBSyxPQUFBLENBQVMsa0JBQVQsQ0FBTCxDQUFBOztBQUFBLEVBQ0EsTUFBQSxHQUFTLE9BQUEsQ0FBUyxNQUFULENBQWUsQ0FBQyxNQUR6QixDQUFBOztBQUFBLEVBRUEsTUFBQSxHQUFTLE9BQUEsQ0FBUyxNQUFULENBQWUsQ0FBQyxNQUZ6QixDQUFBOztBQUFBLEVBR0EsTUFBQSxHQUFTLE9BQUEsQ0FBUyxNQUFULENBQWUsQ0FBQyxNQUFoQixDQUFBLENBSFQsQ0FBQTs7QUFBQSxFQUtBLFFBQUEsQ0FBVSxNQUFWLEVBQWlCLFNBQUEsR0FBQTtBQUNmLFFBQUEsT0FBQTtBQUFBLElBQUEsT0FBQSxHQUNFO0FBQUEsTUFBQSxVQUFBLEVBQVksQ0FBRSxXQUFGLENBQVo7QUFBQSxNQUNDLHNCQUFBLEVBQXVCLElBRHhCO0tBREYsQ0FBQTtBQUFBLElBR0EsVUFBQSxDQUFXLFNBQUMsSUFBRCxHQUFBO0FBQ1QsVUFBQSxNQUFBO0FBQUEsTUFBQSxNQUFBLEdBQVMsT0FBQSxDQUFTLGdCQUFULENBQUEsQ0FBMEIsS0FBMUIsQ0FBNkIsQ0FBQyxNQUF2QyxDQUFBO2FBQ0EsSUFBQSxDQUFBLEVBRlM7SUFBQSxDQUFYLENBSEEsQ0FBQTtXQU1BLEVBQUEsQ0FBSSxpQkFBSixFQUFzQixTQUFDLElBQUQsR0FBQTtBQUNwQixVQUFBLE1BQUE7QUFBQSxNQUFBLE1BQUEsR0FBUyxFQUFFLENBQUMsT0FBSCxDQUFZLHVCQUFaLEVBQW9DLE9BQXBDLENBQVQsQ0FBQTthQUVBLE1BQU0sQ0FBQyxJQUFQLENBQWEsU0FBYixFQUF1QixTQUFBLEdBQUE7QUFDckIsUUFBQSxNQUFNLENBQUMsSUFBUCxDQUFhLFdBQWIsRUFBeUIsU0FBQyxPQUFELEdBQUE7QUFDdkIsVUFBQSxNQUFBLENBQU8sT0FBTyxDQUFDLElBQWYsQ0FBb0IsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQTNCLENBQThCLFFBQTlCLENBQUEsQ0FBQTtBQUFBLFVBRUEsTUFBTSxDQUFDLFVBQVAsQ0FBQSxDQUZBLENBQUE7aUJBR0EsSUFBQSxDQUFBLEVBSnVCO1FBQUEsQ0FBekIsQ0FBQSxDQUFBO2VBS0EsTUFBTSxDQUFDLElBQVAsQ0FBYSxNQUFiLEVBTnFCO01BQUEsQ0FBdkIsRUFIb0I7SUFBQSxDQUF0QixFQVBlO0VBQUEsQ0FBakIsQ0FMQSxDQUFBO0FBQUEiLCJmaWxlIjoidGVzdC5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbImlvID0gcmVxdWlyZSAnc29ja2V0LmlvLWNsaWVudCdcclxuZXhwZWN0ID0gcmVxdWlyZSgnY2hhaScpLmV4cGVjdFxyXG5hc3NlcnQgPSByZXF1aXJlKCdjaGFpJykuYXNzZXJ0XHJcbnNob3VsZCA9IHJlcXVpcmUoJ2NoYWknKS5zaG91bGQoKVxyXG5cclxuZGVzY3JpYmUgXCJ1dWlkXCIsICgpIC0+XHJcbiAgb3B0aW9ucyA9XHJcbiAgICB0cmFuc3BvcnRzOiBbJ3dlYnNvY2tldCddXHJcbiAgICAnZm9yY2UgbmV3IGNvbm5lY3Rpb24nOiB0cnVlXHJcbiAgYmVmb3JlRWFjaCAoZG9uZSkgLT5cclxuICAgIHNlcnZlciA9IHJlcXVpcmUoJy4uL2pzL25lcnZlLmpzJykobm8pLnNlcnZlclxyXG4gICAgZG9uZSgpXHJcbiAgaXQgJ3Nob3VsZCBnZXQgdXVpZCcsIChkb25lKSAtPlxyXG4gICAgY2xpZW50ID0gaW8uY29ubmVjdCAnaHR0cDovL2xvY2FsaG9zdDozOTM5Jywgb3B0aW9uc1xyXG5cclxuICAgIGNsaWVudC5vbmNlICdjb25uZWN0JywgKCkgLT5cclxuICAgICAgY2xpZW50Lm9uY2UgJ2hhbmRzaGFrZScsIChtZXNzYWdlKSAtPlxyXG4gICAgICAgIGV4cGVjdChtZXNzYWdlLnV1aWQpLnRvLmJlLmEgJ3N0cmluZydcclxuXHJcbiAgICAgICAgY2xpZW50LmRpc2Nvbm5lY3QoKVxyXG4gICAgICAgIGRvbmUoKVxyXG4gICAgICBjbGllbnQuZW1pdCAncGluZydcclxuIl19