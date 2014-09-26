Express
-------

This `server.js` is what you use to set up an Express/Node server:

    define(['http', 'body-parser', 'assert', 'underscore'], function(http, bodyParser, assert, _) {
      var express = require("express")
      var port = Number(port || 5000)

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
        var port = Number(port || 5000)

        this.app.use(bodyParser.json())
        this.app.use(bodyParser.urlencoded())

        this.app.use(function(request, response, next) {
          function match(handler) {
            var params = tryToParseUrl(request.url, handler)
            console.log("Parsed url", request.url, "for handler", handler, "into", params)
            if (params) {
              request.params = params
              handler.func(request, response)
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

        this.server.on('connection', function(socket) {
          console.log('socket opened')
          sockets.push(socket)
          socket.setTimeout(4000)
          socket.on('close', function () {
            console.log('socket closed')
            sockets.splice(sockets.indexOf(socket), 1)
          })
        })
      }

      Server.prototype.stop = function (callback) {
        this.server.close(function () {
          console.log('Server closed!')
          callback()
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
        assert(params)
        assert.equal(params.name, 'legendofhelga')
        console.log('yippee!')
      }

      test()

      return Server
    })

It boots up an express server with a catch-all route so that
we can keep messing around with the routes after the server
goes up.


