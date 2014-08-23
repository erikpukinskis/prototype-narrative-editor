Documents
---------

`documents.js`:

    define(['chain', 'knex', 'pg', 'indent'], function(chain, knex, pg, indent) {
      var url = process.env.DATABASE_URL || 'postgres://erik:@localhost/data'
      indent(url)
      var database = require('knex')({
        client: 'pg',
        connection: url
      })

      function handle(query) {
        query.on('row', function(row) {
          console.dir(row);
        });
        query.on('end', function(row) {
          client.end();
          process.exit();
        })
      }

      Documents = function() {
        _docs = this

        this.query = function(query, callback) {
          console.log('query #', query.toString())
          if (_docs.client) {
            console.log('&&&& we have a docs.client')
            indent('about to send query to the client: ' + query + '...')

            _docs.client.query(query, function(err, result) {
              console.log("err ("+query.toString()+"): " + JSON.stringify(result, err, 2))
              console.log("result:\n"+JSON.stringify(result && result.rows, null, 2))
              callback(result)
            })

            if (!callback) {
              throw new Error('Tried to run query ' + query + ' without providing a callback')
            }

          } else {
            console.log('&&&& no docs.client. about to connect.')
            connect(function() {
              console.log('back from the full connect() thing.')
              _docs.query(query, callback) // retry
            })
          }
        }

        var waitingForConnect = [];

        function connect(callback) {
          if (_docs.client) {
            indent('>> client already exists. calling back immediately.')
            return callback() 
          }
          waitingForConnect.push(callback)
          if (waitingForConnect.length > 1) { 
            indent('>> already connecting. waiting.')
            return 
          }

          indent('>> running connect chain...')
          chain(hookUpPostgres, createExtension, createTable, function() {
            indent('back from chain')
            waitingForConnect.forEach(function(cb) {
              indent('calling', cb)
              cb()
            })
          })
        }


        function hookUpPostgres(callback) {
          indent('hooking up pg')
          indent.in()
          pg.connect(process.env.DATABASE_URL, function(err, client) {
            indent('connected to pg!')
            indent.out()
            if (!_docs.client) { // in case another thread comes back first
              _docs.client = client
            }
            callback()
          })            

        }

        function createExtension(callback) {
          indent('creating extension...')
          indent.in()
          var query = 'CREATE EXTENSION IF NOT EXISTS hstore'
          _docs.query(query, function(err, result) {
            console.log("err ("+query+"): " + JSON.stringify(result, err, 2))
            console.log("result:\n"+JSON.stringify(result && result.rows, null, 2))
            indent('created extension.')
            indent.out()
            callback()
          })
        }

        function createTable(callback) {
          indent('creating table...')
          var create = "CREATE TABLE IF NOT EXISTS documents ( \
            id serial PRIMARY KEY, \
            key varchar, \
            value hstore \
          )"
          indent.in()
          _docs.query(create, function(err, result) {
            console.log("err ("+create+"): " + JSON.stringify(result, err, 2))
            console.log("result:\n"+JSON.stringify(result && result.rows, null, 2))
            indent('created table.')
            indent.out()
            callback()
          })
        }

        this.set = function(key, value, callback) {
          var insert = "INSERT INTO documents (key, value) VALUES ('pepper', 'red')"
          console.log('Sending insert query')
          _docs.query(insert, callback)
        }

        this.get = function(key, callback) {
          var select = database.select('*').from('documents').toQuery()
          console.log('database', database)
          indent('select is...' + select)
          this.query(select, function(data) {
            console.log('data?', data)
          }, function() {
            callback()
          })
        }
      }

      return new Documents()
    })

