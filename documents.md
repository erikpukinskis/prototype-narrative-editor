Documents
---------

`documents.js`:

    define(['chain', 'knex', 'pg', 'indent'], function(chain, knex, pg, indent) {
      var database = require('knex')({
        client: 'pg',
        connection: process.env.DATABASE_URL
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

        this.query = function(query, last, callback) {
          console.log('query #', query)
          if (_docs.client) {
            console.log('we have a docs.client')
            indent('about to send query to the client: ', query, '...')
            data = _docs.client.query(query)
            if (callback) { 
              indent('attaching row callback')
              data.on('row', callback) }
            if (last) { 
              indent('attaching end callback')
              data.on('end', last) 
            }
          } else {
            console.log('no docs.client. about to connect.')
            connect(function() {
              console.log('connected.')
              _docs.query(query, callback, last) // retry
            })
          }
        }

        var waitingForConnect = [];

        function connect(callback) {
          if (_docs.client) {
            indent('client already exists. calling back immediately.')
            return callback() 
          }
          waitingForConnect.push(callback)
          if (waitingForConnect.length > 1) { 
            indent('already connecting. waiting.')
            return 
          }

          indent('connecting...')
          indent.in()
          pg.connect(process.env.DATABASE_URL, function(err, client) {
            indent('connected.')
            indent.out()
            if (!_docs.client) { // in case another thread comes back first
              _docs.client = client
            }
            waitingForConnect.forEach(function(callback) {
              callback()
            })
          })            

        }

        function createExtension(callback) {
          indent('creating extension...')
          indent.in()
          indent('done indenting. about to create extension query')
          _docs.query('CREATE EXTENSION IF NOT EXISTS hstore', function() {
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
          _docs.query(create, function() {
            indent('created table.')
            indent.out()
            callback()
          })
        }

        this.set = function(key, value, callback) {
          var insert = "INSERT INTO documents (key) VALUES ('pepper')"
          console.log('Sending insert query')
          _docs.query(insert, callback)
        }

        this.get = function(key, callback) {
          var select = "SELECT * FROM documents"
          var select = database.select('attributes').from('documents').where({
            key: key
          })
          console.log('database', database)
          indent('select is...', select)
          this.query(select, callback)
        }
      }

      return new Documents()
    })

