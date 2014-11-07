Editor
------

[x] Enter key works
[x] Fix cursor bug
...
[ ] Get saving working again

This goes in `editor.js`:

    define(['underscore', 'scrolltoreveal'], function(_, scrollToReveal) {

      function splitLine(string, column) {
        return {
          before: string.slice(0,column),
          after: string.slice(column, string.length)
        }
      }

      function lineToHtml(string, kind) {
        var html = string
        var isProse = kind == 'prose'

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


      function renderLineWithCursor(line, cursor) {
        if (cursor.column == 0) {
          var html = lineToHtml(line.string, line.kind)
          return html.replace(/^(<[^>]*>|)/, '$1'+div('cursor'))
        }
        var parts = splitLine(line.string, cursor.column)
        var string = parts.before + '<<CURSOR>>' + parts.after
        return lineToHtml(string, line.kind).replace('&lt;&lt;CURSOR&gt;&gt;', div('cursor'))
      }

      function div(classNames, contents) {
        contents = contents || ''
        if (contents.join) { contents = contents.join('') }
        return '<div class="' + classNames + '">' + contents + '</div>'
      }


      function Editor(lines) {
        var cursor = this.cursor = {line: 0, column: 0}
        var dirtyLines = new Set()
        var updateTimeout

        function getLine(line) {
          return lines[line].string || ''
        }

        function syncStaticAndAbsoluteElements() {
          dirtyLines.forEach(function(dirty) {
            var html = lineToHtml(dirty.string, dirty.kind)
            $('.line-'+dirty.id+' .static').html(html)
          })
          dirtyLines.clear()
          updateTimeout = null
        }

        function setLine(number, string) {
          var line = lines[number]
          line.string = string
          dirtyLines.add(line)
          if (updateTimeout) { return }
          updateTimeout = setTimeout(syncStaticAndAbsoluteElements, 1000)
        }

        function deleteLine(number) {
          var line = lines[number]
          lines.splice(number+1, 1)
          $('.line-'+line.id).remove()
        }

        function mergeDown() {
          var string = getLine(cursor.line) + getLine(cursor.line+1)
          setLine(cursor.line, string)
          deleteLine(cursor.line+1)
        }

        function limit(number, min, max) {
          number = Math.min(number, max)
          number = Math.max(number, min)
          return number
        }

        function moveCursor(columnsToMove, linesToMove) {
          return function() {
            var previousId = lines[cursor.line].id
            var line = cursor.line + linesToMove
            line = limit(line, 0, lines.length - 1)

            if (cursor.line != line) {
              $('.line-'+previousId).removeClass('active')
              cursor.line = line
              activate(cursor.line)
            }

            var column = cursor.column + columnsToMove
            column = limit(column, 0, getLine(cursor.line).length)
            cursor.column = column

            activate(cursor.line)
            scrollToReveal('.line-'+lines[cursor.line].id)
          }
        }

        var counter = 28846
        function renderLine(line) {
          if (!line.id) { line.id = (counter++).toString(36) }
          return div('line line-'+line.id, [
            div('absolute', ''),
            div('static', lineToHtml(line.string, line.kind))
          ])
        }

        function activate(number) {
          var line = lines[number]
          var el = $('.line-'+line.id)
          el.addClass('active')
          var absolute = el.find('.absolute')
          absolute.html(renderLineWithCursor(line, cursor))
          absolute.css('width', el.width()+'px')
        }

        _(this).extend({
          lineSplitAtCursor: function() {
            return splitLine(getLine(cursor.line), cursor.column)
          },

          right: moveCursor(1,0),

          left: moveCursor(-1,0),

          down: moveCursor(0,1),

          up: moveCursor(0,-1),

          backspace: function() {
            var parts = this.lineSplitAtCursor()

            function moveToTheEndOfTheLine() { 
              cursor.column = getLine(cursor.line).length
            }

            if (cursor.column == 0) {
              if (cursor.line > 0) {
                moveToTheEndOfTheLine()
                this.up()
                mergeDown()
                activate(cursor.line)
              } else {
                // We are at the beginning of the document
              }
            } else {
              this.left()
              var string = parts.before.slice(0, -1) + parts.after
              setLine(cursor.line, string)
              activate(cursor.line)
            }
          },

          type: function(letters) {
            if (letters.length < 1) { return }
            var parts = this.lineSplitAtCursor()
            var string = parts.before.concat(letters, parts.after)

            setLine(cursor.line, string)
            this.right()
            activate(cursor.line)
          },

          enter: function() {
            var parts = this.lineSplitAtCursor()
            var line = lines[cursor.line]
            var kind = line.kind
            var previousId = lines[cursor.line - 1].id

            var firstHalf = {string: parts.before, kind: kind}
            var secondHalf = {string: parts.after, kind: kind}

            lines.splice(cursor.line, 1, firstHalf, secondHalf)

            cursor.line = cursor.line + 1
            cursor.column = 0

            $('.line-'+line.id).remove()

            $(renderLine(firstHalf) + renderLine(secondHalf)).insertAfter('.line-'+previousId)
            activate(cursor.line)
          },

          init: function(selector) {
            lines.forEach(function(line) {
              $('.narrative').append(renderLine(line))
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



