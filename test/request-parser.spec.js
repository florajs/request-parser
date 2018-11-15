/* global describe, it */

'use strict';

const { expect } = require('chai');

const requestParser = require('../').parse;

describe('request-parser', () => {
    it('should be a function', () => {
        expect(requestParser).to.be.a('function');
    });

    it('throws an error if parameter is not an object', () => {
        expect(() => {
            requestParser();
        }).to.throw(Error);
        expect(() => {
            requestParser(42);
        }).to.throw(Error);
        expect(() => {
            requestParser('foo');
        }).to.throw(Error);
    });

    it('should return an object', () => {
        expect(requestParser({})).to.be.an('object');
    });

    it('accepts and passes through unknown properties', () => {
        expect(requestParser({ foo: 'bar' })).to.eql({ foo: 'bar' });
    });

    describe('id', () => {
        it('should parse "id" property', () => {
            const parsed = requestParser({ id: 42 });
            expect(parsed).to.be.an('object');
        });
    });

    describe('aggregate', () => {
        it('is not implemented', () => {
            expect(() => {
                requestParser({ aggregate: {} });
            }).to.throw(Error);
        });
    });

    describe('limit', () => {
        it('should parse "limit" property', () => {
            const parsed = requestParser({ limit: 42 });
            expect(parsed).to.be.an('object');
        });

        it('throws an error if "limit" is invalid', () => {
            expect(() => {
                requestParser({ limit: 'foo' });
            }).to.throw(Error);
        });
    });

    describe('page', () => {
        it('should parse "page" property', () => {
            const parsed = requestParser({ page: 42 });
            expect(parsed).to.be.an('object');
        });

        it('throws an error if "page" is invalid', () => {
            expect(() => {
                requestParser({ page: 'foo' });
            }).to.throw(Error);
        });
    });

    describe('order', () => {
        it('should parse "order" property', () => {
            const parsed = requestParser({ order: 'name:asc' });
            expect(parsed).to.be.an('object');
        });

        it('throws an error if "order" is invalid', () => {
            expect(() => {
                requestParser({ order: 42 });
            }).to.throw(Error);
        });
    });

    describe('search', () => {
        it('should parse "order" property', () => {
            const parsed = requestParser({ search: 'foo' });
            expect(parsed).to.be.an('object');
        });
    });

    describe('select', () => {
        it('should parse "select" property', () => {
            const parsed = requestParser({ select: 'title,instruments.id,quote[countryId]' });
            expect(parsed).to.be.an('object');
        });

        it('throws an error if "select" is invalid', () => {
            expect(() => {
                requestParser({ select: 42 });
            }).to.throw(Error);
            expect(() => {
                requestParser({ select: '' });
            }).to.throw(Error);
            expect(() => {
                requestParser({ select: { foo: 'bar' } });
            }).to.throw(Error);
        });
    });

    describe('filter', () => {
        it('should parse "filter" property', () => {
            const parsed = requestParser({ filter: 'type.id=1' });
            expect(parsed).to.be.an('object');
        });

        it('throws an error if "filter" is invalid', () => {
            expect(() => {
                requestParser({ filter: 42 });
            }).to.throw(Error);
            expect(() => {
                requestParser({ filter: '' });
            }).to.throw(Error);
            expect(() => {
                requestParser({ filter: { foo: 'bar' } });
            }).to.throw(Error);
        });
    });
});
