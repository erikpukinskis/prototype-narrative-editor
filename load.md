Load
----

`load.js`:


    define(['documents', 'getdependencies'], function(documents, getDependencies) {
      var servers = {}
      var narrativesThatDependOn = {}

      function load(name, compiled, callback) {
        getDependencies(compiled, function(dependencies) {
          dependencies.forEach(function(dep) {
            if (!narrativesThatDependOn[dep]) { narrativesThatDependOn[dep] = []}
            narrativesThatDependOn[dep].push(name)
            console.log(JSON.stringify({deps: narrativesThatDependOn}, null, 2))
          })
        })

        console.log("Since", name, "changed, we should reload", narrativesThatDependOn[name])

        function undefine() {
          requirejs.undef(name)
          if (!servers[name]) { servers[name] = [] }
          while(server = servers[name].pop()) {
            server.stop()
          }
        }

        function redefine(block) {
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

        function save(block) {
          var path = 'assets/' + block.filename
          documents.set(path, block.source)
        }

        undefine()
        compiled.each.server(redefine)
        compiled.each.source(save)

        callback()

      }

      return load
    })
