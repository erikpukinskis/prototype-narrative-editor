// Node
// ----
// 
// `node.js`:
// 
//  define(['assert'], function(assert) {


function ensureKey(object, key, value) {
  var result = object[key]
  if (!result) { result = object[key] = value }
  return result
}

function Gate(performer, property) {
  this.performer = performer
  if(typeof property == 'string') {
    this.property = property
  } else {
    this.property = property.string
    this.negated = true
  }
  this.actuated = actuated = []
  performer.addObserver(property, function(value) {
    actuated.forEach(function(observer) {
      if (value) { 
        actuated.enable() 
      } else {
        actuated.disable()
      }
    })
  })
}
Gate.prototype.isOpen = function() {
  var value = this.performer[this.property]
  if (this.negated) { value = !value }
  return value
}
Gate.prototype.actuate = function(observer) {
  this.actuated.push(observer)
}

Function.prototype.observes = function(options) {
  var func = this
  var gate = new Gate(options.when[0], options.when[1])

  options.properties.forEach(function(keyValue) {
    performer = keyValue[0]
    property = keyValue[1]

    var observer = performer.addObserver(property, func, gate)
  })
}


function Observer(func, gate) {
  if (!gate || gate.isOpen()) { func() }
}
Observer.prototype.gateObserver = function() { 
}

function Performer(attributes) {
  for (var key in attributes) {
    this[key] = attributes[key]
  }
  this.observers = {}
}
Performer.prototype.addObserver = function(property, func, gate) {
  var observer = new Observer(func, gate)
  var observers = ensureKey(this.observers, property, [])
  observers.push(observer)
  return observer
}
Performer.prototype.set = function() {
  
}

function Negation(string) {
  this.string = string
}
function not(string) {
  return new Negation(string)
}



assert = require('assert')
function assertEqual(thing, other, message) {
  process.stdout.write('testing ' + message)
  assert.deepEqual(thing, other)
  process.stdout.write(' ✓\n')
}

///////////////////////////////////////





      function test() {
        var cursor = new Performer({line: 1, column: 10})
        var line = new Performer({kind: 'bla', string: 'fee', active: false})
        var staticSideEffect = null
        var absoluteSideEffect = null

        var renderAbsolute = function () {
          absoluteSideEffect = {
            kind: line.kind, 
            string: line.string,
            column: cursor.column
          }
        }.observes({
          properties: [[line, 'kind'], [line, 'string'], [cursor, 'column']],
          when: [line, 'active']
        })

        var renderStatic = function() {
          staticSideEffect = {
            kind: line.kind, 
            string: line.string
          }
        }.observes({
          properties: [[line, 'kind'], [line, 'string']],
          when: [line, not('active')]
        })

        assertEqual(absoluteSideEffect, null, 'absolute waits for activation')
        assertEqual(staticSideEffect, {kind: 'bla', string: 'fee'}, 'static runs right away')
        line.set('active', true)
        assertEqual(absoluteSideEffect, {kind: 'bla', string: 'fee', column: 10}, 'absolute runs after activate')
        line.set('kind', 'blee')
        assertEqual(absoluteSideEffect.kind, 'blee', 'absolute gets updated when active')
        assertEqual(staticSideEffect.kind, 'bla', 'static does not get updated when active')
        cursor.set('column', 15)
        assertEqual(absoluteSideEffect.cursor, 15, 'cursor gets set on absolute')
        line.set('active', false)
        assertEqual(staticSideEffect.kind, 'blee', 'static gets updated on deactivate')
        cursor.set('column', 20)
        assertEqual(absoluteSideEffect.cursor, 15, 'absolute does not update when deactivated')
      }

      test()
//    })