'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert');
const limitParser = require('../').limit;

describe('limit parser', () => {
    it('should be a function', () => {
        assert.equal(typeof limitParser, 'function');
    });

    it('should return a number', () => {
        assert.equal(typeof limitParser(1), 'number');
        assert.equal(limitParser(1234), 1234);
    });

    it('should accept number strings and convert them', () => {
        assert.equal(typeof limitParser(1), 'number');
        assert.equal(limitParser('1234'), 1234);
        assert.equal(limitParser('999999999999999'), 999999999999999);
    });

    it('should return null for "unlimited"', () => {
        assert.equal(limitParser('unlimited'), null);
    });

    it('should throw an error for non-number strings', () => {
        assert.throws(() => limitParser('foo'), { message: 'limit must be an integer or "unlimited"' });
        assert.throws(() => limitParser({}), { message: 'limit must be an integer or "unlimited"' });
        assert.throws(() => limitParser([]), { message: 'limit must be an integer or "unlimited"' });
    });

    it('should throw an error for strings that are isNaN, but might be parsed by parseInt', () => {
        assert.throws(() => limitParser('5;1'), { message: 'limit must be an integer or "unlimited"' });
    });

    it('should throw an error for non-integers', () => {
        assert.throws(() => limitParser(5.1), { message: 'limit must be an integer or "unlimited"' });
        assert.throws(() => limitParser('5.1'), { message: 'limit must be an integer or "unlimited"' });
    });

    it('should throw an error for unsafe integers', () => {
        assert.throws(() => limitParser('999999999999999999'), { message: 'limit must be an integer or "unlimited"' });
    });

    it('should throw an error for numbers < 1', () => {
        assert.throws(() => limitParser(0), { message: 'limit must be greater than 0' });
        assert.throws(() => limitParser('0'), { message: 'limit must be greater than 0' });
        assert.throws(() => limitParser(-1), { message: 'limit must be greater than 0' });
        assert.throws(() => limitParser(-100), { message: 'limit must be greater than 0' });
    });
});
