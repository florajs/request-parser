'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const orderParser = require('../').order;

describe('order-parser', () => {
    it('should be a function', () => {
        assert.equal(typeof orderParser, 'function');
    });

    Object.entries({
        number: 1,
        object: {},
        array: []
    }).forEach(([type, input]) =>
        it(`should throw an error for non-string arguments (${type})`, () => {
            assert.throws(() => orderParser(input), {
                name: 'RequestError',
                message: 'order must be a string'
            });
        })
    );

    ['', ','].forEach((input) =>
        it('does not accept empty strings', () => {
            assert.throws(() => orderParser(input), {
                name: 'RequestError',
                message: 'order cannot be empty'
            });
        })
    );

    it('accepts single order parameters', () => {
        assert.deepEqual(orderParser('name:asc'), [{ attribute: ['name'], direction: 'asc' }]);
    });

    it('accepts multiple order parameters', () => {
        assert.deepEqual(orderParser('name:asc,type:desc'), [
            { attribute: ['name'], direction: 'asc' },
            { attribute: ['type'], direction: 'desc' }
        ]);
    });

    Object.entries({
        foo: 'Invalid order parameter (missing direction): foo',
        'name:asc,type': 'Invalid order parameter (missing direction): type',
        'name:asc:foo': 'Invalid order parameter: name:asc:foo'
    }).forEach(([input, message]) =>
        it(`should throw an error for invalid order parameters (input: "${input}")`, () => {
            assert.throws(() => orderParser(input), {
                name: 'RequestError',
                message
            });
        })
    );

    ['name:as', 'name:ASC'].forEach((input) =>
        it(`should throw an error for invalid order directions (input: "${input}")`, () => {
            assert.throws(() => orderParser(input), {
                name: 'RequestError',
                message: `Invalid order direction: ${input}`
            });
        })
    );

    describe('"random" direction', () => {
        [':random', 'name:asc,:random'].forEach((input) =>
            it(`should be the only order element (input: "${input}")`, () => {
                assert.throws(() => orderParser(input), {
                    name: 'RequestError',
                    message: 'No attribute set to order'
                });
            })
        );

        it('should have no attribute', () => {
            assert.deepEqual(orderParser('name:random'), [{ attribute: ['name'], direction: 'random' }]);
        });
    });

    describe('single order parameters', () => {
        const o = orderParser('name:asc');

        it('should transform the argument into an array', () => {
            assert.ok(Array.isArray(o));
            assert.equal(o.length, 1);
        });

        it('should return an array of objects', () => {
            assert.equal(typeof o[0], 'object');
            assert.ok('attribute' in o[0]);
            assert.ok('direction' in o[0]);
            assert.ok(Array.isArray(o[0].attribute));
            assert.equal(o[0].attribute[0], 'name');
            assert.equal(o[0].direction, 'asc');
        });
    });

    describe('multiple order parameters', () => {
        const o = orderParser('foo:asc,bar:desc');

        it('should transform the argument into an array', () => {
            assert.ok(Array.isArray(o));
            assert.equal(o.length, 2);
        });

        it('should return an array of objects', () => {
            assert.equal(typeof o[0], 'object');
            assert.ok('attribute' in o[0]);
            assert.ok('direction' in o[0]);
            assert.ok(Array.isArray(o[0].attribute));
            assert.equal(o[0].attribute[0], 'foo');
            assert.equal(o[0].direction, 'asc');

            assert.equal(typeof o[1], 'object');
            assert.ok('attribute' in o[1]);
            assert.ok('direction' in o[1]);
            assert.ok(Array.isArray(o[1].attribute));
            assert.equal(o[1].attribute[0], 'bar');
            assert.equal(o[1].direction, 'desc');
        });
    });

    describe('nested attibutes', () => {
        const o = orderParser('instrument.id:asc');

        it('should transform the argument into an array', () => {
            assert.ok(Array.isArray(o));
            assert.equal(o.length, 1);
        });

        it('should return an array of objects', () => {
            assert.equal(typeof o[0], 'object');
            assert.ok('attribute' in o[0]);
            assert.ok('direction' in o[0]);
            assert.ok(Array.isArray(o[0].attribute));
            assert.equal(o[0].attribute[0], 'instrument');
            assert.equal(o[0].attribute[1], 'id');
            assert.equal(o[0].direction, 'asc');
        });
    });
});
