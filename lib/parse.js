'use strict';

const has = require('has');
const { RequestError } = require('flora-errors');

/**
 * Parse a request object.
 *
 * @param {Object} input
 * @return {Object}
 * @public
 */
module.exports = function parseRequest(input) {
    const output = {};

    if (typeof input !== 'object') {
        throw new RequestError('Cannot parse request: must be an object');
    }

    // eslint-disable-next-line global-require
    const parsers = require('../');

    Object.keys(input).forEach((key) => {
        try {
            if (has(parsers, key)) {
                output[key] = parsers[key](input[key]);
            } else {
                output[key] = input[key];
            }
        } catch (e) {
            const err = new RequestError(`Cannot parse ${key}: ${e.message}`);
            err.stack = e.stack;
            throw err;
        }
    });

    return output;
};
