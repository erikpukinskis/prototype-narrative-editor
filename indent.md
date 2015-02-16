Indent
------

Keeps track of how far in you're indented so when you print stuff out it's a little organized. Goes in `indent.js`
`library indent.js
    define([], function() {
      function isInteger(n) { return parseInt(n) === n };

      indent = function() {
        function toArray(obj) {
          return [].slice.call(obj)
        }
        var string = toArray(arguments).join()
        var indents = Math.max(1, indent.depth)
        var indentation = new Array(indents)
        console.log(indentation.join(' ') + string)
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
