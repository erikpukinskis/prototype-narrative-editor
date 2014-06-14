    // I think the thought here is that you can just re-run any of these things
    // and it's fine. But what about the chain of dependencies? That's why you
    // need to handle the dependency resolution yourself.

    // LIBRARY lets us store snippets of code as narratives in a library
    // so that other narratives can load them. Ideally these narratives
    // are namespace isolated, so maybe we'll put them in a function for now!

    library = function() {
      Library = function() {
        this.funcs = {}
      }

      argumentsFor = function(f) {
        return f.toString().replace(/.*\(|\).*/ig,"").split(',');
      }

      Library.prototype.give = function(name, func) {
        this.funcs[name] = func;
      }
        
      // If you give a function with the name, then the args are the
      // dependencies. When I say to take something, it means grab
      // the dependencies and run the function with them as args.
      Library.prototype.take = function(name) {
        console.log('hyeeea!' + arguments.slice(1,5));
        arguments.shift()
        func = this.funcs[name]
        dependencies = argumentsFor(func);
        argumentsForCall = []
        for (name in dependencies) {
          argumentsForCall.push(this.take(name));
        }
        return func.apply({}, argumentsForCall);
      }

      return new Library();
    }();


    // SERVER boots up an express server with a catch-all route so that
    // we can keep messing around with the routes after the server
    // goes up.
      
    library.give('server', function() {
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
    });


    // HELLO-WORLD is the specific server that we want to create. It
    // Says hello when you visit.

    library.give('hello-world', function(server) {
      server.get('/', function(xxxx, response) {
        response.render('hello, world!');
      });
    });

    library.take('hello-world');
