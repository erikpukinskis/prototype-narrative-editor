Scroll To Reveal
----------------

X `scrolltoreveal.js`:
`library scrolltoreveal.js
    define(function() {
      return function scrollToReveal(selector) {
        MINIMUM = 50

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
    })