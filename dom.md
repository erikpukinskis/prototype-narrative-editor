! Dom

`dom.js`:

    define(function() {
      function div(classNames, contents) {
        contents = contents || ''
        if (contents.join) { contents = contents.join('') }
        return '<div class="' + classNames + '">' + contents + '</div>'
      }

      return {div: div}
    })
