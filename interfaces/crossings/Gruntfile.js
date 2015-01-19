module.exports = function(grunt) {

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    // settings set in config.json will be available as constants within angular
    conf: grunt.file.readJSON('config.json'),
    ngconstant: {
      options: {
        space: '  '
      },
      // Environment targets
      development: [{
        dest: 'app/js/config.js',
        wrap: '"use strict";\n\n <%= __ngModule %>',
        name: 'config',
        constants: {
          settings: '<%= conf.settings.dev %>'
        }
      }],
      production: [{
        dest: 'app/js/config.js',
        wrap: '"use strict";\n\n <%= __ngModule %>',
        name: 'config',
        constants: {
          settings: '<%= conf.settings.prod %>'
        }
      }]
    },

    env : {
      options : {
          /* Shared Options Hash */
          //globalOption : 'foo'
      },
      dev: {
        NODE_ENV : 'DEVELOPMENT'
      },
      prod : {
        NODE_ENV : 'PRODUCTION'
      }
    },

    less: {
      prod: {
        options: {
          paths: ["assets"]
        },
        files: {
          "app/css/app.css": "app/css/app.less"
        }
      }
    },

    // removelogging: {
    //   dist: {
    //     src: "app/js/*.js",
    //     dest: "dist/js/*_nolog.js",
    //     options: {}
    //   }
    // },

    concat: {
      options: {
        separator: '\n;\n\n'
      },
      css: {
        src: [
          'app/lib/font-awesome/css/font-awesome.min.css',
          //'app/lib/intro.js/introjs.css', // introjs.css has its own minified version
          'app/css/fonts.css',
          'app/css/app.css'
        ],
        dest: 'dist/css/<%= pkg.name %>.css'
      },
      js: {
        src: [
          'app/lib/jquery/jquery.min.js',
          'app/lib/jquery-ui/ui/minified/jquery-ui.min.js',
          'app/lib/jquery.shapeshift/core/jquery.shapeshift.min.js',
          'app/lib/underscore/underscore.js',
          'app/lib/intro.js/minified/intro.min.js',
          'app/lib/moment/min/moment.min.js',
          'app/lib/typeahead.js/dist/typeahead.jquery.min.js',

          'app/lib/angular/angular.min.js',
          'app/lib/angular-route/angular-route.min.js',
          'app/lib/angular-sanitize/angular-sanitize.min.js',
          //'app/lib/angular-inview/angular-inview.js',
          //'app/lib/hamsterjs/hamster.js',
          //'app/lib/angular-mousewheel/mousewheel.js',
          
          // 'app/js/config.js',
          // 'app/js/app.js',
          // 'app/js/services.js',
          // 'app/js/controllers.js',
          // 'app/js/filters.js',
          // 'app/js/directives.js'

          'app/js/*.js'
        ],
        dest: 'dist/js/<%= pkg.name %>.js'
      }
    },

    copy: {
        dist: {
            files: [
                {
                    src: [ 'app/lib/intro.js/minified/introjs.min.css'],
                    dest: 'dist/css/introjs.min.css',
                    filter: 'isFile'
                },
                {
                    expand: true,
                    flatten: true,
                    src: [ 
                        'app/lib/font-awesome/fonts/**'
                    ],
                    dest: 'dist/fonts/',
                    filter: 'isFile'
                },
                {
                    expand: true,
                    flatten: true,
                    src: [ 
                        'app/lib/font-awesome/css/**'
                    ],
                    dest: 'dist/css/',
                    filter: 'isFile'
                },
                {
                    expand: true,
                    flatten: true,
                    src: [ 
                        'app/fonts/**'
                    ],
                    dest: 'dist/fonts/',
                    filter: 'isFile'
                },
                {
                    expand: true,
                    flatten: false,
                    cwd: 'app/img/',
                    src: ['**'],
                    dest: 'dist/img/'
                },
                {
                    expand: true,
                    flatten: true,
                    src: ['app/partials/**'],
                    dest: 'dist/partials/',
                    filter: 'isFile'
                },
                {
                    expand: true,
                    flatten: false,
                    cwd: 'app/lib/Viewer.js/',
                    src: ['**'],
                    dest: 'dist/Viewer.js/'
                },
                {
                    // also copy our custom Viewer.js index.html
                    src: ['app/partials/viewerjs_custom_index.html'],
                    dest: 'dist/Viewer.js/index.html'
                }
            ]
        }
    },

    preprocess : {
      prod : {
        src : 'app/index.html',
        dest : 'dist/index.html'
      }
    },

    strip : {
      main : {
        src : 'dist/js/<%= pkg.name %>.js',
        dest : 'dist/js/<%= pkg.name %>.nolog.js',
        options : {
          nodes : ['console.log']
        }
      }
    },

    ngmin: {
      all: {
        src: ['dist/js/<%= pkg.name %>.js'],
        dest: 'dist/js/<%= pkg.name %>.ngm.js'
      }
    },

    uglify: {
      options: {
        banner: '\n/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n\n',
        mangle: false
      },
      dist: {
        files: {
          'dist/js/<%= pkg.name %>.min.js': ['dist/js/<%= pkg.name %>.nolog.js']
        }
      }
    },

    jshint: {
      files: ['Gruntfile.js'],
      options: {
        // options here to override JSHint defaults
        globals: {
          jQuery: true,
          console: true,
          module: true,
          document: true
        }
      }
    },

    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['jshint', 'qunit']
    }

  });
  
  grunt.loadNpmTasks('grunt-ng-constant');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-copy' );
  grunt.loadNpmTasks('grunt-ngmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-env');
  grunt.loadNpmTasks('grunt-preprocess');
  //grunt.loadNpmTasks("grunt-remove-logging");
  grunt.loadNpmTasks('grunt-strip');

  grunt.registerTask('dev', ['ngconstant:development']);
  grunt.registerTask('prod', ['ngconstant:production']);
  grunt.registerTask('mini', ['jshint','env:prod','less:prod','concat:js','concat:css','copy','strip','uglify','preprocess:prod']);

};