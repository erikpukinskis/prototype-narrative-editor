Narrative
=========

This is a web app. It just serves this one page that you're reading right now. What's kind of neat is that this page describes everything that has to happen for it to exist on the internet. 

What's really neat is that this page also contains everything it needs to create a complete working copy of itself. All it needs is a human to run a few commands to help it along.

Here's how it works.

The server
----------

First off, this document is written in a filed called README.md. It's written in a language called Markdown. You can see that file [here](README.md).

In order for you to be reading a nicely formatted version of this document in your web browser right now, there needs to be a web server that can take requests from folks on the internet, converts that README file into HTML, and send it down to peoples' web browsers on their phones and computers.

There are lots of ways to accomplish that, but Narrative does it with a little server written in Javascript. It's just a few lines of code in a filed called `server.js`:

    var express = require("express");
    var marked = require("marked");
    var fs = require("fs");
    var app = express();

    app.get('/', function(request, response){
      var markdown = fs.readFileSync('README.md').toString();

      marked(markdown, function(xxxx, html) {
        response.send(html);
      });
    });

    app.use('/', express.static('.'));

    var port = Number(process.env.PORT || 5000);
    
    app.listen(port, function() {
      console.log("Listening on " + port);
    }); 

There's a bunch going on in that code. It loads a library called [Express](http://expressjs.com/) that knows how to talk to web browsers. It loads another library called [Marked](https://github.com/chjj/marked) that knows how to convert Markdown into HTML.

But the only thing you really need to know about that code is that it starts a web server that spits out the HTML version of our README file whenever you visit '/' on the server. In our case that's the slash on the end of <http://narrativejs.herokuapp.com/>.

The system
----------

In order for that server to run, we need to actually set up a computer somewhere that has Express and Marked and Node and knows how to fire everything up. 

Luckily, it's 2014 and there's a service called [Heroku](http://heroku.com) that will do all of that for us. We just need to provide them with two more files that show them what to do. 

The first is `package.json`, which describes the libraries we need (Express, Marked, and Node):

    {
      "name": "narrative",
      "version": "0.0.3",
      "dependencies": {
        "express": "*",
        "marked": "*"
      },
      "engines": {
        "node": "*"
      }
    }

And we also need to tell the Heroku what it has to do to start the server. We do that in a `Procfile`:

    web: node server.js

That just tells Heroku that in order to start the web server they have to run the command "node server.js".

And that's it! That's all the code we need to start a server. The only problem is, all of this is just written down in our [README.md](README.md) file! We need it to actually be split out into all of those files for this whole train to get on the tracks!

The compiler
------------

This is the whole point of writing code in the form of a narrative. We can provide all of this nice structure and explanation, but then we can also just compile the narrative to use it!

In order for that to happen, we need some code that understands these Markdown files with code and filenames all over the place and knows what to do with it. Here's some javascript that does the trick, which we can put in `compile.js`. 

It's a bit of a doozie. Don't worry about understanding it all just yet:

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

There's a lot going on there, but the gist of it is that we read in the [README.md](README.md) file, split it up into chunks, find all of these files we've described, and saves them into a folder called "narrative-build".

And that's it! That's all of the code we need for this narrative to come alive!

Running your own copy of Narrative
----------------------------------

It's lovely that we have all of this code all written out here, but what do we actually *do* with it to get our server running?

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

And then open up <http://localhost:5000> in your web browser (by clicking that link!) and you should see your copy of this narrative! Cool! That's a legit web server running on your computer.

Putting it on the intarwebs
---------------------------

Now, in order to get something on the web, we need to deploy it to Heroku. Install the [Heroku Toolbelt](https://toolbelt.heroku.com/) and switch you into the build folder:

    cd ../narrative-build

Now create a git repository that will keeps track of your code:

    git init

Save the files we just built into the repository:

    git add .
    git commit -m "My own version of Narrative.js"

Create an app on Heroku so we can host all this shiz:

    heroku create whatever-you-want-to-call-this

And finally "push" the code to Heroku, which tells them to actually set it up on the web:

    git push heroku master
    
At this point you should have your very open copy of Narrative.js on the internet! Just go to <http://whatever-you-want-to-call-this.herokuapp.com>, or whatever you called it.

Why would I want to do this?
----------------------------

Right now Narrative JS doesn't really do a whole lot except describe itself. But my next goal is to turn it into an app that can actually edit itself and other narratives.


Developer tips
--------------

If you want to play with it, I recommend just editing the README.md file and then running this in your terminal:

    echo 'THIS IS IT!'; node compile.js; cd ../narrative-build; \
    npm install; foreman start; cd ../narrative

Then reload your <http://localhost:5000>, poke around, press CTRL+C and repeat.

<style>
  body {
    font-size: 14pt;
    max-width: 700px;
    margin: 2em auto;
    padding: 0 1em;
    color: #333;
  }

  a {
    color: #9B59B6;
  }

  h1 {
    text-align: center;
  }

  h1, h2 {
    font-weight: normal;
  }

  pre {
    padding: 10px;
  }

  pre, p code {
    font-size: 12pt;
    border: 1px solid #ddd;
    background: #eee;
    color: #1ABC9C;
  }
</style>