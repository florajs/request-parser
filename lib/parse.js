'use strict';

const { RequestError } = require('flora-errors');

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

    // eslint-disable-next-line global-require
    const parsers = require('../');

    Object.keys(request).forEach((key) => {
        try {
            if (Object.prototype.hasOwnProperty.call(parsers, key)) {
                request[key] = parsers[key](request[key]);
            }
        } catch (e) {
            const err = new RequestError(`Cannot parse ${key}: ${e.message}`);
            err.stack = e.stack;
            throw err;
        }
    });
};
