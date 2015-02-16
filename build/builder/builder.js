requirejs = require('requirejs')

requirejs(['build', 'compile', 'folder', 'indent', 'documents', 'database', 'chain', 'getdependencies'], function(build) {
  var name = process.argv[2]
  console.log('\n|||| |  |   |    |     |      |       |        |         |         '+name+'\n')
  build(name, function() {
    console.log('ya we DID it!')
    process.exit()
  })
}, function(error) { throw(error) })
