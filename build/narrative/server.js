define(function() {
  var express = require("express")

  Server = function() {
    var _this = this
    this.routes = {}
    this.app = express()
    var port = Number(port || 5000)

    this.app.get('/', function(request, response) {
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

  return new Server()
})
