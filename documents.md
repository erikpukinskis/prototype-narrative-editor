Documents
---------

`documents.js`:

OK, what the heck is going on here?

Everything is basically built.

I am just trying to get the server to start again.

I have done a LOT of the plumbing.

A lot of it seems to work.

I just can't get the frickin database to read and write.

I was apparently writing for a while without being able to read.

Then I started reading and saw all the stuff I had written.

By then writing had stopped working.

Then I got writing working again. Reading and writing. Awesome.

But it was only writing the string field. Not the hstore field. I couldn't get that to work

So then I was like fuck it, I'll just use a string.

So wrote code that dropped the table.

But now the table creating code doesn't seem to work.

Lulzzzzz.

    define(['database'], function(database) {

      function set(key, value, callback) {
        var update = "UPDATE documents SET value = '" + JSON.stringify(value) + "'"
        var insert = "insert into documents (key, value) values ('" + key + "', '" + JSON.stringify(value) + "')"

        get(key, function(found) {
          var query = found ? update : insert
          database.query(query, function(data) {
            console.log('+ set', data && data.rowCount, 'with', query)
            callback(JSON.parse(data && data.rowCount))
          })
        })
      }

      function get (key, callback) {
        var select = database.table('*').from('documents').where({key: key}).toQuery()
        database.query(select, function(data) {
          console.log("<- got", data.rows[0] && data.rows[0].value, 'from', select)
          callback(data.rows[0] && data.rows[0].value)
        })
      }

      function test() {
        set('i am', {is: 'lost'}, function(rowCount) {
          console.log('inserted', rowCount)
          get('i am', function(value) {
            console.log('data says i am', value.is)
            set('i am', {is: 'found'}, function(rowCount) {
              console.log('inserted', rowCount)
              get('i am', function(value) {
                console.log('now it says i am', value.is)
              })
            })
          })
        })
      }

      return {get: get, set: set, test: test}
    })

