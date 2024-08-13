'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert');
const orderParser = require('../').order;

describe('order-parser', () => {
    it('should be a function', () => {
        assert.equal(typeof orderParser, 'function');
    });

    it('should throw an error for non-string arguments', () => {
        assert.throws(() => orderParser(1));
        assert.throws(() => orderParser({}));
        assert.throws(() => orderParser([]));
    });

    it('does not accept empty strings', () => {
        assert.throws(() => orderParser(''));
        assert.throws(() => orderParser(','));
    });

    it('accepts single order parameters', () => {
        assert.doesNotThrow(() => orderParser('name:asc'));
    });

    it('accepts multiple order parameters', () => {
        assert.doesNotThrow(() => orderParser('name:asc,type:desc'));
    });

    it('should throw an error for invalid order parameters', () => {
        assert.throws(() => orderParser('foo'));
        assert.throws(() => orderParser('name:asc,type'));
        assert.throws(() => orderParser('name:asc:foo'));
    });

    it('should throw an error for invalid order directions', () => {
        assert.throws(() => orderParser('name:as'));
        assert.throws(() => orderParser('name:ASC'));
    });

    describe('"random" direction', () => {
        it('should be the only order element', () => {
            assert.throws(() => orderParser(':random'));
            assert.throws(() => orderParser('name:asc,:random'));
        });

        it('should have no attribute', () => {
            assert.doesNotThrow(() => orderParser('name:random'));
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
