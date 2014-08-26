Chain
-----

`chain.js` runs a bunch of functions, one after another, waiting for each to respond to a callback

    define(function() {
      function chain() {
        var _arguments = arguments
        if (arguments.length < 1) { return }
        func = arguments[0]

        func(function() {
          var remainingArguments = Array.prototype.slice.call(_arguments, 1)
          chain.apply(null, remainingArguments)
        })
      }

      function testAddingTwice() {
        var array = []

        function addHi(callback) {
          array.push('hi')
          callback()
        }

        function addHo(callback) {
          array.push('ho')
          callback()
        }

        chain(addHi,addHo, function() {
          var expected = ['hi', 'ho']
          if(JSON.stringify(array) != JSON.stringify(expected)) {
            throw new Error("Chain didn't work. Expected " + array + " to be " + expected)
          }
        })
      }

      testAddingTwice()
      return chain
    })
