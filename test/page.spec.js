'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
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

    Object.entries({
        string: 'foo',
        object: {},
        array: []
    }).forEach(([type, input]) =>
        it(`should throw an error for non-number strings (type: ${type})`, () => {
            assert.throws(() => pageParser(input), {
                name: 'RequestError',
                message: 'page must be a number'
            });
        })
    );

    [0, '0', -1, -100].forEach((page) =>
        it(`should throw an error for numbers < 1 (page: ${page})`, () => {
            assert.throws(() => pageParser(page), {
                name: 'RequestError',
                message: 'page must be greater than 0'
            });
        })
    );
});
