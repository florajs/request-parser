'use strict';

var parserOld = require('./lib/select-old');
var parserPeg = require('../lib/select');

var query = 'title,instruments(filter=assetClass.id=1)(order=name:asc)(limit=3)(page=1).quotations(filter=id=4)[quote[value,changePerc]]';

module.exports = {
    name: 'select-parser',
    tests: {
        'old parser': function () {
            parserOld(query);
        },
        'new parser': function () {
            parserPeg(query);
        }
    }
};
