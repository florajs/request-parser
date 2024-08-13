'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert');
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

    it('should only accept string or number', () => {
        assert.doesNotThrow(() => idParser(1));
        assert.doesNotThrow(() => idParser(3.1415));
        assert.doesNotThrow(() => idParser('foo'));
        assert.throws(() => idParser([]));
        assert.throws(() => idParser({}));
        assert.throws(() => idParser());
    });
});
