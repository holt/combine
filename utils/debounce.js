/* jshint bitwise:true, curly:false, eqeqeq:true, forin:true, immed:false, 
latedef:true, newcap:true, noarg:true, noempty:false, nonew:true, plusplus:false, 
regexp:false, undef:true, unused:vars, strict:false, trailing:false, asi:false, 
boss:true, debug:false, eqnull:false, es5:false, esnext:false, evil:false, expr:true, 
funcscope:true, globalstrict:false, iterator:false, lastsemic:false, laxbreak:true, 
laxcomma:true, loopfunc:false, multistr:false, onecase:false, proto:false, 
regexdash:false, scripturl:false, smarttabs:true, shadow:false, sub:false, esnext:true,
supernew:false,  browser:true, couch:false, devel:false, dojo:false, jquery:true, 
mootools:false, node:false, nonstandard:false, prototypejs:false, rhino:false, strict:false,
wsh:false, nomen:false, onevar:false, passfail:false, white:true, indent:4 */

// Lifted from Underscore
var debounce = function (func, wait, immediate) {
    var timeout, args, context, timestamp, result;
    return function () {
        context = this;
        args = arguments;
        timestamp = new Date();
        var later = function () {
            var last = (new Date()) - timestamp;
            if (last < wait) {
                timeout = setTimeout(later, wait - last);
            } else {
                timeout = null;
                if (!immediate) result = func.apply(context, args);
            }
        };
        var callNow = immediate && !timeout;
        if (!timeout) {
            timeout = setTimeout(later, wait);
        }
        if (callNow) result = func.apply(context, args);
        return result;
    };
};

module.exports = debounce;