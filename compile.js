
require('./folder')


// COMPILE pulls code blocks out of a narrative and runs the unassigned ones

library.give('compile', function(folder) {

  startsWith = function(string, pattern) {
    var pattern = new RegExp("^" + pattern);
    return !!string.match(pattern);
  }

  getBlocks = function(content) {
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
    var source = folder.read(name + '.md')
    if (!source) { throw new Error(name + '.md not found.')}
    indent('Compiling ' + name)
    var blocks = getBlocks(source)
    analyze(blocks)
    return blocks
  }

  compile.andRun = function(name) {
    var blocks = compile(name)

    blocks.forEach(function(block) {
      if (block.unassigned) {
        eval(block.source)
      }
    })

    return blocks
  }

  return compile
})
