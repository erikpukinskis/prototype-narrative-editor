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

    define(['chain', 'database', 'pg', 'indent', 'database'], function(chain, knex, pg, indent, database) {

      Documents = function() {
        _docs = this

        _docs.query = function(query, callback) {

          if (!_docs.client) {
            return connect(function() {
              _docs.query(query, callback) // retry
            })
          }

          if (!callback) {
            throw new Error('Tried to run query ' + query + ' without providing a callback')
          }

          // console.log('%% query', query)
          _docs.client.query(query, function(err, result) {
            callback(result)
          })
        }

        var waitingForConnect = [];

        function connect(callback) {
          if (_docs.client) {
            return callback() 
          }

          waitingForConnect.push(callback)

          if (waitingForConnect.length > 1) { return }

          function callWaitingBack() {
            waitingForConnect.forEach(function(waitingCallback) { 
              waitingCallback() 
            })
          }

          chain(hookUpPostgres, dropTable, createTable, callWaitingBack)
        }


        function hookUpPostgres(callback) {
          pg.connect(process.env.DATABASE_URL, function(err, client) {
            if (!_docs.client) { // in case another thread comes back first
              _docs.client = client
            }
            callback()
          })
        }

        function makeQueryFunction(query) {
          return function(callback) {
            _docs.query(query, callback)
          }
        }

        function dropTable(callback) {
          _docs.query("DROP TABLE documents", callback)
        }

        function createTable(callback) {
          var create = "CREATE TABLE IF NOT EXISTS documents ( \
            id serial PRIMARY KEY, \
            key varchar, \
            value text \
          )"
          _docs.query(create, callback)
        }

        _docs.test = function() {
          _docs.set('i am', 'lost', function(rowCount) {
            console.log('inserted', rowCount)
            _docs.get('i am', function(value) {
              console.log('data says i am', value)
              _docs.set('i am', 'found', function(rowCount) {
                console.log('inserted', rowCount)
                _docs.get('i am', function(value) {
                  console.log('now it says i am', value)
                })
              })
            })
          })
        }

        _docs.set = function(key, value, callback) {
          var update = database('documents')
            .where({key: key})
            .update({value: value})
            .toQuery()

          var insert = database('documents').insert({key:key, value: value}).toQuery()

          _docs.get(key, function(found) {
            var query = found ? update : insert
            _docs.query(query, function(data) {
              callback(data && data.rowCount)
            })
          })
        }
        
        _docs.get = function(key, callback) {
          var select = database.select('*').from('documents').where({key: key}).toQuery()
          _docs.query(select, function(data) {
            callback(data.rows[0] && data.rows[0].value)
          })
        }
      }

      return new Documents()
    })

