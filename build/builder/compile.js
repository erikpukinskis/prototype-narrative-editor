define(['folder', 'documents', 'underscore'], function(folder, documents, _) {
  function isCode(block) { return block.kind == 'code' }
  function hasFilename(block) { return !!block.filename }
  function isSource(block) { return isCode(block) && hasFilename(block) }
  function isServer(block) { return block.filename == 'center.js' }
  function isStylesheet(block) { return endsWith(block.filename, '.css') }

  startsWith = function(string, pattern) {
    return !!(string||'').match(new RegExp('^' + pattern))
  }

  endsWith = function(string, pattern) {
    return !!(string||'').match(new RegExp(pattern + '$'))
  }

  Compiled = function(blocks, run) {
    this.blocks = blocks

    eachBlock = function(filter) {
      return function(callback) {
        var _callback = callback
        var filtered = _(blocks).chain()
          .filter(filter)
          .each(_callback)
          .value()
      }
    }

    this.each = {
      source: eachBlock(isSource),
      code: eachBlock(isCode),
      server: eachBlock(isServer),
      stylesheet: eachBlock(isStylesheet),
      block: eachBlock(function() { return true })
    }
    
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

    if (block.writing) {
      blocks.push(block);
    }

    return blocks;
  }

  extractFilenamesAndSource = function(blocks) {
    var filenameLastSeen = null

    blocks.forEach(function(block) {
      // TODO: This needs to also identify center blocks now.
      var inAComment = block.kind == 'comment'
      var inCode = !inAComment
      var matches = block.lines.join('').match(/`([^`]+)`/)
      var hasBackticks = !!matches

      if (inCode) {
        block.source = block.lines.join("\n").replace(/( *^| *\n)    /g, "$1")
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

  function summarize(source) {
    return source.substr(0,40).split('\n').join(' ')        
  }

  function compile(source, callback) {
    var blocks = getBlocks(source)
    indent('Compiled ' + summarize(source) + '... to ' + blocks.length + ' blocks')
    extractFilenamesAndSource(blocks)
    callback(new Compiled(blocks)) 
  }

  compile.summarize = summarize

  return compile
})
