module.exports = function(grunt) {

    // Load some tasks
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-develop');

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        uglify: {
            app: {
                src: ['static/js/vendor/zepto.min.js',
                      'static/js/vendor/zepto.touch.js',
                      'static/js/vendor/fastclick.js',
                      'static/js/app/*.js'],
                dest: 'static/js/compiled/app.js'
            }
        },

        less: {
            app: {
                files: {
                    "static/css/compiled/app.css": "static/css/app.less"
                }
            }
        },

        watch: {
            scripts: {
                files: ['static/js/app/*.js', 'static/js/vendor/*.js'],
                tasks: ['uglify:app']
            },
            stylesheets: {
                files: ['static/css/*.less'],
                tasks: ['less']
            }
        },

        develop: {
            server: {
                file: 'app.js',
                env: { NODE_ENV: 'development'}
            }
        }
    });

    grunt.registerTask('default', ['uglify', 'less']);
    grunt.registerTask('server', ['uglify', 'less', 'develop', 'watch']);

};
