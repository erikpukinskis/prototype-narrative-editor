Narrative
=========

A tool for writing code in a literary way, "narratives". Includes a web-based editor, a compiler that can run the narratives and a bit of deployment framework, and an integrated host.

Next up
-------

There's some stuff to clean up to get back to feature parity with 0.2.0.

 - [X] Narrative saving client side
 - [ ] Get server to run
 - [ ] Get hello world to run on the same server as narrative
 - [ ] Add a static asset
 - [ ] Add a dependency on a different narrative
 - [ ] Type in Folder
 - [ ] Type in all the other deps
 - [ ] Type Narrative into itself

And that'll be 0.3.0, "Self hosting without touching the filesystem".

Backlog
-------
 - [ ] getDependencies should go straight to searchLine. We should just join the blocks together into a string in build
 - [ ] make getDependencies its own module that just takes a string
 - [ ] Do something to break up code blocks into different parts. Maybe make prose indentable. Maybe just design things so that it works. Maybe use other commands besides "write this file"
 - [ ] don't have entire function bodies in Build be wrapped in a compile block. Just pass the blocks or whatever. Pass a string if you can.
 - [ ] Automatically compile dependencies of dependencies so narrative doesn't have to require Ember and such
 - [ ] Make enter key not mess with indentation (so we can do inline prose)

The Server
----------


First off, this document is written in a filed called narrative.md. It's written in a language called Markdown. You can see that file [here](https://raw.githubusercontent.com/erikpukinskis/narrative/master/narrative.md).

In order for you to be reading a nicely formatted version of this document in your web browser right now, there needs to be a web server that can take your request, convert that README file into HTML, and send it down to your web browser on your phone or laptop or whatever.

Here's `center.js` of this story:

    define(['server', 'documents', 'build', 'underscore', 'require', 'folder', 'compile', 'database', 'chain', 'indent'], function(server, documents, build, underscore) {
      var servers = {}

      documents.test()
      
      server.use(server.static('.'))

      function restart(name, freshlyBuiltServer) {
        var port = 3001
        if(servers[name]) { 
          servers[name].close()
          delete servers[name]
        }
        freshlyBuiltServer.start(port)
        servers[name] = freshlyBuiltServer
      }

      function evalDependencies(compiled) {
        build.getDependencies(compiled.blocks, function(deps) {
          _(deps).each(function(dep) {
            compile(dep, function(compiled) {
              _(compiled.blocks.definitions).each(function(block) {
                eval(block.source)
              })
            })
          })
        })
      }

      server.get('/', function(xxxx, response) {
        response.sendfile('./edit.html')
      })

      server.get('/narratives/narrative', function(xxxx, response) {
        console.log('[GET] client is asking for narrative. looking in db.')
        documents.get('narrative', function(document) {
          console.log('looking in the db for narrative, found ' + document)
          document = document || {
            name: 'narrative',
            lines: [
              {string: '', kind: 'prose'}, 
            ]
          }

          console.log('sending document with ' + document.lines.length + ' lines')
          response.json(document)
        })
      })

      server.post('/narratives', function(request, response) {
        var name = request.body.name
        console.log('[POST] saving ' + request.body.name + ' to the db')

        documents.set(name, _(request.body).pick('lines', 'name'), function() {

          compile(name, function(compiled) {
            console.log('looking for servers....')
            var block = compiled.each.server(function(block) {
              console.log('compiled '+name+' and got server:'+block)
              var buildServer = eval(block.source)
              restart(name, buildServer())
              response.json({ok: true})
            })
          })
        })
      })

      return server
    })

At this point we need to 

> Note that in order to parse that we need to recognize center declarations in the Narrative compiler. The reason this is special is we need to know how to plug in to the narrative without actually running foreman on the filesystem. So in our POST after the compile we can just eval the funcs and then eval the server.

Then we need a javascript file that starts the server. We'll put it in `narrative.js`:

    var requirejs = require('requirejs')

    requirejs(['center'], function(center) {
      center.start(process.env.PORT)
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
      {{narrative-editor model=model.lines}}
    </script>

    <script src="require.js"></script>
    <script data-main="editor" src="require.js"></script>
    <script data-main="ember" src="require.js"></script>
    <script data-main="jquery" src="require.js"></script>
    <script data-main="handlebars" src="require.js"></script>
    <script data-main="underscore" src="require.js"></script>

    <script>


      require(['editor', 'ember', 'underscore', 'jquery', 'handlebars'], function(editor, ember){
        var Ember = ember
        App = Ember.Application.create()
        App.NarrativeEditorComponent = Ember.Component.extend(editor)
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
              editor[action]()
              return false
            } else {
              Ember.run.next(function() {
                editor.type(_this.get('value'))
                _this.set('value', '')
              })
            }
          }
        });

        App.ApplicationController = Ember.Controller.extend({
          save: function() {
            var _this = this
            if (this.timeout) { clearTimeout(this.timeout) }
            this.timeout = setTimeout(function() {
              $.post('/narratives', {
                name: 'narrative',
                lines: _this.get('model.lines')
              })
            }, 3000)
          }.observes('model.lines.@each.string')
        })

        App.ApplicationRoute = Ember.Route.extend({
          model: function() {
            return Ember.$.getJSON('/narratives/narrative')
          }
        })

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
      "version": "0.2.5",
      "dependencies": {
        "express": "*",
        "ejs": "*",
        "underscore": "*",
        "body-parser": "*",
        "knex": "*",
        "pg": "*"
      },
      "devDependencies": {
        "requirejs": "*"
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

