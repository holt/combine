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
/* global require, process, __dirname */

const VERSION = '2.6.0';

const MANIFEST = 'combine.json';
const GRNTFILE = 'gruntfile.js';
const COMBNSFX = '.js';
const MINIFSFX = '.min.js';
const THMEFLDR = 'themes';
const CSSFOLDR = 'styles';
const CSSSUFFX = '.css';
const TPLFOLDR = 'templates';
const TPLSUFFX = '.hbs';
const DOCFOLDR = 'docs';
const L10NFLDR = 'l10n';
const L10NSFFX = '.resx';

// Convert short-form command line params (to stop them clobbering grunt-cli)
process.argv.forEach(function (item, idx, arr) {
	switch (item) {
	case '-s':
		item = '--src';
		break;
	case '-d':
		item = '--dest';
		break;
	case '-m':
		item = '--mode';
		break;
	case '-c':
		item = '--colors';
		break;
	case '-l':
		item = '--lite';
		break;
	}		
	arr[idx] = item;
});

var 
	program		= require('commander'),
	fs			= require('fs'),
	path		= require('path'),
	env			= require('JSV').JSV.createEnvironment(),
	schema		= require('./validate.json'),
	normpath	= require('./utils/normpath'),
	inj			= require('syringejs'),
	grunt		= require('./node_modules/grunt'),
	report		= null,
	noop		= function () { return this; };

program
	.version(VERSION)
	.option('-s, --src <src>', 'The directory that contains the JS source files')
	.option('-d, --dest <dest>', 'The destination for the compiled JS output')
	.option('-m, --mode <mode>', 'The compilation output mode: debug, release or all [all]', 'all')
	.option('-c, --colors <bool>', 'Are colors are enabled in the log output? [true]', true)
	.option('-l, --lite <bool>', 'Is this a lightweight compilation using cached data? [false]', false)

	.parse(process.argv);

// Resolve relative paths (if required)
program.src		= program.src ? path.resolve(__dirname, program.src) : false;
program.dest	= program.dest ? path.resolve(__dirname, program.dest) : false;

if (fs.existsSync(program.src) && fs.existsSync(program.dest)) {

	// Configuration object - all tasks get passed this information (via the injector)
	var conf = {
		mode : program.mode || 'all',		// "Mode ("debug", "release", or "all")
		paths: {
			src : normpath(program.src),	// Source directory
			dest: normpath(program.dest)	// Destination directory
		},
		data : {},							// Storage object for manifest data etc.
		names: {},							// Storage object for folder names etc.
		dependencies: [],					// Array for compiled dependencies
		suffixes: {
			comb: COMBNSFX,					// Combined JS file suffix
			mini: MINIFSFX,					// Minified JS file suffix
			tpl : TPLSUFFX,					// Handlebars file suffix
			css : CSSSUFFX,					// CSS file suffix
			l10n: L10NSFFX					// L10N string file suffix
		},
		quality: {
			ratio: 0						// Code-to-line ratio
		},
		log: {
			colors: (program.colors === 'false') ? false : true // Log output contains colors?
		},
		lite: (program.lite === 'true') ? true : false,		 // Use caching if possible?
		VERSION: VERSION
	};

	// Load and validate the project manifest file for this project
	try {
		conf.data.manifest = require(path.join(conf.paths.src, MANIFEST));
	}
	catch (e) {
		grunt.warn("Manifest file could not be loaded from source project");
	}

	report = env.validate(conf.data.manifest, schema);

	if (report.errors.length > 0) {
		grunt.warn("Manifest file is not in a proper format: " + JSON.stringify(report.errors, null, 4));
	}

	// Assign names to configuration object
	conf.names.tpl = TPLFOLDR; // Handlebars directory name
	conf.names.css = CSSFOLDR; // Styles directory name

	// Assign normalized paths to configuration object
	conf.paths.themes	= normpath(path.join(conf.paths.src, THMEFLDR)); // Themes directory
	conf.paths.doc		= normpath(path.join(conf.paths.src, DOCFOLDR)); // Docs directory
	conf.paths.l10n		= normpath(path.join(conf.paths.src, L10NFLDR)); // L10N directory

	// Create a docs folder (if one is not already present)
	!fs.exists(conf.paths.doc, function () {
		fs.mkdir(conf.paths.doc, noop);
	});

	// Chmod the folder alone
	fs.chmodSync(conf.paths.dest, 0755);

	// Remove existing output
	fs.readdir(conf.paths.dest, function (err, list) {
		err && grunt.warn(err);
		list.forEach(function (file) {
			if (file.indexOf(conf.data.manifest.component) !== -1) {
				fs.chmodSync(conf.paths.dest + file, '0755');
				fs.unlink(conf.paths.dest + file, noop);
			}
		});
	});

	// Add various container objects to the injector - we'll need them later
	inj.add({
		'conf'		: conf,
		'status'	: {active: 0},
		'locales'	: {},
		'compiled'	: {},
		'themes'	: {}
	});

	// Go Grunt!
	grunt.cli({
		gruntfile	: __dirname + '/' + GRNTFILE,
		inj			: inj
	});

} else {

	if (!fs.existsSync(program.src)) {
		grunt.warn("Source directory not found...");
	}
	if (!fs.existsSync(program.dest)) {
		grunt.warn("Destination directory not found... (" + program.dest + ")");
	}

}