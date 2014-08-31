Express
-------

This `server.js` is what you use to set up an Express/Node server:

    define(['body-parser'], function(bodyParser) {
      var express = require("express")
    var port = Number(port || 5000)

      Server = function() {
        var _this = this
        this.handlers = {GET: {}, POST: {}}
        this.app = express()
        var port = Number(port || 5000)

        this.app.use(bodyParser.json())
        this.app.use(bodyParser.urlencoded())

        this.app.use(function(request, response, next) {
          var handler = _this.handlers[request.method][request.url]
          if (handler) { 
            handler(request, response) 
          } else {            
            next()
          }
        })
      }

      Server.prototype.start = function(port) { 
        this.app.listen(port, function() {
          console.log("Listening on " + port);
        })
      }

      Server.prototype.get = function(pattern, handler) {
        this.handlers.GET[pattern] = handler
      }

      Server.prototype.post = function(pattern, handler) {
        this.handlers.POST[pattern] = handler
      }

      Server.prototype.static = express.static;

      Server.prototype.use = function() {
        this.app.use.apply(this.app, arguments)
      }

      return new Server()
    })

It boots up an express server with a catch-all route so that
we can keep messing around with the routes after the server
goes up.


