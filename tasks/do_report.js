/* jshint bitwise:true, curly:false, eqeqeq:true, forin:true, immed:false, 
latedef:true, newcap:true, noarg:true, noempty:false, nonew:true, plusplus:false, 
regexp:false, undef:true, unused:vars, strict:false, trailing:false, asi:false, 
boss:true, debug:false, eqnull:false, es5:false, esnext:false, evil:false, expr:true, 
funcscope:true, globalstrict:false, iterator:false, lastsemic:false, laxbreak:true, 
laxcomma:true, loopfunc:false, multistr:false, onecase:false, proto:false, 
regexdash:false, scripturl:false, smarttabs:true, shadow:false, sub:false, esnext:true,
supernew:false,  browser:true, couch:false, devel:false, dojo:false, jquery:true, 
mootools:false, node:false, nonstandard:false, prototypejs:false, rhino:false, strict:false,
wsh:false, nomen:false, onevar:false, passfail:false, white:true, indent:4, -W115 */
/* global require, module */

var 
    fs      = require('fs'),
    regexp1 = new RegExp('type\\s*:\\s*((\'\\w+\')|("\\w+"))'),
    regexp2 = new RegExp('data-action=\\\\\\"(\\w+)\\\\\\"', 'g');

module.exports = function (grunt) {

    "use strict";

    grunt.registerTask('do_report', function () {

        grunt.combine.logger.write([{ 'taskhead': 'Report' }]);

        var 
            inj     = grunt.option('inj'),
            conf    = inj.get('conf'),
            mfst    = conf.data.manifest,
            done    = this.async(),
            full    = conf.paths.dest + mfst.component + '.meta.json';

        if (conf.lite) {
            grunt.combine.logger.write([{
                'pass': 'Skipped'
            }, {
                'duration': 'Duration: '
            }]);            
            done();
        }
        else {
            var meta = {
                "name"          : mfst.name,
                "namespace"     : mfst.namespace,
                "application"   : mfst.application,
                "type"          : mfst.component,
                "provider"      : false,
                "locales"       : inj.get('locales'),
                "themes"        : {}
            };

            inj.get('source').forEach(function (theme) {
                meta.provider = (theme.data.match(regexp1) || [''])[0].replace(regexp1, '$1').replace(/\W/g, '');
                meta.themes[theme.name] = {
                    actions: (theme.data.match(regexp2) || []).reduce(function (prev, curr) {
                        curr = curr.replace(regexp2, '$1');
                        if (!prev.some(function (item) {
                            return item === curr;
                        })) {
                            prev.push(curr);
                        }
                        return prev;
                    }, [])
                };
            });

            fs.writeFile(full, JSON.stringify(meta, null, 4), { encoding: 'utf8' }, function (err) {
                err && grunt.combine.logger.error('\n>> '.red + err + '\n', { errcode: 3 });
                grunt.combine.logger.write([{
                    'custom': 'Generating metadata report... '
                }, {
                    'custom': full.yellow.bold + '\n'
                }, {
                    'pass': 'Passed'
                }, {
                    'duration': 'Duration: '
                }]);
                done();
            });
        }
    });
};