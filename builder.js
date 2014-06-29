var indent = require('./indent')
var library = require('./library')
var _ = require('underscore')
require('./folder')
require('./compile')
require('./build')

// Go!

library.take('build')(process.argv[2])
