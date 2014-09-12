Documents
---------

`documents.js`:

    define(['database'], function(database) {

      function set(key, value, callback) {
        console.log('setting')
        // ok, we hould try using knex for this.


        var update = "UPDATE documents SET value = '" + JSON.stringify(value) + "'"
        var rawSqlValue = database.raw("'" + JSON.stringify(value) + "'")
        var knexUpdate = database.table('documents').update({value: rawSqlValue}).toQuery()
        console.log('reglar update:', update)
        console.log('knex update:', knexUpdate)
        var insert = "insert into documents (key, value) values ('" + key + "', '" + JSON.stringify(value) + "')"
        console.log('insrrrrt:', insert)
        get(key, function(found) {
          var query = found ? knexUpdate : insert
          console.log('now setting.... about to call database.query....')
          database.query(query, function(data) {
            console.log('+ set', data && data.rowCount, 'with', query)
            callback(JSON.parse(data && data.rowCount))
          })
        })
      }

      function get (key, callback) {
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
              })
            })
          })
        })
      }

      return {get: get, set: set, test: test}
    })

