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
      console.log(new Array(indent.depth).join("  ") + string);
    }
    indent.depth = 1
    indent.in = function() {
      this.depth++
      indent(this.depth + '->')
    }
    indent.out = function() {
      this.depth--
      indent('<-' + this.depth)
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












    // FOLDER

    folder = {
      write: function(filename, content) {
        fs.mkdirSync('../narrative-build')
        fs.writeFileSync('../narrative-build/' + filename, content)
      },
      read: function(filename) {
        return fs.readFileSync(filename).toString()
      }
    }    










    // LIBRARY

    library = function() {
      count = 0
      // A helper for grabbing the first little bit of a function:
      summarize = function(stuff) {
        if (!(typeof stuff == 'string')) { return new String(stuff).toString() }
        return func.toString().replace(/(?:\r\n|\r|\n)/g, '').replace(/ +/, ' ').substr(0,50);
      }
      function Library() { 
        this.funcs = {}; 
        return this; 
      }
      // `give` grabs a name and a function and stores them away for later use
      Library.prototype.give = function(name, func) {
        func.hash = Math.random().toString(35).substr(2,30)
        func.dependencies = annotate(func)
        this.require(dependencies)
        this.funcs[name] = func;
        indent("Gave " + name + " (" + func.hash.substr(0,40) + ")<<" + summarize(func) + ">> to the library (which now has " + _(this.funcs).size() + " funcs) ");
      };
      Library.prototype.require = function(dependencies) {
        compile = this.take('compile')
        if (!compile) { return }

        dependencies.forEach(function(dep) {
          if (!this.funcs[dep]) {
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
        indent("....ran it! got back " + result);
        indent("Took " + name + " (" + func.hash + ") out of the library and passed it " + JSON.stringify(args) + " and it looks like this: " + summarize(result));
        return result;
      }

      Library.prototype.dependencyChainFor = function(dependencies) {
        return ['express', 'folder']
      }

      return new Library();      
    }();











    // COMPILE takes a narrative and evaluates the unassigned blocks

    library.give('compile', function(xfolder) {

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
          var hasBackticks = !!match

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
        blocks = compile(name)
        blocks.forEach(function(block)) {
          if (block.unassigned) {
            eval(block.source)
          }
        }
        return blocks
      }

      return compile
    })








    // BUILD reads a narrative and does what it's told

    library.give('build', function(xcompile) {
      saveNarratives = function(narratives) { 
        narratives.forEach(function(narrative) {
          source = narrative.selfLoadingSource
          filename = narrative.name + '.js'
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

      return function(name) {
        blocks = library.take('compile').andRun(name)

        blocks.each(block) {
          if ((block.kind == 'code') && block.filename) {
            saveFile(block)
          }
        }

        narratives = library.narrativesInLoadOrder()
        saveNarratives(narratives)
        addRequires(narratives, name)

        console.log("Look in ../narrative-build/ for your stuff!");
      }  
    })






// Go!

library.take('build')(process.argv[2]))
