'use strict';

var expect = require('chai').expect;

var idParser = require('../').id;

describe('id parser', function () {
    it('should be a function', function () {
        expect(idParser).to.be.a('function');
    });

    it('should return the input as string', function () {
        expect(idParser(1)).to.be.a('string');
        expect(idParser(1)).to.equal("1");
        expect(idParser(3.1415)).to.equal("3.1415");
        expect(idParser("foo")).to.equal("foo");
    });

    it('should only accept string or number', function () {
        expect(function () { idParser(1); }).not.to.throw(Error);
        expect(function () { idParser(3.1415); }).not.to.throw(Error);
        expect(function () { idParser("foo"); }).not.to.throw(Error);
        expect(function () { idParser([]); }).to.throw(Error);
        expect(function () { idParser({}); }).to.throw(Error);
        expect(function () { idParser(); }).to.throw(Error);
    });
});
