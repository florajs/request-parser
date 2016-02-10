'use strict';

var expect = require('chai').expect;

var limitParser = require('../lib/limit');

describe('limit parser', function () {
    it('should be a function', function () {
        expect(limitParser).to.be.a('function');
    });

    it('should return a number', function () {
        expect(limitParser(1)).to.be.a('number');
        expect(limitParser(1234)).to.equal(1234);
    });

    it('should accept number strings and convert them', function () {
        expect(limitParser("1")).to.be.a('number');
        expect(limitParser("1234")).to.equal(1234);
    });

    it('should return null for "unlimited"', function () {
        expect(limitParser("unlimited")).to.equal(null);
    });

    it('should throw an error for non-number strings', function () {
        expect((function () { limitParser("foo"); })).to.throw(Error);
        expect((function () { limitParser({}); })).to.throw(Error);
        expect((function () { limitParser([]); })).to.throw(Error);
    });

    it('should throw an error for numbers < 1', function () {
        expect((function () { limitParser(0); })).to.throw(Error);
        expect((function () { limitParser("0"); })).to.throw(Error);
        expect((function () { limitParser(-1); })).to.throw(Error);
        expect((function () { limitParser(-100); })).to.throw(Error);
    });
});
