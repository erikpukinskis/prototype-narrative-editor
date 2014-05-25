var fs = require('fs');
var _ = require('underscore');


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

  blocks.eachBlock = function(callback) {
    _(this).each(function(block) {
      callback(block.lines.join("\n"), block.kind);
    })
  }

  return blocks;
}


fs.readFile('README.md', 'utf-8', function(err, content) {
  byCodeOrComment = function(line) {
    return line.startsWith('    ') ? 'code' : 'comment';    
  }

  filename = null;

  chunkLines(content, byCodeOrComment).eachBlock(function(block, kind) {
    if (matches = block.match(/`([^`]+)`/)) {
      filename = matches[1]
    }
    if ((kind == 'code') && filename) {
      console.log("\n// " + filename + ":");
      block = block.replace(/(^|\n)    /g, "$1");
      console.log(block);
    }
  });
});
