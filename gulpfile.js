var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var eslint = require('gulp-eslint');
var jasmine = require('gulp-jasmine-phantom');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

gulp.task('default', ['copy-html', 'copy-images', 'styles', 'lint', 'scripts'], function() {
	gulp.watch('js/**/*.js', ['lint']);
	gulp.watch('partials/**/*.html', ['copy-html']);
	gulp.watch('index.html', ['copy-html']);
	//This would recursively create dist within dist, dont use it:
	//gulp.watch('./dist/**/*.html').on('change', browserSync.reload);
	gulp.watch('./dist/index.html').on('change', browserSync.reload);
	gulp.watch('./dist/partials/*.html').on('change', browserSync.reload);

	browserSync.init({
		server: './dist'
	});
});

gulp.task('dist', [
	'copy-html',
	'copy-images',
	'styles',
	'lint',
	'scripts-dist'
]);

gulp.task('scripts', function() {
	//TODO: find out if this is the best practice for including scripts
	gulp.src(['js/**/*.js', 'bower_components/ng-a11y/src/*.js'])
		.pipe(concat('all.js'))
		.pipe(gulp.dest('dist/js'));
});

gulp.task('scripts-dist', function() {
	//TODO: find out if this is the best practice for including scripts
	gulp.src(['js/**/*.js', 'bower_components/ng-a11y/src/*.js'])
		.pipe(concat('all.js'))
		.pipe(uglify())
		.pipe(gulp.dest('dist/js'));
});

gulp.task('copy-html', function() {
	//This would recursively create dist within dist, dont use it:
	//gulp.src('./**/*.html')
	//.pipe(gulp.dest('./dist'));

	gulp.src('./index.html')
		.pipe(gulp.dest('./dist'));
	gulp.src('./partials/*.html')
		.pipe(gulp.dest('./dist/partials'));
});

gulp.task('copy-images', function() {
	gulp.src('img/*')
		.pipe(gulp.dest('dist/img'));
});

gulp.task('styles', function() {
	gulp.src('style/**/*.css')
		.pipe(gulp.dest('dist/style'))
		.pipe(browserSync.stream());
});

gulp.task('lint', function () {
	return gulp.src(['js/**/*.js'])
		// eslint() attaches the lint output to the eslint property
		// of the file object so it can be used by other modules.
		.pipe(eslint())
		// eslint.format() outputs the lint results to the console.
		// Alternatively use eslint.formatEach() (see Docs).
		.pipe(eslint.format())
		// To have the process exit with an error code (1) on
		// lint error, return the stream and pipe to failOnError last.
		.pipe(eslint.failOnError());
});

gulp.task('tests', function () {
	gulp.src('tests/spec/extraSpec.js')
		.pipe(jasmine({
			integration: true,
			vendor: 'js/**/*.js'
		}));
});