narrative
=========

This isn't going to be pretty, but here's the story of how this came to be.

First off, this is a web app written in HTML. We keep that html in a file called `index.html`:

    <html>
    Hello, world!
    </html>

In order for your web browser to be able to read that file, we need to start a web server. Let's put the code for a simple [Node.js](http://nodejs.org/) server in `server.js`:

    var express = require("express");
    var app = express();
    
    app.use('/', express.static('.'));
    
    var port = Number(process.env.PORT || 5000);
    
    app.listen(port, function() {
      console.log("Listening on " + port);
    }); 

That just says load the [Express](http://expressjs.com/) library, create a new app, and make all the files in the current folder publicly accessible our domain (http://narrativejs.herokuapp.com).

In order to make that work, we need to start a server with Node on it and the packages we'll need. The convention in the Node community is to configure that in a file called `package.json`:

    {
      "name": "narrative",
      "version": "0.0.1",
      "engines": {
        "node": "*"
      }
    }

Heroku will look at that and install all the necessary files. They also need a `Procfile` to tell them how to start the server:

    web: node server.js

So that's what the server needs to know, but how do we get this all started? You'll need to [install Git](http://git-scm.com/downloads) on your computer and then open a terminal and enter:

    git clone https://github.com/erikpukinskis/narratorjs.git
    cd narratorjs
    
Now we need to compile this narrative. We'll put the code for that in `compile.js`:

    var fs = require('fs');
    
    fs.readFile('README.md', 'utf-8', function(err, content) {
        console.log(content);
    });


Then install the [Heroku Toolbelt](https://toolbelt.heroku.com/) and run:

    heroku create whatever_you_want_to_call_this
    git push heroku master
    
And



