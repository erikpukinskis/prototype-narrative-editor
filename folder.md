Folder
------

    library.give('folder', function() {
      return {
        write: function(filename, content) {
            exec("mkdir -p ../narrative-build", function() {
              fs.writeFile('../narrative-build/' + filename, content, callback)
            })
        },
        copy: function(filename, directory) {
          fs.createReadStream(filename)
            .pipe(fs.createWriteStream(directory + '/' + filename));
        }
      }
    })
