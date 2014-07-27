define([], function() { 


  var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
  var FN_ARG_SPLIT = /,/;
  var FN_ARG = /^\s*(_?)(\S+?)\1\s*$/;
  var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
  function anonFn(fn) {
    // For anonymous functions, showing at the very least the function signature can help in
    // debugging.
    var fnText = fn.toString().replace(STRIP_COMMENTS, ''),
        args = fnText.match(FN_ARGS);
    if (args) {
      return 'function(' + (args[1] || '').replace(/[\s\r\n]+/, ' ') + ')';
    }
    return 'fn';
  }
  function annotate(fn, strictDi, name) {
    var $inject,
        fnText,
        argDecl,
        last;
    if (typeof fn == 'function') {
      if (!($inject = fn.$inject)) {
        $inject = [];
        if (fn.length) {
          if (strictDi) {
            if (!isString(name) || !name) {
              name = fn.name || anonFn(fn);
            }
            throw new Error('{0} is not using explicit annotation and cannot be invoked in strict mode');
          }
          fnText = fn.toString().replace(STRIP_COMMENTS, '');
          argDecl = fnText.match(FN_ARGS);
          argDecl[1].split(FN_ARG_SPLIT).forEach(function(arg){
            arg.replace(FN_ARG, function(all, underscore, name){
              $inject.push(name);
            });
          });
        }
        fn.$inject = $inject;
      }
    } else if (isArray(fn)) {
      last = fn.length - 1;
      assertArgFn(fn[last], 'fn');
      $inject = fn.slice(0, last);
    } else {
      assertArgFn(fn, 'fn', true);
    }
    return $inject;
  }

  return annotate
})
