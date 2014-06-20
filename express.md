Express
-------

This is what you use to set up an Express/Node server:
      
    library.give('express', function() {
      Server = function() {
        var _server = this
        _server.routes = {}
        indent('initializing server')
        var express = require("express");
        _server.app = express();
        var port = Number(port || 5000);

        this.app.get('*', function(request, response) {
          var handler = _server.routes[request.url];
          handler(request, response);
        });

        this.app.listen(port, function() {
          indent.in()
          indent("Listening on " + port);
          indent.out()
        });
      }

      Server.prototype.get = function(pattern, handler) {
        this.routes[pattern] = handler;
      };

      indent('Starting new server...')
      indent.in()
      var server = new Server();
      indent.out()
      indent("Built a server: " + server);
      return server;
    });

It boots up an express server with a catch-all route so that
we can keep messing around with the routes after the server
goes up.


