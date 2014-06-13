Browserifier
------------

Level: 2

This is a little `server.js` that takes requests to browserify npm modules.

    var express = require("express");
    var app = express();

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
