var fs = require('fs');
var exec = require('child_process').exec;

handleReadme = function(error, content) {
  chunkLines(content).eachBlock(handleBlock);
  copyFile('README.md', '../narrative-build');
  console.log("Look in ../narrative-build/ for your stuff!");
}

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