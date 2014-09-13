Get Dependencies
----------------

`getdependencies.js`:

    define(['compile', 'underscore', 'indent'], function(compile, _, indent) {
      return function (source, callback) {
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

        indent('Getting dependencies for ' + compile.summarize(source) + '. About to compile:')
        indent.in()
        compile(source, function(compiled) {
          indent.out()
          compiled.each.code(searchBlock)
          console.log("we're probably ending up here, right?")
          indent('### calling back with ' + dependencies.length + '  dependencies')
          callback(dependencies)
        })
        indent("done with getDeps block, hopefully ###'ing later")
      }
    })