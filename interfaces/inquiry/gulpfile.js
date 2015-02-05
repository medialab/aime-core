var gulp = require('gulp'),
    less = require('gulp-less'),
    handlebars = require('gulp-handlebars'),
    wrap = require('gulp-wrap'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    declare = require('gulp-declare');

// Paths
var styleFiles = './css/style.less',
    templateFiles = './templates/*.hbs';

// Compiling style
gulp.task('style', function() {
  return gulp.src(styleFiles)
    .pipe(less().on('error', function(e) { console.error(e); }))
    .pipe(gulp.dest('build'));
});

// Compiling templates
gulp.task('templates', function() {
  return gulp.src(templateFiles)
    .pipe(handlebars())
    .pipe(wrap('Handlebars.template(<%= contents %>);'))
    .pipe(declare({
      namespace: 'maze.engine.template',
      noRedeclare: true
    }))
    .pipe(concat('templates.js'))
    .pipe(uglify())
    .pipe(gulp.dest('build'));
});

// Watching
gulp.task('work', ['style', 'templates'], function() {
  gulp.watch(styleFiles, ['style']);
  gulp.watch(templateFiles, ['templates']);
});

// Macro-task
gulp.task('default', ['style', 'templates']);
