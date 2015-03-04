var expect = require('chai').expect

function thing() {
  return 'our picnic of a peanut butter sandwich'
}

function test() {
  expect(thing()).to.equal('our picnic of a peanut butter sandwich')
}

test()

// requirejs(['inject'], function(inject) {
//   inject.do(['picnic', 'inject'], function(picnic, inject) {
//     console.log('buttering')
//     inject(picnic, 'topping', ['peanut butter'])
//   })    
// })




// requirejs = require('requirejs')

// requirejs.define('inject', function() {
//   function inject(thing, key, args) {
//     console.log('hiey')
//     console.log('injecting', key, 'onto (', thing, ') done')
//   }

//   inject.define = requirejs.define
//   inject.do = function() {
//     console.log('doing')
//     requirejs.apply(requirejs, arguments)
//   }
//   inject.handle = function() {}

//   inject.define('picnic', ['sandwich'], function(Sandwich) {
//     return function() {
//       var sandwich = new Sandwich()
//       console.log('our picnic has ' + sandwich.describe())
//     }
//   })

//   inject.define('sandwich', function() {
//     function Sandwich() {
//       this.topping = Sandwich.topping || 'empty'
//     }
//     Sandwich.prototype.describe = function() {
//       return 'a ' + this.topping + ' sandwich'
//     }
//     inject.handle(Sandwich, 'topping', function(name) {
//       this.topping = name
//     })
//     return Sandwich
//   })

//   return inject
// })

