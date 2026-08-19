'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const requestParser = require('../').parse;

describe('request-parser', () => {
    it('should be a function', () => {
        assert.equal(typeof requestParser, 'function');
    });

    Object.entries({
        undefined: undefined,
        number: 42,
        string: 'foo'
    }).forEach(([type, input]) =>
        it(`throws an error if parameter is not an object (type: ${type})`, () => {
            assert.throws(() => requestParser(input), {
                name: 'RequestError',
                message: 'Cannot parse request: must be an object'
            });
        })
    );

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
            assert.throws(() => requestParser({ aggregate: {} }), {
                name: 'RequestError',
                message: 'Cannot parse aggregate: aggregate is not implemented yet'
            });
        });
    });

    describe('limit', () => {
        it('should parse "limit" property', () => {
            const request = { limit: 42 };
            requestParser(request);
            assert.equal(typeof request, 'object');
        });

        it('throws an error if "limit" is invalid', () => {
            assert.throws(() => requestParser({ limit: 'foo' }), {
                name: 'RequestError',
                message: 'Cannot parse limit: limit must be an integer or "unlimited"'
            });
        });
    });

    describe('page', () => {
        it('should parse "page" property', () => {
            const request = { page: 42 };
            requestParser(request);
            assert.equal(typeof request, 'object');
        });

        it('throws an error if "page" is invalid', () => {
            assert.throws(() => requestParser({ page: 'foo' }), {
                name: 'RequestError',
                message: 'Cannot parse page: page must be a number'
            });
        });
    });

    describe('order', () => {
        it('should parse "order" property', () => {
            const request = { order: 'name:asc' };
            requestParser(request);
            assert.equal(typeof request, 'object');
        });

        it('throws an error if "order" is invalid', () => {
            assert.throws(() => requestParser({ order: 42 }), {
                name: 'RequestError',
                message: 'Cannot parse order: order must be a string'
            });
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

        new Map([
            [{ select: 42 }, 'Cannot parse select: select must be a string'],
            [{ select: '' }, 'Cannot parse select: Expected "[" or [A-Za-z0-9_{}] but end of input found.'],
            [{ select: { foo: 'bar' } }, 'Cannot parse select: select must be a string']
        ]).forEach((message, input) =>
            it(`throws an error if "select" is invalid (input: ${JSON.stringify(input)})`, () => {
                assert.throws(() => requestParser(input), {
                    name: 'RequestError',
                    message
                });
            })
        );
    });

    describe('filter', () => {
        it('should parse "filter" property', () => {
            const request = { filter: 'type.id=1' };
            requestParser(request);
            assert.equal(typeof request, 'object');
        });

        [
            [42, 'Cannot parse filter: filter must be a string'],
            ['', 'Cannot parse filter: Invalid query string'],
            [{ foo: 'bar' }, 'Cannot parse filter: filter must be a string']
        ].forEach(([value, message]) =>
            it(`throws an error if "filter" is invalid (value: ${JSON.stringify(value)})`, () => {
                assert.throws(() => requestParser({ filter: value }), {
                    name: 'RequestError',
                    message
                });
            })
        );
    });
});
