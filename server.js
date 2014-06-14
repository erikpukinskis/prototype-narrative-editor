  // LIBRARY lets us store snippets of code as narratives in a library
  // so that other narratives can load them. Ideally these narratives
  // are namespace isolated, so maybe we'll put them in a function for now!

    library = function() {
      Library = function() {
        this.funcs = {}
      }
      Library.prototype.put = function(name, func) {
        this.funcs[name] = func;
      }
      Libary.prototype.get = function(name) {
        arguments.shift()
        func = this.funcs[name]
        return func.apply(arguments);
      }

      return new Library();
    }();


    // SERVER boots up an express server with a catch-all route so that
    // we can keep messing around with the routes after the server
    // goes up.
      
    library.put('server', function(){
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

      return new Server();
    }


    // HELLO-WORLD is the specific server that we want to create. It
    // Says hello when you visit.

    library.put('hello-world', function(server) {
      server = library.get('server');
      server.get('/', function(xxxx, response) {
        response.render('hello, world!');
      });
    }


    // BROWSERIFIER turns npm modules into a single chunk of javascript code.
    // I think we want it because it can help us get marked and ember and
    // such into the browser without having to copy and paste all that.

    library.put('browserifier', function(server) {
      server = library.get('server');
    });

    var app = require("express").express();

    app.get('/:moduleName', function(request, response) {
      // this is where you kick off the browserifying
      response.send('');
    });

    var port = Number(process.env.PORT || 5000);
    
    app.listen(port, function() {
      console.log("Listening on " + port);
    }); 

Our `package.json`:

    {
      "name": "browserifier",
      "version": "0.0.1",
      "dependencies": {
        "express": "*"
      },
      "engines": {
        "node": "*"
      }
    }
