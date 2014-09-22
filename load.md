Load
----

`load.js`:

    define(function() {
      function load(name, compiled, callback) {
        console.log('compiled to ' + JSON.stringify(compiled, null, 2))
        console.log('looking for servers....')
        var block = compiled.each.server(function(block) {
          console.log('compiled '+name+' and got server:'+block)
          
          requirejs.undef(name)

          try {
            eval(block.source)

            requirejs([name], function(output) {
              callback()
            }, function() {
              console.log("There was an error.")
            })

          } catch (e) {
            console.log(e)
          }

        })
      }

      return load
    })
