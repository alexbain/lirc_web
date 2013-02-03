
module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        min: {
            app: {
                src: ['js/vendor/zepto.min.js',
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
                tasks: ['min']
            },
            stylesheets: {
                files: ['css/*.less'],
                tasks: ['less']
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-less');

    grunt.registerTask('default', 'min less');

};


