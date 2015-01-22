var gulp = require('gulp'),
    less = require('gulp-less'),
    handlebars = require('gulp-handlebars');

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
    .pipe(gulp.dest('build'));
});

// Watching
gulp.task('work', function() {
  gulp.watch(styleFiles, ['style']);
});

// Macro-task
gulp.task('default', ['style']);
