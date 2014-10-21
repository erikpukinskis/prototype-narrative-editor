Editor
------

This goes in `editor.js`:


    define(['underscore', 'react'], function(_, React) {

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

      function lineSplitAtCursor(string, cursor) {   
        return {
          before: string.slice(0,cursor.column),
          after: string.slice(cursor.column, string.length)
        }
      }


      function lineToHtml(line, cursor) {
        var _this = this
        var html = line.string
        var isProse = line.kind == 'prose'

        function addHeadings(line) {
          var exclamation = /^(####CURSOR####|)(!)(####CURSOR####|)(.*)$/

          function withH1(xxxx, cursor, marker, otherCursor, line) {
            return '<h1>' + cursor + '<span class="marker">' + 
              marker + '</span>' + otherCursor + line + '</h1>'
          }

          return line.replace(exclamation, withH1)
        }

        function markCursor() {
          var parts = lineSplitAtCursor(line.string, cursor)
          return parts.before + '####CURSOR####' + parts.after
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

        if (cursor) {
          html = markCursor(html)
        }

        html = escapeHtml(html)

        if (isProse) {
          html = noteTicks(addHeadings(html))
        }

        html = html.replace('####CURSOR####', '<div class="cursor"></div>')

        return '<span class="line-number">' + line.number + '</span>' + html
      }

      function moveCursor(columnsToMove, linesToMove) {
        return function() {
          var cursor = this.state.cursor
          var line = cursor.line + linesToMove
          line = limit(line, 0, this.state.lines.length - 1)

          var column = cursor.column + columnsToMove
          column = limit(column, 0, this.getLine(cursor.line).length)

          this.setState({cursor: {line: line, column: column}})
          
          scrollToReveal('.cursor')
        }
      }



      var Line = React.createClass({
        displayName: 'Line',
        render: function() {
          var line = this.props
          var html = lineToHtml(line, this.props.cursor)

          return React.DOM.div({
            id: 'line-'+line.number,
            className: 'line '+line.kind,
            dangerouslySetInnerHTML: {__html: html}
          })
        }
      })

      var Editor = React.createClass({
        displayName: 'Editor',
        componentDidMount : function() {
          $.ajax({
            url: '/narratives/' + this.props.name,
            dataType: 'json',
            success: function(doc) {
              console.log(doc)
              this.setState(doc)
            }.bind(this)
          })
          setInterval(this.loadCommentsFromServer, this.props.pollInterval)
        },
        getInitialState: function() {
          return {
            cursor: {line: 0, column: 0},
            lines: []
          }
        },
        render: function() {
          var cursor = this.state.cursor
          return React.DOM.div({className: "narrative"}, 
            this.state.lines.map(function (line, number) {
              line.number = number
              if (cursor.line == number) {
                line.cursor = cursor
              }
              return Line(line)
            })
          )
        },



        getLine: function(line) {
          return this.state.lines[line].string || ''
        },

        mergeDown: function() {
          var string = this.getLine(cursor.line) + this.getLine(cursor.line+1)
          var newLine = this.state.lines[cursor.line]
          newLine.string = string

          this.state.lines.splice(cursor.line, 2, thisLine)
          this.setState({lines: this.state.lines})
        }, 

        lineSplitAtCursor: function() {
          var cursor = this.state.cursor       
          var string = this.getLine(cursor.line)
          return lineSplitAtCursor(string, cursor)
        },
       

        // COMMANDS

        right: moveCursor(1,0),

        left: moveCursor(-1,0),

        down: moveCursor(0,1),

        up: moveCursor(0,-1),

        backspace: function() {
          var cursor = this.state.cursor
          var parts = this.lineSplitAtCursor()
          var atBeginningOfLine = parts.before.length < 1

          function moveToTheEndOfTheLine() { 
            var column = this.getLine(cursor.line).length
            this.setState({cursor: {column: column}})
          }

          if (atBeginningOfLine) {
            if (this.state.cursor.line > 0) {
              this.up()
              moveToTheEndOfTheLine()
              this.mergeDown()
            } else {
              // We are at the beginning of the document
            }
          } else {
            var string = parts.before.slice(0, -1) + parts.after
            this.state.lines[cursor.line].string = string
            this.setState({lines: this.state.lines})
            this.left()
          }
        },

        type: function(letter) {
          if (letter.length < 1) { return }
          var parts = this.lineSplitAtCursor()
          var string = parts.before.concat(letter, parts.after)

          this.state.lines[this.state.cursor.line].string = string
          this.setState({lines: this.state.lines})
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



