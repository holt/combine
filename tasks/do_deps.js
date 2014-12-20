/* jshint bitwise:true, curly:false, eqeqeq:true, forin:true, immed:false, 
latedef:true, newcap:true, noarg:true, noempty:false, nonew:true, plusplus:false, 
regexp:false, undef:true, unused:vars, strict:false, trailing:false, asi:false, 
boss:true, debug:false, eqnull:false, es5:false, esnext:false, evil:false, expr:true, 
funcscope:true, globalstrict:false, iterator:false, lastsemic:false, laxbreak:true, 
laxcomma:true, loopfunc:false, multistr:false, onecase:false, proto:false, 
regexdash:false, scripturl:false, smarttabs:true, shadow:false, sub:false, esnext:true,
supernew:false,  browser:true, couch:false, devel:false, dojo:false, jquery:true, 
mootools:false, node:false, nonstandard:false, prototypejs:false, rhino:false, strict:false,
wsh:false, nomen:false, onevar:false, passfail:false, white:true, indent:4, multistr: true */
/* global require, module */

var 
    hb              = require('handlebars'),
    CleanCSS        = require('clean-css'),
    autoprefixer    = require('autoprefixer'),
    fs              = require('fs');

module.exports = function (grunt) {

    "use strict";

    grunt.registerTask('do_deps', function () {

        grunt.combine.logger.write([{
            'taskhead': 'Dependencies'
        }]);

        var
            inj         = grunt.option('inj'),
            conf        = inj.get('conf'),
            pkg         = grunt.pkg,
            manifest    = conf.data.manifest,
            component   = manifest.component,
            themespath  = conf.paths.themes,
            done        = this.async(),
            css         = conf.names.css,
            tpl         = conf.names.tpl;

        // Fire this every time an asset is added to the theme stack. If the status count is
        // zero then nothing more remains to do and we can continue
        var complete = inj.on(['status', 'themes', 'compiled'], function (status, themes, compiled) {
            
            status.active--;

            if (status.active === 0) {

                var 
                    cssstr = '',
                    tplstr = '';

                pkg.deps = [];

                // Flatten the styles stack and stringify the templates objects
                Object.keys(themes).forEach(function (theme) {

                    cssstr = themes[theme][css].join('');

                    // Create a stringified version of the Handlebars template component object
                    tplstr = '\n/* Compiled HandlebarsJS templates for the "' + theme + '" theme */\n' 
                        + 'window.Handlebars && window.Handlebars.set(' + JSON.stringify(themes[theme][tpl]) + ');\n';

                    // Populate the template string object with the actual templates
                    compiled[theme][tpl].forEach(function (item, idx) {
                        var re = new RegExp('"&&&&' + idx + '&&&&"');
                        tplstr = tplstr.replace(re, item);
                    });

                    // Push the theme object onto the package stack
                    pkg.deps.push({
                        name: theme,
                        tpl : tplstr,
                        css : cssstr
                    });

                });

                // And we're done
                done();
                
            }
        });

        var processStyles = inj.on(['status'], function (status, file) {

            if (file.indexOf(conf.suffixes.css) !== -1) {

                // Tick the status
                status.active++;

                fs.readFile(this.path + '/' + css + '/' + file, 'utf-8', function (err, stylesheet) {

                    err && grunt.combine.logger.error('\n>> '.red + err + '\n', { errcode: 3 });

                    // Create a detailed identity for the stylesheet
                    var fullname = component + '-' + file.replace(conf.suffixes.css, '') + '-' + this.theme;

                    // Replace single-quotes and return spaces, run the autoprefixer and compress and 
                    // normalize the string data

                    stylesheet = autoprefixer.process(stylesheet).css;
                    stylesheet = stylesheet.replace(/'/gm, '"');
                    stylesheet = new CleanCSS().minify(stylesheet).styles;
                    stylesheet = stylesheet.replace(/\s\s/gm, '');

                    // Wrap the stylesheet in the append-to-DOM functionality. The logic ensures that the 
                    // styles are added to the <head> element in strict order.
                    stylesheet = " \
                        \n\n/* Injected stylesheet for " + fullname + " */\n \
                        if (!document.getElementById('" + fullname + "')) { \
                            var elem = document.createElement('style'); \
                            elem.setAttribute('id', '" + fullname + "'); \
                            elem.setAttribute('type', 'text/css'); \
                            elem.setAttribute('media', 'all'); \
                            var stylesheet = '"  + stylesheet + "'; \
                            if (elem.styleSheet && document.documentMode < 9) { \
                                elem.styleSheet.cssText = stylesheet; \
                            } \
                            else { \
                                elem.innerHTML = stylesheet; \
                            } \
                            \n[].slice.call(document.getElementsByTagName('head')[0].children).some(function (tag) { \
                                if ('style' === tag.tagName.toLowerCase() || 'link' === tag.tagName.toLowerCase()) { \
                                    for (var next = tag.nextSibling; next && 1 !== next.nodeType;) { \
                                        next = next.nextSibling; \
                                    } \
                                    if (next && ('style' !== next.tagName.toLowerCase() && 'link' !== next.tagName.toLowerCase())) { \
                                        return next.parentNode.insertBefore(elem, next), !0; \
                                    } \
                                } \
                                else { \
                                    return tag.parentNode.insertBefore(elem, tag.parentNode.firstChild), !1; \
                                } \
                            }); \
                        }\n \
                    ";

                    // Add the stylesheet to the css collection for this theme
                    inj.get('themes.' + this.theme + '.' + css).push(stylesheet);

                    complete();

                }.bind(this));
            }
        });

        var processTemplates = inj.on(['status', 'compiled'], function (status, compiled, file) {

            var _file = file;

            if (file.indexOf(conf.suffixes.tpl) !== -1) {

                // Tick the status
                status.active++;

                // Get the filename without the suffix - if this name is dot-delimited it will 
                // be used to create a deep template object
                file = file.split('.');
                file.pop();

                // Iterate over the list of templates in this theme, but don't add them directly
                // to the themes[theme].css[component][filename] object - store them instead. We
                // are going to use regex to add them to the object later.
                fs.readFile(this.path + '/' + tpl + '/' + _file, 'utf-8', function (err, template) {
                    err && grunt.combine.logger.error('\n>> '.red + err + '\n', { errcode: 3 });
                    compiled[this.theme][tpl].push(hb.precompile(template));
                    inj.add('themes.' + this.theme + '.' + tpl + '.' + component + '.' + file.join('.'), '&&&&' + compiled[this.theme].count++ + '&&&&');
                    complete();

                }.bind(this));
            }
        });

        // Second-level iteration: take theme payload and split into style and template
        // concerns, then pass these to the associated processor
        var processTheme = function (err, files) {
            err && grunt.combine.logger.error('\n>> '.red + err + '\n', { errcode: 3 });
            files.forEach(function (files) {
                switch (files) {

                // Build a dependency container for stylesheet files and then
                // process them...
                case css:
                    inj.add('themes.' + this.theme + '.' + css, []);
                    fs.readdir(this.path + '/' + css, function (err, files) {
                        err && grunt.combine.logger.error('\n>> '.red + err + '\n', { errcode: 3 });
                        files.forEach(processStyles, this);
                    }.bind(this));
                    break;

                // Build a dependency container for template files and then
                // process them...
                case tpl:
                    inj
                        .add('themes.' + this.theme + '.' + tpl, {})
                        .add('compiled.' + this.theme + '.' + tpl, [])
                        .add('compiled.' + this.theme + '.count', 0);
                    fs.readdir(this.path + '/' + tpl, function (err, files) {
                        err && grunt.combine.logger.error('\n>> '.red + err + '\n', { errcode: 3 });
                        files.forEach(processTemplates, this);
                    }.bind(this));
                    break;
                }
            }, this); 
        };

        // First-level iteration: look inside themes dir and marshall child folders into
        // array, then call processTheme
        var processThemes = function (err, files) {
            err && grunt.combine.logger.error('\n>> '.red + err + '\n', { errcode: 3 });
            files.forEach(function (file) {
                var path = themespath + file;
                fs.stat(path, function (err, stats) {
                    err && grunt.combine.logger.error('\n>> '.red + err + '\n', { errcode: 3 });
                    if (stats.isDirectory()) {
                        fs.readdir(path, processTheme.bind({
                            theme: file,
                            path : path
                        }));
                    }
                });
            });
        };

        // Get theme folder(s) list
        if (manifest.wrap !== false) {
            inj.remove('themes').remove('compiled');
            fs.readdir(themespath, processThemes);
        }
        else {
            done();
        }

        grunt.combine.logger.write([{'pass': 'Passed'}, {'duration': 'Duration: '}]);

    });
};