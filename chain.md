Chain
-----

`chain.js` runs a bunch of functions, one after another, waiting for each to respond to a callback

    define(['assert'], function(assert) {
      function chain() {
        var functions = arguments
        if (functions.length < 1) { return }
        var i = 0

        function runNext() {
          i++
          runOne.apply({}, Array.prototype.slice.call(arguments))
        }

        function runOne() {
          var argumentsFromLastFunc = Array.prototype.slice.call(arguments)
          var nextFunc = functions[i]
          if (!nextFunc) { return }

          var plentyOfArguments = argumentsFromLastFunc.concat(new Array(nextFunc.length))
          var argumentsForNextFunc = plentyOfArguments.slice(0, nextFunc.length-1)
          argumentsForNextFunc.push(runNext)

          nextFunc.apply({}, argumentsForNextFunc)
        }

        runOne()
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
          json = JSON.stringify
          assert.equal(json(array), json(['hi', 'ho']), "Chain didn't work")
          console.log('awesome!')
        })
      }

      function testChainingResponses() {
        function firstName(callback) {
          callback('Gloria')
        }
        function addMiddleName(first, callback) {
          callback(first + ' Evangelina')
        }
        function andLastName(first, callback) {
          callback(first + ' Anzaldúa')
        }
        function test(name, callback) {
          assert.equal(name, 'Gloria Evangelina Anzaldúa')
          console.log('Gloria!')
        }

        chain(firstName, addMiddleName, andLastName, test)
      }

      testAddingTwice()
      testChainingResponses()
      return chain
    })
