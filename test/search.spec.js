'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert');
const searchParser = require('../').search;

describe('search-parser', () => {
    it('should be a function', () => {
        assert.equal(typeof searchParser, 'function');
    });

    it('should return a string', () => {
        assert.equal(typeof searchParser('foo'), 'string');
        assert.equal(typeof searchParser(1234), 'string');
    });

    it('should accept strings and convert them', () => {
        assert.equal(typeof searchParser('1'), 'string');
        assert.equal(searchParser(1234), '1234');
    });

    it('should not modify strings', () => {
        assert.equal(searchParser('foo bar'), 'foo bar');
    });

    it('should return undefined for undefined', () => {
        assert.equal(searchParser(), undefined);
    });

    it('should throw an error for non-strings', () => {
        assert.throws(() => searchParser({}));
        assert.throws(() => searchParser([]));
    });
});
