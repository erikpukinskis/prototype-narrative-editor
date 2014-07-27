define(['library', 'folder', 'compile', 'underscore'], function(library, folder, compile, underscore) {
  var _ = underscore
  recompile = function(names) {
    indent('Rebuilding library (' + names + ':')
    _(names).forEach(function(name) {
      compile.andRun(name)
    })
  }

  saveNarratives = function(narratives) { 
    indent('Writing depdencies...')
    indent.in()
    narratives.forEach(function(narrative) {
      var source = narrative.selfLoadingSource
      filename = narrative.name + '.js'
      indent(filename)
      folder.write(filename, source)
    })
    indent.out()
  }

  saveFile = function(block) {
    folder.write(block.filename, block.source)
  }

  return build = function(name, callback) {
    indent('Building ' + name)

    compile(name, function(blocks) {

      indent('Writing files...')
      indent.in()
      blocks.forEach(function(block) {
        if ((block.kind == 'code') && block.filename) {
          indent(block.filename)
          saveFile(block)
        }
      })
      indent.out()

      // TODO: Why do we do this again? When you figure it out, rename
      // these methods so they are self explanatory.
      // recompile(library.list())

      _(['annotate', 'indent']).each(function(name) {
        folder.copy(name+'.js', '../narrative-build')
      })
      folder.copy(name+'.md', '../narrative-build')
      console.log("Look in ../narrative-build/ for your stuff!");
      if (callback) { callback() }
    })

  }  
})