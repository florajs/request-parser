'use strict';

const { RequestError } = require('@florajs/errors');

const unlimited = null;

/**
 * Parse "limit" options.
 *
 * @param {(number|string)} input
 * @return {?number}
 */
module.exports = function limitParser(input) {
    // convert strings
    if (typeof input === 'string') {
        if (input === 'unlimited') return unlimited;
        input = parseInt(input, 10);
    }

    // check type
    if (typeof input !== 'number' || !Number.isFinite(input)) {
        throw new RequestError('limit must be a number or "unlimited"');
    }

    // check range
    if (input < 1) {
        throw new RequestError('limit must be greater than 0');
    }

    return input;
};
