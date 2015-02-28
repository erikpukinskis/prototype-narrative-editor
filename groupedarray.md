requirejs = require('requirejs')

requirejs(['chai', 'underscore'], function(chai, _) {
  var expect = chai.expect

  function GroupedArray(array) {
    this.array = array
  }

  GroupedArray.prototype.groupBy = function(func) {
    this.groupingFunction = func
    this.groups = []
    var lastGroup
    for(var i=0; i<this.array.length; i++) {
      var item = this.array[i]
      var value = func(item)
      var isNewGroup = lastGroup && value != lastGroup.value
      var isLastItem = i == this.array.length - 1

      if (isNewGroup) {
        this.groups.push(lastGroup)
        lastGroup = null
      }

      if (!lastGroup) {
        lastGroup = {value: value, items: []}
      }

      lastGroup.items.push(item) 

      if (isLastItem) { 
        this.groups.push(lastGroup)
      }
    }

    return this
  }

  GroupedArray.prototype.splice = function() {
    //Array.prototype.splice.apply(this.array, arguments)
    //var newItems = arguments.slice(2)
    //var values = newItems.map(this.groupingFunction)
  }

  function test() {
    var array = [1,2,3,0]
    var grouped = new GroupedArray(array).groupBy(function(number) {
      return number > 2
    })
    expect(grouped.groups).to.have.length(3)

    expect(grouped.groups[0].value).to.equal(false) // not greater than two
    expect(grouped.groups[0].items).to.have.members([1,2])

    expect(grouped.groups[1].value).to.equal(true)  // YES greater than 2
    expect(grouped.groups[1].items).to.have.members([3])

    expect(grouped.groups[2].value).to.equal(false)  // also not greater than 2
    expect(grouped.groups[2].items).to.have.members([0])

    // Adding 
    // grouped.splice(1, 0, 27)
    // expect(array).to.have.members([1,27,2,3])
    // expect(grouped.groups[true].items).to.have.members([3,27])
    console.log('dooooooooooooon!')
  }

  test()
})