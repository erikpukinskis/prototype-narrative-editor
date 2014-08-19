Migrate
-------

    exports.up = function(knex, Promise) {
      return knex.schema.createTable('posts', function(t) {
        t.increments().primary();
        t.string('title').notNull();
        t.text('description').notNull();
        t.dateTime('created_at').notNull();
        t.dateTime('updated_at').nullable();
      });
    };

    exports.down = function(knex, Promise) {
      return knex.schema.dropTable('posts');
    };

    
    pending = initKnex(env).migrate.make(name, {extension: ext}).then(function(name) {
      success(chalk.green('Created Migration: ' + name));
    }).catch(exit);