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
/* global grunt, root */

var jshint_default = function (results, data, opts) {

    var len = results.length,
        str = '',
        prevfile;

    opts = opts || {};

    results.forEach(function (result) {

        var file = result.file,
            error = result.error;

        if (prevfile && prevfile !== file) {
            str += '\n';
        }
        prevfile = file;

        str += '\n>> '.green 
            + file 
            + ': line ' + (error.line + '').bold 
            + ', col ' 
            + (error.character + '').bold + ', ' 
            + error.reason.yellow.bold;

        if (opts.verbose) {
            str += ' (' + error.code + ')';
        }

        str += '\n>> '.green 
            + error.evidence.trim().red.bold + '\n';
    });

    grunt.combine.logger.error(str + '\n>> '.green 
        + (len + '').bold 
        + grunt.util.pluralize(len, ' error\n/ errors\n')
    , {
        errcode: 3
    });

};

module.exports = {

    reporter: function (results, data) {

        var grunt = root.grunt;

        grunt.combine.logger.write([{
            'taskhead': 'JSHint'
        }]);

        if (results.length) {
            jshint_default.apply(this, arguments);
        } else {
            grunt.combine.logger
                .write({
                    'custom': data.length + ' files successfully linted'
                })
                .write([{
                    'pass': 'Passed'
                }, {
                    'duration': 'Duration: '
                }]);
        }
    }
};