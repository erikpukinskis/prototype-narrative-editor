Build
-----

Reads a narrative and writes files to deploy to heroku. In `build.js`:

    define('getdependencies', ['compile', 'underscore', 'indent'], function(compile, _, indent) {
      return function (name, callback) {
        var dependencies = []

        // We should refactor this so it's just a dependencies function
        // that returns the dependencies and we just keep unioning them
        // in out compile function down there. I.e
        // 
        // compile(name, function(compiled) {
        //   var dependencies = []
        //   compiled.each.code(function(block) { 
        //     var moreDeps = searchBlock(block)
        //     dependencies = _(dependencies).union(moreDeps)
        //   })
        //   return dependencies
        // })

        function searchBlock(block) {
          var pattern = /(define|require(js)?) *\( *\[.*/g
          var match = block.source.match(pattern)
          _(match).each(searchLine)
        }

        function searchLine(line) {
          function unquote(quoted) { return quoted.replace(/'/g, "") }

          var commaSeparated = line.match(/\[(.*)\]/)[1]
          var deps = commaSeparated.split(', ').map(unquote)

          indent('Found some dependencies! ' + deps)

          _(deps).each(addDep)
        }

        function addDep(dep) {
          if (!_(dependencies).contains(dep)) {
            dependencies.push(dep)
          }
        }

        indent('Getting dependencies for ' + name + '. About to compile:')
        indent.in()
        compile(name, function(compiled) {
          indent.out()
          compiled.each.code(searchBlock)
          console.log("we're probably ending up here, right?")
          indent('### calling back with ' + dependencies.length + '  dependencies')
          callback(dependencies)
        })
        indent("done with getDeps block, hopefully ###'ing later")
      }
    })



    define(['folder', 'compile', 'underscore', 'indent', 'getdependencies'], function(folder, compile, underscore, indent, getDependencies) {
      var _ = underscore

      saveFiles = function(name, destination, callback) {
        compile(name, function(compiled) {
          // indent('-> compiled: '+ compiled)
          compiled.each.source(function(block) {
            folder.write(destination + '/' + block.filename, block.source)
          })
          callback(compiled)
        })
      }

      build = function(name, callback) {
        indent('Building ' + name)
        indent.in()
        buildPath = 'build/' + name

        getDependencies(name, function(deps) {
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
