Library
-------

This might be an interesting way to structure a Node app.

    libraries = {}

    library = function(name, func) {
      libraries[name] = func
    }

    libraries.get = function(name) {
      func = libraries[name]
      arguments.shift()
      return func.apply(arguments);
    }

Here's how you use it:

    server = lib.get('server');
    server.get('/', function(xxxx, response) {
      response.render('hello, world!');
    });

And then here's how you use your library:

### TEMPORARILY MOVED TO LIBRARY

  Server = function() {}
  Server.prototype.initialize = function(port) {
    this.routes = {};

    var express = require("express");
    this.app = express();
    var port = Number(port || 5000);
  
    this.app.get('*', function(request, response) {
      var handler = this.routes[req.url];
      handler(request, response);
    });

    this.app.listen(port, function() {
      console.log("Listening on " + port);
    });
  }

  Server.prototype.get = function(pattern, handler) {
    this.routes[pattern] = handler;
  };

  lib('server', function(){
    return new Server();
  }

