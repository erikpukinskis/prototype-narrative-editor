Load
----

`load.js`:


    define(['documents', 'getdependencies', 'underscore'], function(documents, getDependencies, _) {
      var servers = {}
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

        function undefine() {
          requirejs.undef(name)
          if (!servers[name]) { servers[name] = [] }
          while(server = servers[name].pop()) {
            server.stop()
          }
        }

        function redefineServer(block) {
          try {
            eval(block.source)
            console.log('\nRunning ' + name + '...\n+=================+\n')
            requirejs([name], function(server) {
              console.log('\n+=================+\n')
              servers[name].push(server)
            }, function() {
              console.log("There was an error.")
            })
          } catch (e) {
            console.log(e)
          }
        }

        function redefineIfLib(block) {
          if (block.filename != name + '.js') { return }

          try {
            eval(block.source)
          } catch (e) {
            console.log(e)
          }
        }

        function save(block) {
          var path = 'assets/' + block.filename
          documents.set(path, block.source)
        }

        undefine()
        compiled.each.server(redefineServer)
        compiled.each.source(save)
        compiled.each.block(redefineIfLib)
      }

      return function(name, compiled) {
        load(name, compiled)
        rememberDependencies(name, compiled)
        reloadDependents(name, compiled)
      }
    })
