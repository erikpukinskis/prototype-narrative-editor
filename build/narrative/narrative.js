requirejs = require('requirejs')

requirejs(['server', 'require'], function(server) {
  console.log('hola!')
  server.use(server.static('.'))

  server.get('/', function(xxxx, response) {
    response.sendfile('./edit.html')
  })
})
