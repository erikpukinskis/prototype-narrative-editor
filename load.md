Load
----

`load.js`:

    define(['documents'], function(documents) {
      function load(name, compiled, callback) {
        function redefine(block) {
          requirejs.undef(name)

          try {
            eval(block.source)
            requirejs([name], function() {}, function() {
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

        compiled.each.server(redefine)
        compiled.each.source(save)

        callback()

      }

      return load
    })
