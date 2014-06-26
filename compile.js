var fs = require('fs')
var _ = require('underscore')
var exec = require('child_process').exec
require('./library')

// We need to figure out which narratives we're depending on, and compile those narratives first. But all of their dependencies first. These all go into server.js.

// Next to go in there are the blocks which are not preceded by a `file` in a paragraph.

// Of course we still write out the files specified. (That should be it's own narrative at some point but I'm trying avoid scope creep here.)

// Require's are auto-detected, and go into the package.json

// Func = function(func) {
//   dependencies = {}
// 
//   this.dependencies = function() {
//     set = new Set()
//     this.addDependencies(set)
//     return set
//   }
// 
//   this.addDependencies = function(set) {
//     return dependencies.map(function(dep) {
//       dep.addDependencies(set)
//       set.add(dep)
//     }).flatten()
//   }
// 
//   this.run = function() {
//     this.dependencies().each(function(dependency) {
//       dependency.run();
//     })
//     func.run()
//   }
// }

//OK, so narratives compile to javascript functions. You can check them into the library. 

//If you want to run one, you ask for the dependency set, the dependency tree flattened into a list. For each of those we check if they're in the library. If they are, cool. If not, we compile them from the markdown and check them in. Repeat for the dependencies of each of those. We have to be careful we only do this once per narrative.

//At this point, we should have something in the library for everything we'll need to touch.

//You can then ask the library to take out each of those dependencies. That will run the function for the narrative, but it presumes its dependencies are loaded. This requires we load the narratives starting with the ones with no dependencies, and then the ones that depend on those, and the ones that depend upon those, and so on.

//And then finally we just call the main narrative's function.

Set = function() {
  var object = {}
  this.add = function(item) {
    object[item] = true
  }
  this.toArray = function() {
    return _(object).keys()
  }
}

grabDependenciesFromCodeBlocks = function(blocks) {
  dependencies = new Set()
  blocks = [{lines: ["library.give('blah', function(express, ya) {"]}]
  blocks.forEach(function(block) {
    block.lines.forEach(function(line) {
      match = line.match(/library.give.*\((.*)\) {/)
      if (!match) { return }
      match[1].split(',').forEach(function(dep) {
        dependencies.add(dep.trim())
      })
    })
  })
  return dependencies.toArray()
}


unassignedCodeblocks = function(blocks) {
  var foundSomethingInBackticks = false
  var unassigned = []

  blocks.forEach(function(block) {
    var inAComment = block.kind == 'comment'
    var inCode = !inAComment
    var hasBackticks = block.lines.join().match(/`([^`]+)`/)
    if (inAComment && hasBackticks) {
      foundSomethingInBackticks = true
    } else if (inCode && !foundSomethingInBackticks) {
      unassigned.push(block)
    } else if (inCode && foundSomethingInBackticks) {
      foundSomethingInBackticks = false
    }
  })

  return unassigned
}

sourceFor = function(dep) {
  // get the source lines from the .md file
}

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


handleReadme = function(error, content, name) {
  blocks = getBlocksFromNarrative(content);
  unassignedCodeblocks(blocks).forEach(function(block) {
    eval(block.source)
  })

  narratives = library.narrativesInLoadOrder()

  requires = "require('./library')\n"
  sourequiresrce += narratives.map(function(narrative) {
    return "require('" + narrative.name + "')"
  }).join('\n')

  narratives.forEach(function(narrative) {
    source = narrative.selfLoadingSource
    filename = narrative.name + '.js'
    if (narrative.name == name) {
      source = requires + source
    }
    filesystem.write(filename, source)
  })

  console.log("Look in ../narrative-build/ for your stuff!");
}

startsWith = function(string, pattern) {
  pattern = new RegExp("^" + pattern);
  return !!string.match(pattern);
}

getBlocksFromNarrative = chunkLines = function(content) {
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

eachBlock = function(process) {
  var memo = {}
  for(i=0; i<this.length; i++) {
    block = this[i];
    process(block.lines.join("\n"), block.kind, memo);
  }
}

handleBlock = function(block, kind, memo) {
  var inAComment = kind == 'comment'
  var foundCodeSnippets = block.match(/`([^`]+)`/)
  if (inAComment && foundCodeSnippets) {
    memo.filename = foundCodeSnippets[1]
  }

  if ((kind == 'code') && memo.filename) {
    block = block.replace(/(^|\n)    /g, "$1");
    writeFile(memo.filename, block);
    memo.filename = null;
  }
}

writeFile = function(filename, content, callback) {
  exec("mkdir -p ../narrative-build", function() {
    fs.writeFile('../narrative-build/' + filename, content, callback);
  });
}

copyFile = function(filename, directory) {
  fs.createReadStream(filename)
    .pipe(fs.createWriteStream(directory + '/' + filename));
}

fs.readFile(process.argv[2], 'utf-8', handleReadme);