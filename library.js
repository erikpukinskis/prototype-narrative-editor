annotate = require('./annotate')
indent = require('./indent')
_ = require('underscore')

// 

library = function() {
  count = 0

  // grabs the first little bit of a function:
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

  // grabs a name and a function and stores them away for later use
  Library.prototype.give = function(name, func) {
    indent('Giving ' + name + ' to the library...')
    narrative = {
      hash: Math.random().toString(35).substr(2,30),
      dependencies: annotate(func),
      name: name,
      func: func,
      source: func.toString(),
      selfLoadingSource: 'library.give("' + name + '", ' + func.toString() + ')'
    }
    this.funcs[name] = narrative;
    indent.in()
    this.require(narrative.dependencies)
    indent.out()
    indent("Gave " + name + " (" + narrative.hash.substr(0,40) + ")<<" + summarize(narrative.func) + ">> to the library (which now has " + _(this.funcs).size() + " funcs) ");
  };

  // looks for a narrative for any dependencies that haven't been given yet,
  // compiles it, and runs it (which pulls in any sub-dependencies).
  Library.prototype.require = function(dependencies) {
    if (dependencies.length < 1) { return }
    var _lib = this
    indent('Requiring ' + dependencies + ' to be in the library.')

    dependencies.forEach(function(dep) {
      if (!_lib.funcs[dep]) {
        indent('Compiling ' + dep)
        indent.in()
        // TODO: check for a .js file and use it if it's already compiled.
        // ... although maybe the narrative compilation should be elsewhere.
        _lib.take('compile').andRun(dep)
        indent.out()
      } else {
        indent('found ' + dep)
      }
    })
  }

  // pulls something out of the library
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

  // returns an array of all of the narratives, except the named on, such that
  // if you load them in order the dependencies will all work.
  Library.prototype.dependenciesFor = function(name) {
    var _lib = this
    _(this.funcs).each(function(f) { f.depth = 0 })
    _(this.funcs).each(function(func) {
      func.dependencies.forEach(function(dep) {
        if (_lib.funcs[dep].depth <= func.depth) {
          _lib.funcs[dep].depth = func.depth + 1
        }
      })
    })
    return _(this.funcs)
      .chain()
      .reject(function(narrative) { return narrative.name == name })
      .sortBy(function(f) { return -f.depth })
      .value()
  }

  return new Library();      
}();

module.exports = library