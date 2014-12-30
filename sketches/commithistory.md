Maybe we should be able to do something like this:

! Commit editor

Has a `client widget`:

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

      function commit() {
        var el = this.el
        var message = el.find('input[type=text]').val()
        $.ajax({
          method: 'POST',
          contentType: "application/json",
          url: '/commits',
          data: {name: this.name, message: message},
          success: function() {
            console.log('back from commit!')
            el.removeClass('dirty')
          }
        })          
        return false
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

And a `stylesheet`:

    #commit {
      position: fixed;
      right: 3px;
      z-index: 1;
      bottom: -40px;
      transition: bottom 400ms;
    }

And there is a `server route at /commits`

    define(function() {
      var repo = new Repo()...

      return function(request, response) {

      }
    })