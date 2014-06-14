    var _ = require('underscore');


    // ANGULAR ANNOTATE
    // https://github.com/angular/angular.js/blob/master/src/auto/injector.js

    var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
    var FN_ARG_SPLIT = /,/;
    var FN_ARG = /^\s*(_?)(\S+?)\1\s*$/;
    var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;

    function anonFn(fn) {
      // For anonymous functions, showing at the very least the function signature can help in
      // debugging.
      var fnText = fn.toString().replace(STRIP_COMMENTS, ''),
          args = fnText.match(FN_ARGS);
      if (args) {
        return 'function(' + (args[1] || '').replace(/[\s\r\n]+/, ' ') + ')';
      }
      return 'fn';
    }

    function annotate(fn, strictDi, name) {
      var $inject,
          fnText,
          argDecl,
          last;

      if (typeof fn == 'function') {
        if (!($inject = fn.$inject)) {
          $inject = [];
          if (fn.length) {
            if (strictDi) {
              if (!isString(name) || !name) {
                name = fn.name || anonFn(fn);
              }
              throw new Error('{0} is not using explicit annotation and cannot be invoked in strict mode');
            }
            fnText = fn.toString().replace(STRIP_COMMENTS, '');
            argDecl = fnText.match(FN_ARGS);
            argDecl[1].split(FN_ARG_SPLIT).forEach(function(arg){
              arg.replace(FN_ARG, function(all, underscore, name){
                $inject.push(name);
              });
            });
          }
          fn.$inject = $inject;
        }
      } else if (isArray(fn)) {
        last = fn.length - 1;
        assertArgFn(fn[last], 'fn');
        $inject = fn.slice(0, last);
      } else {
        assertArgFn(fn, 'fn', true);
      }
      return $inject;
    }


    // I think the thought here is that you can just re-run any of these things
    // and it's fine. But what about the chain of dependencies? That's why you
    // need to handle the dependency resolution yourself.

    // LIBRARY lets us store snippets of code as narratives in a library
    // so that other narratives can load them. Ideally these narratives
    // are namespace isolated, so maybe we'll put them in a function for now!

    library = function() {
      count = 0

      function Library() { 
        this.funcs = {}; 
        return this; 
      }
      Library.prototype.give = function(name, func) {
        console.log("Gave " + name);
        this.funcs[name] = func;
        console.log(_(this.funcs).size() + " funcs");
        console.log("Server is a " + this.funcs.server);
        console.log("Hell world is " + this.funcs.helloworld);
      };

      Library.prototype.take = function(name) {
        count++
        if (count > 10 ) { return }
        console.log("Looking for " + name);
        _(this.funcs).each(function(func, i) {
          console.log("&&&&&&& Func " + i + ": " + func);
        });
        console.log("Funcs are " + JSON.stringify(this.funcs));
        console.log(_(this.funcs).size() + " funcs");
        func = this.funcs[name];
        console.log("Found it: " + func.toString());
        dependencies = annotate(func);
        console.log("Deps: <" + dependencies + ">>");

        argumentsForCall = []
        for(var i=0; i<dependencies.length; i++) {
          dep = dependencies[i];
          console.log("Dep %%%" + dep + "%%%% ");
          returnVal = this.take(dep);
          console.log("Returned " + returnVal);
          argumentsForCall.push(returnVal);
        }
        console.log("calling " + name + ": " + func.toString());
        console.log("\n\n...with params " + argumentsForCall)
        returnVal = func.apply({}, argumentsForCall);
        console.log("Got back " + returnVal);
        return returnVal;
      }

      return new Library();      
    }();


    // SERVER boots up an express server with a catch-all route so that
    // we can keep messing around with the routes after the server
    // goes up.
      
    library.give('server', function() {
      console.log("generating a server");
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
      var server = new Server();
      console.log("Built a server: " + server);
      return server;
    });


    // HELLO-WORLD is the specific server that we want to create. It
    // Says hello when you visit.

    library.give('helloworld', function(server) {
      console.log("generating a hello world");
      if (!server) {
        console.log("no server!");
        return;
      }
      server.get('/', function(xxxx, response) {
        response.render('hello, world!');
      });
    });

    library.take('hello-world');
