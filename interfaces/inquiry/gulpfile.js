var gulp = require('gulp'),
    less = require('gulp-less'),
    handlebars = require('gulp-handlebars'),
    wrap = require('gulp-wrap'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    declare = require('gulp-declare'),
    rename = require('gulp-rename'),
    gulpif = require('gulp-if'),
    cssmin = require('gulp-cssmin'),
    lazypipe = require('lazypipe');

// Paths
var styleFiles = './css/style.less',
    templateFiles = './templates/*.hbs';

var jsFiles = [
  './config.js',
  './js/lib/jquery-2.1.3.js',
  './js/lib/bootstrap-modal.min.js',
  './js/lib/domino.min.js',
  './js/lib/marked.min.js',
  './js/lib/jquery.easing.min.js',
  './js/lib/jquery.highlight.js',
  './js/lib/jquery.ba-bbq.js',
  './js/lib/jquery.toastmessage.js',
  './js/lib/slimScroll.min.js',
  './js/lib/jquery.nanoscroller.min.js',
  './js/lib/form-validation.js',
  './js/lib/pdf.js',
  './js/lib/jquery.pidif.js',
  './js/lib/handlebars.runtime.min.js',
  './js/maze.js',
  './js/mlab.utils.js',
  './js/maze.domino.js',
  './js/modules/login.js',
  './js/modules/signup.js',
  './js/modules/sos.js',
  './js/modules/reset.js',
  './js/modules/location.js',
  './js/modules/scroll.js',
  './js/modules/search.js',
  './js/modules/page.js',
  './js/modules/misc.js',
  './js/modules/layout.js',
  './js/modules/column.js',
  './js/modules/columnText.js',
  './js/modules/columnVoc.js',
  './js/modules/columnDoc.js',
  './js/modules/columnComm.js',
  './js/modules/slider.js',
  './js/modules/notebook.js',
  './js/modules/editor.js',
  './js/maze.magic.js',
  './js/maze.story.js',
  './js/maze.engine.js',
  './js/maze.search.js',
  './js/maze.move.js',
  './js/maze.move.comm.js',
  './js/maze.move.comm.js',
  './js/maze.move.doc.js',
  './js/maze.move.js',
  './js/maze.move.text.js',
  './js/maze.move.voc.js',
  './js/markdown.parser.js',
  './js/handlebars.helpers.js'
];

var coda = [
  './js/checkBrowser.js',
  './locales/en.js',
  './locales/fr.js',
  './js/init.js'
];

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

// Minify the css
gulp.task('style-min', function() {
  return gulp.src(styleFiles)
    .pipe(less())
    .pipe(cssmin())
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build'));
});

// Minify the js
gulp.task('js-min', function() {
  var files = jsFiles
    .concat(templateFiles)
    .concat(coda);

  var pipe = lazypipe()
    .pipe(handlebars)
    .pipe(wrap, 'Handlebars.template(<%= contents %>);')
    .pipe(declare, {
      namespace: 'maze.engine.template',
      noRedeclare: true
    });

  return gulp.src(files)
    .pipe(gulpif('*.hbs', pipe()))
    .pipe(concat('app.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('build'));
});

// Production build
gulp.task('prod', ['style-min', 'js-min']);

// Watching
gulp.task('work', ['style', 'templates'], function() {
  gulp.watch(styleFiles, ['style']);
  gulp.watch(templateFiles, ['templates']);
});

// Macro-task
gulp.task('default', ['style', 'templates']);
