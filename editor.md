Editor
------

This goes in `editor.js`:

    var moveCursor = function(columns, lines) {
      return function() {
        var column = this.get('cursor.column') + columns
        var line = this.get('cursor.line') + lines
        if (column >= 0) {
          this.set('cursor.column', column)
        }
        if (line >= 0) {
          this.set('cursor.line', line)
        }
      }
    }

    define(['ember', 'underscore'], function(ember, underscore) {
      var _ = underscore
      return {
        template: Ember.Handlebars.compile('{{focus-input editor=controller}}{{html}}'),

        classNames: ['narrative'],

        cursor: {line: 0, column: 0},

        right: moveCursor(1,0),

        left: moveCursor(-1,0),

        down: moveCursor(0,1),

        up: moveCursor(0,-1),

        indent: function() {          
          var cursorLine = this.get('cursor.line')
          var property = ['model', cursorLine, 'kind'].join('.')
          this.set(property, 'code')
        },

        lineProperty: function(line) {
          if (!line || (line == Cursor)) {
            line = this.get('cursor.line')
          }

          return ['model', line, 'string'].join('.')
        },

        getLine: function(line) {
          return this.get(this.lineProperty(line));
        },

        setLine: function(line, string) {
          this.set(this.lineProperty(line), string)
        },

        lineSplitAtCursor: function() {          
          var string = this.getLine(Cursor)
          var cursor = this.get('cursor')

          return {
            before: string.slice(0,cursor.column),
            after: string.slice(cursor.column, string.length)
          }
        },

        mergeDown: function() {
          var line = this.get('cursor.line')
          var string = this.getLine(line) + this.getLine(line+1)
          this.setLine(line, string)
          this.removeAt(line+1,1)
        },

        backspace: function() {
          var _this = this;
          var cursor = this.get('cursor')
          var parts = _this.lineSplitAtCursor()
          if (parts.before.length < 1) {
            if (cursor.line > 0) {
              this.decrementProperty('cursor.line')
              var previousLine = this.getLine()
              this.set('cursor.column', previousLine.length)
              this.mergeDown(cursor.line - 1)
            }           

          } else {
            var string = parts.before.slice(0, -1) + parts.after
            _this.setLine(Cursor, string)
            _this.left()
          }
        },

        type: function(letter) {
          if (letter.length < 1) { return }
          var cursor = this.get('cursor')
          var parts = this.lineSplitAtCursor()
          var string = parts.before.concat(letter, parts.after)

          this.setLine(Cursor, string)
          this.right()
        },

        enter: function() {
          var cursor = this.get('cursor')
          var parts = this.lineSplitAtCursor()
          var kind = this.get('model')[cursor.line].kind
          var linesAfter = this.get('model').slice(cursor.line)
          linesAfter.unshiftObject({string: parts.before, kind: kind})
          linesAfter[1] = {string: parts.after, kind: kind}
          this.get('model').replace(cursor.line, cursor.line + linesAfter.length + 1, linesAfter)
          this.incrementProperty('cursor.line')
          this.set('cursor.column', 0)
        },

        html: function() {
          var _this = this
          var strings = this.get('model')
          var cursor = this.get('cursor')
          var htmlLines = _(strings).map(function(line, lineNumber) {
            var html
            if (lineNumber == cursor.line) {
              var parts = _this.lineSplitAtCursor()
              html = parts.before + '<div class="cursor"></div>' + parts.after
            } else {
              html = line.string
            }

            var classes = ['line', line.kind]
            classes = classes.join(' ')
            return '<div class="' + classes + '">' + html + '</div>'
          })
          
          var html = htmlLines.join("\n")

          Ember.run.next(function() {
            EXTRA = 50
            var distance = distanceFromBottomToCursor()
            if (distance < EXTRA) {
              $("html,body").animate({scrollTop: $('body').scrollTop() - distance + EXTRA}, 0)
            }
          })
          return Ember.String.htmlSafe(html)
        }.property('model.@each', 'model.@each.string', 'model.@each.kind', 'cursor.line', 'cursor.column'),
      }
    })

It's an Ember Component so you can do:




Ideas for the future
====================

When you write code, it is hashed with the hashes of its dependencies and stored. Whenever there is an interaction with the running server, it is hashed with the hash of the server. Subsequent interactions are hashed with the hash, forming a long chain. 

When you "change" the file, you're actually just forking it and starting a new branch of interactions. When you're in the editor, you will see the branch actually fall away below and a new viewer appear. You'd also see the chain of interactions nearby somehow, and you'd be able to replay then. Maybe a literal draggable chain that you can break/edit and drop onto the viewer. I know, pretty 90s right?

Here's what I really wanted to get down though:

We definitely should not use medium-editor. This needs to be a fully custom, fully integrated editing experience. You should simply be able to write the word lib( and you'll be in a function. And you type code until you want to stop, and you type # to break out. And you can break out at any indentation level and the comments will be indented just the same.

Other random idea: Each depth should be a different color. 

When you hit tab, you go from serif mode into code mode.

As we are typing words, Narrative is continually searching for keywords:

    keywords = [
      'a book',
      'book named wanda',
      'the book a book',
      'ThinkPad',
      'thinking is',
      'thinkper'
    ]

We need some sort of function that makes the grid:

    makeGrid = function() {

    }

I think I wrote a book named|
  ThinkPad      a book
  thinking is     book named wanda
  thinker     the book a book

And those search results would get dimmer as you got further away. And they wouldn't stay on the screen long unless you arrow-keyed down into them.

When you type library.give it explains to you what that is. It shows you the first line of the library.give narrative! And that links to it! And if you just press the right arrow after it auto-completes it, you just gracefully slide over to the full document. The first line can be bigger font so when it's a little smaller because it's further back in the z-axis, the font actually just looks normal size. Then when you rightarrow over to it, it zooms to full size while the rest of the narrative fades in.



