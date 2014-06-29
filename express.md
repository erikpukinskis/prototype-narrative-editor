Express
-------

This is what you use to set up an Express/Node server:
      
    library.give('express', function() {
      var express = require("express")

      Server = function() {
        var _this = this
        this.routes = {}
        this.app = express()
        var port = Number(port || 5000)

        this.app.get('*', function(request, response) {
          var handler = _this.routes[request.url];
          handler(request, response)
        })

        this.app.listen(port, function() {
          console.log("Listening on " + port);
        })
      }

      Server.prototype.get = function(pattern, handler) {
        this.routes[pattern] = handler
      }

      Server.prototype.static = express.static;

      Server.prototype.use = function() {
        this.app.use.apply(this.app, arguments)
      }

      return new Server();
    });

It boots up an express server with a catch-all route so that
we can keep messing around with the routes after the server
goes up.


