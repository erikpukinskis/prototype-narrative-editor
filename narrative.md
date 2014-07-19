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
      <title>Narrative</title>
        <link rel="stylesheet" href="styles.css" />
    </head>

    <script type="text/x-handlebars">
      {{narrative-editor model}}
    </script>

    <script src="/libs/jquery.js"></script>
    <script src="/libs/handlebars.js"></script>
    <script src="/libs/ember.js"></script>
    <script src="/libs/lodash.js"></script>

    <script>
      App = Ember.Application.create();

      Cursor = new function(){}

      distanceFromBottomToCursor = function() {
        var cursorEl = $('.cursor')[0]
        if (cursorEl) {
          return window.innerHeight - cursorEl.getBoundingClientRect().bottom
        }
      }

      App.FocusInputComponent = Ember.TextField.extend({
        classNames: ['focus-input'],

        becomeFocused: function() {
          this.$().focus();
        }.on('didInsertElement'),

        keyDown: function(e) {
          var _this = this
          var number = e.keyCode
          var editor = this.get('editor')
          var action = {
            8: 'backspace',
            9: 'indent',
            39: 'right',
            37: 'left',
            38: 'up',
            40: 'down',
            13: 'enter'
          }[number];

          if (action) {
            console.log(action)
            controller[action]()
            return false
          } else {
            Ember.run.next(function() {
              controller.type(_this.get('value'))
              _this.set('value', '')
            })
          }
        }
      });

      App.ApplicationRoute = Ember.Route.extend({
        model: function() {
          return [
            {string: 'hello', kind: 'prose'}, 
            {string: 'world', kind: 'prose'}
          ]
        }
      })

      var moveCursor = function(columns, lines) {
        return function() {
          var column = this.get('cursor.column') + columns
          var line = this.get('cursor.line') + lines
          if (column >= 0) {
            this.set('cursor.column', column)
          }
          if (line >= 0) {
            this.set('cursor.line', line)
          }
        }
      }

      App.NarrativeEditorComponent = Ember.Component.extend({
        template: Ember.Handlebars.compile('{{focus-input editor=controller}}{{html}}')

        cursor: {line: 0, column: 0},

        right: moveCursor(1,0),

        left: moveCursor(-1,0),

        down: moveCursor(0,1),

        up: moveCursor(0,-1),

        indent: function() {          
          var cursorLine = this.get('cursor.line')
          var property = ['model', cursorLine, 'kind'].join('.')
          this.set(property, 'code')
        },

        lineProperty: function(line) {
          if (!line || (line == Cursor)) {
            line = this.get('cursor.line')
          }

          return ['model', line, 'string'].join('.')
        },

        getLine: function(line) {
          return this.get(this.lineProperty(line));
        },

        setLine: function(line, string) {
          this.set(this.lineProperty(line), string)
        },

        lineSplitAtCursor: function() {          
          var string = this.getLine(Cursor)
          var cursor = this.get('cursor')

          return {
            before: string.slice(0,cursor.column),
            after: string.slice(cursor.column, string.length)
          }
        },

        mergeDown: function() {
          var line = this.get('cursor.line')
          var string = this.getLine(line) + this.getLine(line+1)
          this.setLine(line, string)
          this.removeAt(line+1,1)
        },

        backspace: function() {
          var _this = this;
          var cursor = this.get('cursor')
          var parts = _this.lineSplitAtCursor()
          if (parts.before.length < 1) {
            if (cursor.line > 0) {
              this.decrementProperty('cursor.line')
              var previousLine = this.getLine()
              this.set('cursor.column', previousLine.length)
              this.mergeDown(cursor.line - 1)
            }           

          } else {
            var string = parts.before.slice(0, -1) + parts.after
            _this.setLine(Cursor, string)
            _this.left()
          }
        },

        type: function(letter) {
          if (letter.length < 1) { return }
          var cursor = this.get('cursor')
          var parts = this.lineSplitAtCursor()
          var string = parts.before.concat(letter, parts.after)

          this.setLine(Cursor, string)
          this.right()
        },

        enter: function() {
          var cursor = this.get('cursor')
          var parts = this.lineSplitAtCursor()
          var kind = this.get('model')[cursor.line].kind
          var linesAfter = this.get('model').slice(cursor.line)
          linesAfter.unshiftObject({string: parts.before, kind: kind})
          linesAfter[1] = {string: parts.after, kind: kind}
          this.get('model').replace(cursor.line, cursor.line + linesAfter.length + 1, linesAfter)
          this.incrementProperty('cursor.line')
          this.set('cursor.column', 0)
        },

        html: function() {
          var _this = this
          var strings = this.get('model')
          var cursor = this.get('cursor')
          var htmlLines = _(strings).map(function(line, lineNumber) {
            var html
            if (lineNumber == cursor.line) {
              var parts = _this.lineSplitAtCursor()
              html = parts.before + '<div class="cursor"></div>' + parts.after
            } else {
              html = line.string
            }

            var classes = ['line', line.kind]
            classes = classes.join(' ')
            return '<div class="' + classes + '">' + html + '</div>'
          })
          
          var html = htmlLines.join("\n")

          Ember.run.next(function() {
            EXTRA = 50
            var distance = distanceFromBottomToCursor()
            if (distance < EXTRA) {
              $("html,body").animate({scrollTop: $('body').scrollTop() - distance + EXTRA}, 0)
            }
          })
          return Ember.String.htmlSafe(html)
        }.property('model.@each', 'model.@each.string', 'model.@each.kind', 'cursor.line', 'cursor.column'),
      })

      App.NarrativeView = Ember.View.extend({
        classNames: ['narrative'],
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

    .line {
      line-height: 1.6em;
      min-height: 1.6em;
    }

    .line.prose {
      color: #333;
    }

    .line.code {
      color: #1abc9c;
      padding-left: 2em;
      font-family: Courier;
    }

    .focus-input {
      position: fixed;
      opacity: 0;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
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
      "version": "0.2.1",
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

