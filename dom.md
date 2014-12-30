! Dom

`dom.js`:

    define(function() {
      function tagRenderer(tag, options) {
        options = options || {}

        return function() {
          var attributesWereGiven = !!(typeof arguments[0] == 'object')

          if (attributesWereGiven) {
            var attributes = arguments[0]
            var contents = arguments[1] || ''
          } else {
            var attributes = {}
            var contents = arguments[0] || ''
          }

          if (contents.join) { contents = contents.join('') }

          var html = '<' + tag

          for(attribute in attributes) {
            html += ' ' + attribute + '="' + attributes[attribute] + '"'
          }

          html += '>' + contents

          if (options.close !== false) {
            html = html + '</' + tag + '>'
          }

          return html
        }
      }

      return {
        div: tagRenderer('div'),
        button: tagRenderer('button'),
        form: tagRenderer('form'),
        input: tagRenderer('input', {close: false})
      }
    })
