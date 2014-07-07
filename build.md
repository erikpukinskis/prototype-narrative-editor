Build
-----

Reads a narrative and does what it's told.

> *Todo: Not sure if the recompile step is really working/idempotent*

    library.give('build', function(folder, compile) {
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

      addRequires = function(narratives, name) {
        var names = _(narratives).pluck('name')

        var requires = "require('./library')\n"
        names.forEach(function(name) {
          requires += "require('./" + name + "')\n"
        })

        var source = folder.read('../narrative-build/' + name + '.js')
        source = requires + "\n" + source
        source += "\nlibrary.take('" + name + "')"
        folder.write(name + '.js', source)
        indent('Added requries for ' + names + '.')
      }

      saveFile = function(block) {
        folder.write(block.filename, block.source)
      }

      return build = function(name) {
        indent('Building ' + name)
        indent.in()
        var blocks = compile(name)
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

        // TODO: Why do we do this again? When you figure it out, rename
        // these methods so they are self explanatory.
        // recompile(library.list())
        var narratives = library.dependenciesFor(name)
        saveNarratives(narratives)
        addRequires(narratives, name)
        folder.copy('library.js', '../narrative-build')
        folder.copy('annotate.js', '../narrative-build')
        folder.copy('indent.js', '../narrative-build')
        folder.copy(name+'.md', '../narrative-build')
        console.log("Look in ../narrative-build/ for your stuff!");
      }  
    })