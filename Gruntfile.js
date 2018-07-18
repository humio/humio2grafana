module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-ts');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-pug');

  grunt.initConfig({
    clean: ['dist'],

    copy: {
      dist_html: {
        expand: true,
        flatten: true,
        cwd: 'src/partials',
        src: ['*.html'],
        dest: 'dist/partials/',
      },
      dist_css: {
        expand: true,
        flatten: true,
        cwd: 'src/css',
        src: ['*.css'],
        dest: 'dist/css/',
      },
      dist_img: {
        expand: true,
        flatten: true,
        cwd: 'src/img',
        src: ['*.*'],
        dest: 'dist/img/',
      },
      dist_statics: {
        expand: true,
        flatten: true,
        src: ['src/plugin.json', 'LICENSE', 'README.md'],
        dest: 'dist/',
      },
    },

    pug: {
      compile: {
        options: {
          data: {
            debug: false,
          },
        },
        // TODO: temporary file by file solution
        files: [
          {
            src: ['src/partials/annotations.editor.pug'],
            dest: 'dist/partials/annotations.editor.html',
          },
          {src: ['src/partials/config.pug'], dest: 'dist/partials/config.html'},
          {
            src: ['src/partials/query.editor.pug'],
            dest: 'dist/partials/query.editor.html',
          },
          {
            src: ['src/partials/query.options.pug'],
            dest: 'dist/partials/query.options.html',
          },
        ],
      },
    },

    ts: {
      build: {
        src: ['src/*.ts', 'src/**/*.ts', '!**/*.d.ts'],
        dest: 'dist',
        tsconfig: './tsconfig.json',
      },
    },

    watch: {
      files: [
        'src/**/*.ts',
        'src/**/*.html',
        'src/**/*.css',
        'src/img/*.*',
        'src/plugin.json',
        'README.md',
      ],
      tasks: ['default'],
      options: {
        debounceDelay: 250,
      },
    },
  });

  grunt.registerTask('default', [
    'clean',
    'ts:build',
    'pug:compile',
    'copy:dist_html',
    'copy:dist_css',
    'copy:dist_img',
    'copy:dist_statics',
  ]);
};
