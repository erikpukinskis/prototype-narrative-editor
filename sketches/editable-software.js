// Editable Software

// Software can make things easy and it can make things hard.

// Because that can mean a big difference sometimes, people should be able to change the software they use.

// Let's make an app that a person could stumble across, read the code, change a word, and have that reflected in a new instance of the software.





// Chapter 1

// Component Host
// Makes a component accessible to a web browser

// First, what's a component? A component is a bundle pieces of code that work together to do something on a computer. Let's describe a really simple component—a web page that says "Hello, world!":

var helloWorldComponent = {
  template: [
    element("Hello, world!")
  ]
}

// One of the kinds of code a component can have is a template. Templates generate HTML that a web browser could read. Elements are the building block of an HTML page, so templates are made of elements.

// We can give the component host our new Hello, world component and it will make it accessable in the web! Let's test that out:

with(
  ["component-host", "chai"],
  function(Host, chai) {

    var expect = chai.expect

    // Chai is a component that lets you set some expectations, and it tells you whether they seem to be true. We can use it to test whether the component host is working the way we are expecting.

    // In our case, if we create a new host and put our helloWorldComponent in it...

    host = new Host()
    host.put("hello_world", helloWorldComponent)

    // We expect that when we try to get the Hello, world page, it has our message in it:

    host.get(
      "hello_world", 
      function(page) {
        expect(page).to.contain("world!")
      }
    )
  }
)

// So let's define how the code for that works.

define("component-host", function() {
  function ComponentHost() {

    // We need a database to store stuff in. And we 
    this.init("database", SecureDatabase)

    this.route("put", ":name", saveComponent)

    var shows = new SetOfShows()
    shows.add("html-page", htmlPage)

    this.route(
      "get", 
      ":name",
      shows.middleware("html-page")
    )
  }

  extend(ComponentHost.prototype, Server.prototype)

  return ComponentHost
})

// component runner - Puts with, describe, and extend in scope

// app.show

// module.show - makes a module available to the client








// Chapter 2

// Docker Booter

// Provisions a computer and boots a component

define.component(
  "docker-booter", 
  ["docker-image"], 
  function(component, DockerImage) {

    function deployImage(component, params) {
      image = show "docker_image"
      instance = provision(secret, image)
      instance.syncs.create(
        params.starterKit)
      })
    }

    component.show("docker-image", DockerImage.show)

    this.route(
      "get", 
      ":name",
      shows.middleware("html-page")


    var deploy = component.route("post", "deploys", deployImage)

    component.template([
      element "input", "secret"
      element "input", "starterKit", "http://narrativejs.com/starter_kit"
      element "button", "Deploy", deploy
    ])
  }
)

// docker_image.show

    class DockerImage

    image = new DockerImage
      package.json:
        dependencies: 
           "express"
           "couch"
           "narrative_host"
      boot.sh:
         node boot.js
      boot.js:
          couch.start()
          host.start()

// provision.app

  exports : (secret, image) ->
    class Instance
       post: ->
    return new Instance

// boot_component.app





// Chapter 3

// Secure Database

// couch.app

// couch.set - writes a document to couchdb

// couch.start

// auth.app





// Chapter 4

// Narrative Editor

// edit_narrative.app




// Chapter 5

// Web Server

// The server should write out an HTML page through HTTP:

with (
  ["server", "chai", "unirest"], 
  function(Server, chai, unirest) {
    var expect = chai.expect

    var server = new Server()
    server.start()

    var hi = function(req, res) {
      res.send("Hello, world!")
    })

    server.route("get", "hiya", hi)

    function expectTheWorld(page) {
      expect(page).to.contain("world!")
    }

    unirest.get(server.url+"/hiya")
    .end(expectTheWorld)

    // we want to be able to grab it programmatically too

    server.get("hiya", expectTheWorld)

    // and there should be update:

    expect(server.put).to.be.defined()
  }
)

define("server", function() {  
  function Server() {}
  extend(Server.prototype, {
    init: function(name, initializer) {}
    route: function(verb, path, middleware) {}
  })

  return Server
})





// Chapter 6

// Example Apps

// blog.app

template:
   if editing
      richTextEditor post
    else
      post

