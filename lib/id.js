'use strict';

const { RequestError } = require('flora-errors');

/**
 * Parse "id".
 *
 * @param {(string|number)} input
 * @return {string}
 */
module.exports = function idParser(input) {
    if (typeof input !== 'string'
        && typeof input !== 'number') {
        throw new RequestError('id only allows string or number');
    }
    return '' + input;
};
