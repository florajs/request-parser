'use strict';

var expect = require('chai').expect;

var searchParser = require('../lib/search');

describe('search-parser', function () {
    it('should be a function', function () {
        expect(searchParser).to.be.a('function');
    });

    it('should return a string', function () {
        expect(searchParser("foo")).to.be.a('string');
        expect(searchParser(1234)).to.be.a('string');
    });

    it('should accept strings and convert them', function () {
        expect(searchParser("1")).to.be.a('string');
        expect(searchParser(1234)).to.equal("1234");
    });

    it('should not modify strings', function () {
        expect(searchParser("foo bar")).to.equal("foo bar");
    });

    it('should return undefined for undefined', function () {
        expect(searchParser()).to.equal(undefined);
    });

    it('should throw an error for non-strings', function () {
        expect((function () { searchParser({}); })).to.throw(Error);
        expect((function () { searchParser([]); })).to.throw(Error);
    });
});
