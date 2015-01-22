var gulp = require('gulp'),
    less = require('gulp-less'),
    handlebars = require('gulp-handlebars'),
    wrap = require('gulp-wrap'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify');

// Paths
var styleFiles = './css/style.less',
    templateFiles = './templates/*.hbs';

// Compiling style
gulp.task('style', function() {
  return gulp.src(styleFiles)
    .pipe(less())
    .pipe(gulp.dest('build'));
});

// Compiling templates
gulp.task('templates', function() {
  return gulp.src(templateFiles)
    .pipe(handlebars())
    .pipe(wrap('Handlebars.template(<%= contents %>);'))
    .pipe(concat('templates.js'))
    .pipe(uglify())
    .pipe(gulp.dest('build'));
});

// Watching
gulp.task('work', function() {
  gulp.watch(styleFiles, ['style']);
});

// Macro-task
gulp.task('default', ['style', 'templates']);
