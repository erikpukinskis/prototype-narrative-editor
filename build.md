Build
-----

Reads a narrative and writes files to deploy to heroku. In `build.js`:

    define(['folder', 'compile', 'underscore', 'indent', 'getdependencies'], function(folder, compile, underscore, indent, getDependencies) {
      var _ = underscore

      saveFiles = function(name, destination, callback) {

        // indent('Compiling ' + name)
        source = folder.read('./' + name + '.md')

        if (!source) {
          indent("reading "+name+" ... got source:"+source)
        }

        compile(source, function(compiled) {
          indent('-> compiled: '+ compiled)
          compiled.each.source(function(block) {
            folder.write(destination + '/' + block.filename, block.source)
          })
          callback(compiled)
        })
      }

      build = function(name, callback) {
        indent('Building ' + name)
        indent.in()

        var buildPath = 'build/' + name
        var source = folder.read(name + '.md')

        getDependencies(source, function(deps) {
          // What's going on? This never returns.
          deps.push(name)
          indent("DONE! deps are " + deps)

          var done = []
          _(deps).each(function(narrative) {

            function tryToFinish() {
              done.push(narrative)
              if (done.length == deps.length) {
                indent("  -;-;-;-;-;-;-   Done with " + narrative)
                callback()
              }
            }

            if (narrative == 'center') { 
              console.log('skipping center')
              return tryToFinish()
            }

            indent.in()
            saveFiles(narrative, 'build/' + name, tryToFinish)
            indent.out()
          })
        })

        folder.copy(name + '.md', buildPath)
        indent.out()
      }

      // This should be its own module
      build.getDependencies = getDependencies
      return build
    })
