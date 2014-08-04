requirejs = require('requirejs')

requirejs(['server'], function(server) {
  console.log('hola!')
  server.use(server.static('.'))

  server.get('/', function(xxxx, response) {
    response.sendfile('./edit.html')
  })
})
