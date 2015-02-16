Folder
------

Reads, writes, and moves files. In `folder.js`:
`library folder.js
    console.log('above folder')
    define([], function() {
      console.log('in folder')
      var fs = require('fs')

      return {
        parts: function(path) {
          var match = path.match(/^(.*)\/([^\/]*)$/)
          if (!match) {
            return {dir: '.', filename: path}
          } else {
            return {dir: match[1], filename: match[2]}
          }
        },
        write: function(path, content) {
          var dir = this.parts(path).dir
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir)
          }
          indent('writing ' + path)
          fs.writeFileSync(path, content)
        },
        read: function(filename) {
          if (fs.existsSync(filename)) {
            return fs.readFileSync(filename).toString()
          }
        },
        copy: function(path, destination) {
          var parts = this.parts(path)
          var destinationPath = destination + '/' + parts.filename
          indent('copying ' + parts.filename + ' to ' + destination, 1)
          fs.createReadStream(path).pipe(fs.createWriteStream(destinationPath))
        }
      }  
    })
