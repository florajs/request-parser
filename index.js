'use strict';

var RequestError = require('flora-errors').RequestError;

module.exports = parseRequest;

var parsers = {
    'id': require('./lib/id'),
    'aggregate': require('./lib/aggregate'),
    'filter': require('./lib/filter'),
    'limit': require('./lib/limit'),
    'order': require('./lib/order'),
    'page': require('./lib/page'),
    'search': require('./lib/search'),
    'select': require('./lib/select')
};

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
