var expect = require('chai').expect

function inject(thing, key, value) {
  if (thing.__injectionHandlers && thing.__injectionHandlers[key]) {
    thing.__injectionHandlers[key](value)
  }
}

inject.handle = function(thing, key, func) {
  thing.__injectionHandlers = thing.__injectionHandlers || {}
  thing.__injectionHandlers[key] = function() {
    func.apply(thing, arguments)
  }
}

function test() {
  function picnic() {
    var topping = picnic.defaultTopping || 'empty'
    var company = 'our'
    if (picnic.friend) {
      company = 'you and '+picnic.friend+"'s"
    }
    return company + ' picnic of a '+topping+' sandwich'
  }

  inject.handle(picnic, 'topping', function(name) {
    this.defaultTopping = name  
  })

  inject.handle(picnic, 'friend', function(name) {
    this.friend = name  
  })

  inject(picnic, 'topping', 'peanut butter')
  expect(picnic()).to.equal('our picnic of a peanut butter sandwich')

  inject(picnic, 'topping', 'honeyberry')
  expect(picnic()).to.equal('our picnic of a honeyberry sandwich')

  inject(picnic, 'friend', 'lucy')
  expect(picnic()).to.equal("you and lucy's picnic of a honeyberry sandwich")

  console.log(picnic()+'!!!!!!!!!')
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

