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
/* global require, module, process */

var 
    uglify      = require('uglify-js'),
    beautify    = require('js-beautify').js_beautify,
    fs          = require('fs');

module.exports = function (grunt) {

    grunt.registerTask('do_write', function () {

        grunt.combine.logger.write([{'taskhead': 'Writing'}]);

        var 
            inj         = grunt.option('inj'),
            conf        = inj.get('conf'),
            done        = this.async(),
            date        = new Date(),
            pkg         = grunt.pkg,
            data        = pkg.source,
            f           = conf.data.manifest.namespace + "." + conf.data.manifest.application + "." + conf.data.manifest.component,
            licenses    = conf.data.manifest.licenses,
            timestamp, copystamp, buildstamp, tl_ast, c_ast, compressed_data, uncompressed_data;

        buildstamp  = "\n\n/*  Compiled by combine.js - Copyright (c) 2014 M Holt. Distributed under the MIT License */";

        var complete = inj.on(['status'], function (status, fullpath) {

            fs.stat(fullpath, function (err, stats) {

                err && grunt.combine.logger.error('\n>> '.red + err + '\n', { errcode: 3 });

                grunt.combine.logger.write([{
                    'custom': 'Generating compiled output... '
                }, {
                    'custom': fullpath.yellow.bold + '\n'
                }, {
                    'custom': 'Size: ' + (Math.round(stats.size / 1024) + 'Kb').bold
                }, {
                    'pass': 'Passed'
                }, {
                    'duration': 'Duration: '
                }]);

                --status.active;

                if (!status.active) {
                    done();
                }

            }.bind(this));
        }, this);

        var write_debug = function (theme, data, locale) {
            
            locale      = locale || 'en-US';
            timestamp   = "/* Generated on "  + date.toString() + " by " + (process.env.USER || process.env.USERNAME) + " */\n\n";

            // Write uncompressed, beautified file
            uncompressed_data = '/* File: ' + f + '-' + theme + '-' + locale + conf.suffixes.comb + ' */\n' + timestamp  + beautify(data, { indent_size: 4 }) + buildstamp;
            
            var fullpath = conf.paths.dest + f + '-' + theme + '-' + locale + conf.suffixes.comb;
            fs.writeFile(fullpath, uncompressed_data, { encoding: 'utf8' }, function (err) {
                
                err && grunt.combine.logger.error('\n>> '.red + err + '\n', { errcode: 3 });
                complete(fullpath);
                
            });
        };

        var write_release = function (theme, data, locale) {

            locale      = locale || 'en-US';
            copystamp   = "/* Copyright © " + date.getFullYear() + " Citrix. All rights reserved. */\n";

            // Uglify compressor / mangler
            tl_ast = uglify.parse(data, {});
            tl_ast.figure_out_scope();
            c_ast = tl_ast.transform(uglify.Compressor({unused: false, warnings: false}));
            c_ast.figure_out_scope();
            c_ast.compute_char_frequency();
            c_ast.mangle_names();
            c_ast = c_ast.print_to_string();

            // Add licenses (if required)
            if (licenses instanceof Array && licenses.length) {
                var licensetxt = ''
                    + '/*\n\n'
                    + 'The following third-party files are used by this application:\n\n';

                licenses.forEach(function (item) {
                    licensetxt = licensetxt + '\t' + item + '\n';
                });

                copystamp = copystamp 
                    + '\n' 
                    + licensetxt 
                    + '\n*/\n\n';
            }

            // Write minified file
            compressed_data = copystamp + c_ast + buildstamp;

            var fullpath = conf.paths.dest + f + '-' + theme + '-' + locale + conf.suffixes.mini;
            fs.writeFile(fullpath, compressed_data, { encoding: 'utf8' }, function (err) {

                err && grunt.combine.logger.error('\n>> '.red + err + '\n', { errcode: 3 });
                complete(fullpath);
                
            });
        };

        // The data may be an unstitched, unwrapped, concatenation of files (for example, 3rd-party
        // data), so we need to put it into an object the writers can understand
        if (typeof data === 'string') {
            data = [{
                name: 'default',
                l10n: 'en-US',
                data: data
            }];            
        }

        switch (conf.mode) {

        case 'debug':
            data.forEach(inj.on(['status'], function (status, theme) {
                status.active = status.active + 1;
                write_debug(theme.name, theme.data, theme.l10n);
            }, this));
            break;

        case 'release':
            data.forEach(inj.on(['status'], function (status, theme) {
                status.active = status.active + 1;
                write_release(theme.name, theme.data, theme.l10n);
            }, this));
            break;

        case 'all':
            data.forEach(inj.on(['status'], function (status, theme) {
                status.active = status.active + 1;
                write_debug(theme.name, theme.data, theme.l10n);
            }, this));
            data.forEach(inj.on(['status'], function (status, theme) {
                status.active = status.active + 1;
                write_release(theme.name, theme.data, theme.l10n);
            }, this));
            break;

        default:
            grunt.combine.logger.error('\n>> '.red + 'Output mode not recognized - must be \'debug\', \'release\' or \'all\''.red + '\n');
        }

    });
};