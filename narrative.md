! Narrative

A tool for writing code in a literary way, "narratives". Includes a web-based editor, a compiler that can run the narratives and a bit of deployment framework, and an integrated host.

Thank you
---------

Why?, Ursula K. Leguin, Jonathan Blow, Ryan Dahl

Tests
-----

What better way is there to start than to describe some necessary conditions for a thing to be itself?

[X] The client saves a narrative to the database
[X] If you type hello.md a server starts
[X] If you type some css in the hello world it gets saved to the database
[X] If you reload the hello world it has the new css
[X] You can add a dependency to hello world and it will get loaded on the server
[X] Narrative can restart itself from a web request
[X] When you edit editor.md it can be reloaded in the client

The Server
----------

`server narrative.js
        define('narrative', ['server', 'documents', 'compile', 'load', 'repo', 'folder', 'underscore', 'getdependencies', 'build', 'require', 'database', 'chain', 'indent', 'jquery', 'editor', 'scrolltoreveal', 'dom', 'commiteditor'], function(server, documents, compile, load, Repo) {

          var server = new Server()
          var repo = new Repo('erikpukinskis/narrative', process.env.GITHUB_TOKEN)

          function sourceToNarrative(source, name) {
            var lines = source.split('\n').map(function(string) {
              return compile.stringToLine(string)
            })

            return {
              name: name,
              lines: lines
            }
          }

          function docToSource(doc) {
            return _(doc.lines).map(function(line) {
              var prefix = compile.prefixes[line.kind]

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

          server.get('/xxxx:name.js', function(request, response, next) {
            documents.get('assets/'+request.params.name+'.js', function(document) {
              if (document) {
                response.send(document)
              } else {
                next()
              }
            })
          })
          
          server.get('/narratives/:name', function(request, response) {
            var name = request.params.name

            documents.get(name, function(document) {
              if (document) {
                return response.json({narrative: docToNarrative(document, name)})
              }

              repo.get(name + '.md', function(source, hash) {
                var narrative = sourceToNarrative(source || '', name)
                narrative.hash = hash
                response.json({narrative: narrative})
                documents.set(name, narrative)
              })
            })
          })

          server.get('/narratives', function(request, response) {
            documents.where({name: /^narratives\//}).map('id', function(id) {
              console.log(id)
            })
          })

          server.post('/narratives', function(request, response) {
            var doc = _(request.body).pick('lines', 'name')

            documents.set('narratives/'+doc.name, doc, function() {
              compile(docToSource(doc), function(compiled) {
                console.log(JSON.stringify(compiled, null, 2))
                load(doc.name, compiled)
                response.json({ok: true})
              })
            })
          })

          server.post('/commits', function(request, response) {
            response.setTimeout(30000)
            var name = request.body.name

            documents.get(name, function(doc) {
              var changes = {}
              changes[name+'.md'] = docToSource(doc)
              repo.commit(changes, request.body.message, function(hash) {
                response.send({hash: hash})
              })
            })
          })

          // documents.test()

          return server
        })

Then we need a javascript file that starts the server. We'll put it in `start.js`:
`file start.js
        var requirejs = require('requirejs')

        requirejs(['narrative'], function(server) {
          server.start(process.env.PORT)
        })

Writing
-------

We mentioned `edit.html` above. That's the HTML we are passing down that actually sets up the editor:
`file edit.html
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Narrative</title>
          <link rel="stylesheet" href="styles.css" />
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />

        </head>
        <script src="require.js"></script>

        <body>
          <div class="narrative"></div>
        </body>

        <script>

          require(['editor', 'commiteditor', 'underscore', 'jquery'], function(Editor, CommitEditor){

            var editor

            KeyboardCatcher = function() {
              function handleAction(e) {
                var number = e.keyCode
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
                  editor[action]()
                  return true
                }
              }

              document.onkeydown = function(event) {
                if (handleAction(event)) {
                  event.preventDefault()
                }
              }

              document.onkeypress = function(event) {
                var char = String.fromCharCode(event.keyCode)
                editor.type(char)
                return false
              }

              function distanceToCursor(event) {
                var cursor = $('.active .cursor').offset()
                return Math.sqrt(
                  Math.pow(cursor.left - event.pageX, 2) 
                + Math.pow(cursor.top - event.pageY, 2)
                )
              }

              function moveCursorToMouse(event) {
                var id = $(event.toElement).parent('.line').attr('data-id')
                editor.moveToId(id)

                var best = 0
                var bestDistance = 999999
                var previousColumn
                do {
                  var distance = distanceToCursor(event)
                  if (distance < bestDistance) {
                    best = editor.cursor.column
                    bestDistance = distance
                  }

                  previousColumn = editor.cursor.column
                  editor.move(1,0)
                } while(previousColumn != editor.cursor.column)

                editor.move(best - editor.cursor.column, 0)
              }

              var documentClick
              $(document).on('touchstart', function() {
                  documentClick = true;
              })
              $(document).on('touchmove', function() {
                  documentClick = false;
              })

              $(document).on('click touchend', function(event) {
                if (event.type == "click") { documentClick = true }
                if (documentClick){
                    moveCursorToMouse(event)
                }
              })

              document.addEventListener('paste', function(event){
                var contents = event.clipboardData.getData('text')
                var lines = contents.split('\n')
                var columnsToMove = Math.max(0, lines[lines.length - 1].length - 1)

                var line = lines.shift()
                editor.type(line)

                while(line = lines.shift()) {
                  editor.enter()
                  editor.type(line)
                }
              })
            }

            new KeyboardCatcher()


            // ROUTER

            function getRouteParams() {
              var parts = document.location.pathname.split('/')
              return {name: parts[1] || 'narrative'}
            }

            var name = getRouteParams().name

            function save(lines) {
              doc = {name: name, lines: lines}
              $.ajax({
                method: 'POST',
                contentType: "application/json",
                url: '/narratives',
                data: JSON.stringify(doc)
              })          
            }

            function onDocumentChange(lines) {
              save(lines)
              commit.dirty()
            }

            $.getJSON('/narratives/' + name, function(response) {
              editor = new Editor(response.narrative.lines, onDocumentChange)
              editor.bind('.narrative')
              $('title').html(name + ' - Narrative')
            })

            $.getJSON('/narratives', function(response) {
              console.log(response.narratives)
            })

            var commit = new CommitEditor(name)
            commit.bind('body')

          })

        </script>
        
        </html>

And we also need a CSS stylesheet to make things pretty, which goes in `styles.css`:
`file styles.css
        body {
          -webkit-font-smoothing: antialiased;
          margin: 0
        }

        .narrative {
          font-family: Helvetica;
          font-size: 20px;
          max-width: 800px;
          margin: 1.5em auto;
          padding: 0 1em;
        }

        .line, h1 {
          line-height: 1.6em;
          min-height: 1.6em;
          white-space: pre-wrap;
          font-sie: 1em;
        }

        .line.prose, h1 {
          color: #555;
        }

        .line.prose {
          margin: 12px;
        }

        .line.heading {
          color: #222;
          padding-top: 15px;
          margin: 12px;
        }

        .line.code, .line.command {
          color: rgb(52, 126, 210);
          padding-left: 40px;
          font-family: Courier;
        }

        .line.command {
          padding-bottom: 12px;
        }

        .line.command .absolute, .line.command .static {
          color: white;
          background: rgba(52,126,210, 0.7);
          border-radius: 1px;
          display: table-cell;
        }

        .line .absolute, .line.command .absolute {
          display: none;
          position: absolute;
          z-index: 0;
        }

        .line.active .absolute {
          display: block;
        }

        .line.active .static {
          opacity: 0.1;
        }


        @-webkit-keyframes blinker {  
          from { opacity: 1; }
          to { opacity: 0; }
        }

        .cursor {
          -webkit-animation: blinker 500ms cubic-bezier(1,-0.21,0,1.33) infinite alternate;  
          display: none;
          text-decoration: blink;
          width: 2px;
          margin-left: -1px;
          margin-right: -1px;
          height: 1.2em;
          vertical-align: -.2em;
          border-radius: 1px;
        }

        .narrative .cursor {
          display: inline-block;
        }

        .line.command .cursor {
          background:  rgba(255,255,255, 0.9);
        }

        .line.code .cursor {
          background: rgba(52,126,210, 0.7)
        }

        .line.heading .cursor {
          background: rgba(0,0,0,0.7);          
        }

        .line.prose .cursor {
          background: rgba(0,0,0,0.5);
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

        .test-run {
          margin-left: 40px;
          margin-right: 70px;
          margin-top: 12px;
          box-shadow: 0px -2px 3px 0px rgb(192, 216, 255);
          padding: 15px;
          border-radius: 4px;
        }

        a {
          color: #9B59B6;
        }

        h1 {
          text-align: center;
          margin: 0 0 0 -0.5em;
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

        #commit {
          position: fixed;
          right: 3px;
          z-index: 1;
          bottom: -40px;
          transition: bottom 400ms;
        }

        #commit.dirty {
          bottom: 6px;
        }

        #commit input {
          font-family: sans-serif;
          padding: 6px 7px;
          font-size:  14px;
          border: 2px solid rgba(0, 255, 136, 1);
        }

        #commit input[type=text] {
          border-radius: 0px 2px 2px 0px;
          border-left-width: 0px;
          min-width: 11em;
          color: #666;
        }

        #commit input[type=submit] {
          background: rgba(0, 255, 136, 1);
          border: 2px solid rgba(255,255,255, 0);
          color: white;
          border-radius: 2px 0px 0px 2px;
        }

The system
----------

Great. So in order for all of those things to actually take part in the real world, we need to actually set up a computer somewhere that has Express and Node and knows how to fire everything up. 

Luckily, it's 2014 and there's a service called [Heroku](http://heroku.com) that will do all of that for us. We just need to provide them with two more files that show them what to do. 

The first is `package.json`, which describes the various things running the server depends on:
`file package.json
        {
          "name": "narrative",
          "version": "0.5.0",
          "dependencies": {
            "express": "*",
            "underscore": "*",
            "body-parser": "*",
            "knex": "*",
            "pg": "*",
            "pg-escape": "*",
            "chai": "*",
            "js-github": "*",
            "js-git": "*"
            "prototypes": "*"
          },
          "devDependencies": {
            "requirejs": "*"
          },
          "engines": {
            "node": "*"
          }
        }

We also need to tell Heroku what it has to do to start the server. We do that in a `Procfile`:
`file Procfile
        web: node start.js

That just tells them that to start the web server they should run the command "node server.js".

Running your own copy of Narrative
----------------------------------

If you want to run Narrative on your computer or deploy your own copy on the web, check out the [deploy instructions](deploy.md).

