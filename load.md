Load
----

`load.js`:


    define(['documents', 'getdependencies', 'underscore'], function(documents, getDependencies, _) {
      var servers = {}
      var ports = {}
      var nextPort = 5100
      var narratives = {}
      var narrativesThatDependOn = {}

      function rememberDependencies(name, compiled) {
        getDependencies(compiled, function(dependencies) {
          dependencies.forEach(function(dep) {
            if (!narrativesThatDependOn[dep]) { narrativesThatDependOn[dep] = {}}
            narrativesThatDependOn[dep][name] = true
            console.log(JSON.stringify({deps: narrativesThatDependOn}, null, 2))
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
          if (!ports[name]) {
            ports[name] = nextPort
            nextPort++
          }
          return ports[name]
        }

        function start(block) {
          try {
            eval(block.source)
            console.log('\nRequiring', name, '...\n+=================+\n')
            requirejs([name], function(server) {
              console.log('\n+=================+\n')

              server.start(getPort(name))

              console.log('starting', name)
              servers[name].push(server)
            }, function() {
              console.log("There was an error.")
            })
          } catch (e) {
            console.log(e)
          }
        }

        function redefineIfLib(block) {
          console.log('checking if', block.filename, 'is lib...')
          if (block.filename != name + '.js') { 
            console.log("it's not");
            return 
          }

          try {
            console.log('it is. evaluating...')
            eval(block.source)
          } catch (e) {
            console.log(e)
          }
        }

        function save(block) {
          var path = 'assets/' + block.filename
          documents.set(path, block.source)
        }

        undefine(function() {
          compiled.each.server(start)
          compiled.each.source(save)
          compiled.each.block(redefineIfLib)
        })
      }

      return function(name, compiled) {
        load(name, compiled)
        rememberDependencies(name, compiled)
        reloadDependents(name, compiled)
      }
    })
