var fs = require('fs');
var _ = require('underscore');
var sys = require('sys')
var exec = require('child_process').exec;

if (!String.prototype.startsWith) {
  String.prototype.startsWith = function(pattern) {
    pattern = new RegExp("^" + pattern);
    return !!pattern.exec(this);
  }
}

function chunkLines(content, categorizer) {
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

  blocks.eachBlock = function(process) {
    var memo = {}
    _(this).each(function(block, i) {
      process(block.lines.join("\n"), block.kind, memo);
    })
  }

  return blocks;
}

function writeFile(filename, content, callback) {
  exec("mkdir -p build", function() {
    fs.writeFile('build/' + filename, content, callback);
  });
}

function handleBlock(block, kind, memo) {
  if (matches = block.match(/`([^`]+)`/)) {
    memo.filename = matches[1]
  }

  if ((kind == 'code') && memo.filename) {
    block = block.replace(/(^|\n)    /g, "$1");
    writeFile(memo.filename, block);
  }
}

fs.readFile('README.md', 'utf-8', function(err, content) {
  byCodeOrComment = function(line) {
    return line.startsWith('    ') ? 'code' : 'comment';    
  }
  
  chunkLines(content, byCodeOrComment).eachBlock(handleBlock)
  console.log("Look in build/ for your stuff!");
});
