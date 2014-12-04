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

var CombineLog = function (grunt, options) {

    options = options || {};
    this.timer = (options.timer && options.timer.start) ? options.timer : false;

    var colorhandler = function (type) {
        return function (str) {
            type(str = (options.colors === false) ? str.stripColors : str);
        };
    };

    this.wrn = colorhandler(grunt.log.warn);
    this.wrt = colorhandler(grunt.log.write);
    this.wln = colorhandler(grunt.log.writeln);
    this.err = colorhandler(console.error);

    this.timer && this.timer.start();
    this.exit = false;
};

CombineLog.prototype.handlers = {

    custom: function (txt) {
        return ''
            + '\n>> '.green
            + txt;
    },

    taskhead: function (txt) {
        var len = txt.length,
            res = (80 - (len + 2)),
            str = '';
        while (res) {
            str += '-';
            res--;
        }
        str = '\n--- ' + txt + ' ' + str + '\n';
        return str.bold;
    },

    subhead: function (txt) {
        return ''
            + '\n'
            + '>> '.green
            + txt;
    },

    pass: function (txt) {

        this.tick = this.timer
            ? this.timer.tick()
            : {
                'last': 'unknown',
                'full': 'unknown'
            };

        var dur = this.timer
            ? (' @ ' + (this.tick.full + '' + 'ms').white.bold)
            : '';

        return ''
            + '\n>> '.green
            + txt.green.bold
            + dur;
    },

    duration: function (txt) {

        var dur = (this.timer)
            ? (this.tick.last + 'ms').white.bold
            : 'unknown';

        return ''
            + '\n>> '.green
            + txt
            + dur
            + '\n';
    },
};

CombineLog.prototype.error = function (data, opts) {

    opts = opts || {};
    opts.errcode = opts.errcode || 1;

    data = (typeof data === 'string')
        ? data
        : (typeof data === 'object')
            ? JSON.stringify(data, null, 4)
            : null;

    if (opts.silent !== true && data) {
        this.err(data);
    }

    if (!process.stdout.isTTY) {
        this.exit = true;
        process.exit(opts.errcode);
    }
},

CombineLog.prototype.write = function (arr) {

    if (this.exit) return this;

    var ref = null,
        hasProp = {}.hasOwnProperty;

    arr = (arr instanceof Array)
        ? arr
        : (typeof arr === 'object') ? [arr] : {};

    arr.forEach(function (item) {
        for (var key in item) {
            if (hasProp.call(item, key)) {
                ref = this.handlers[key];
                ref = (ref) ? ref.call(this, item[key]) : ref;
                if (ref) {
                    this.wrt(ref);
                }
            }
        }
    }, this);
    return this;
};

module.exports = CombineLog;