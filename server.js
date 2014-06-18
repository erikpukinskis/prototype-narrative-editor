    //
    //
    //
    // So, sadly this is not a runnable narrative. I'm just going to try to
    // get things working and then split them out into separate narratives
    // which will all hopefully be libs.
    //


    var _ = require('underscore');
    var print = require('pretty-print');



    // INDENT helps print out nested stuff so I can understand it

    indent = function(string) {
      console.log(new Array(indent.depth).join("  ") + string);
    }
    indent.depth = 1
    indent.in = function() {
      this.depth++
      indent(this.depth + '->')
    }
    indent.out = function() {
      this.depth--
      indent('<-' + this.depth)
    }

    // indent("hello!")
    // indent.in()
    // indent("and now?")
    // indent.in()
    // indent("one")
    // indent("two")
    // indent("three")
    // indent.out()
    // indent("and what of a long paragraph?");
    // indent.out()
    // indent("ok")
    // indent.out()
    // indent("spoooky")



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

      summarize = function(func) {
        return func.toString().replace(/(?:\r\n|\r|\n)/g, '').replace(/ +/, ' ').substr(0,50);
      }

      hash = function(string){
        return string.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0).toString(36).substr(1,10);
      }

      function Library() { 
        this.funcs = {}; 
        return this; 
      }
      Library.prototype.give = function(name, func) {
        func.hash = hash(func.toString())
        this.funcs[name] = func;
        indent("hash is " + func.hash)
        indent("Gave " + name + " (" + func.hash.substr(0,40) + ")<<" + summarize(func) + ">> to the library (which now has " + _(this.funcs).size() + " funcs) ");
      };

      Library.prototype.take = function(name) {
        var _this = this;
        count++
        if (count > 10 ) { return }

        var func = this.funcs[name];
        indent("funcs[" + name + "] is " + func.hash);
        if (!func) {
          indent("Nothing in the library called " + name);
          return
        }

        var dependencies = annotate(func);
        indent("Taking " + name + " out of the library. It needs " + dependencies.join(", ") + ".")

        var args = {}
        _(dependencies).each(function(dep) { 
          indent('Taking out ' + dep)
          indent.in()
          args[dep] = _this.take(dep);
          indent.out()
        });

        var values = _(args).values();

        indent("running func " + func.hash + " to respond to take(" + name + ")....")
        indent.in()
        var result = func.apply({}, values);
        indent.out()
        indent("....ran it! got back " + result);
        indent("Took " + name + " out of the library and passed it " + JSON.stringify(args) + " and it looks like this: " + summarize(result));
        return result;
      }

      return new Library();      
    }();


    // SERVER boots up an express server with a catch-all route so that
    // we can keep messing around with the routes after the server
    // goes up.
      
    library.give('server', function() {
      indent("Building a server.");
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
          indent.in()
          indent("Listening on " + port);
          indent.out()
        });
      }

      Server.prototype.get = function(pattern, handler) {
        this.routes[pattern] = handler;
      };
      var server = new Server();
      indent("Built a server: " + server);
      return server;
    });


    // HELLO-WORLD is the specific server that we want to create. It
    // Says hello when you visit.

    library.give('helloworld', function(server) {
      indent("generating a hello world");
      if (!server) {
        indent("no server!");
        return;
      }
      server.get('/', function(xxxx, response) {
        indent.in()
        indent('responding on server!')
        indent.out()
        response.render('hello, world!');
      });
    });

    indent("Diving in!")
    indent.in()
    library.take('helloworld');
    indent.out()