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
        indent('Giving ' + name + ' to the library...')
        narrative = {
          hash: Math.random().toString(35).substr(2,30),
          dependencies: annotate(func),
          name: name,
          func: func
        }
        this.funcs[name] = narrative;
        indent.in()
        this.require(narrative.dependencies)
        indent.out()
        indent("Gave " + name + " (" + narrative.hash.substr(0,40) + ")<<" + summarize(narrative.func) + ">> to the library (which now has " + _(this.funcs).size() + " funcs) ");
      };
      Library.prototype.require = function(dependencies) {
        if (dependencies.length < 1) { return }
        var _lib = this
        indent('Requiring ' + dependencies + ' to be in the library.')

        dependencies.forEach(function(dep) {
          if (!_lib.funcs[dep]) {
            indent('Compiling ' + dep)
            indent.in()
            _lib.take('compile').andRun(dep)
            indent.out()
          } else {
            indent('found ' + dep)
          }
        })
      }
      // `take` pulls something out of the library
      Library.prototype.take = function(name) {
        var _this = this;
        count++
        if (count > 10 ) { return }
        var narrative = this.funcs[name];
        if (!narrative) {
          indent("Nothing in the library called " + name);
          return
        }
        indent("Taking " + name + " (" + narrative.hash + ") out of the library. It needs " + (narrative.dependencies.length ? '['+narrative.dependencies.join(", ")+']' : 'nothing' ) + '.')
        var args = {}
        _(narrative.dependencies).each(function(dep) { 
          indent.in()
          args[dep] = _this.take(dep);
          indent.out()
        });
        var values = _(args).values();
        indent('Running the func for ' + name + '....')
        indent.in()
        var result = narrative.func.apply({}, values);
        indent.out()
        indent("....ran it! got back " + summarize(result))
        indent("Took " + name + " (" + narrative.hash + ") out of the library and passed it " + JSON.stringify(args) + " and it looks like this: " + summarize(result));
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
          var matches = block.lines.join('').match(/`([^`]+)`/)
          var hasBackticks = !!matches

          if (inCode) {
            block.source = block.lines.join("\n").replace(/(^|\n)    /g, "$1")
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
            indent('Running unassigned block """' + block.lines + '"""')
            indent.in()
            new Function(block.source).apply(this)
            indent.out()
            indent('Ran it.')
          } else if (block.kind == 'comment') {
            indent('Enjoying comment block: "' + block.lines[0] + '..."')
          } else {
            indent('Skipping code block ' + block.lines[0] + ', which was saved to ' + block.filename)
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
          source = narrative.selfLoadingSource
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
          requires += "require('" + name + "')\n"
        })

        source = folder.read('../narrative-build/' + name + '.js')
        source = requires + source
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

        narratives = library.narrativesInLoadOrder()
        saveNarratives(narratives)
        addRequires(narratives, name)

        console.log("Look in ../narrative-build/ for your stuff!");
      }  
    })






// Go!

library.take('build')(process.argv[2])
