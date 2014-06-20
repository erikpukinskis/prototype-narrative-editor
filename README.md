Narrative
=========

_*Warning: This is totally broken right now!*_

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

Let's make a server! We'll call it 'narrative':

    library.give('narrative', function(express) {
      express.use('/', express.static('.'));

      express.get('/', function(xxxx, response) {
        response.render('edit.html');
      });
    });

That's our server, narrative, and we're giving it to the library to hold on to (don't trust myself with that!). It needs one other function from the library in order to work: express, a web server.

Writing
-------

We mentioned ad `edit.html` above. That's the HTML we are passing down that actually sets up the editor:

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

    library.take('helloworld');

You can go to [http://localhost:5000](http://localhost:5000) to see it.


The system
----------

Great. So that's In order for that server to run, we need to actually set up a computer somewhere that has Express and Marked and Node and knows how to fire everything up. 

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

