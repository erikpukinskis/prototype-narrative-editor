// requirejs has an api that is compatible with client-side. we want to use it 
// instead of just using exports. then we can try to load libraries client-side.
// then we can split out the editor into its own narrative.

// then we write data
// then we port compile to data
// then we have the app use what compile writes to data
// then live reload

// and then we're self hosting

// maybe after 1.0:
// interleaved comments and code
// indentation/colors?

define(['annotate', 'indent', 'underscore'], function(annotate, indent, underscore) { 
  var _ = underscore
  var count = 0

  // grabs the first little bit of a function:
  var summarize = function(stuff) {
    if (typeof stuff == 'string') { 
      return stuff.
        toString()
        .replace(/(?:\r\n|\r|\n)/g, '')
        .replace(/ +/, ' ')
        .substr(0,50)
    } else {
      var stuff = new String(stuff).toString()
      return summarize(stuff)
    }
  }

  function Library() { 
    this.funcs = {}; 
    return this; 
  }

  // grabs a name and a function and stores them away for later use
  Library.prototype.give = function(name, func) {
    count++
    if (count > 10 ) { throw new Error('Gave too much!') }
    var narrative = {
      hash: Math.random().toString(35).substr(2,3),
      // dependencies: annotate(func),
      name: name,
      func: func,
      source: func.toString(),
      selfLoadingSource: 'library.give("' + name + '", ' + func.toString() + ')'
    }
    this.funcs[name] = narrative;
    // this.require(narrative.dependencies)
    indent("Gave " + name + " (" + narrative.hash.substr(0,40) + ")\t\"" + summarize(narrative.func) + "...\"\t\tto the library (#" + _(this.funcs).size() + ") ");
  };

  // looks for a narrative for any dependencies that haven't been given yet,
  // compiles it, and runs it (which pulls in any sub-dependencies).
  Library.prototype.require = function(dependencies, callback) {
    if (dependencies.length < 1) { return }
    var _lib = this
    console.log('requiring', dependencies)
    dependencies.forEach(function(dep) {
      _lib.ensure(dep, function() {
        var loaded = _(_lib.funcs).keys()
        var finished = _(dependencies).without(loaded).length == 0
        if (finished) { callback() }
      })
    })
  }

// This needs to be async. Although at some point it has to end, right?
  Library.prototype.ensure = function(name, callback) {
    var _this = this
    console.log('ensuring ' + name)
    var narrative = this.funcs[name]

    if (narrative) { return callback(narrative) }

    give = function(narrative) {      
      console.log('got back narrative: ' + JSON.stringify(narrative, undefined, 2))
      _this.give(name, narrative)
      callback(_this.funcs[name])
    }

    console.log('requiring ' + name)
    requirejs([name], function(narrative) {
      console.log('got ' + narrative)
      give(narrative)
      callback()
    })
  }

  // pulls something out of the library
  Library.prototype.take = function(name, callback) {
    console.log('taking ' + name)
    var _this = this
    count++
    if (count > 10 ) { return callback('took too much!') }

    this.ensure(name, function(narrative) {
      callback(narrative)
      // _(narrative.dependencies).each(function(dep) { 
      //   _this.take(dep, function(narrative) {
      //     args[dep]
      //     if (args.length == narrative.dependencies.length) {
      //       var values = _(args).values()
      //       var result = narrative.func.apply({}, values)
      //       indent("Took " + name + " (" + narrative.hash + ") out of the library, passed it " + JSON.stringify(args) + ", got back " + summarize(result))
      //       callback(result)
      //     }
      //   })
      // })
    })
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

  Library.prototype.list = function() {
    return _(this.funcs).map(function(n) { return n.name })
  }

  return new Library();      

})