'use strict';

const parse = require('../select-parser').parse;

function checkKeys(parsed, enableBraces = false) {
    Object.keys(parsed).forEach((key) => {
        if (!enableBraces && (key.includes('{') || key.includes('}'))) {
            throw new SyntaxError('Invalid attribute name: { } is not allowed');
        }
        if (parsed[key].select) checkKeys(parsed[key].select, false);
    });
}

/**
 * Parse "select" options.
 *
 * @param {string} input
 * @param {Object} options
 * @param {boolean} option.enableBraces
 * @return {Object}
 */
module.exports = function selectParser(input, options = {}) {
    const parsed = parse(input);
    checkKeys(parsed, options.enableBraces);
    return parsed;
};
