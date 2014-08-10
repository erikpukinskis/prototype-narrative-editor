Narrative
=========

A tool for writing code in a literary way, "narratives". Includes a web-based editor, a compiler that can run the narratives and a bit of deployment framework. Working towards an integrated host.

Next up
-------

Requirejs is working, but there's some stuff to clean up to get back to feature parity with 0.2.0.

 - [ ] Get server to run
 - [ ] Get hello world to run on the same server as narrative
 - [ ] Add a static asset
 - [ ] Add a dependency on a different narrative
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

Here's a `server`:

    define('narrative', ['server', 'documents', 'build', 'require', 'migrate'], function(server, documents, build, tests) {
      var servers = {}

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

      function runTests(compiled, buildServer) {
        return _(compiled.blocks.tests).map(function(test) {
          return test(buildServer())
        })        
      }

      server.use(server.static('.'))

      server.get('/', function(xxxx, response) {
        response.sendfile('./edit.html')
      })

      server.post('/narratives', function(request, response) {
        var name = request.body.name

        documents.set(name, request.pick('body', 'lines')

        compile(name, function(compiled) {
          var block = compiled.blocks.servers()[0]

          evalDependencies(compiled)

          saveStaticFileToPostgres(compiled.blocks.files)

          var buildServer = eval(block.source)

          restart(name, buildServer())

          response.status(ok = 200).send()

          broadcast.notify('build/' + name)

          var results = runTests(compiled, buildServer)

          broadcast.notify('tests/' + name, results)
        })
      })
    })

Then we need a javascript file that starts the server. We'll put it in `narrative.js`:

    var requirejs = require('requirejs')

    requirejs('server', function(server) {
      server.start(process.env.PORT)
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
      {{narrative-editor model=model}}
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
                lines: _this.get('model')
              })
            }, 3000)
          }.observes('model.@each.string')
        })

        App.ApplicationRoute = Ember.Route.extend({
          model: function() {
            return [
              {string: '', kind: 'prose'}, 
            ]
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
      "version": "0.2.3",
      "dependencies": {
        "express": "*",
        "ejs": "*",
        "underscore": "*",
        "body-parser": "*"
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

