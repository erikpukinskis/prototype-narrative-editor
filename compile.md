Compiler
--------

Reads a narrative, breaks it into blocks, and figures out what kinds of blocks they are. In `compile.js`:

    define(['folder'], function(folder) {
      startsWith = function(string, pattern) {
        var pattern = new RegExp("^" + pattern);
        return !!string.match(pattern);
      }

      Compiled = function(blocks, run, test) {
        this.blocks = blocks

        eachBlock = function(filter) {
          return function(callback) {
            _(blocks).filter(filter).eachBlock(callback)
          }
        }

        this.each = {
          source: eachBlock(isSource)

          code: eachBlock(isCode)

          test: eachBlock(isTest)
        }
        
        this.test = function(callback) {
          var results = _(this.tests).map(function(test) {
            return test(instance)
          })
          return results
        }

        this.tests = _(blocks).chain().filter(isTest).map(function(block) {
          return function(instance) {
            eval(block.source)(instance)
          }
        })

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

      analyze = function(blocks) {
        var filenameLastSeen = null

        blocks.forEach(function(block) {
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

      return compile = function(name, callback) {

        var source = folder.read('./' + name + '.md')
        if (!source) { throw new Error(name + '.md not found.')}
        var blocks = getBlocks(source)
        indent('Compiled ' + name + ' to ' + blocks.length + ' blocks')
        analyze(blocks)
        blocks.

        blocks.isSource = isSource
        blocks.is
        test = function() {
          blocks.tests
        }
        callback(new Compiled(blocks, )) 
      }
    })
