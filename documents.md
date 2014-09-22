Documents
---------

`documents.js`:

    define(['database'], function(database) {

      function set(key, value, callback) {
        console.log('setting')
        // ok, we hould try using knex for this.


        var rawSqlValue = database.raw("'" + JSON.stringify(value) + "'")
        var update = database.table('documents').where({key: key}).update({value: rawSqlValue}).toQuery()
        var insert = "insert into documents (key, value) values ('" + key + "', '" + JSON.stringify(value) + "')"
        get(key, function(found) {
          var query = found ? update : insert
          database.query(query, function(data) {
            console.log('+ set', data && data.rowCount, 'with', query)
            callback(JSON.parse(data && data.rowCount))
          })
        })
      }

      function get(key, callback) {
        var select = database.select('*').from('documents').where({key: key}).toQuery()
        database.query(select, function(data) {
          value = data.rows[0] && data.rows[0].value
          console.log('back from select. Got value ' + value)
          if (value) { value = JSON.parse(value) }
          console.log("<- got", value, 'from', select)
          callback(value)
        })
      }

      function test() {
        console.log('testing')
        set('i am', {is: 'lost'}, function(rowCount) {
        console.log('returned from "i am" set. inserted', rowCount)
        get('i am', function(value) {
        console.log('back from getting "i am". Value was ' + JSON.stringify(value))
        console.log('i am', value.is)
        set('i am', {is: 'found'}, function(rowCount) {
        console.log('inserted', rowCount)
        get('i am', function(value) {
        console.log('now i am', value.is)
        set('one more', {}, function() {
        set('one more', {is: 'this other shit'}, function() {
        get('i am', function(value) {
          console.log('now i am', value.is)
          if (value.is != 'found') { throw new Error('overwrote "i am"') } else { console.log('wee!!') }
        })
        })
        })
        })
        })
        })
        })
      }

      return {get: get, set: set, test: test}
    })

