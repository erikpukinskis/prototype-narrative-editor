var indent = require('./indent')
var library = require('./library')
require('./folder')
require('./compile')

var _ = require('underscore')


// BUILD reads a narrative and does what it's told

library.give('build', function(folder, compile) {
  saveNarratives = function(narratives) { 
    indent('Writing depdencies...')
    indent.in()
    narratives.forEach(function(narrative) {
      source = narrative.source
      console.log('source is ' + narrative.source)
      filename = narrative.name + '.js'
      indent(filename)
      folder.write(filename, source)
    })
    indent.out()
  }

  addRequires = function(narratives, name) {
    var names = _(narratives).pluck('name')

    requires = "require('./library')\n"
    names.forEach(function(name) {
      requires += "require('./" + name + "')\n"
    })

    source = folder.read('../narrative-build/' + name + '.js')
    source = requires + "\n" + source
    source += "\nlibrary.take('" + name + "')"
    folder.write(name + '.js', source)
    indent('Added requries for ' + names + '.')
  }

  saveFile = function(block) {
    folder.write(block.filename, block.source)
  }

  return build = function(name) {
    indent('building ' + name)
    indent.in()
    blocks = compile(name)
    indent.out()

    indent('Writing files...')
    indent.in()
    blocks.forEach(function(block) {
      if ((block.kind == 'code') && block.filename) {
        indent(block.filename)
        saveFile(block)
      }
    })
    indent.out()

    var source = folder.read('../narrative-build/' + name + '.js')
    indent('Running central narrative...')
    new Function(source).apply(this)

    narratives = library.dependenciesFor(name)
    saveNarratives(narratives)
    addRequires(narratives, name)
    folder.copy('library.js', '../narrative-build')
    folder.copy('annotate.js', '../narrative-build')
    folder.copy('indent.js', '../narrative-build')
    console.log("Look in ../narrative-build/ for your stuff!");
  }  
})

// Go!

library.take('build')(process.argv[2])
