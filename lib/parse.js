'use strict';

const { RequestError } = require('@florajs/errors');
const parsers = require('./parsers');

/**
 * Parse a request object.
 *
 * @param {Object} request
 * @return {Object}
 * @public
 */
module.exports = function parseRequest(request) {
    if (typeof request !== 'object') {
        throw new RequestError('Cannot parse request: must be an object');
    }

    for (const key of Object.keys(request)) {
        try {
            if (Object.hasOwn(parsers, key)) {
                request[key] = parsers[key](request[key]);
            }
        } catch (e) {
            const err = new RequestError(`Cannot parse ${key}: ${e.message}`);
            err.stack = e.stack;
            throw err;
        }
    }
};
