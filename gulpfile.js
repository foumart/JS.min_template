const { src, dest, series } = require('gulp');
const gulp = require('gulp');
const gulpif = require('gulp-if');
const concat = require('gulp-concat');
const htmlmin = require('gulp-htmlmin');
const replace = require('gulp-string-replace');
const browserSync = require('browser-sync').create();
const argv = require('yargs').argv;

let del, js, css, scriptFiles, cssFiles;

const replaceOptions = { logs: { enabled: false } };

// Script Arguments:
// --dir: set the output directory
const dir = argv.dir || 'public';

// --raw: don't minify the js files at all
const raw = argv.raw != undefined ? true : false;

function app(callback) {
	const scripts = [
		'src/scripts/*.js'
	];

	js = '';
	scriptFiles = [];

	src(scripts, { allowEmpty: true })
		.pipe(gulpif(raw, dest(dir + '/scripts/')))
        .on('data', (file) => {
            if (file.isBuffer()) {
                js += file.contents.toString().replace(/\s+/g, ' ') + '\n';
				scriptFiles.push(file.relative.replace(/\\/g, '/'));
            }
        })
        .on('end', () => {
            callback();
        });
}

function cs(callback) {
	const styles = [
		'src/styles/*.css'
	];

	css = '';
	cssFiles = [];

	src(styles, { allowEmpty: true })
		.pipe(gulpif(raw, dest(dir + '/styles/')))
        .on('data', (file) => {
            if (file.isBuffer()) {
                css += file.contents.toString().replace(/\s+/g, ' ') + '\n';
				cssFiles.push(file.relative.replace(/\\/g, '/'));
            }
        })
        .on('end', () => {
            callback();
        });
}

// Inline JS and CSS into index.html
function pack(callback) {
	let stream = src('src/index.html', { allowEmpty: true });
	let scriptTags, cssTags;

	if (raw) {
		scriptTags = scriptFiles.map(scriptFile => `<script src="./scripts/${scriptFile.replace(/\\/g, '/')}"></script>`).join('\n\t');
		cssTags = cssFiles.map(cssFile => `<link rel="stylesheet" href="./styles/${cssFile.replace(/\\/g, '/')}">`).join('\n\t');
	}

	stream
		.pipe(gulpif(!raw, htmlmin({ collapseWhitespace: true, removeComments: true, removeAttributeQuotes: true })))
		.pipe(replace('rep_css', raw ? cssTags : '<style>' + css + '</style>', replaceOptions))
		.pipe(replace('rep_js', raw ? scriptTags : '<script>' + js + '</script>', replaceOptions))
		.pipe(concat('index.html'))
		.pipe(dest(dir + '/'))
		.on('end', callback);
}

// Delete the public folder at the beginning
function prep(callback) {
	(async () => {
		del = (await import('del')).deleteAsync;
		del(dir);
		callback();
	})();
}

// Watch for changes in the source folder
function watch(callback) {
	browserSync.init({
		server: './public',
		ui: false,
		port: 8080
	});
	
	gulp.watch('./src').on('change', () => {
		exports.sync();
	});

	callback();
};

// Reload the browser sync instance, or run a new server with live reload
function reload(callback) {
	if (!browserSync.active) {
		watch(callback);
	} else {
		browserSync.reload();
		callback();
	}
}

// Exports
exports.default = series(prep, app, cs, pack, watch);
exports.sync = series(app, cs, pack, reload);

/*
   JS Template Gulpfile by Noncho Savov
   https://www.FoumartGames.com
*/
