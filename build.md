Build
-----

Reads a narrative and writes files to deploy to heroku. In `build.js`:

    define(['folder', 'compile', 'underscore', 'indent'], function(folder, compile, underscore, indent) {
      var _ = underscore

      function isCode(block) { return block.kind == 'code' }
      function hasFilename(block) { return !!block.filename }
      function isSource(block) { return isCode(block) && hasFilename(block) }

      function getDependencies(name, callback) {
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
          if (_(dependencies).contains(dep)) {
            indent(dep + ' is already in deps. Not adding.')
          } else {
            dependencies.push(dep)
            indent('Added ' + dep + ' to the dependencies (' + dependencies + ')')
          }
        }

        indent('Getting dependencies for ' + name + ':')
        indent.in()
        compile(name, function(compiled) {
          compiled.each.code(searchBlock)
        })
        indent.out()
        callback(dependencies)
      }

      saveFiles = function(name, destination) {
        compile(name, function(compiled) {
          compiled.each.source(function(block)) {
            folder.write(destination + '/' + block.filename, block.source)
          }
          callback(compiled)
        })
      }

      build = function(name, callback) {
        indent('Building ' + name)
        indent.in()
        buildPath = 'build/' + name

        getDependencies(name, function(deps) {
          deps.push(name)
          indent("DONE! deps are " + deps)

          _(deps).each(function(narrative) {
            indent('Saving files for ' + narrative + ':')
            indent.in()
            saveFiles(narrative, 'build/' + name)
            indent.out()
          })
        })
        indent.out()
      }

      // This should be its own module
      build.getDependencies = getDependencies
      return build
    })
