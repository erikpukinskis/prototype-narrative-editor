Load
----

How a test injects a paragraph in the DOM on the client:

 - eval all code blocks
 - see if test was defined. If so, grab the module and undefine it
 - save it out for requirejs somehow
 - send the module id down to the browser with a block id (means we need some concept of block ids)
 - load it client side and inject it into the DOM

How we can have a working server:

When we make a change:
 - which servers are live? load the freshest libs. reload them.
 - which servers are baked? load them on a different port with the fresh libs and mark those live

When we commit a change:
 - mark the lib baked.
 - which servers are baked? unload all the fresh libs. leave the committed ones. or go back to the db and get the most recently committed one. reload the servers.


`load.js`:


    define(['documents', 'getdependencies', 'underscore', 'requirejs'], function(documents, getDependencies, _, requirejs) {
      var servers = {}
      var ports = {}
      var nextPort = 5100
      var narratives = {}
      var narrativesThatDependOn = {}

      function rememberDependencies(name, compiled) {
        getDependencies(compiled, function(dependencies) {
          dependencies.forEach(function(dep) {
            if (dep == name) { return }
            if (!narrativesThatDependOn[dep]) { narrativesThatDependOn[dep] = {}}
            narrativesThatDependOn[dep][name] = true
          })
        })
      }

      function reloadDependents(name) {
        var dirty = _(narrativesThatDependOn[name]).keys()
        dirty.forEach(function(dependent) {
          load(dependent)
        })
      }
      
      function load(name, compiled) {
        if (compiled) {
          narratives[name] = compiled
        } else {
          compiled = narratives[name]
        }

        function undefine(callback) {
          requirejs.undef(name)
          if (!servers[name]) { servers[name] = [] }
          if (servers[name].length < 1) { callback() }
          
          while(server = servers[name].pop()) {
            server.stop(callback)
          }
        }

        function getPort(name) {
          return ports[name] || nextPort++
        }

        function startServer(server) {
          console.log('\n##=================##')

          if (server && server.start) {
            port = getPort(name)
            console.log('Starting', name, 'on port', port)
            server.start(port)
            servers[name].push(server)
            ports[name] = port
          } else {
            console.log('Your center.js needs to return a server that can be started! It returned ' + JSON.stringify(server) + ' instead')
          }
        }

        function logError(e) {
          console.log(e.stack)
        }

        requirejs.onError = logError

        function start(block) {
          try {
            eval(block.source)
            console.log('\nRequiring', name, '...\n+=================+\n')
            requirejs([name], startServer, logError)
          } catch (e) {
            console.log(e.stack)
          }
        }

        function save(block) {
          var path = 'assets/' + block.filename
          documents.set(path, block.source)
        }

        function redefine(block) {
          try {
            console.log('Evaluating', block.filename, 'because it seems to be a library....')
            eval(block.source)
          } catch (e) {
            console.log(e)
          }
        }

        undefine(function() {
          compiled.each.server(start)
          compiled.each.source(save)
          compiled.each.library(redefine)
        })
      }

      return function(name, compiled) {
        load(name, compiled)
        rememberDependencies(name, compiled)
        reloadDependents(name, compiled)
      }
    })
