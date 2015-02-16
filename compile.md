Compiler
--------

Reads a narrative, breaks it into blocks, and figures out what kinds of blocks they are. In `compile.js`:
`library compile.js
    define(['documents', 'underscore'], function(documents, _) {
      var prefixes = {
        heading: '# ',
        prose:   '',
        command: '`',
        code:    '    '
      }

      function stringToLine(string) {
        var kindOfLine = 'prose'

        for (kind in prefixes) {
          if (kind == 'prose') { continue }
          var prefix = new RegExp('^' + prefixes[kind])
          if (string.match(prefix)) {
            string = string.replace(prefix,'')
            kindOfLine = kind
            break
          }
        }

        return {
          string: string,
          kind: kindOfLine
        }
      }


      function isCode(block) { return block.kind == 'code' }
      function hasFilename(block) { return !!block.filename }
      function isSource(block) { 
        return isCode(block) && hasFilename(block) 
      }
      function isServer(block) { return block.command == 'server' }
      function isStylesheet(block) { return endsWith(block.filename, '.css') }
      function isLibrary(block) { return block.command == 'library' }
      function isCommand(block) { return block.kind == 'command' }

      startsWith = function(string, pattern) {
        return !!(string||'').match(new RegExp('^' + pattern))
      }

      endsWith = function(string, pattern) {
        return !!(string||'').match(new RegExp(pattern + '$'))
      }

      isEmpty = function(string) {
        return string.match(/$\s?^/)        
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
          command: eachBlock(isCommand),
          server: eachBlock(isServer),
          stylesheet: eachBlock(isStylesheet),
          library: eachBlock(isLibrary),
          block: eachBlock(function() { return true })
        }
        
      }

      getBlocks = function(content) {
        var block = {lines: []};
        var blocks = [];
        var kind;

        for (i in lines = content.split("\n")) {
          var line = lines[i];

          if (isEmpty(line)) {
            // keep kind as whatever it was
          } else {
            kind = stringToLine(line).kind
            line = stringToLine(line).string
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
        var commandLastSeen = null

        blocks.forEach(function(block) {
          // TODO: This needs to also identify center blocks now.
          var inAComment = block.kind == 'comment'
          var inCode = block.kind == 'code'
          var matches = block.lines.join('').match(/`([^`]+)`/)
          var hasBackticks = !!matches

          if (block.kind == 'command') {
            commandLastSeen = block.lines[0]
          } else if (inCode) {
            block.source = block.lines.join("\n").replace(/( *^| *\n)    /g, "$1")
          }
          if (inAComment && hasBackticks) {
            filenameLastSeen = matches[1]
          } else if (inCode && filenameLastSeen) {
            var parts = filenameLastSeen.split(' ')
            block.filename = parts[parts.length-1]
            if (parts[1]) {
              block.command = parts[0]
            }
            filenameLastSeen = null
          } else if (inCode && commandLastSeen) {
            block.command = commandLastSeen
            var parts = commandLastSeen.split(' ')
            var shouldBecomeCode = _(['file', 'server', 'library']).contains(parts[0])
            if (shouldBecomeCode) { 
              block.kind = 'code'
              block.filename = parts[1]
            }
            commandLastSeen = null
          } else {
            block.unassigned = true
          }
        })
      }

      function summarize(source) {
        return source.substr(0,50).split('\n').join(' ')
      }

      function compile(source, callback) {
        var blocks = getBlocks(source)
        indent('   ---  Compiled ' + summarize(source) + '... to ' + blocks.length + ' blocks')
        extractFilenamesAndSource(blocks)
        console.log('         ', blocks.map(function(block) { 
          var short = block.kind.substring(0,4) || ''
          if (block.command) { short = short + ':' + block.command }
          return short
        }).join('|'))
        callback(new Compiled(blocks)) 
      }

      compile.summarize = summarize
      compile.prefixes = prefixes
      compile.stringToLine = stringToLine

      return compile
    })
