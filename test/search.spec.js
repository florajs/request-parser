'use strict';

const { expect } = require('chai');

const searchParser = require('../').search;

describe('search-parser', () => {
    it('should be a function', () => {
        expect(searchParser).to.be.a('function');
    });

    it('should return a string', () => {
        expect(searchParser('foo')).to.be.a('string');
        expect(searchParser(1234)).to.be.a('string');
    });

    it('should accept strings and convert them', () => {
        expect(searchParser('1')).to.be.a('string');
        expect(searchParser(1234)).to.equal('1234');
    });

    it('should not modify strings', () => {
        expect(searchParser('foo bar')).to.equal('foo bar');
    });

    it('should return undefined for undefined', () => {
        expect(searchParser()).to.equal(undefined);
    });

    it('should throw an error for non-strings', () => {
        expect(() => {
            searchParser({});
        }).to.throw(Error);
        expect(() => {
            searchParser([]);
        }).to.throw(Error);
    });
});
