var requirejs = require('requirejs')

requirejs(['server', 'require'], function(server) {
  server.use(server.static('.'))

  server.get('/', function(xxxx, response) {
    response.sendfile('./edit.html')
  })

  server.post('/narratives', function(request, response) {
    console.log(request.body.name)
    console.log(request.body.lines)
    response.json({ok: 'yup'})
  })
})
