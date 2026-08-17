'use strict';

const parsers = require('./lib/parsers');

module.exports = {
    ...parsers,
    parse: require('./lib/parse')
};
