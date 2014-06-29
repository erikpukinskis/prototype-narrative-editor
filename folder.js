
library.give('folder', function() {
  var fs = require('fs')

  return {
    write: function(filename, content) {
      var path = '../narrative-build/'
      if (!fs.existsSync(path)) {
        fs.mkdirSync(path)
      }
      fs.writeFileSync(path + filename, content)
    },
    read: function(filename) {
      if (fs.existsSync(filename)) {
        return fs.readFileSync(filename).toString()
      }
    },
    copy: function(filename, destination) {
      path = destination + '/' + filename
      console.log('copying ' + filename + ' to ' + destination)
      fs.createReadStream(filename).pipe(fs.createWriteStream(path))
    }
  }    
})