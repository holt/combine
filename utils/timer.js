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

module.exports = (function () {

    var base, err, last, running, starterr, stoperr, tick;

    running = false;
    tick    = 0;
    last    = 0;
    base    = 0;
    
    err = {
        started: "The stopwatch is running; please stop it first.",
        stopped: "The stopwatch is stopped; please start it first."
    };

    starterr    = new Error(err.started);
    stoperr     = new Error(err.stopped);
    
    return {

        start: function () {

            if (running) throw starterr;
            
            running = true;
            tick    = 0;
            last    = 0;

            return base = (new Date()).getTime();
        },

        tick: function () {

            var a, b;

            if (!running) throw stoperr;

            b       = last;
            last    = a = (new Date()).getTime() - base;
            
            return {
                last: a - b,
                full: a
            };
        },

        stop: function () {

            var _tick;
            if (!running) throw stoperr;

            running = false;
            _tick   = (new Date()).getTime() - base;

            tick = base = 0;            
            return _tick;
        }
    };
})();