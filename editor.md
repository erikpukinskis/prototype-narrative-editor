Editor
------

This goes in `editor.js`:

    define(['underscore', 'scrolltoreveal', 'dom'], function(_, scrollToReveal, dom) {
      var div = dom.div

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

      function limit(number, min, max) {
        number = Math.min(number, max)
        number = Math.max(number, min)
        return number
      }

      function whenIStopAskingYouTo(callback) {
        if (callback.requested) {
          callback.requestedAgain = true
        } else {
          callback.requested = setTimeout(sleep, 500)
        }

        function sleep() {
          if (callback.requestedAgain) { 
            callback.requestedAgain = false
            callback.requested = setTimeout(sleep, 500)
            return
          }
          callback.requested = null
          callback()
        }
      }      

      function renderLineWithCursor(line, cursor) {
        var cursorHtml = div({'class': 'cursor'})

        if (cursor.column == 0) {
          var html = lineToHtml(line.string, line.kind)
          return html.replace(/^(<[^>]*>|)/, '$1'+cursorHtml)
        }
        var parts = splitLine(line.string, cursor.column)
        var string = parts.before + '<<CURSOR>>' + parts.after
        return lineToHtml(string, line.kind).replace('&lt;&lt;CURSOR&gt;&gt;', cursorHtml)
      }

      function Editor(lines, saveCallback) {
        var cursor = this.cursor = {line: 0, column: 0}

        function getLine(line) {
          return lines[line].string || ''
        }

        var dirtyLines = new Set()
        var updateTimeout
        function syncStaticAndAbsoluteElements() {
          dirtyLines.forEach(function(dirty) {
            var html = lineToHtml(dirty.string, dirty.kind)
            $('.line-'+dirty.id+' .static').html(html)
          })
          dirtyLines.clear()
          updateTimeout = null
        }


        // Data model 

        function setLine(number, string) {
          var line = lines[number]
          line.string = string
          dirtyLines.add(line)
          if (updateTimeout) { return }
          updateTimeout = setTimeout(syncStaticAndAbsoluteElements, 100)
        }

        function splice() {
          Array.prototype.splice.apply(lines, arguments)
        }

        function deleteLine(number) {
          var line = lines[number]
          splice(number, 1)
          $('.line-'+line.id).remove()
        }

        function mergeDown() {
          var string = getLine(cursor.line) + getLine(cursor.line+1)
          setLine(cursor.line, string)
          deleteLine(cursor.line+1)
        }

        function saveNow() {
          saveCallback(lines)
        }

        // This syncs with the server, usually after a setLine, 
        // deleteLine, or splice
        function save() {
          whenIStopAskingYouTo(saveNow)
        }

        function move(columnsToMove, linesToMove) {
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

        function presetMove(columns, lines) { 
          return function() {
            move(columns, lines)
          }
        }

        var counter = 28846
        function renderLine(line) {
          if (!line.id) { line.id = (counter++).toString(36) }
          var lineClass = 'line line-'+line.id+' '+line.kind
          return div({'class': lineClass}, [
            div({'class': 'absolute'}, ''),
            div({'class': 'static'}, lineToHtml(line.string, line.kind))
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

          move: move,

          right: presetMove(1,0),

          left: presetMove(-1,0),

          down: presetMove(0,1),

          up: presetMove(0,-1),

          backspace: function() {
            var parts = this.lineSplitAtCursor()

            function moveToTheEndOfTheLine() { 
              cursor.column = getLine(cursor.line).length
            }

            if (cursor.column == 0) {
              if (cursor.line > 0) {
                this.up()
                moveToTheEndOfTheLine()
                mergeDown()
                activate(cursor.line)
                save()
              } else {
                // We are at the beginning of the document
              }
            } else {
              this.left()
              var string = parts.before.slice(0, -1) + parts.after
              setLine(cursor.line, string)
              activate(cursor.line)
              save()
            }
          },

          type: function(letters) {
            if (letters.length < 1) { return }
            var parts = this.lineSplitAtCursor()
            var string = parts.before.concat(letters, parts.after)
            setLine(cursor.line, string)
            this.move(letters.length, 0)
            activate(cursor.line)
            save()
          },

          enter: function() {
            var parts = this.lineSplitAtCursor()
            var line = lines[cursor.line]
            var kind = line.kind

            var firstHalf = {string: parts.before, kind: kind}
            var secondHalf = {string: parts.after, kind: kind}

            splice(cursor.line, 1, firstHalf, secondHalf)

            cursor.line = cursor.line + 1
            cursor.column = 0

            $('.line-'+line.id).remove()

            var html = renderLine(firstHalf) + renderLine(secondHalf)

            if (cursor.line > 1) {
              var previousId = lines[cursor.line - 2].id
              $(html).insertAfter('.line-'+previousId)
            } else {
              $('.narrative').append(html)
            }
            activate(cursor.line)
            save()
          },

          indent: function() {
            var line = lines[cursor.line]
            line.kind = 'code'
            var el = $('.line-'+line.id)
            el.removeClass('prose')
            el.addClass('code')
            save()
          },

          unindent: function() {
            var line = lines[cursor.line]
            line.kind = 'prose'
            var el = $('.line-'+line.id)
            el.removeClass('code')
            el.addClass('prose')
            save()
          },

          bind: function(selector) {
            lines.forEach(function(line) {
              line.id = null
              $(selector).append(renderLine(line))
            })
            activate(0)
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

There's a light gray cursor with a tappable tab on top of it that is at the beginning of each world that brings the cursor there. If you drag it up it selects multi-cursor lines above it. You can hover at a spot and it will put that line's cursor there, or just drag over multiple lines and the editor will try to guess what you're highlighting. It tries for straight columns and then goes to punctuation and then whatever. The editor should lead people step by step into advanced usage. These features can be organized in a tree of interactions off the base view.

Each level of the architecture adds DOM structures and can style those structures, but only the structures at that level and above are visible. So at the top level (the UI) it's just the characters and the pipe. One layer down the cursor might have its line,column coordinates, lines have numbers, etc.


