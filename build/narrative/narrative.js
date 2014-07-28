requirejs = require('requirejs') 
 
requirejs(['server', 'editor'], function(server, editor) { 
  console.log('hola!') 
  server.use(server.static('.')) 
 
  server.get('/', function(xxxx, response) { 
    response.sendfile('./edit.html') 
  }) 
}) 
