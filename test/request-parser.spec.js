'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert');
const requestParser = require('../').parse;

describe('request-parser', () => {
    it('should be a function', () => {
        assert.equal(typeof requestParser, 'function');
    });

    it('throws an error if parameter is not an object', () => {
        assert.throws(() => requestParser());
        assert.throws(() => requestParser(42));
        assert.throws(() => requestParser('foo'));
    });

    it('accepts and keeps unknown properties', () => {
        const request = { foo: 'bar' };
        requestParser(request);
        assert.deepEqual(request, { foo: 'bar' });
    });

    describe('id', () => {
        it('should parse "id" property', () => {
            const request = { id: 42 };
            requestParser(request);
            assert.equal(typeof request, 'object');
        });
    });

    describe('aggregate', () => {
        it('is not implemented', () => {
            assert.throws(() => requestParser({ aggregate: {} }));
        });
    });

    describe('limit', () => {
        it('should parse "limit" property', () => {
            const request = { limit: 42 };
            requestParser(request);
            assert.equal(typeof request, 'object');
        });

        it('throws an error if "limit" is invalid', () => {
            assert.throws(() => requestParser({ limit: 'foo' }));
        });
    });

    describe('page', () => {
        it('should parse "page" property', () => {
            const request = { page: 42 };
            requestParser(request);
            assert.equal(typeof request, 'object');
        });

        it('throws an error if "page" is invalid', () => {
            assert.throws(() => requestParser({ page: 'foo' }));
        });
    });

    describe('order', () => {
        it('should parse "order" property', () => {
            const request = { order: 'name:asc' };
            requestParser(request);
            assert.equal(typeof request, 'object');
        });

        it('throws an error if "order" is invalid', () => {
            assert.throws(() => requestParser({ order: 42 }));
        });
    });

    describe('search', () => {
        it('should parse "order" property', () => {
            const request = { search: 'foo' };
            requestParser(request);
            assert.equal(typeof request, 'object');
        });
    });

    describe('select', () => {
        it('should parse "select" property', () => {
            const request = { select: 'title,instruments.id,quote[countryId]' };
            requestParser(request);
            assert.equal(typeof request, 'object');
        });

        it('throws an error if "select" is invalid', () => {
            assert.throws(() => requestParser({ select: 42 }));
            assert.throws(() => requestParser({ select: '' }));
            assert.throws(() => requestParser({ select: { foo: 'bar' } }));
        });
    });

    describe('filter', () => {
        it('should parse "filter" property', () => {
            const request = { filter: 'type.id=1' };
            requestParser(request);
            assert.equal(typeof request, 'object');
        });

        it('throws an error if "filter" is invalid', () => {
            assert.throws(() => requestParser({ filter: 42 }));
            assert.throws(() => requestParser({ filter: '' }));
            assert.throws(() => requestParser({ filter: { foo: 'bar' } }));
        });
    });
});
