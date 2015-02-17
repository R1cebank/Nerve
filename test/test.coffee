io = require 'socket.io-client'
expect = require('chai').expect
assert = require('chai').assert
should = require('chai').should()

describe "uuid", () ->
  options =
    transports: ['websocket']
    'force new connection': true
  beforeEach (done) ->
    server = require('../js/nerve.js')(no).server
    done()
  it 'should get uuid', (done) ->
    client = io.connect 'http://localhost:3939', options

    client.once 'connect', () ->
      client.once 'handshake', (message) ->
        expect(message.uuid).to.be.a 'string'

        client.disconnect()
        done()
      client.emit 'ping'
