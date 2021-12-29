'use strict';

const { expect } = require('chai');

const pageParser = require('../').page;

describe('page-parser', () => {
    it('should be a function', () => {
        expect(pageParser).to.be.a('function');
    });

    it('should return a number', () => {
        expect(pageParser(1)).to.be.a('number');
        expect(pageParser(1234)).to.equal(1234);
    });

    it('should accept number strings and convert them', () => {
        expect(pageParser('1')).to.be.a('number');
        expect(pageParser('1234')).to.equal(1234);
    });

    it('should return 1 for undefined', () => {
        const output = pageParser();
        expect(output).to.be.a('number');
        expect(output).to.equal(1);
    });

    it('should throw an error for non-number strings', () => {
        expect(() => {
            pageParser('foo');
        }).to.throw(Error);
        expect(() => {
            pageParser({});
        }).to.throw(Error);
        expect(() => {
            pageParser([]);
        }).to.throw(Error);
    });

    it('should throw an error for numbers < 1', () => {
        expect(() => {
            pageParser(0);
        }).to.throw(Error);
        expect(() => {
            pageParser('0');
        }).to.throw(Error);
        expect(() => {
            pageParser(-1);
        }).to.throw(Error);
        expect(() => {
            pageParser(-100);
        }).to.throw(Error);
    });
});
