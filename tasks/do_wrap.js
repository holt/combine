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
/* global module */

module.exports = function (grunt) {

    grunt.registerTask('do_wrap', function () {

        grunt.combine.logger.write([{'taskhead': 'Wrapper'}]);

        var
            inj         = grunt.option('inj'),        
            conf        = inj.get('conf'),
            pkg         = grunt.pkg,
            data        = pkg.source,
            manifest    = conf.data.manifest,
            comp        = manifest.component,
            mainmethod  = manifest.main || 'main',
            thiscomp    = 'this.' + comp;

        var eventname   = (manifest.event === true)
                ? 'init.' + comp : Boolean(manifest.event)
                ? manifest.event : false;
            
        pkg.deps = pkg.deps || [];

        if (manifest.wrap !== false) {

            /* Utility function to build the invocation structure that either starts
            the component automatically, or waits for an event of the form "init.<component>" */
            var invoc = function (type) {

                var chunk = "";

                switch (type) {

                // Assume module is not stitched and therefore does not require an invocation handler
                case false: 
                    break;

                // Run the module automatically on instantiation (don't wait for event)
                default:

                    // Wrapper for event-based invocation of the module
                    if (eventname) {

                        chunk = ""
                            +   "\n/* Event listener binding and Stitch object cleanup */\n"
                            +   "if (typeof Backbone !== 'undefined' && Backbone !== null) {"   
                            +       "var _ref;"
                            +       "if ((_ref = Backbone) != null) {"
                            +           "var _ref1;"            
                            +           "if ((_ref1 = _ref.Events) != null) {"
                            +               "_ref1.on('" + eventname + "', function(ev) {"
                            +                   thiscomp + "_require('" + mainmethod + "');" 
                            +                   thiscomp + "_require = void 0;"
                            +                   "try {delete " + thiscomp + "_require;}" 
                            +                   "catch(e){};"
                            +               "}, this);"
                            +           "}"
                            +       "}"
                            +   "}\n\n";

                    }
                    
                    //  Wrapper for automatic invocation of the module
                    else {
                        chunk = ""
                            + "\n/* Module invocation and Stitch object cleanup */\n"
                            + "if (" + thiscomp + "_require) {"
                            +       thiscomp + "_require('" + mainmethod + "');" 
                            +       thiscomp + "_require = void 0;" 
                            +       "try {delete " + thiscomp + "_require;}" 
                            +       "catch(e){};"
                            + "}\n\n";
                    }

                    break;

                }

                return chunk;
            };

            data = data.replace(/this.require/g, thiscomp + '_require');
            pkg.source = [];

            pkg.deps.forEach(function (theme) {

                // Generic wrapper for stitched/concatenated output
                var payload = ""
                    + "(function( /*! Packaged using Combine.js v" + conf.VERSION + " by Michael Holt !*/ ){\n"
                    +   '\n"use strict";\n'
                    +   data           
                    +   theme.css
                    +   theme.tpl
                    +   invoc(manifest.wrap)
                    + "}.call(window));";

                pkg.source.push({
                    name: theme.name,
                    data: payload
                });

            });
        }

        grunt.combine.logger.write([{'pass': 'Passed'}, {'duration': 'Duration: '}]);
    });

};