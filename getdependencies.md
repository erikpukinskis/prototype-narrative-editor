Get Dependencies
----------------

`getdependencies.js`:

    define(['compile', 'underscore', 'indent'], function(compile, _, indent) {
      return function (compiled, callback) {
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
          var pattern = /(define) *\(.*\[.*]/g
          var match = block.source.match(pattern)
          _(match).each(searchLine)
        }

        function searchLine(line) {
          function unquote(quoted) { return quoted.replace(/['"]/g, "") }

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

        compiled.each.code(searchBlock)
        indent('### calling back with ' + dependencies.length + '  dependencies')
        callback(dependencies)

        indent("done with getDeps block, hopefully ###'ing later")
      }
    })