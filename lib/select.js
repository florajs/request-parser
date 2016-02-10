'use strict';

var PEG = require('pegjs');
var fs = require('fs');

var requestParser = require('../index');

var parser = require('./select-parser');

//var parser = PEG.buildParser(fs.readFileSync(__dirname + '/../src/select.pegjs', 'utf8'));

/**
 * Parse "select" options.
 *
 * @param {string} input
 * @return {Object}
 */
module.exports = function selectParser(input) {
    var res = parser.parse(input);
    return res;
};
