Express
-------

This `server.js` is what you use to set up an Express/Node server:

    define(['http', 'body-parser', 'chai', 'underscore'], function(http, bodyParser, chai, _) {
      var expect = chai.expect
      var express = require("express")

      function tryToParseUrl(url, handler) {
        var keys = []

        var regex = handler.pattern.replace(/:([a-z]+)/, function(xxxx, key) {
          keys.push(key)
          return "([a-z]+)"
        })
        regex = '^' + regex + '$'

        var match = url.match(regex)
        if (!match) { return null }

        var values = match.slice(1,1+keys.length)
        var keyValuePairs = _.zip(keys, values)
        var params = _.object(keyValuePairs)

        return params
      }

      Server = function() {
        var _this = this
        var handlers = this.handlers = {GET: [], POST: []}

        this.app = express()

        this.app.use(bodyParser.json())

        this.app.use(function(request, response, next) {
          function match(handler) {
            var params = tryToParseUrl(request.url, handler)
            if (params) {
              request.params = params
              handler.func(request, response, next)
              return true
            }
          }

          _(handlers[request.method]).find(match) || next()
        })
      }

      Server.prototype.start = function(port) { 
        this.sockets = sockets = []

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
        this.server.close(function () {
          console.log('Server closed!')
          if (callback) { callback() }
        })
        this.sockets.forEach(function(socket) {
          socket.destroy()
        })
      }

      Server.prototype.get = function(pattern, func) {
        this.handlers.GET.push({pattern:pattern, func:func})
      }

      Server.prototype.post = function(pattern, func) {
        this.handlers.POST.push({pattern:pattern, func:func})
      }

      Server.prototype.static = express.static;

      Server.prototype.use = function() {
        this.app.use.apply(this.app, arguments)
      }

      function test() {
        var handler = {
          pattern: '/narratives/:name'
        }
        var params = tryToParseUrl('/narratives/legendofhelga', handler)
        expect(params).to.have.property('name', 'legendofhelga')
        console.log('yippee!')
      }

      test()

      return Server
    })

It boots up an express server with a catch-all route so that
we can keep messing around with the routes after the server
goes up.


