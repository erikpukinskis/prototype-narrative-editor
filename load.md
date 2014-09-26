Load
----

`load.js`:

    define(['documents'], function(documents) {
      var servers = {}

      function load(name, compiled, callback) {

        function undefine() {
          requirejs.undef(name)
          if (!servers[name]) { servers[name] = [] }
          while(server = servers[name].pop()) {
            server.stop(function() {
              console.log('back from stopping!')
            })
          }
        }

        function redefine(block) {
          try {
            eval(block.source)
            requirejs([name], function(server) {
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
