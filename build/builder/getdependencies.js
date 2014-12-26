define(['compile', 'underscore', 'indent'], function(compile, _, indent) {
  return function (compiled, callback) {
    var dependencies = []

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
    indent('Found ' + dependencies.length + '  dependencies')
    callback(dependencies)
  }
})