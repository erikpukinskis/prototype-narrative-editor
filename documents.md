Documents
---------

`documents.js`:

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
          var create = "CREATE TABLE IF NOT EXISTS documents ( \
            id serial PRIMARY KEY, \
            key varchar, \
            value hstore \
          )"
          _docs.query(create, function(err, result) {
            callback()
          })
        }

        this.test = function() {
          var select = database.select('*').from('documents').toQuery()
          var insert = database('documents').insert({key:'todd'}).toQuery()
          console.log('insert query is', insert)
          _docs.query(insert, function(err,data) {
            console.log('insert is ', data)
            console.log('err is ', err)

            _docs.query(select, function(data) {
              console.log('select is', data.rows.slice(53,100))
            })
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

