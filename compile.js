
// COMPILE pulls code blocks out of a narrative and runs the unassigned ones

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
