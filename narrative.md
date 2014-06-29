Narrative
=========

_*Warning: This is somewhat broken right now.*_

This is a web app.
------------------

It just serves this one page that you're reading right now. What's kind of neat is that this page describes everything that has to happen for it to exist on the internet. 

What's really neat is that this page also contains everything it needs to create a complete working copy of itself. All it needs is a human to run a few commands to help it along.

Here's how it works.

The Server
----------

First off, this document is written in a filed called README.md. It's written in a language called Markdown. You can see that file [here](https://raw.githubusercontent.com/erikpukinskis/narrative/master/README.md).

In order for you to be reading a nicely formatted version of this document in your web browser right now, there needs to be a web server that can take your request, convert that README file into HTML, and send it down to your web browser on your phone or laptop or whatever.

Let's make a server! We'll call it Narrative and put it in `narrative.js`:

> *Todo: The static file serving doesn't seem to be working.*

    library.give('narrative', function(express) {
      express.use(express.static('.'))

      express.get('/', function(xxxx, response) {
        response.sendfile('./edit.html')
      })
    })

We're giving it to the [library](library.md) to hold on to (don't trust myself with that!). It needs one other narrative from the library in order to work: [Express](express.md), a web server. 

Writing
-------

We mentioned `edit.html` above. That's the HTML we are passing down that actually sets up the editor:

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

That's it! To start it up, we just do:

    library.take('narrative');

The system
----------

Great. So in order for all of those things to actually take part in the real world, we need to actually set up a computer somewhere that has Express and Node and knows how to fire everything up. 

Luckily, it's 2014 and there's a service called [Heroku](http://heroku.com) that will do all of that for us. We just need to provide them with two more files that show them what to do. 

The first is `package.json`, which describes the various things running the server depends on:

    {
      "name": "narrative",
      "version": "0.1.3",
      "dependencies": {
        "express": "*",
        "ejs": "*",
        "underscore": "*"
      },
      "engines": {
        "node": "*"
      }
    }

We also need to tell Heroku what it has to do to start the server. We do that in a `Procfile`:

    web: node narrative.js

That just tells them that to start the web server they should run the command "node server.js".

Running your own copy of Narrative
----------------------------------

So those are some snippets of code to run. But some human intervention is necessary for that to actually happen. Like, real computers need to be on in the real world in a closet somewhere.

Here's how.

You'll need to install [Git](http://git-scm.com/downloads), [Node.js](http://nodejs.org/) and [NPM](https://www.npmjs.org/) on your computer. Then open a terminal and run:

  git clone https://github.com/erikpukinskis/narrative.git
  cd narrative

That will put you into a folder that has this very document (README.md) and the a file called compile.js, which was generated from the [compiler.md](compiler.md) narrative¹.

That narrative will actually read a narrative file, and write out a javascript file that can actually be run on your computer to start the server! You do that like this:

  node compile.js

That also will spit out all the files described in the narrative. So now if you type:

  ls ../narrative-build

... you'll see styles.css, edit.html, and all of the other files we described above! Neat! 

In order to start the server you just do:

  cd ../narrative-build
  npm install
  node server.js

Now open up [http://localhost:5000](http://localhost:5000) in your web browser and you should see your copy of this narrative! Cool! That's a legit web server running on your computer.

Try changing some text in the README.md and running "node compile.js" and "node server.js" again, reload your browser and you should see your changes!

If you want to deploy it on the web, checkout out the [deploy instructions](deploy.md).
 
----
¹ If you want to bootstrap the process just from the narrative, you can just save the README.md file and then copy just the javascript out of compiler.md and paste it into compile.js and run that. But we include compile.js in this repository as a convenience.














