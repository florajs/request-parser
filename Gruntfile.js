'use strict';

module.exports = function (grunt) {

    grunt.initConfig({
        mochaTest: {
            test: {
                options: {
                    reporter: 'spec',
                    quiet: false
                },
                src: ['test/**/*.js']
            },
            bamboo: {
                options: {
                    reporter: 'mocha-bamboo-reporter',
                    quiet: false
                },
                src: ['<%= mochaTest.test.src %>']
            }
        },

        'mocha_istanbul': {
            coverage: {
                src: 'test',
                options: {
                    coverageFolder: 'build',
                    reportFormats: ['clover', 'lcov']
                }
            }
        },

        exec: {
            createParser: {
                cmd: './node_modules/.bin/pegjs ./src/select-parser.pegjs select-parser.js'
            }
        },

        benchmark: {
            all: {
                src: ['benchmarks/*.js']
            }
        },

        eslint: {
            target: ['lib/**/*.js']
        },

        clean: {
            build: {
                src: ['build/']
            }
        }
    });

    require('load-grunt-tasks')(grunt);

    grunt.registerTask('default', ['lint', 'test']);
    grunt.registerTask('doc', ['jsdoc']);
    grunt.registerTask('lint', 'eslint');
    grunt.registerTask('test', ['create-parser', 'mochaTest:test']);
    grunt.registerTask('test-bamboo', ['create-parser', 'mochaTest:bamboo']);
    grunt.registerTask('test-cov', ['create-parser', 'mocha_istanbul:coverage']);
    grunt.registerTask('create-parser', 'exec:createParser');

};
