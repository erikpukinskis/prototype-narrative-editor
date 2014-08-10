Documents
---------

    define(['knex'], function(knex)) {
      var pg = knex({
        client: 'pg',
        connection: process.env.DATABASE_URL
      })
      return pg
    })
