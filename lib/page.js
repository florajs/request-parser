'use strict';

const { RequestError } = require('@florajs/errors');

/**
 * Parse "page" options.
 *
 * @param {(number|string|undefined)} input
 * @return {number}
 */
module.exports = function pageParser(input) {
    // default: 1
    if (typeof input === 'undefined') return 1;

    // convert strings
    if (typeof input === 'string') {
        input = parseInt(input, 10);
    }

    // check type
    if (typeof input !== 'number' || !Number.isFinite(input)) {
        throw new RequestError('page must be a number');
    }

    // check range
    if (input < 1) {
        throw new RequestError('page must be greater than 0');
    }

    return input;
};
