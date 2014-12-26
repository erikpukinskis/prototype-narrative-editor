Builder
-------

Kicks off the build process. Goes in `builder.js`:

Here's what needs to happen.

We need something that looks at the narratives and figures out which other narratives we're going to need. Maybe that can just be a lib of its own. The goal here is to be able to do 'build narrative' and all of the right shit goes into the folder.

    requirejs = require('requirejs')
    requirejs(['build', 'compile', 'folder', 'indent', 'documents', 'database', 'chain', 'getdependencies'], function(build) {
      var name = process.argv[2]
      console.log('\n|||| |  |   |    |     |      |       |        |         |         '+name+'\n')
      build(name, function() {
        console.log('ya we DID it!')
        process.exit()
      })
    }, function(error) { throw(error) })

Needs some packages. `package.json`:

    {
      "name": "narrative-builder",
      "version": "0.0.2",
      "dependencies": {
        "requirejs": "*",
        "underscore": "*",
        "pg": "*",
        "knex": "*",
        "pg-escape": "*",
        "chai": "*"
      },
      "engines": {
        "node": "*"
      }
    }

To use it do

    npm install
    node builder.js path/to/your/narrative
