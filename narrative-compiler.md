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

The future
----------

This is a function called lib:

    argumentsFor = function(f) {
      return f.toString().replace(/.*\(|\).*/ig,"").split(',');
    }

    libs = {}

    lib = function(name, func) {
      libs[name] = func
    }




This compiler takes some text, breaks it into blocks. For each of those blocks, it grabs the necessary dependencies and passes them on.

There's a server somewhere. That's a given. You have to keep reminding the compiler about the server:

  lib('compiler', function(document, callback) {
    data.write(key, content)
  });

You can just run it over and over, whenever the document changes.


I think eventually these narratives aren't files, they're functions. And we want it to be a function that can just run over and over forever and that will generally be OK and safe and everything.

    function(content) {

    }

Here's what a server might look like as a function: (See [node-server](node-server.md))

    function(server) {
      server.get('/', function(xxxx, response) {
        response.render('hello, world!');
      });
    }


Then we just eval that code!