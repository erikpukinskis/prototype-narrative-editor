narrative
=========

This is a web app. It just serves this one page that you're reading right now. What's kind of neat is that this page describes everything that has to happen for it to exist on the internet. 

What's really neat is that this page also contains everything it needs to compile itself. All it needs is a human to run a few commands and it can create a complete, running copy of itself.

Here's how it works.

the server
----------

First off, this document is written in a filed called README.md. It's written in a language called Markdown. You can see that file [here](README.md).

In order for you to be able to read a nicely formatted version of this document in your web browser, there needs to be a web server that can take requests from folks on the internet, convert that README file into HTML, and send it down to peoples' web browsers on their phones and computers.

There are lots of ways to accomplish that, but one good way is to write a little server in another language, called Javascript. It's just a few lines of code, and we can put that in a filed called `server.js`:

    var express = require("express");
    var marked = require("marked");
    var fs = require("fs");
    var app = express();

    app.use('/', express.static('.'));

    app.get('/', function(request, response){
      console.log("\n\n\n\n\nBLAHAHA!\n\n\n\n\n");
      var markdown = fs.readFileSync('README.md').toString();

      marked(markdown, function(xxxx, html) {
        response.send(html);
      });
    });

    var port = Number(process.env.PORT || 5000);
    
    app.listen(port, function() {
      console.log("Listening on " + port);
    }); 

There's a bunch going on in that code. It loads a library called [Express](http://expressjs.com/) that knows how to talk to web browsers. It loads another library called [Marked](https://github.com/chjj/marked) that knows how to convert Markdown into HTML.

But the only thing you really need to know about that code is that it starts a web server that spits out the HTML version of our README file whenever you visit '/' on the server. In our case that's the slash on the end of <http://narrativejs.herokuapp.com/>.

system stuff
------------

In order for that server to run, we need to actually set up a server that has Express and Marked and Node and knows how to fire everything up. For that we need two more files. The first is `package.json`, which describes the libraries we need:

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

And we also need to tell the computer what it has to do to start the server. We do that in a `Procfile`:

    web: node server.js

That just says when you want to start the web stuff, run the command "node server.js".

the compiler
------------

So that's all we need to start our server. But all of these goodies are locked away inside this README file you're looking at right now!

In order to actually get usable copies of these files, we need to compile this narrative!

We'll put the code for that in `compile.js`. It's a doozie. Don't worry about understanding it all just yet:

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

There's a lot going on there, but the gist of it is that we read in the README.md file, split it up into chunks, find all of these files we've described, and saves them into a folder called "narrative-build".

And that's it! That's all of the code we need for this narrative to come alive!

running your own copy of narrative.js
-------------------------------------

It's lovely that we have all of this code all written out here, but what do we actually *do* with it to get our Hello World server running?

You'll need to [install Git](http://git-scm.com/downloads), [Node.js](http://nodejs.org/) and [NPM](https://www.npmjs.org/) on your computer first. Then open a terminal and run:

    git clone https://github.com/erikpukinskis/narrative.git
    cd narrative

That will put you into a folder that has this very document (README.md) and our compile.js file. In order to generate all the files we described above, you just run:

    node compile.js

Now type

    ls ../narrative-build

You'll see all of the files we described above! Neat! In order to start the server you just do:

    cd ../narrative-build
    npm install
    node server.js

And then open up <http://localhost:5000> in your web browser (by clicking that link!) and you should see our Hello, World app! Cool! That's a legit web server running on your computer.

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
    
At this point you should have your very open copy of Narrative.js on the internet! Just go to <http://whatever_you_want_to_call_this.herokuapp.com>, or whatever you called it.

developer tips
--------------

If you want to play with it, I recommend just editing the README.md file and then running this in your terminal:

    echo 'THIS IS IT!'; node compile.js; cd ../narrative-build; npm install; foreman start; cd ../narrative

Then reload your <http://localhost:5000>, poke around, press CTRL+C and repeat.
