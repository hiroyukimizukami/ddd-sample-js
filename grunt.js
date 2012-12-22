/*
  SUPPORTED TASKS
    * default ( concat > min > lint > qunit )
    * lint
    * concat
    * min
*/


/*global module:false*/
module.exports = function(grunt) {

  // CONFIG
  grunt.initConfig({
    // lint task config
    lint: {
      files: ['grunt.js', 't/**/*.js', 'src/**/*.js', 'build/ddd.js']
    },

   // qunit task config
   qunit: {
       files: ['t/**/*.html']
   },
    // jshint config
    jshint: {
      options: {
      },
      globals: {}
    },

    // concat task config
    concat: {
        main : {
            src: ['src/**/*.js'],
            dest: 'build/ddd.js'
        }
    },

    // minify task config
    min: {
      mobile: {
        src: ['build/ddd.js'],
        dest: 'build/ddd.min.js'
      }
    }
  });

  // ALIASES
  // default
  grunt.registerTask('default', 'concat min lint');

};
