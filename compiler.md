Compiler
--------

We need something that understands narratives, with all their file names and blocks of code, and can spit out actual files that can be executed! Here's some javascript that does the trick.

Note that this narrative requires that it be built with library loaded, but we don't have a way to load it here. For that, we need to build it with a compiler that already has the new features! So temporarily I'm working in [server.js](server.js) to write at least enough features that we can compile this file, at which point we'll be bootstrapped again compiler-wise.

It's a bit of a doozie. Don't worry about understanding it all just yet:

> TODO
> 
> - We need to figure out which narratives we're depending on, and compil>e narratives first. But all of their dependencies first. These all g> server.js.
> - Next to go in there are the blocks which are not preceded by a `file> paragraph.
> - Of course we still write out the files specified. (That should be it'>narrative at some point but I'm trying avoid scope creep here.)
> - Require's are auto-detected, and go into the package.json
    
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

There's a lot going on there, but the gist of it is that we take the [README.md](README.md) file, split it up into chunks, find all of these files we've described, and save them into a folder called "narrative-build".

And really that needs to get squeezed into something more like this:

    library.give('compiler', function(document, folder) {
      chunkLines(content).eachBlock(function(filename, content){
        folder.write(filename, content)
      })
    })

Which needs [folder.md](folder.md). And to actually use it we need to compile in this at the end:

    fs.readFile(process.argv[2], 'utf-8', handleReadme);
