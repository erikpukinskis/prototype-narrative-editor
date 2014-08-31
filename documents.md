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

    define(['chain', 'knex', 'pg', 'indent'], function(chain, knex, pg, indent) {

      var url = process.env.DATABASE_URL || 'postgres://erik:@localhost/data'

      var database = require('knex')({
        client: 'pg'
      })

      Documents = function() {
        _docs = this

        this.query = function(query, callback) {

          if (!_docs.client) {
            return connect(function() {
              _docs.query(query, callback) // retry
            })
          }

          if (!callback) {
            throw new Error('Tried to run query ' + query + ' without providing a callback')
          }

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

          chain(hookUpPostgres, createTable, callWaitingBack)
        }


        function hookUpPostgres(callback) {
          pg.connect(process.env.DATABASE_URL, function(err, client) {
            if (!_docs.client) { // in case another thread comes back first
              _docs.client = client
            }
            callback()
          })
        }

        function createTable(callback) {
          var drop = "DROP TABLE documents"

          var create = "CREATE TABLE IF NOT EXISTS documents ( \
            id serial PRIMARY KEY, \
            key varchar, \
            value text \
          )"
          console.log('create query is', create)
          _docs.query(create, function(err, result) {
            callback()
          })
        }

        this.test = function() {
          var select = database.select('*').from('documents').toQuery()
          var insert = database('documents').insert({key:'bill and', value: 'ted'}).toQuery()
          console.log('the query is', select)
          _docs.query(select, function(err,data) {
            console.log('insert returned ', data)
            console.log('err is ', err)

            // _docs.query(select, function(data) {
            //   console.log('select is', data.rows.slice(53,100))
            // })
          })
        }

        //this.set = function(key, value, callback) {
        //  var insert = database.insert({key: key, value: value}).into('documents').toQuery()
        //  console.log('Sending insert query')
        //  _docs.query(insert, callback)
        //}
        //
        //this.get = function(key, callback) {
        //  var select = database.select('*').from('documents').toQuery()
        //  console.log('database', database)
        //  indent('select is...' + select)
        //  this.query(select, callback)
        //}
      }

      return new Documents()
    })

