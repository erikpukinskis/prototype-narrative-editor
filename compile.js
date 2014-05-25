var fs = require('fs');
var _ = require('underscore');


if (!String.prototype.startsWith) {
  String.prototype.startsWith = function(pattern) {
    pattern = new RegExp("^" + pattern);
    return !!pattern.exec(this);
  }
}


var Block = function() {
  this.lines = [];
}


function breakIntoBlocks(content) {
  var block = new Block();
  var blocks = [];

  for (i in lines = content.split("\n")) {
    var line = lines[i];
    var kind = line.startsWith('    ') ? 'code' : 'comment';

    if (block.kind != kind) {
      if (block.writing) {
        blocks.push(block);
      }

      block = new Block();
      block.writing = true;
      block.kind = kind
    }

    line = line.replace(/^    /,'');
    block.lines.push(line);
  }

  if(block.writing) {
    blocks.push(block);
  }

  return blocks;
}


fs.readFile('README.md', 'utf-8', function(err, content) {
  var blocks = breakIntoBlocks(content);

  _(blocks).each(function(block) {
    console.log("\n-----------------------------------------------------------------");
    console.log(block.kind + " block:")
    _(block.lines).each(function(line) {
      console.log(line);
    });
  });
});
