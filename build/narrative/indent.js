define([], function() {
  indent = function(string, offset) {
    offset = offset || 0
    indent.depth = indent.depth + offset
    var indentation = new Array(indent.depth)
    console.log(indentation.join("    ") + string)
    indent.depth = indent.depth - offset
  }
  indent.depth = 1
  indent.in = function() {
    this.depth++
  }
  indent.out = function() {
    this.depth--
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

  return indent
})
