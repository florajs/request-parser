'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const idParser = require('../').id;

describe('id parser', () => {
    it('should be a function', () => {
        assert.equal(typeof idParser, 'function');
    });

    it('should return the input as string', () => {
        assert.equal(typeof idParser(1), 'string');
        assert.equal(idParser(1), '1');
        assert.equal(idParser(3.1415), '3.1415');
        assert.equal(idParser('foo'), 'foo');
    });

    it('should accept and return string or number input', () => {
        assert.equal(idParser(1), '1');
        assert.equal(idParser(3.1415), '3.1415');
        assert.equal(idParser('foo'), 'foo');
    });

    Object.entries({
        array: [],
        object: {},
        undefined: undefined
    }).forEach(([type, input]) =>
        it(`should throw an error for non-string/non-number arguments (${type})`, () => {
            assert.throws(() => idParser(input), {
                name: 'RequestError',
                message: 'id only allows string or number'
            });
        })
    );
});
