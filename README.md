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
      "dependencies": {
        "express": "*"
      },
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
    var exec = require('child_process').exec;

    handleReadme = function(error, content) {
      chunkLines(content).eachBlock(handleBlock);
      console.log("Look in build/ for your stuff!");
    }

    startsWith = function(string, pattern) {
      pattern = new RegExp("^" + pattern);
      return !!string.match(pattern);
    }

    chunkLines = function(content) {
      var block = {lines: []};
      var blocks = [];
      var kind;

      for (i in lines = content.split("\n")) {
        var line = lines[i];

        if (startsWith(line, '    ')) { 
          kind = 'code';
        } else if (line.match(/$\s?^/)) {
          // keep kind as whatever it was
        } else {
          kind = 'comment';
        }

        if (block.kind != kind) {
          if (block.writing) {
            blocks.push(block);
          }

          block = {lines: []};
          block.writing = true;
          block.kind = kind;
        }

        block.lines.push(line);
      }

      if(block.writing) {
        blocks.push(block);
      }

      blocks.eachBlock = eachBlock;

      return blocks;
    }

    eachBlock = function(process) {
      var memo = {}
      for(i=0; i<this.length; i++) {
        block = this[i];
        process(block.lines.join("\n"), block.kind, memo);
      }
    }

    handleBlock = function(block, kind, memo) {
      var inAComment = kind == 'comment'
      var foundCodeSnippets = block.match(/`([^`]+)`/)
      if (inAComment && foundCodeSnippets) {
        memo.filename = foundCodeSnippets[1]
      }

      if ((kind == 'code') && memo.filename) {
        block = block.replace(/(^|\n)    /g, "$1");
        writeFile(memo.filename, block);
        memo.filename = null;
      }
    }

    writeFile = function(filename, content, callback) {
      exec("mkdir -p build", function() {
        fs.writeFile('build/' + filename, content, callback);
      });
    }

    fs.readFile('README.md', 'utf-8', handleReadme);

In order to generate all the files we described above, you just run:

    node compile.js

That will write them into the "build" folder. 

Install the [Heroku Toolbelt](https://toolbelt.heroku.com/) and switch you into the build folder:

    cd ../narrative-build

Creates what's called a "git repository" that keeps track of your code:

    git init

Save the files we just built to the repository:

    git commit -am "My own version of Narrative.js"

Create an app on Heroku so we can host all this shiz:

    heroku create whatever_you_want_to_call_this

And finally "push" the code to Heroku, which tells them to actually set it up on the intarwebs:

    git push heroku master
    
At this point if you run 