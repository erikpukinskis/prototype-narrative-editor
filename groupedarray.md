requirejs = require('requirejs')

requirejs(['chai', 'underscore'], function(chai, _) {
  var expect = chai.expect

  function GroupedArray(array) {
    this.array = array
  }

  GroupedArray.prototype.groupBy = function(func) {
    this.groups = {}
    for(var i=0; i<this.array.length; i++) {
      var item = this.array[i]
      var value = func(item)
      var group = this.groups[value] || (this.groups[value] = {value: value, items: []})
      group.items.push(item)
    }
    return this
  }

  function test() {
    var array = [1,2,3]
    var grouped = new GroupedArray(array).groupBy(function(number) {
      return number > 2
    })
    expect(grouped.groups).to.have.all.keys('false', 'true')
    expect(grouped.groups[false].items).to.have.members([1,2])
    expect(grouped.groups[true].items).to.have.members([3])
  }

  test()
})