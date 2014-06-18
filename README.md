Narrative
=========

Level: 1

Narrative is a tree of functions. But they're better functions. You watch results change as you type. You see red test lights going off within a couple keystrokes of a breakage. It is accessible and editable from any computer, big or small, with a web browser. They are instantly and forever deployed and usable on the internet without you having to set that up. Other people can just as instantly run instances of your function for their use. And can just as easily use their own modified version. They discourage the use of side effects by living in a sandbox. And they're also written as stories, with a beginning and an end.

Here is one!

This is a web app.
------------------

It just serves this one page that you're reading right now. What's kind of neat is that this page describes everything that has to happen for it to exist on the internet. 

What's really neat is that this page also contains everything it needs to create a complete working copy of itself. All it needs is a human to run a few commands to help it along.

Here's how it works.

The Server
----------

First off, this document is written in a filed called README.md. It's written in a language called Markdown. You can see that file [here](README.md).

In order for you to be reading a nicely formatted version of this document in your web browser right now, there needs to be a web server that can take your request, convert that README file into HTML, and send it down to your web browser on your phone or laptop or whatever.

There are lots of ways to set up a web server, but right now we're using a little server written in Javascript. It's just a few lines of code in a file called `server.js`:

    var express = require("express");
    var app = express();

    app.get('/', function(xxxx, response) {
      response.render('edit.html');
    });

    app.engine('html', require('ejs').renderFile);
    app.set('views', __dirname);

    app.use('/', express.static('.'));

    var port = Number(process.env.PORT || 5000);
    
    app.listen(port, function() {
      console.log("Listening on " + port);
    }); 

There's a bunch going on in that code. .

But the only thing you really need to know about that code is that it It loads a library called [Express](http://expressjs.com/) that knows how to talk to web browsers. It took the request you just sent from your web browser for this page, and passed it on to the "gitRead" controller.

> Now this is a sidebar.
> 
> This is the part of the code that I need to change next, but I don't know 
> how to change it. I know I want to be able to be able to download a 
> browserified version of the "medium-editor" npm module. 
>
> So I think that means I need a separate server that just takes requests for 
> browserified js files. On to a separate narrative... 
>
> [browserifier.md](browserified.md)
>
> And it also seems like there's some use for a service that just hosts our 
> files. And maybe it's a rethinkdb proxy?
> 
> [data.md](data.md)

Writing
-------

You are never just reading a narrative. All narratives are living documents that you are editing.

And `edit.html` is an app written in Ember.js:

    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Ember Starter Kit</title>
        <link rel="stylesheet" href="styles.css" />
    </head>
    <body>
      <script type="text/x-handlebars">
        {{outlet}}  
      </script>

      <script type="text/x-handlebars" id="index">
        {{html}}
      </script>

      <script src="//cdnjs.cloudflare.com/ajax/libs/jquery/2.1.1/jquery.js"></script>
      <script src="//cdnjs.cloudflare.com/ajax/libs/handlebars.js/1.1.2/handlebars.min.js"></script>
      <script src="//cdnjs.cloudflare.com/ajax/libs/ember.js/1.5.1/ember.js"></script>
      <script src="//cdnjs.cloudflare.com/ajax/libs/marked/0.3.2/marked.min.js"></script>

      <script>
        App = Ember.Application.create();

        App.IndexRoute = Ember.Route.extend({
          model: function() {
            return Ember.$.get('README.md');
          },
        });

        App.IndexController = Ember.Route.extend({
          html: function() {
            return new Handlebars.SafeString(marked(this.get('model')));
          }.property('model'),
        });
      </script>
    </body>
    </html>

There's a lot going on there. It loads Ember and some other javascript libraries that it needs to work. It creates an Ember application with a Handlebars template and a link back to the Read page.

And we also need a CSS stylesheet to make things pretty, which goes in `styles.css`:

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

    blockquote {
      font-style: italic;
    }


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
        "ejs": "*"
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

We compile narratives with [narrative-comiler](narrative-compiler.md).


We need to be able to turn a narrative into actual files, and there's a module for that. Let's hook it up in `compile.js`:

    compiler = require('narrative-compiler')

    compiler.

This is sort of the whole point of this strange little app. You're reading this nice, linear narrative and all the code that made it show up. But we also want to be able to run that code. That's what code is for!


> node 
> This is where there would be some fancy reference to another narrative!
>
> we need the `compile module`, and then our serve

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

