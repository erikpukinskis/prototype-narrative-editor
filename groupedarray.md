var requirejs = require('requirejs')

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
        lastGroup = {value: value, items: [], start: i}
      }

      lastGroup.items.push(item) 

      if (isLastItem) { 
        this.groups.push(lastGroup)
      }
    }

    return this
  }

  function spliceParams(args) {
    return {
      start: args[0],
      numberToRemove: args[1],
      newItems: Array.prototype.slice.call(args, 2)
    }
  }

  // This one looks through all the groups and finds the one 
  // that is fully before the start item
  function indexOfGroupBefore(groups, start) {
    var groupStart = 0
    for (var i=0; i<groups.length; i++) {
      var group = groups[i]
      console.log('grp', group)
      console.log('posi', groupStart, 'len', group.items.length)
      var positonOfLastItemInGroup = groupStart + group.items.length - 1
      console.log('positonOfLastItemInGroup:'+ positonOfLastItemInGroup, 'start:'+ start, 'group:'+ group)
      if (start == groupStart) {
        return i - 1
      } else if (positonOfLastItemInGroup < start) {
        console.log('sending back', group)
        return i
      } else {
        groupStart = groupStart + group.items.length
      }
    }

    return -1
  }

  function testGroupBefore() {
    var groupOfOne = {items: [1]}
    var groups = [groupOfOne]
    // -1 if we're right at the start of the first group
    expect(indexOfGroupBefore(groups, 0)).to.equal(-1)
    // a group we're past
    expect(indexOfGroupBefore(groups, 1)).to.equal(0)
    // attaches the index
    expect(indexOfGroupBefore([], 0)).to.equal(-1)
  }
  testGroupBefore()

  GroupedArray.prototype.splice = function() {
    console.log("ok, we're starting with", this.array)
    Array.prototype.splice.apply(this.array, arguments)
    console.log("now it's", this.array, ". glad that's done")
    if (!this.groups) { return }

    var splice = spliceParams(arguments)
    console.log('splice arams of', arguments, 'are', splice)


    var numberLeftTorRemove = splice.numberToRemove

    // grab the one that is fully before the start item
    var lastGroupIndex = indexOfGroupBefore(this.groups, splice.start)

    var groupsToRemove = []
    this.groups.splice(lastGroupIndex,groupsToRemove)

    for(var i=lastGroupIndex+1; i<this.groups.length; i++) {
      var i = lastGroupIndex+1
      var group = this.groups[i]
      console.log('lastGroupIndex', lastGroupIndex)
      var numberToRemove = Math.min(group.items.length, numberLeftTorRemove)

      console.log('\n> splicing', group, "removing", numberToRemove, "starting at", splice.start)
      group.items.splice(splice.start - group.start, numberToRemove)
      numberLeftTorRemove -= numberToRemove

      // clean up empty groups
      if (group.items.length < 1) {
        groupsToRemove.push(i)
      }
    }

    console.log("now let's kill groups", groupsToRemove)
    if (groupsToRemove.length) {
      console.log('sup. splicing', groupsToRemove.length, 'out of', this.groups, 'starting from', groupsToRemove[0])
      this.groups.splice(groupsToRemove[0], groupsToRemove.length)
      console.log("groups is", this.groups)
    }

    // walk through the new items
    // for(var i=0; i<splice.newItems.length; i++) {

    // }
    //   var item = splice.newItems[i]
    //   var value = this.groupingFunction(item)
    //   // figured out what value this item has so we can
    //   // know whether to stick that in the current group
    //   // or start a new one

    //   var nextGroup = this.groups[lastGroupIndex+1]

    //   // undefined?
    //   if (value != lastGroup.value) {
    //     // lastGroup is obsolete. we need to move on. If we are not at the end of the group
    //     if (nextGroup && value == nextGroup.value) {
    //       newGroup = nextGroup
    //     }
    //     var newGroup = {value: value, items: [item]}
    //     //// lastGroupIndex+1???
    //     this.groups.splice(lastGroupIndex+1,0,newGroup)
    //   }
    // }
  }

  function isDigit(number) { return number < 10 }

  function testSplice() {
    var grouped = new GroupedArray([1,2]).groupBy(isDigit)
    expect(grouped.array).to.deep.equal([1,2])
    expect(grouped.groups[0].items).to.deep.equal([1,2])

    // Delete an item
    grouped.splice(1,1)
    expect(grouped.array).to.deep.equal([1])
    expect(grouped.groups[0].items).to.deep.equal([1])

    // Delete the other one
    grouped = new GroupedArray([1,2]).groupBy(isDigit)
    grouped.splice(0,1)
    expect(grouped.groups[0].items).to.deep.equal([2])

    // Delete one that's not in the first group
    grouped = new GroupedArray([10,1,2]).groupBy(isDigit)
    grouped.splice(1,1)
    expect(grouped.groups[0].items).to.deep.equal([10])
    expect(grouped.groups[1].items).to.deep.equal([2])
    console.log(typeof grouped.groups[0].items)
    // Delete two
    grouped = new GroupedArray([0,1,2]).groupBy(isDigit)
    grouped.splice(0,2)
    expect(grouped.groups[0].items).to.deep.equal([2])
    console.log(typeof grouped.groups[0].items, grouped.groups[0].items)

    console.log('\n\n\n\n*------------------\n\n\n\n\n')
    // Delete a whole group
    grouped = new GroupedArray([0]).groupBy(isDigit)
    grouped.splice(0,1)
    expect(grouped.groups).to.have.length(0)

    // Delete across two groups
    grouped = new GroupedArray([1,2,10,11]).groupBy(isDigit)
    console.log('groupeddd is',grouped)
    console.log(typeof grouped.groups[0].items, grouped.groups[0].items)
    throw new Error('fart')
    grouped.splice(1,2)
    console.log('seeeeegnorita!')
    console.log(typeof grouped.groups[0].items, grouped.groups[0].items)
    throw new Error('fart')
    expect(grouped.groups[0].items).to.deep.equal([1])
    expect(grouped.groups[1].items).to.deep.equal([11])
    console.log('blestik')

    // // Prepend two items
    // expect(grouped.groups).to.have.length(1)
    // expect(grouped.groups[0].items).to.deep.equal([1])

    // grouped.splice(0,0,0)
    // expect(grouped.array).to.deep.equal([0,1])
    // expect(grouped.groups).to.have.length(1)
    // expect(grouped.groups[0].items).to.deep.equal([0,1])
    // console.log('wuuut')

    // expect(grouped.groups).to.have.length(2)

    // expect(grouped.groups[0].value).to.equal(true)
    // expect(grouped.groups[0].items).to.deep.equal([10])

    // expect(grouped.groups[1].value).to.equal(false)
    // expect(grouped.groups[1].items).to.deep.equal([0,1])
    // console.log('right value!')

  }

  function test() {
    var array = [1,2,11,0]
    var grouped = new GroupedArray(array).groupBy(isDigit)
    expect(grouped.groups).to.have.length(3)

    expect(grouped.groups[0].value).to.equal(true) // digits
    expect(grouped.groups[0].items).to.deep.equal([1,2])

    expect(grouped.groups[1].value).to.equal(false)  // not digits
    expect(grouped.groups[1].items).to.to.deep.equal([11])

    expect(grouped.groups[2].value).to.equal(true)  // digits
    expect(grouped.groups[2].items).to.to.deep.equal([0])
    console.log('booya')
  }


  test()
  testSplice()
})