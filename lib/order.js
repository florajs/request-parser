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

    Object.keys(components).forEach((i) => {
        const s = components[i].split(':');
        if (s.length < 2) {
            throw new RequestError('Invalid order parameter (missing direction): ' + components[i]);
        }
        if (s.length > 2) {
            throw new RequestError('Invalid order parameter: ' + components[i]);
        }
        if (s[0].length == 0) {
            throw new RequestError('No attribute set to order');
        }
        if (validOrders.indexOf(s[1]) === -1) {
            throw new RequestError('Invalid order direction: ' + components[i]);
        }

        output.push({
            attribute: s[0].split('.'),
            direction: s[1]
        });
    });

    return output;
};
