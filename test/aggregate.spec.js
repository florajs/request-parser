'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert');
const aggregateParser = require('../').aggregate;

describe('aggregate parser', () => {
    it('should be a function', () => {
        assert.equal(typeof aggregateParser, 'function');
    });

    it('should throw an error (not implemented)', () => {
        assert.throws(() => aggregateParser({}));
    });
});
