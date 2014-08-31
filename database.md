Database
--------

A wrapper for knex with an upsert extension. `database.js`

    define(function() {
      var url = process.env.DATABASE_URL || 'postgres://erik:@localhost/data'

      var database = require('knex')({
        client: 'pg'
      })

      database.upsert = function(attributes) {
        var insert = 'insert into "documents" ("key", "value") SELECT "key", "value"'

        var update = database('documents')
          .where({key: attributes.key})
          .update(attributes)
          .toQuery()

        var upsert = "WITH upsert \
          AS (" + update + " RETURNING *) \
          " + insert + " \
          WHERE NOT EXISTS (select * FROM upsert)"

        return {update: update, insert: insert, toQuery: function() { return upsert }}
      }

      return database
    })
