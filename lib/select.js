'use strict';

const parse = require('../select-parser').parse;

/**
 * Parse "select" options.
 *
 * @param {string} input
 * @return {Object}
 */
module.exports = function selectParser(input) {
    return parse(input);
};
