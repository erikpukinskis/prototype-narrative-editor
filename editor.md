Editor
------

This goes in `editor.js`:


    define(['underscore'], function(_) {

      function lineToHtml(line) {
        var _this = this
        var html = line.string
        var isProse = line.kind == 'prose'

        function addHeadings(line) {
          var exclamation = /^(!)(.*)$/

          function withH1(xxxx, marker, line) {
            return '<h1><span class="marker">' + 
              marker + '</span>' + line + '</h1>'
          }

          return line.replace(exclamation, withH1)
        }

        function noteTicks(line) {
          var tickedCommands = /`([^`]+)`/
          function withWrapped(xxxx, command) {
            return '<span class="command">`' + command 
              + '`</span>'
          }
          return line.replace(tickedCommands, withWrapped)
        }

        var entityMap = {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': '&quot;',
          "'": '&#39;',
          "/": '&#x2F;'
        };

        function escapeHtml(string) {
          return String(string).replace(/[&<>"'\/]/g, function (s) {
            return entityMap[s]
          })
        }

        html = escapeHtml(html)

        if (isProse) {
          html = noteTicks(addHeadings(html))
        }

        return html
      }


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

        function div(classNames, contents) {
          if (contents.join) { contents = contents.join('') }
          return '<div class="' + classNames + '">' + contents + '</div>'
        }

        function createLine(line, number) {
          var html = div('line.line-1', [
            div('line-number', number),
            div('static', lineToHtml(line)),
            div('absolute', '')
          ])

          console.log(number)
          $('.narrative').append(html)
        }

        function activate(number) {
          var line = $('.line-'+number)
          line.addClass('active')
          // line.find('.absolute').html(renderLineWithCursor(lines[number], cursor))
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
          },

          init: function(selector) {
            lines.forEach(function(line, number) {
              createLine(line, number)
            })
            activate(0)
          }
        })
      }

      return Editor

    })

What should happen
------------------


Let's just think in terms of messages for a second.

render the first line number
render the first line
add those to the dom

render the second line number
render the second line
add those to the dom

....

    .line .absolute {
      position: absolute;
    }

    .line.active .absolute {
      display: block;
    }

    .line.active .static {
      visibility: hidden;
    }

    var cursor

    function renderLineWithCursor(text, cursor) {
      var parts = lineSplitAtCursor(text, cursor)
      return parts.before + div('cursor') + parts.after
    }

    function activate(number) {
      var line = $('.line-'+number+)
      line.addClass('active')
      line.find('.absolute').html(renderLineWithCursor(lines[number], cursor))
    }

    function init(lines) {
      lines.each(function(line, number) {
        createLine(line, number)
      })
      cursor = {line: 0, column: 0}      
      activate()
    }

    function down() {
      $('.line-'+number+)
    }

XXX [focus]

when I create a document with two lines

activate:
  set line one to visibility:hidden
  copy the node and re-render it with the cursor in the same spot with position:absolute
  note how tall it is

[press down]

set the static first line back to visibility:visible
hide the absolute one

move the cursor down

wait a few ms, then:
  activate the second one

[arrow right]

(it might make sense to get metrics on the whole line so we can move faster)
reRender(2)

[spacebar]

add a space to the line
reRender(2)
check if the height changed. If it did, re-render the static line

[enter]

remove second part of line
rerender the static line 2
render new line with second part of line
add it to the dom
activate the new line


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



