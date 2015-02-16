! Commit Editor

X `commiteditor.js`:
`library commiteditor.js
    define(['dom'], function(dom) {
      var form = dom.form
      var input = dom.input

      function Editor(name) {
        this.name = name
      }

      function renderHtml() {
        return form({id: 'commit'}, [
          input({type: 'submit', value: 'Commit'}),
          input({type: 'text', placeholder: 'What are you changing?'})
        ])
      }

      function commit(event) {
        var el = this.el
        var message = el.find('input[type=text]').val()

        $.ajax({
          method: 'POST',
          contentType: "application/json",
          url: '/commits',
          data: JSON.stringify({name: this.name, message: message}),
          success: function() {
            el.removeClass('dirty')
          }
        })

        event.preventDefault()
      }

      Editor.prototype.bind = function(selector) {
        var el = this.el = $(renderHtml())
        el.on('submit', $.proxy(commit, this))
        $(selector).append(el)
      }

      Editor.prototype.dirty = function() {
        this.el.addClass('dirty')
      }

      return Editor
    })