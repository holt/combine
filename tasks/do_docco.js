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
/* global require, module */

var docco = require('docco');

module.exports = function (grunt) {

    "use strict";

    grunt.registerTask('do_docco', function () {

        grunt.combine.logger.write([{ 'taskhead': 'Docco' }]);

        var arr     = [],
            inj     = grunt.option('inj'),
            conf    = inj.get('conf'),
            pkg     = grunt.pkg,
            mod     = null,
            done    = this.async();

        if (conf.data.manifest.docco) {
            for (mod in pkg.compileCache) {
                if (pkg.compileCache.hasOwnProperty(mod)) {
                    arr.push(mod);
                }
            }
            docco.run(['', '', '-o', conf.paths.doc].concat(arr));
            
            // There isn't a callback-based API for Docco so we'll need to give the writer
            // some time to complete. Ugly, but there we go...
            setTimeout(function () {
                done();
            }, 500);
        }
        else {

            grunt.combine.logger.write([{
                'custom': 'Skipping... '
            }]); 

            done();
        }
    });
};