var gulp = require('gulp');

var connect = require('gulp-connect');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var minifyCSS = require('gulp-minify-css');
var del = require('del');
var vinylPaths = require('vinyl-paths');
var jade = require('gulp-jade');
var watch = require('gulp-watch');

gulp.task('serve', function(){
  gulp.src('./app/bower_components/**')
    .pipe(gulp.dest('./tmp/bower_components'));
  connect.server({
    livereload: true,
    root: ['./app/', './tmp'],
    port: 4567
  });
});
gulp.task('lint', function() {
  gulp.src(['./app/**/*.js', '!./app/bower_components/**'])
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail'));
});
gulp.task('clean', function(cb) {
  del(['./tmp/**/*', './dist/**/*', './tmp', './dist'], cb);
});
gulp.task('minify-css', function() {
  var opts = {comments:true,spare:true};
  gulp.src(['./app/**/*.css', '!./app/bower_components/**'])
    .pipe(minifyCSS(opts))
    .pipe(gulp.dest('./dist/'))
});
gulp.task('minify-js', function() {
  gulp.src(['./app/**/*.js', '!./app/bower_components/**'])
    .pipe(uglify({
      // inSourceMap:
      // outSourceMap: "app.js.map"
    }))
    .pipe(gulp.dest('./dist/'))
});
gulp.task('templates', function () {
  return gulp.src('./app/**/*.jade')
    .pipe(jade({pretty: true}))
    .pipe(gulp.dest('./tmp/'))
    .pipe(connect.reload({stream: true}));
});
gulp.task('copy-bower-components', function () {
  gulp.src('./app/bower_components/**')
    .pipe(gulp.dest('./dist/bower_components'));
});
gulp.task('copy-html-files', function () {
  gulp.src('./app/**/*.html')
    .pipe(gulp.dest('./dist/'));
});
gulp.task('livereload', function() {
  gulp.src(['./tmp/**/*.html', './tmp/**/*.js'])
    .pipe(watch('./app/**/*.jade', ['templates']))
    .pipe(connect.reload());
});
gulp.task('watch', function() {
    gulp.watch('./app/**/*.jade', ['templates']);
});
gulp.task('serveDist', function () {
  connect.server({
    root: './dist/',
    port: 9999
  });
});

// default task
gulp.task('default',
  ['lint', 'templates', 'serve', 'livereload', 'watch']
);
// build task
gulp.task('build',
  ['lint', 'templates', 'minify-css', 'minify-js', 'copy-html-files', 'copy-bower-components', 'serveDist']
);


