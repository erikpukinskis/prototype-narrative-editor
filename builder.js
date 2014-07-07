var indent = require('./indent')
var library = require('./library')
var _ = require('underscore')
require('./folder')
require('./compile')

// Go!

console.log('||| requiring build.....')
library.require(['build'])
console.log('||| build required.')
build = library.take('build')
console.log('||| got build from the library')
build(process.argv[2])
console.log('||| built it!')
