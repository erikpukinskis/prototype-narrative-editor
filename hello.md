! Hello, world!

This is the simplest server you could imagine. It needs to know it lives in `center.js`:

    define('hello', ['server'], function(Server) {
      var server = new Server()
      server.get('/', function(xxxx,response) {
        response.send('hello world!')
      })
      return server
    })



With CSS:

! Hello, world!

This is the simplest server you could imagine. It needs to know it lives in `center.js`:

    define('hello', ['server', 'documents'], function(Server, documents) {
      var server = new Server()
      server.use(documents.api)
      server.get('/', function(xxxx,response) {
        response.send("<html><link rel='stylesheet' href='/documents/style.css' /><body>hello world!</body></html>")
      })
      return server
    })

And here is some css that goes in `style.css`:

    body { color: red }