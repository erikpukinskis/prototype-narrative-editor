var requirejs = require('requirejs')
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

function domgrabber() {
  var el = '<DOM/>'
  var tests = [function() {
    console.log('here is a test!')
  }]
  tests.forEach(function(test) {
    test()
  })
}
domgrabber()

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

  inject(picnic, 'topping', 'peanut butter')
  expect(picnic()).to.equal('our picnic of a peanut butter sandwich')

  inject(picnic, 'topping', 'honeyberry')
  expect(picnic()).to.equal('our picnic of a honeyberry sandwich')

  inject.handle(picnic, 'friend', function(name) {
    this.friend = name  
  })

  inject(picnic, 'friend', 'lucy')
  expect(picnic()).to.equal("you and lucy's picnic of a honeyberry sandwich")

  console.log(picnic()+'!!!!!!!!!')
}

test()
