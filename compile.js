var fs = require('fs');
var exec = require('child_process').exec;

handleReadme = function(error, content) {
  byCodeOrComment = function(line) {
    return startsWith(line, '    ') ? 'code' : 'comment';    
  }
  
  chunkLines(content, byCodeOrComment).eachBlock(handleBlock);
  console.log("Look in build/ for your stuff!");
}

startsWith = function(string, pattern) {
  pattern = new RegExp("^" + pattern);
  return !!pattern.exec(string);
}

chunkLines = function(content, categorizer) {
  var block = {lines: []};
  var blocks = [];

  for (i in lines = content.split("\n")) {
    var line = lines[i];
    var kind = categorizer(line);

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
  }
}

writeFile = function(filename, content, callback) {
  exec("mkdir -p build", function() {
    fs.writeFile('build/' + filename, content, callback);
  });
}

fs.readFile('README.md', 'utf-8', handleReadme);
