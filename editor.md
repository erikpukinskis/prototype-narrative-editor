Editor
------

This goes in `editor.js`:


    define(['underscore'], function(_) {

      function Editor(lines) {
        var cursor = this.cursor = {line: 0, column: 0}

        function getLine(line) {
          return lines[line].get('string') || ''
        }

        function mergeDown() {
          var string = getLine(cursor.line) + getLine(cursor.line+1)
          lines[cursor.line].set('string', string)
          lines.splice(cursor.line+1, 1)
        }

        function scrollToReveal(selector) {
          MINIMUM = 50

          function scrollTowards(edge) {
            var distance = distanceTo(edge, selector)
            if (distance > MINIMUM) { return }

            function directionTowards(edge) {
              return edge == 'bottom' ? 1 : -1
            }

            var offset = distance - MINIMUM
            var direction = directionTowards(edge)
            var newPosition = $('body').scrollTop() - direction * offset

            $("html,body").scrollTop(newPosition)
          }

          scrollTowards('bottom')
          scrollTowards('top')        
        }

        function distanceTo(edge, selector) {
          var cursorEl = $(selector)[0]
          if (!cursorEl) { return }
          if (edge == 'bottom') {
            var direction = 1
            var start = window.innerHeight
          } else if (edge == 'top') {
            var direction = -1
            var start = 0
          }

          return start - direction * cursorEl.getBoundingClientRect()[edge]
        }

        function limit(number, min, max) {
          number = Math.min(number, max)
          number = Math.max(number, min)
          return number
        }

        function moveCursor(columnsToMove, linesToMove) {
          return function() {
            var line = cursor.line + linesToMove
            var linesToRender = [cursor.line, line]
            line = limit(line, 0, lines.length - 1)
            cursor.line = line

            var column = cursor.column + columnsToMove
            column = limit(column, 0, getLine(cursor.line).length)
            cursor.column = column
            console.log('cursor: ', cursor.line, cursor.column)

            linesToRender.forEach(function(lineNumber) {
              lines[lineNumber].render()
            })

            scrollToReveal('.cursor')
          }
        }

        _(this).extend({
          lineSplitAtCursor: function() {          
            var string = getLine(cursor.line)
            return {
              before: string.slice(0,cursor.column),
              after: string.slice(cursor.column, string.length)
            }
          },

          right: moveCursor(1,0),

          left: moveCursor(-1,0),

          down: moveCursor(0,1),

          up: moveCursor(0,-1),

          backspace: function() {
            var parts = this.lineSplitAtCursor()
            var atBeginningOfLine = parts.before.length < 1

            function moveToTheEndOfTheLine() { 
              cursor.column = getLine(cursor.line).length
            }

            if (atBeginningOfLine) {
              if (cursor.line > 0) {
                this.up()
                moveToTheEndOfTheLine()
                mergeDown()
              } else {
                // We are at the beginning of the document
              }
            } else {
              var string = parts.before.slice(0, -1) + parts.after
              lines[cursor.line].set('string', string)
              this.left()
            }
          },

          type: function(letter) {
            if (letter.length < 1) { return }
            var parts = this.lineSplitAtCursor()
            var string = parts.before.concat(letter, parts.after)

            lines[cursor.line].set('string', string)
            this.right()
          },

          enter: function() {
            throw new Error('not yet')
            var cursor = this.get('cursor')
            var parts = this.lineSplitAtCursor()
            var kind = this.get('model')[cursor.line].kind
            var linesAfter = this.get('model').slice(cursor.line)
            linesAfter.unshiftObject({string: parts.before, kind: kind})
            linesAfter[1] = {string: parts.after, kind: kind}
            this.get('model').replace(cursor.line, cursor.line + linesAfter.length + 1, linesAfter)
            this.incrementProperty('cursor.line')
            this.set('cursor.column', 0)
          }
        })
      }

      return Editor

    })

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



