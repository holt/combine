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
/* global require, root */

var 
    timer       = require('./utils/timer'),
    Logger      = require('./utils/logger'),
    jshintopts  = require('./jshintrc');

module.exports = function (grunt) {

    // Give grunt a global hook
    root.grunt  = grunt;
    
    var 
        inj     = grunt.option('inj'),
        conf    = inj.get('conf');

    // Use custom JSHint error reporter
    jshintopts.reporter = __dirname + '/utils/reporter.js';

    // Allow debuggers to be used when compiling in strict debug mode
    if (conf.mode === 'debug') {
        jshintopts.debug = true;
    }

    // Project configuration.
    grunt.initConfig({
        watch: {
            "default": {
                files: [conf.paths.src + '/**/*.js', conf.paths.src + '/**/*.hbs', conf.paths.src + '/**/*.css', conf.paths.src + '/**/*.coffee', conf.paths.src + '/**/*.json'],
                tasks: ['default'],
                options: {
                    spawn: false
                }
            },
            "nohint": {
                files: [conf.paths.src + '/**/*.js', conf.paths.src + '/**/*.hbs', conf.paths.src + '/**/*.css', conf.paths.src + '/**/*.coffee', conf.paths.src + '/**/*.json'],
                tasks: ['nohint'],
                options: {
                    spawn: false
                }
            },
            framework: {
                files: [ conf.paths.src + '/**/*.js', conf.paths.src + '/**/*.hbs'],
                tasks: ['framework'],
                options: {
                    spawn: false
                }
            }
        },
        "jshint": {
            options: jshintopts,
            all: [ conf.paths.src + '/**/*.js' ]
        }
    });

    grunt.combine = {
        logger: new Logger(grunt, {
            timer: timer,
            colors: conf.log.colors
        })
    };

    // Load tasks and supporting libs
    grunt.loadTasks('tasks');
    
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['jshint', 'do_stitch', 'do_deps', 'do_wrap', 'do_l10n', 'do_write', /*'do_report',*/ 'do_docco']);
    grunt.registerTask('nohint', ['do_stitch', 'do_deps', 'do_wrap', 'do_l10n', 'do_write', /*'do_report',*/ 'do_docco']);
    grunt.registerTask('framework', ['do_join',  'do_deps', 'do_wrap', 'do_write']);

};