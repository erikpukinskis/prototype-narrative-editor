Narrative
=========

This is a web app. It just serves this one page that you're reading right now. What's kind of neat is that this page describes everything that has to happen for it to exist on the internet. 

What's really neat is that this page also contains everything it needs to create a complete working copy of itself. All it needs is a human to run a few commands to help it along.

Here's how it works.

The Server
----------

First off, this document is written in a filed called README.md. It's written in a language called Markdown. You can see that file [here](README.md).

In order for you to be reading a nicely formatted version of this document in your web browser right now, there needs to be a web server that can take your request, convert that README file into HTML, and send it down to your web browser on your phone or laptop or whatever.

There are lots of ways to set up a web server, but right now we're using a little server written in Javascript. It's just a few lines of code in a file called `server.js`:

    var express = require("express");
    var app = express();

    app.get.apply(app, require("./read_controller"));
    app.get.apply(app, require("./edit_controller"));

    app.set('view engine', 'html');
    app.engine('html', require('hbs').__express);
    app.set('views', __dirname);

    app.use('/', express.static('.'));

    var port = Number(process.env.PORT || 5000);
    
    app.listen(port, function() {
      console.log("Listening on " + port);
    }); 

There's a bunch going on in that code. .

But the only thing you really need to know about that code is that it It loads a library called [Express](http://expressjs.com/) that knows how to talk to web browsers. It took the request you just sent from your web browser for this page, and passed it on to the "Read" controller.

Reading
-------

After the server deciphered your request, it fires up `read_controller.js` which connects itself to the '/' path (the / after narrativejs.herokuapp.com in the address for this page). It grabs the README.md file, converts it to HTML, and sticks it in a template.

    var marked = require("marked");
    var fs = require("fs");
    var Handlebars = require('hbs').handlebars;

    module.exports = ['/', function(request, response){
      var markdown = fs.readFileSync('README.md').toString();

      marked(markdown, function(xxxx, html) {
        response.render('./read.html', {
          html: new Handlebars.SafeString(html)
        });
      });
    }];

That mentions a file called `read.html`. This is just some HTML that goes around the narrative itself, telling the browser that we're an HTML document, we need a CSS stylesheet to make things pretty, and we want to link to the Edit page:

    <html>
      <head>
        <link rel="stylesheet" href="read.css" />
      </head>
      <body>
        <a href="/edit">Edit</a>
        {{html}}
      </body>
    </html>

And that stylesheet goes in `read.css`:

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

Writing
-------

We also referenced `edit_controller.js` in our server above. That connects to the '/edit' address you get to if you click the Edit link above:

    module.exports = ['/edit', function(request, response) {
      response.render('edit.html');
    }];

And `edit.html` is an app written in Ember.js:

    <html>
      <head>
        <script src="//cdnjs.cloudflare.com/ajax/libs/jquery/2.1.1/jquery.min.js"></script>
        <script src="//cdnjs.cloudflare.com/ajax/libs/handlebars.js/1.1.2/handlebars.min.js"></script>
        <script src="//cdnjs.cloudflare.com/ajax/libs/ember.js/1.5.1/ember.js"></script>

        <script>
          App = Ember.Application.create();
        </script>
      </head>
      <body>
        <script type="text/x-handlebars">
          <a href="/">Read</a>
          This is the editor!
        <script>

      </body>
    </html>

There's a lot going on there. It loads Ember and some other javascript libraries that it needs to work. It creates an Ember application with a Handlebars template and a link back to the Read page.

The system
----------

In order for that server to run, we need to actually set up a computer somewhere that has Express and Marked and Node and knows how to fire everything up. 

Luckily, it's 2014 and there's a service called [Heroku](http://heroku.com) that will do all of that for us. We just need to provide them with two more files that show them what to do. 

The first is `package.json`, which describes the libraries we need (Express, Marked, and Node):

    {
      "name": "narrative",
      "version": "0.1.2",
      "dependencies": {
        "express": "*",
        "marked": "*",
        "hbs": "*"
      },
      "engines": {
        "node": "*"
      }
    }

We also need to tell Heroku what it has to do to start the server. We do that in a `Procfile`:

    web: node server.js

That just tells them that to start the web server they should run the command "node server.js".

And that's it! That's all the code we need to start this server. The only problem is, all of it is locked away in our [README.md](README.md) file, and Heroku doesn't understand files like this. 

We need something to actually go through our narrative and make real, usable files from it.

The compiler
------------

This is sort of the whole point of this strange little app. You're reading this nice, linear narrative and all the code that made it show up. But we also want to be able to run that code. That's what code is for!

In order for that to happen, we need something that understands this Markdown file you are reading, with all it's file names and blocks of code, and can spit out actual files. Here's some javascript that does the trick. It's in a file called `compile.js`.

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

There's a lot going on there, but the gist of it is that we take the [README.md](README.md) file, split it up into chunks, find all of these files we've described, and save them into a folder called "narrative-build".

And that's it! That's all of the code we need for this narrative to come alive! 

... We just need that little bit of human-intervention that I mentioned before, and that's where you come in. Tie your shoes and tighten your belt, we're about to deploy some software.

Running your own copy of Narrative
----------------------------------

You'll need to install [Git](http://git-scm.com/downloads), [Node.js](http://nodejs.org/) and [NPM](https://www.npmjs.org/) on your computer. Then open a terminal and run:

    git clone https://github.com/erikpukinskis/narrative.git
    cd narrative

That will put you into a folder that has this very document (README.md) and the compile.js file described above. In order to generate your copies of the files, run:

    node compile.js

Now type:

    ls ../narrative-build

You'll see all of the files we described above! Neat! In order to start the server you just do:

    cd ../narrative-build
    npm install
    node server.js

Now open up <http://localhost:5000> in your web browser and you should see your copy of this narrative! Cool! That's a legit web server running on your computer.

Try changing some text in the README.md and running "node compile.js" and "node server.js" again, reload your browser and you should see your changes!

Putting it on the intarwebs
---------------------------

Now, in order to get it on the web so that the whole world can see it, we need to deploy it to Heroku. Install the [Heroku Toolbelt](https://toolbelt.heroku.com/) and create a git repository that will keeps track of your code:

    git init

We need to do that because git is what we use to actually send all of this stuff to Heroku. Save the files we just built into the repository:

    git add .
    git commit -m "My own version of Narrative.js"

Create an app on Heroku so we can host all this shiz:

    heroku create whatever-you-want-to-call-this

You'll have to choose a name of your own. And then finally "push" the code to Heroku, so they can set it up on the web:

    git push heroku master
    
At this point you should have your very open copy of Narrative.js on the internet! Just go to <http://whatever-you-want-to-call-this.herokuapp.com>, or whatever you called it.

Why would I want to do this?
----------------------------

Right now Narrative JS doesn't really do a whole lot except describe itself. But my next goal is to turn it into an app that can actually edit itself and other narratives. And allow you to create and deploy your own narratives without leaving the web browser. All that terminal stuff is way more complicated than it needs to be.

But for now this is the bare minimum thing that I could get working that demonstrates the idea of narrative-driven programming. So it's a fun start.
