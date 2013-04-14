module.exports = function(grunt) {

    // Load some tasks
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        uglify: {
            app: {
                src: ['js/vendor/zepto.min.js',
                      'js/vendor/zepto.touch.js',
                      'js/vendor/fastclick.js',
                      'js/app/*.js'],
                dest: 'js/compiled/app.js'
            }
        },

        less: {
            app: {
                files: {
                    "css/compiled/app.css": "css/app.less"
                }
            }
        },

        watch: {
            scripts: {
                files: ['js/app/*.js', 'js/vendor/*.js'],
                tasks: ['uglify:app']
            },
            stylesheets: {
                files: ['css/*.less'],
                tasks: ['less']
            }
        }

    });

    grunt.registerTask('default', ['uglify', 'less']);

};
