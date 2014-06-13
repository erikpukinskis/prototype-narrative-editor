Data
----

Level: 2

In order to store some stuff, you want a server that can key some values!

I'm doing this so I can store some fonts so I can change the font in Narrative. I'm also doing it so I can store browserified npm modules, which you can follow along [here](browserifier.js). There should be a breadcrumb over there too (a prompt to help me remember where I left off).

We start off with a `server.js`:

    var app = require("express").express();
    var sql = require("sql")

    app.get('/:key', function(request, response) {
      response.send('');
    });

    app.post('/:key', function(request, response) {
      response.send('');
    });

    var port = Number(process.env.PORT || 5000);
    
    app.listen(port, function() {
      console.log("Listening on " + port);
    }); 

And a `Procfile`:

    web: node server.js

Table
-----

This one needs some migrations. This is Javascript, and we like us some frameworks, but there aren't always frameworks for everything. Rails tries to have an opinion about everything, but Javascript wants you to have some opinions for yourself.

Let's use Node! `migrate.js`:

    var pg = require('pg').native;
    var sql = require('sql');

    var client = new pg.Client(
      process.env.DATABASE_URL || 'postgres://localhost:5432/data')
    );
    client.connect();

    client
      .query('CREATE TABLE things (id serial PRIMARY KEY, key )')
      .on('end', function() { 
        client.end(); 
      });

How to install
--------------

This one is a little more involved. 

Run this to create the app:

    $ heroku create lovely-data

Start the database addon

    $ heroku addons:add heroku-postgresql



You'll have to choose a name of your own. And then finally "push" the code to Heroku, so they can set it up on the web:

    git push heroku master
