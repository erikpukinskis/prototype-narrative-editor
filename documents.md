Documents
---------

`documents.js`:

    define(['database'], function(database) {

      function set(key, value, callback) {
        var update = "UPDATE documents SET value = '" + JSON.stringify(value) + "'"
        var insert = "insert into documents (key, value) values ('" + key + "', '" + JSON.stringify(value) + "')"

        get(key, function(found) {
          var query = found ? update : insert
          database.query(query, function(data) {
            // console.log('+ set', data && data.rowCount, 'with', query)
            callback(JSON.parse(data && data.rowCount))
          })
        })
      }

      function get (key, callback) {
        var select = database.table('*').from('documents').where({key: key}).toQuery()
        database.query(select, function(data) {
          // console.log("<- got", data.rows[0] && data.rows[0].value, 'from', select)
          callback(data.rows[0] && data.rows[0].value)
        })
      }

      function test() {
        set('i am', {is: 'lost'}, function(rowCount) {
          console.log('inserted', rowCount)
          get('i am', function(value) {
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

