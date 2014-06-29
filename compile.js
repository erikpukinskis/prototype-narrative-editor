var indent = require('./indent')
var library = require('./library')
var fs = require('fs')
var _ = require('underscore')


    // FOLDER

    library.give('folder', function() {
      return {
        write: function(filename, content) {
          var path = '../narrative-build/'
          if (!fs.existsSync(path)) {
            fs.mkdirSync(path)
          }
          fs.writeFileSync(path + filename, content)
        },
        read: function(filename) {
          if (fs.existsSync(filename)) {
            return fs.readFileSync(filename).toString()
          }
        },
        copy: function(filename, destination) {
          path = destination + '/' + filename
          console.log('copying ' + filename + ' to ' + destination)
          fs.createReadStream(filename).pipe(fs.createWriteStream(path))
        }
      }    
    })



    // COMPILE takes a narrative and evaluates the unassigned blocks

    library.give('compile', function(folder) {

      startsWith = function(string, pattern) {
        pattern = new RegExp("^" + pattern);
        return !!string.match(pattern);
      }

      getBlocks = chunkLines = function(content) {
        var block = {lines: []};
        var blocks = [];
        var kind;

        for (i in lines = content.split("\n")) {
          var line = lines[i];

          if (startsWith(line, '    ')) { 
            kind = 'code';
          } else if (line.match(/$\s?^/)) {
            // keep kind as whatever it was
          } else {
            kind = 'comment';
          }

          if (block.kind != kind) {
            if (block.writing) {
              blocks.push(block);
            }

            block = {lines: []};
            block.writing = true;
            block.kind = kind;
          }

          block.lines.push(line);
        }

        if(block.writing) {
          blocks.push(block);
        }

        return blocks;
      }

      analyze = function(blocks) {
        var filenameLastSeen = null

        blocks.forEach(function(block) {
          var inAComment = block.kind == 'comment'
          var inCode = !inAComment
          var matches = block.lines.join('').match(/`([^`]+)`/)
          var hasBackticks = !!matches

          if (inCode) {
            block.source = block.lines.join(" \n").replace(/(^|\n)    /g, "$1")
          }
          if (inAComment && hasBackticks) {
            filenameLastSeen = matches[1]
          } else if (inCode && !filenameLastSeen) {
            block.unassigned = true
          } else if (inCode && filenameLastSeen) {
            block.filename = filenameLastSeen
            filenameLastSeen = null
          }
        })
      }

      compile = function(name) {
        if (source = folder.read(name + '.js')) {
          console.log('found ' + name + '.js!')
        }
        source = folder.read(name + '.md')
        blocks = getBlocks(source)
        analyze(blocks)
        return blocks
      }

      compile.andRun = function(name) {
        indent('Compiling ' + name)
        indent.in()
        blocks = compile(name)
        indent.out()

        blocks.forEach(function(block) {
          if (block.unassigned) {
            indent('Running unassigned block """' + block.lines[0].trim() + '"""')
            indent.in()
            new Function(block.source).apply(this)
            indent.out()
            indent('Ran it.')
          } else if (block.kind == 'comment') {
            indent('Enjoying comment block: "' + block.lines[0].substr(0,50).trim() + '..."')
          } else {
            indent('Skipping code block """' + block.lines[0].trim() + '""", which was saved to ' + block.filename)
          }
        })
        return blocks
      }

      return compile
    })








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
