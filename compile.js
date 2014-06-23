var fs = require('fs');
var exec = require('child_process').exec;

// We need to figure out which narratives we're depending on, and compile those narratives first. But all of their dependencies first. These all go into server.js.

// Next to go in there are the blocks which are not preceded by a `file` in a paragraph.

// Of course we still write out the files specified. (That should be it's own narrative at some point but I'm trying avoid scope creep here.)

// Require's are auto-detected, and go into the package.json

Func = function(func) {
  dependencies = {}

  this.dependencies = function() {
    set = new Set()
    this.addDependencies(set)
    return set
  }

  this.addDependencies = function(set) {
    return dependencies.map(function(dep) {
      dep.addDependencies(set)
      set.add(dep)
    }).flatten()
  }

  this.run = function() {
    this.dependencies().each(function(dependency) {
      dependency.run();
    })
    func.run()
  }
}

//OK, so narratives compile to javascript functions. You can check them into the library. 

//If you want to run one, you ask for the dependency set, the dependency tree flattened into a list. For each of those we check if they're in the library. If they are, cool. If not, we compile them from the markdown and check them in. Repeat for the dependencies of each of those. We have to be careful we only do this once per narrative.

//At this point, we should have something in the library for everything we'll need to touch.

//You can then ask the library to take out each of those dependencies. That will run the function for the narrative, but it presumes its dependencies are loaded. This requires we load the narratives starting with the ones with no dependencies, and then the ones that depend on those, and the ones that depend upon those, and so on.

//And then finally we just call the main narrative's function.

grabDependenciesFromCodeBlocks = function(blocks) {
  blocks.forEach(function(block) {
    block.lines.forEach(function(line) {
      console.log(line)
      match = line.match(/library/)
      console.log(match)
    })
  })
}

handleReadme = function(error, content) {
  blocks = getBlocksFromNarrative(content);
  dependencies = grabDependenciesFromCodeBlocks(blocks)
  console.log("dependencies are " + dependencies)
  source = compileDependencyTree(dependencies)
  unassignedCodeBlocks(blocks).each(function(block) {
    source = source + block.source
  })
  filesystem.write(source, 'server.js')
  files = grabFilesFromCodeBlocks(blocks)
  files.each(function(filename, content) {
    filesystem.write(content, filename)
  })
  copyFile('README.md', '../narrative-build');
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