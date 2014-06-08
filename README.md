narrative
=========

Keep reading. This web page will explain exactly how it came to be.

the server
----------

First off, this is a web app written in HTML. It's kept in a file called `index.html`:

    <html>
    Hello, world!
    </html>

In order for a web browser to be able to get that file, a web server needed to be established. Here is the actual code that lets you read this, written in `server.js`:

    var express = require("express");
    var marked = require("marked");
    var fs = require("fs");
    var app = express();

    app.get('/', function(request, response){
      var markdown = fs.readFileSync('README.md');
      console.log("markdown is " + markdown + "\n\n\nThat's all folks");
      console.log("here we are! marked is " + marked + "\n\n\n\nMARKED! DONE!");

      marked(markdown, function(html) {
        console.log("html is " + html);
        response.send(html);
      });
    });

    var port = Number(process.env.PORT || 5000);
    
    app.listen(port, function() {
      console.log("Listening on " + port);
    }); 



What you just read allows for [Express](http://expressjs.com/) the creation of a whole new app. This is the code that describes how to respond to anyone who is trying to read this.  all the files in the current folder publicly accessible our domain (http://narrativejs.herokuapp.com).

In order to make that work, I needed to start a server with Node and some other packages. The convention in the Node community is to make that happen in a file called `package.json`:

    {
      "name": "narrative",
      "version": "0.0.1",
      "dependencies": {
        "express": "*",
        "marked": "*"
      },
      "engines": {
        "node": "*"
      }
    }

Heroku, a service that runs your software on their computers, looks at that and installs all the necessary files. They need something called a `Procfile` to tell them how to start the server:

    web: node server.js

the compiler
------------

So that's what the server needs to know, but all I've done so far is write this all out in this README.md file. In order to actuall get all of these files, we need to compile this narrative.

We'll put the code for that in `compile.js`:

    var fs = require('fs');
    var exec = require('child_process').exec;

    handleReadme = function(error, content) {
      chunkLines(content).eachBlock(handleBlock);
      copyFile('README.md', '../narrative-build');
      console.log("Look in ../narrative-build/ for your stuff!");
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
      exec("mkdir -p ../narrative-build", function() {
        fs.writeFile('../narrative-build/' + filename, content, callback);
      });
    }

    copyFile = function(filename, directory) {
      fs.createReadStream(filename)
        .pipe(fs.createWriteStream(directory + '/' + filename));
    }

    fs.readFile('README.md', 'utf-8', handleReadme);

And that's it! You'll notice there's not much else in this Git repository. The README file which you're reading right now, and the compile.js file that knows what to do with it.

running your own copy of narrative.js
-------------------------------------

It's lovely that we have all of this code, but what do we actually *do* with it to get our Hello World server running?

You'll need to [install Git](http://git-scm.com/downloads), [Node.js](http://nodejs.org/) and [NPM](https://www.npmjs.org/) on your computer first. Then open a terminal and run:

    git clone https://github.com/erikpukinskis/narratorjs.git
    cd narratorjs

That will put you into a folder that has this very document (README.md) and our compile.js file. In order to generate all the files we described above, you just run:

    node compile.js

Now type

    ls ../narrative-build

You'll see all of the files we described above! Neat! In order to start the server you just do:

    cd ../narrative-build
    npm install
    node server.js

And then open up http://localhost:5000 in your web browser (by clicking that link!) and you should see our Hello, World app! Cool! That's a legit web server running on your computer.

putting it on the intarwebs
---------------------------

Now, in order to get something on the web, we need to deploy it to Heroku. Install the [Heroku Toolbelt](https://toolbelt.heroku.com/) and switch you into the build folder:

    cd ../narrative-build

Now create a git repository that will keeps track of your code:

    git init

Save the files we just built into the repository:

    git commit -am "My own version of Narrative.js"

Create an app on Heroku so we can host all this shiz:

    heroku create whatever_you_want_to_call_this

And finally "push" the code to Heroku, which tells them to actually set it up on the web:

    git push heroku master
    
At this point you should have your very open copy of Narrative.js on the internet! Just go to http://whatever_you_want_to_call_this.herokuapp.com, or whatever you called it.

developer tips
--------------

If you want to play with it, I recommend just editing the README.md file and then running this in your terminal:

    echo 'THIS IS IT!'; node compile.js; cd ../narrative-build; foreman start; cd ../narrative

Then reload your http://localhost:5000, poke around, press CTRL+C and repeat.
