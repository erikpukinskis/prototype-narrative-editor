Node Server
-----------

This is the abstract encapsulation of the dynamical everything-piped-to-everything realtime
It probably starts off like this:

    var express = require("express");
    var app = express();

And then there's maybe some sort of Express middleware thing that happens here. Maybe there's also just some interface to the Express router that I can tie into and change the routes. Maybe I just have to dig into the router source.

Regardless, we want to get to the point that we can do this:

    server.get('/', function(xxxx, response) {
      response.render('edit.html');
    });

    server.get('/', function(xxx,res) {
      res.send('hiya!');
    });

And the server will server 'hiya'.

  Server = function() {}
  Server.prototype.initialize = function(port) {
    var express = require("express");
    this.app = express();
    var port = Number(port || 5000);
  
    this.app.listen(port, function() {
      console.log("Listening on " + port);
    });
  }

  lib('server', function(){
    return new Server();
  }

Here's what a server might look like as a function: (See [node-server](node-server.md))

    function(server) {
      server.get('/', function(xxxx, response) {
        response.render('hello, world!');
      });
    }

Or:

var server = require('node-server').server();

server.get('/', function(xxxx, response) {
  response.render('edit.html');
});

server.get('/', function(xxx,res) {
  res.send('hiya!');
});

server.start();