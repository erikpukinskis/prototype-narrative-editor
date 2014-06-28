//
// The overall plan for this process is to:
//
// compile md into:
//   blocks
// 
// save fileblocks
// eval code blocks
//   library.give also compiles the dependencies if needed
// write all of the files from the library
// add them all to the top of the main one as
//
// library.give:
//   look at arguments, eval the md for any deps that don't already exist






var fs = require('fs')
var _ = require('underscore')
var exec = require('child_process').exec




    // INDENT helps print out nested stuff so I can understand it
    indent = function(string) {
      indentation = new Array(indent.depth)
      console.log(indentation.join("    ") + string);
    }
    indent.depth = 1
    indent.in = function() {
      this.depth++
    }
    indent.out = function() {
      this.depth--
    }
    // indent("hello!")
    // indent.in()
    // indent("and now?")
    // indent.in()
    // indent("one")
    // indent("two")
    // indent("three")
    // indent.out()
    // indent("and what of a long paragraph?");
    // indent.out()
    // indent("ok")
    // indent.out()
    // indent("spoooky")






    // ANNOTATE

    var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
    var FN_ARG_SPLIT = /,/;
    var FN_ARG = /^\s*(_?)(\S+?)\1\s*$/;
    var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
    function anonFn(fn) {
      // For anonymous functions, showing at the very least the function signature can help in
      // debugging.
      var fnText = fn.toString().replace(STRIP_COMMENTS, ''),
          args = fnText.match(FN_ARGS);
      if (args) {
        return 'function(' + (args[1] || '').replace(/[\s\r\n]+/, ' ') + ')';
      }
      return 'fn';
    }
    function annotate(fn, strictDi, name) {
      var $inject,
          fnText,
          argDecl,
          last;
      if (typeof fn == 'function') {
        if (!($inject = fn.$inject)) {
          $inject = [];
          if (fn.length) {
            if (strictDi) {
              if (!isString(name) || !name) {
                name = fn.name || anonFn(fn);
              }
              throw new Error('{0} is not using explicit annotation and cannot be invoked in strict mode');
            }
            fnText = fn.toString().replace(STRIP_COMMENTS, '');
            argDecl = fnText.match(FN_ARGS);
            argDecl[1].split(FN_ARG_SPLIT).forEach(function(arg){
              arg.replace(FN_ARG, function(all, underscore, name){
                $inject.push(name);
              });
            });
          }
          fn.$inject = $inject;
        }
      } else if (isArray(fn)) {
        last = fn.length - 1;
        assertArgFn(fn[last], 'fn');
        $inject = fn.slice(0, last);
      } else {
        assertArgFn(fn, 'fn', true);
      }
      return $inject;
    }











    // LIBRARY

    library = function() {
      count = 0
      // A helper for grabbing the first little bit of a function:
      summarize = function(stuff) {
        if (typeof stuff == 'string') { 
          return '  [' + stuff.
            toString()
            .replace(/(?:\r\n|\r|\n)/g, '')
            .replace(/ +/, ' ')
            .substr(0,50) + ']  '
        } else {
          stuff = new String(stuff).toString()
          return summarize(stuff)
        }
      }
      function Library() { 
        this.funcs = {}; 
        return this; 
      }
      // `give` grabs a name and a function and stores them away for later use
      Library.prototype.give = function(name, func) {
        func.hash = Math.random().toString(35).substr(2,30)
        func.dependencies = annotate(func)
        this.require(func.dependencies)
        func.name = name
        this.funcs[name] = func;
        indent("Gave " + name + " (" + func.hash.substr(0,40) + ")<<" + summarize(func) + ">> to the library (which now has " + _(this.funcs).size() + " funcs) ");
      };
      Library.prototype.require = function(dependencies) {
        var _lib = this
        compile = _lib.take('compile')
        if (!compile) { return }

        dependencies.forEach(function(dep) {
          if (!_lib.funcs[dep]) {
            compile.andRun(dep)
          }
        })
      }
      // `take` pulls something out of the library
      Library.prototype.take = function(name) {
        var _this = this;
        count++
        if (count > 10 ) { return }
        var func = this.funcs[name];
        if (!func) {
          indent("Nothing in the library called " + name);
          return
        }
        var dependencies = annotate(func);
        indent("Taking " + name + " (" + func.hash + ") out of the library. It needs " + (dependencies.length ? '['+dependencies.join(", ")+']' : 'nothing' ) + ". Running func...")
        var args = {}
        _(dependencies).each(function(dep) { 
          indent.in()
          args[dep] = _this.take(dep);
          indent.out()
        });
        var values = _(args).values();
        indent.in()
        var result = func.apply({}, values);
        indent.out()
        indent("....ran it! got back " + summarize(result))
        indent("Took " + name + " (" + func.hash + ") out of the library and passed it " + JSON.stringify(args) + " and it looks like this: " + summarize(result));
        return result;
      }
      Library.prototype.narrativesInLoadOrder = function() {
        var _lib = this
        _(this.funcs).each(function(f) { f.depth = 0 })
        _(this.funcs).each(function(func) {
          func.dependencies.forEach(function(dep) {
            if (_lib.funcs[dep].depth <= func.depth) {
              _lib.funcs[dep].depth = func.depth + 1
            }
          })
        })
        return _(this.funcs).sortBy(function(f) { return -f.depth })
      }

      return new Library();      
    }();







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
          return fs.readFileSync(filename).toString()
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
          var matches = block.lines.join().match(/`([^`]+)`/)
          var hasBackticks = !!matches

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
          indent('Running block "' + block.lines[0] + '"')
          if (block.unassigned) {
            indent.in()
            eval(block.source)
            indent.out()
          }
        })
        return blocks
      }

      return compile
    })








    // BUILD reads a narrative and does what it's told

    library.give('build', function(folder, compile) {
      saveNarratives = function(narratives) { 
        narratives.forEach(function(narrative) {
          source = narrative.selfLoadingSource
          filename = narrative.name + '.js'
          indent('Saving ' + filename)
          folder.write(filename, source)
        })
      }

      addRequires = function(narratives, name) {
        requires = "require('./library')\n"
        requires += narratives.map(function(narrative) {
          return "require('" + narrative.name + "')"
        }).join('\n')

        source = folder.read(name + '.js')
        source = requires + source
        folder.write(name + '.js', source)
      }

      saveFile = function(block) {
        source = block.lines.join().replace(/(^|\n)    /g, "$1")
        folder.write(block.filename, source)
      }

      return build = function(name) {
        indent('building ' + name)
        indent.in()
        blocks = compile.andRun(name)
        indent.out()

        blocks.forEach(function(block) {
          if ((block.kind == 'code') && block.filename) {
            indent.in()
            saveFile(block)
            indent.out()
          }
        })

        narratives = library.narrativesInLoadOrder()
        saveNarratives(narratives)
        addRequires(narratives, name)

        console.log("Look in ../narrative-build/ for your stuff!");
      }  
    })






// Go!

library.take('build')(process.argv[2])
