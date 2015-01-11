Express
-------

This `server.js` is what you use to set up an Express/Node server:

    define(['http', 'body-parser', 'chai', 'underscore'], function(http, bodyParser, chai, _) {
      var expect = chai.expect
      var express = require("express")

      Server = function() {
        var _this = this
        var handlers = this.handlers = {GET: [], POST: []}

        this.app = express()

        this.app.use(bodyParser.json())
      }

      Server.prototype.start = function(port) { 
        this.sockets = sockets = []
        this.port = port

        this.server = http.createServer(this.app)
        this.server.listen(port)
        console.log('listening on', port)

        this.server.on('connection', function(socket) {
          sockets.push(socket)
          socket.setTimeout(4000)
          socket.on('close', function () {
            sockets.splice(sockets.indexOf(socket), 1)
          })
        })
      }

      Server.prototype.stop = function (callback) {
        var port = this.port
        this.server.close(function () {
          console.log('Server closed!', port, 'should be free.')
          if (callback) { callback() }
        })
        this.sockets.forEach(function(socket) {
          socket.destroy()
        })
      }

      Server.prototype.get = function() {
        this.app.get.apply(this.app, arguments)
      }

      Server.prototype.post = function() {
        this.app.post.apply(this.app, arguments)
      }

      Server.prototype.static = express.static;

      Server.prototype.use = function() {
        this.app.use.apply(this.app, arguments)
      }

      return Server
    })

It boots up an express server with a catch-all route so that
we can keep messing around with the routes after the server
goes up.


