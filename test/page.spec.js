'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert');
const pageParser = require('../').page;

describe('page-parser', () => {
    it('should be a function', () => {
        assert.equal(typeof pageParser, 'function');
    });

    it('should return a number', () => {
        assert.equal(typeof pageParser(1), 'number');
        assert.equal(pageParser(1234), 1234);
    });

    it('should accept number strings and convert them', () => {
        assert.equal(typeof pageParser('1'), 'number');
        assert.equal(pageParser('1234'), 1234);
    });

    it('should return 1 for undefined', () => {
        const output = pageParser();
        assert.equal(typeof output, 'number');
        assert.equal(output, 1);
    });

    it('should throw an error for non-number strings', () => {
        assert.throws(() => pageParser('foo'));
        assert.throws(() => pageParser({}));
        assert.throws(() => pageParser([]));
    });

    it('should throw an error for numbers < 1', () => {
        assert.throws(() => pageParser(0));
        assert.throws(() => pageParser('0'));
        assert.throws(() => pageParser(-1));
        assert.throws(() => pageParser(-100));
    });
});
