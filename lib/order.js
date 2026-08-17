'use strict';

const { RequestError } = require('@florajs/errors');

const validOrders = ['asc', 'desc', 'random', 'topflop'];

/**
 * Parse "order" options.
 *
 * @param {string} input
 * @return {(Array.<Object>|Object)}
 */
module.exports = function orderParser(input) {
    if (typeof input !== 'string') {
        throw new RequestError('order must be a string');
    }

    const components = input.split(',');
    if (components.indexOf('') !== -1) {
        throw new RequestError('order cannot be empty');
    }

    const output = [];
    for (const component of components) {
        const parts = component.split(':');
        if (parts.length < 2) {
            throw new RequestError(`Invalid order parameter (missing direction): ${component}`);
        }
        if (parts.length > 2) {
            throw new RequestError(`Invalid order parameter: ${component}`);
        }

        const [attribute, direction] = parts;
        if (attribute.length === 0) {
            throw new RequestError('No attribute set to order');
        }
        if (!validOrders.includes(direction)) {
            throw new RequestError(`Invalid order direction: ${component}`);
        }

        output.push({ attribute: attribute.split('.'), direction });
    }

    return output;
};
