'use strict';

const ql = require('flora-ql');
const { RequestError } = require('flora-errors');

const operators = {
    '!=': 'notEqual',
    '<=': 'lessOrEqual',
    '>=': 'greaterOrEqual',
    '=': 'equal',
    '<': 'less',
    '>': 'greater'
};

ql.setConfig('api');

/**
 * Parse "filter" options.
 *
 * @param {string} input
 * @return {Object}
 */
module.exports = function filterParser(input) {
    if (typeof input !== 'string') {
        throw new RequestError('filter must be a string');
    }

    const result = ql.parse(input);

    for (let i = 0; i < result.length; i++) {
        for (let j = 0; j < result[i].length; j++) {
            result[i][j].operator = operators[result[i][j].operator];
        }
    }

    return result;
};
