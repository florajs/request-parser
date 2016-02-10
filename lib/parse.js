'use strict';

var RequestError = require('flora-errors').RequestError;

module.exports = parseRequest;

/**
 * Parse a request object.
 *
 * @param {Object} input
 * @return {Object}
 * @public
 */
function parseRequest(input) {
    var output = {};

    if (typeof input !== 'object') {
        throw new RequestError('Cannot parse request: must be an object');
    }

    var parsers = require('../');

    for (var key in input) {
        try {
            if (parsers.hasOwnProperty(key)) {
                output[key] = parsers[key](input[key]);
            } else {
                output[key] = input[key];
            }
        } catch (e) {
            var err = new RequestError('Cannot parse ' + key + ': ' + e.message);
            err.stack = e.stack;
            throw err;
        }
    }

    return output;
}
