'use strict';

var expect = require('chai').expect;

var aggregateParser = require('../lib/aggregate');

describe('aggregate parser', function () {
    it('should be a function', function () {
        expect(aggregateParser).to.be.a('function');
    });

    it('should throw an error (not implemented)', function () {
        expect((function () { aggregateParser({}); })).to.throw(Error);
    });
});
