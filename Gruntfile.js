module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        concat: {
            dist: {
                src: [
                    // 'src/prologue.js',
                    'src/Sim.js',
                    'src/MoveableMarker.js',
                    'src/Track.js',
                    'src/TrackController.js',
                    'src/Icon.js',
                    'src/MarkerClusterGroup.js',
                    'src/Event.js',
                    'src/Theme.js'
                    // 'src/epilogue.js'
                ],
                dest: 'dist/LeafletSim.js'
            }
        },

        uglify: {
            dist: {
                options: {
                    mangle: true,
                    compress: true
                },
                src: 'dist/LeafletSim.js',
                dest: 'dist/LeafletSim.min.js'
            }
        }

        //, writeBowerJson: {
        //     options: {
        //         bowerJsonTemplate: 'config/bower-template.json'
        //     }
        // }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    // grunt.loadNpmTasks('grunt-write-bower-json');

    grunt.registerTask('default', [
        'concat',
        'uglify',
        // 'writeBowerJson'
    ]);
};
