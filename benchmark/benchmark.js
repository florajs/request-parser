'use strict';

var benchmark = require('benchmark');
var benchmarks = require('beautify-benchmark');

var parserOld = require('./lib/select-old');
var parserPeg = require('../lib/select');

var query = 'title,instruments(filter=assetClass.id=1)(order=name:asc)(limit=3)(page=1).quotations(filter=id=4)[quote[value,changePerc]]';

var suite = new benchmark.Suite();

suite.add('select-parser (flora-ql + Buchstabensuppe)', function () {
    parserOld(query);
});

suite.add('select-parser (PEG.js)', function () {
    parserPeg(query);
});

suite.on('cycle', function (event) {
    benchmarks.add(event.target);
});

suite.on('complete', function () {
    benchmarks.log();
});

suite.run();
