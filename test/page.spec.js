'use strict';

var expect = require('chai').expect;

var pageParser = require('../').page;

describe('page-parser', function () {
    it('should be a function', function () {
        expect(pageParser).to.be.a('function');
    });

    it('should return a number', function () {
        expect(pageParser(1)).to.be.a('number');
        expect(pageParser(1234)).to.equal(1234);
    });

    it('should accept number strings and convert them', function () {
        expect(pageParser("1")).to.be.a('number');
        expect(pageParser("1234")).to.equal(1234);
    });

    it('should return 1 for undefined', function () {
        var output = pageParser();
        expect(output).to.be.a('number');
        expect(output).to.equal(1);
    });

    it('should throw an error for non-number strings', function () {
        expect((function () { pageParser("foo"); })).to.throw(Error);
        expect((function () { pageParser({}); })).to.throw(Error);
        expect((function () { pageParser([]); })).to.throw(Error);
    });

    it('should throw an error for numbers < 1', function () {
        expect((function () { pageParser(0); })).to.throw(Error);
        expect((function () { pageParser("0"); })).to.throw(Error);
        expect((function () { pageParser(-1); })).to.throw(Error);
        expect((function () { pageParser(-100); })).to.throw(Error);
    });
});
