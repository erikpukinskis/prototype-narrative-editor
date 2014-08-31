Database
--------

A wrapper for knex with an upsert extension. `database.js`

    define(function() {
      var url = process.env.DATABASE_URL || 'postgres://erik:@localhost/data'

      var database = require('knex')({
        client: 'pg'
      })

      return database
    })
