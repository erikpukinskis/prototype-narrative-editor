Narrative
=========

This is a web app.
------------------

It just serves this one page that you're reading right now. What's kind of neat is that this page describes everything that has to happen for it to exist on the internet. 

What's really neat is that this page also contains everything it needs to create a complete working copy of itself. All it needs is a human to run a few commands to help it along.

Here's how it works.

The Server
----------

First off, this document is written in a filed called narrative.md. It's written in a language called Markdown. You can see that file [here](https://raw.githubusercontent.com/erikpukinskis/narrative/master/narrative.md).

In order for you to be reading a nicely formatted version of this document in your web browser right now, there needs to be a web server that can take your request, convert that README file into HTML, and send it down to your web browser on your phone or laptop or whatever.

Let's make a server! We'll put it in `narrative.js`:

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

    <script type="text/x-handlebars">
      {{render 'narrative' model}}
    </script>

    <script type="text/x-handlebars" id="narrative">
      {{html}}
    </script>

    <script src="/libs/jquery.js"></script>
    <script src="/libs/handlebars.js"></script>
    <script src="/libs/ember.js"></script>
    <script src="/libs/lodash.js"></script>

    <script>
      App = Ember.Application.create();

      App.ApplicationRoute = Ember.Route.extend({
        model: function() {
          return [{string: 'hello'}]
        }
      })

      var splitAtCursor = function(string, cursor) {
        return {
          before: string.slice(0,cursor.column),
          after: string.slice(cursor.column, string.length)
        }
      }

      var moveCursor = function(d) {
        return function() {
          var column = this.get('cursor.column') + d
          this.set('cursor.column', column)
        }
      }

      App.NarrativeController = Ember.ArrayController.extend({
        cursor: {line: 0, column: 0},

        right: moveCursor(1),

        left: moveCursor(-1),

        backspace: function() {
          var _this = this;
          setTimeout(function() {
            var cursor = _this.get('cursor')
            var property = ['model', cursor.line, 'string'].join('.')
            var string = _this.get(property)
            var parts = splitAtCursor(string, cursor)
            string = parts.before.slice(0, -1) + parts.after
            _this.set(property, string)
            _this.set('cursor.column', cursor.column - 1)
          }, 0)
        },

        html: function() {
          var strings = this.get('model')
          var cursor = this.get('cursor')
          var htmlLines = _(strings).map(function(line, lineNumber) {
            if (lineNumber == cursor.line) {
              var parts = splitAtCursor(line.string, cursor)
              return parts.before + '<div class="cursor"></div>' + parts.after
            } else {
              return line.string
            }
          })
          
          var html = htmlLines.join("<br/>\n")
          return Ember.String.htmlSafe(html)
        }.property('model.@each.string', 'cursor.column'),
      })

      App.NarrativeView = Ember.View.extend({
        classNames: ['narrative'],

        didInsertElement: function() {
          return this.$().attr({ tabindex: 1 }), this.$().focus()
        },

        keyDown: function(e) {
          var action = {
            8: 'backspace',
            39: 'right',
            37: 'left',
            38: 'up',
            40: 'down'
          }[e.keyCode];

          if (action) {
            console.log(action)
            this.get('controller')[action]()
            return false
          } else {
            console.log(e.keyCode)
          }
        }
      })
    </script>

    </html>

There's a lot going on there. It loads Ember and some other javascript libraries that it needs to work. It creates an Ember application with a Handlebars template and a link back to the Read page.

And we also need a CSS stylesheet to make things pretty, which goes in `styles.css`:

    .narrative {
      font-family: Georgia;
      font-size: 30px;
      max-width: 700px;
      margin: 2em auto;
      padding: 0 1em;
    }

    .narrative:focus {
      outline: none;
    }

    .cursor {
      display: inline-block;
      background: #999;
      width: 2px;
      margin-right: -2px;
      height: 1.2em;
      vertical-align: -.2em;
      color: #999
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


That's it! To start it up, we just do:

    library.take('narrative');

The system
----------

Great. So in order for all of those things to actually take part in the real world, we need to actually set up a computer somewhere that has Express and Node and knows how to fire everything up. 

Luckily, it's 2014 and there's a service called [Heroku](http://heroku.com) that will do all of that for us. We just need to provide them with two more files that show them what to do. 

The first is `package.json`, which describes the various things running the server depends on:

    {
      "name": "narrative",
      "version": "0.2.0",
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

If you want to run Narrative on your computer or deploy your own copy on the web, check out the [deploy instructions](deploy.md).

