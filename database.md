Database
--------

A wrapper for knex with an upsert extension. `database.js`

    define(['pg', 'knex', 'chain'], function(pg, knex, chain) {

      var client
      var url = process.env.DATABASE_URL || 'postgres://erik:@localhost/data'
      var knex = require('knex')({client: 'pg'})
      var waitingForConnect = []

      function connect(callback) {
        if (client) {
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
        pg.connect(url, function(err, freshClient) {
          if (!client) { // in case another thread comes back first
            client = freshClient
          }
          callback()
        })
      }

      function dropTable(callback) {
        query("DROP TABLE documents", callback)
      }

      function createTable(callback) {
        var create = "CREATE TABLE IF NOT EXISTS documents ( \
          id serial PRIMARY KEY, \
          key varchar, \
          value text \
        )"
        query(create, callback)
      }

      function table(name) {
        return knex(name)
      }

      function query(queryString, callback) {

        if (!client) {
          return connect(function() {
            query(queryString, callback) // retry
          })
        }

        if (!callback) {
          throw new Error('Tried to run query ' + queryString + ' without providing a callback')
        }

        // console.log('%% query', queryString)
        client.query(queryString, function(err, result) {
          callback(result)
        })
      }

      return {table: table, query: query}
    })
