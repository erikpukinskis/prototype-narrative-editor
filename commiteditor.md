! Commit Editor

`commiteditor.js`:

    define(['dom'], function(dom) {
      var form = dom.form
      var input = dom.input

      function Editor(selector) {
      }

      Editor.prototype.bind = function(selector) {
        var html = form({id: 'commit'}, [
          input({type: 'submit', value: 'Commit'}),
          input({type: 'text', placeholder: 'What are you changing?'})
        ])
        var el = this.el = $(html)
        el.submit(function() {
          console.log(el.find('input[type=text]').val())          
          return false
        })
        $(selector).append(el)
      }

      Editor.prototype.dirty = function() {
        this.el.addClass('dirty')
      }

      return Editor
    })