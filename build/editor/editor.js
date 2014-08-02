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

define({
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
})
