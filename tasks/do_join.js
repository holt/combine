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

var 
    path        = require('path'),
    fs          = require('fs'),
    normpath    = require('../utils/normpath');

module.exports = function (grunt) {

    "use strict";

    grunt.registerTask('do_join', function () {

        grunt.combine.logger.write([{ 'taskhead': 'Joining' }]);

        var 

            inj     = grunt.option('inj'),
            conf    = inj.get('conf'),
            done    = this.async(),
            include = conf.data.manifest.include || [],
            len     = include.length,
            source  = [],
            count   = 0;

        if (len) {

            var complete = (function () {
                var calls = 0;
                return function (source) {
                    if (++calls === len) {
                        grunt.pkg = {
                            source: source.join(';\n\n')
                        };

                        grunt.combine.logger.write([{
                            'pass': 'Passed'
                        }, {
                            'duration': 'Duration: '
                        }]);

                        done();
                    }
                };
            }.call(this));

            var getfiles = function (filepath, count) {

                grunt.combine.logger.write([{'custom': filepath}]);

                fs.readFile(filepath, {'encoding': 'utf8'}, function (err, data) {
                    err && grunt.combine.logger.error('\n>> '.red + err + '\n', { errcode: 3 });
                    source[count] = data;
                    complete(source);
                });
            };

            include.forEach(function (item) {
                getfiles(normpath(path.resolve(conf.paths.src, item)).slice(0, -1), count++);
            });
        }
        else {
            grunt.combine.logger.error('\n>> '.red 
                + 'No framework items have been specified!' + '\n' 
            , {
                errcode: 3
            });            
        }
    });
};