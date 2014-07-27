requirejs = require('requirejs')
requirejs(['build'], function(build) {
  var name = process.argv[2]
  console.log('\n|||| |  |   |    |     |      |       |        |         |         '+name+'\n')
  build(name)
})