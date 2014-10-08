Narrative
=========

A tool for writing code in a literary way, "narratives". Includes a web-based editor, a compiler that can run the narratives and a bit of deployment framework, and an integrated host.

Next up
-------

There's some stuff to clean up to get back to feature parity with 0.2.0.

 - [X] Type Narrative into itself
 - [ ] Get Narrative typed in to save, reload, and run a hello world
 - [ ] Write out stored narratives to .md files. Overwrite Narrative.
 - [ ] Load .md files if there's nothing in the db

And that'll be 0.3.0, "Self hosting without touching the filesystem".

Maybe 0.4.0 can be:

 - [ ] Indented comments
 - [ ] Actually make these narratives read well

Backlog
-------
 - [ ] getDependencies should go straight to searchLine. We should just join the blocks together into a string in build
 - [ ] Automatically compile dependencies of dependencies so narrative doesn't have to require jquery and database and such

The Server
----------


First off, this document is written in a filed called narrative.md. It's written in a language called Markdown. You can see that file [here](https://raw.githubusercontent.com/erikpukinskis/narrative/master/narrative.md).

In order for you to be reading a nicely formatted version of this document in your web browser right now, there needs to be a web server that can take your request, convert that README file into HTML, and send it down to your web browser on your phone or laptop or whatever.

Here's `center.js` of this story:

    define(['server', 'documents', 'compile', 'load', 'underscore', 'getdependencies', 'build', 'require', 'folder', 'database', 'chain', 'indent', 'jquery', 'ember', 'editor'], function(server, documents, compile, load) {

      var server = new Server()

      function docToSource(doc) {
        return _(doc.lines).map(function(line) {
          var prefix = line.kind == 'code' ? '    ' : ''
          return prefix + line.string
        }).join('\n')
      }

      function docToNarrative(document, name) {
        if (document && !document.lines) { document = null }
        document = document || {
          lines: [{string: '', kind: 'prose'}]
        }
        if (typeof document.lines == 'object') {
          document.lines = _(document.lines).values()
        }

        document.name = name

        return document
      }

      function editor(xxxx, response) {
        response.sendfile('./edit.html')
      }

      server.use(server.static('.'))

      server.use(documents.api)

      server.get('/', editor)

      server.get('/:name', editor)
      
      server.get('/narratives/:name', 
        function(request, response) {
        var name = request.params.name
        documents.get(name, function(document) {
          response.json(docToNarrative(document, name))
        })
      })

      server.post('/narratives', function(request, response) {
        var name = request.body.name
        var doc = _(request.body).pick('lines', 'name')
       
        documents.set(name, doc, function() {
          compile(docToSource(doc), function(compiled) {
            load(name, compiled)
            response.json({ok: true})
          })
        })
      })

      documents.test()

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

    <script type="text/x-handlebars" data-template-name="narrative">
      {{narrative-editor model=model.lines}}
      <div class="spinner"></div>
    </script>

    <script src="require.js"></script>
    <script data-main="editor" src="require.js"></script>
    <script data-main="ember" src="require.js"></script>
    <script data-main="underscore" src="require.js"></script>

    <script>


      require(['editor', 'ember', 'underscore', 'jquery', 'handlebars'], function(editor, ember){
        var Ember = ember
        App = Ember.Application.create()
        App.NarrativeEditorComponent = editor
        Cursor = new function(){}

        App.FocusInputComponent = Ember.TextField.extend({
          classNames: ['focus-input'],

          becomeFocused: function() {
            this.$().focus();
          }.on('didInsertElement'),

          keyDown: function(e) {
            var _this = this
            var number = e.keyCode
            var editor = this.get('editor')
            var code = e.shiftKey ? 'shift-' : ''
            code = code + number

            var action = {
              '8': 'backspace',
              '9': 'indent',
              'shift-9': 'unindent',
              '39': 'right',
              '37': 'left',
              '38': 'up',
              '40': 'down',
              '13': 'enter'
            }[code];

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

        App.NarrativeController = Ember.Controller.extend({
          save: function() {
            if (this.get('isDirty') == null) {
              this.set('isDirty', false)
              return
            }
            this.set('isDirty', true)
            var _this = this
            if (this.timeout) { clearTimeout(this.timeout) }
            this.timeout = setTimeout(function() {
              $.post('/narratives', _this.get('model'), function() {
                _this.set('isDirty', false)
              })
            }, 3000)
          }.observes('model.lines.@each.string')
        })

        App.NarrativeView = Ember.View.extend({
          classNameBindings: ['controller.isDirty']
        })

        App.Router.reopen({
          location: 'history'
        })

        App.Router.map(function() {
          this.route("narrative", { path: "/:name" });
        })

        App.NarrativeRoute = Ember.Route.extend({
          model: function(params) {
            $(document).attr('title', params.name + ' - Narrative')
            return Ember.$.getJSON('/narratives/' + params.name)
          }
        })

      })

    </script>

    </html>

There's a lot going on there. It loads Ember and some other javascript libraries that it needs to work. It creates an Ember application with a Handlebars template and a link back to the Read page.

And we also need a CSS stylesheet to make things pretty, which goes in `styles.css`:

    .narrative {
      font-family: Georgia;
      font-size: 20px;
      max-width: 800px;
      margin: 1.5em auto;
      padding: 0 1em;
    }

    .line, h1 {
      line-height: 1.6em;
      min-height: 1.6em;
      white-space: pre-wrap;
    }

    .line.prose, h1 {
      color: #555;
    }

    .line.prose {
      margin-bottom: 1em;
    }

    .line.code {
      color: #00C8A0;
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

    .marker {
      opacity: 0.5;
      font-size: 0.5em;
      vertical-align: 0.25em;
    }

    .spinner::before {
      content: '*';
      position: fixed;
      right: 0.2em;
      top: 0;
      font-size: 2em;
      -webkit-animation: colorPulse 500ms infinite alternate;
      opacity: 0;
    }

    @-webkit-keyframes colorPulse { 
      0% {color: rgba(0,0,0,0.1)} 
      100% {color: rgba(0,0,0,0.6)} 
    }


    .is-dirty .spinner::before {
      opacity: 1;
      transition: opacity 200ms;
    }

    .command {
      color: #00C8A0;
    }

    a {
      color: #9B59B6;
    }

    h1 {
      text-align: center;
      margin-left: -0.5em;
    }

    h1, h2 {
      font-weight: normal;
    }

    @media(max-width: 800px) {
      .narrative {
        font-size: 16px;
      }
    }

    @media(max-width: 550px) {
      .narrative {
        font-size: 13px
      }
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
      "version": "0.2.6",
      "dependencies": {
        "express": "*",
        "ejs": "*",
        "underscore": "*",
        "body-parser": "*",
        "knex": "*",
        "pg": "*",
        "pg-escape": "*",
        "handlebars": "*"
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

