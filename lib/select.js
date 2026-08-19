'use strict';

const { RequestError } = require('@florajs/errors');
const { parse } = require('../build/select-parser');

function checkKeys(parsed, enableBraces = false) {
    for (const key of Object.keys(parsed)) {
        if (!enableBraces && (key.includes('{') || key.includes('}'))) {
            throw new SyntaxError('Invalid attribute name: { } is not allowed');
        }
        if (parsed[key].select) checkKeys(parsed[key].select, false);
    }
}

/**
 * Parse "select" options.
 *
 * @param {string} input
 * @param {Object} options
 * @param {boolean} options.enableBraces
 * @return {Object}
 */
module.exports = function selectParser(input, options = {}) {
    if (typeof input !== 'string') {
        throw new RequestError('select must be a string');
    }

    const parsed = parse(input);
    checkKeys(parsed, options.enableBraces);
    return parsed;
};
