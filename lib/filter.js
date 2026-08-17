'use strict';

const ql = require('@florajs/ql');
const { RequestError } = require('@florajs/errors');

const operators = {
    '!=': 'notEqual',
    '<=': 'lessOrEqual',
    '>=': 'greaterOrEqual',
    '=': 'equal',
    '~': 'like',
    '<': 'less',
    '>': 'greater'
    // 'between' will be handled differently
};

const rangeOperators = {
    '=': 'between',
    '!=': 'notBetween'
};

const config = {
    operators: ['!=', '<=', '>=', '=', '~', '<', '>'],
    glue: '.',
    and: ' AND ',
    or: ' OR ',
    relate: '%',
    string: '"',
    lookDelimiter: ' OR ',
    setDelimiter: ',',
    rangeDelimiter: '..',
    roundBracket: ['(', ')'],
    squareBracket: ['[', ']'],

    validateStrings: true,
    validateConnectives: true,
    validateStatements: true,
    elemMatch: false
};

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

    ql.setConfig(config);
    const result = ql.parse(input);

    for (const andConditions of result) {
        for (const condition of andConditions) {
            if (!condition.range) {
                condition.operator = operators[condition.operator];
                continue;
            }

            const rangeOperator = rangeOperators[condition.operator];
            if (!rangeOperator) throw new RequestError('invalid range operator');

            condition.operator = rangeOperator;
            condition.value = condition.range;
            delete condition.range;
        }
    }

    return result;
};
