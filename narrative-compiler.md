Narrative Compiler
------------------

Level: 2

In order for that to happen, we need something that understands this Markdown file you are reading, with all it's file names and blocks of code, and can spit out actual files. Here's some javascript that does the trick. It's in a file called `compile-narrative.js`.

It's a bit of a doozie. Don't worry about understanding it all just yet:

    startsWith = function(string, pattern) {
      pattern = new RegExp("^" + pattern);
      return !!string.match(pattern);
    }

    chunkLines = function(content) {
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

      blocks.eachBlock = eachBlock;

      return blocks;
    }

    eachBlock = function(callback) {
      var memo = {}
      for(i=0; i<this.length; i++) {
        block = this[i];
        block.lines.join("\n"), block.kind, memo);

        var inAComment = kind == 'comment'
        var foundCodeSnippets = block.match(/`([^`]+)`/)
        if (inAComment && foundCodeSnippets) {
          memo.filename = foundCodeSnippets[1]
        }

        if ((kind == 'code') && memo.filename) {
          block = block.replace(/(^|\n)    /g, "$1");
          callback(memo.filename, block);        
          memo.filename = null;
        }

      }
    }

    lib('compiler', function(document, data) {
      chunkLines(content).eachBlock(function(filename, content){
        data.write(filename, content)
      });
    });


There's a lot going on there, but the gist of it is that we take the [README.md](README.md) file, split it up into chunks, find all of these files we've described, and save them into a folder called "narrative-build".

