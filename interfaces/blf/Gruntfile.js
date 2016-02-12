var findit = require('findit');
module.exports = function(grunt) {
  var jsFiles = [
    './js/ext/jquery.min.js',
    './js/ext/domino.min.js',
    './js/ext/i18next.min.js',
    './js/ext/handlebars.js',
    './js/ext/mlab.utils.js',
    './js/blf.utils.js',
    './js/blf.layout.js',
    './js/blf.control.js',
    './build/templates.js'
  ].concat(findit.sync('./js/modules/').filter(function(s) {
    return s.match(/\.js$/);
  }));

  // Project configuration.
  grunt.initConfig({
    handlebars: {
      compile: {
        options: {
          namespace: 'blf.templates.preloaded'
        },
        files: {
          'build/templates.js': 'templates/*.handlebars'
        }
      }
    },
    uglify: {
      options: {
        banner: '/* BibLib Web front-end */\n'
      },
      prod: {
        files: {
          'build/blf.min.js': jsFiles
        }
      }
    },
    cssmin: {
      minify: {
        src: 'css/*.css',
        dest: 'build/style.min.css',
        ext: '.min.css'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-handlebars');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  // By default, will check lint, test and minify:
  grunt.registerTask('default', ['handlebars', 'uglify', 'cssmin']);
};
