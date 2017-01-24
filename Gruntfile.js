'use strict';

module.exports = (grunt) => {
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

        mocha_istanbul: {
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
                cmd: './node_modules/.bin/pegjs -o select-parser.js ./src/select-parser.pegjs'
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
