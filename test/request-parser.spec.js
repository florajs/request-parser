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

    it('accepts and keeps unknown properties', () => {
        const request = { foo: 'bar' };
        requestParser(request);
        expect(request).to.eql({ foo: 'bar' });
    });

    describe('id', () => {
        it('should parse "id" property', () => {
            const request = { id: 42 };
            requestParser(request);
            expect(request).to.be.an('object');
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
            const request = { limit: 42 };
            requestParser(request);
            expect(request).to.be.an('object');
        });

        it('throws an error if "limit" is invalid', () => {
            expect(() => {
                requestParser({ limit: 'foo' });
            }).to.throw(Error);
        });
    });

    describe('page', () => {
        it('should parse "page" property', () => {
            const request = { page: 42 };
            requestParser(request);
            expect(request).to.be.an('object');
        });

        it('throws an error if "page" is invalid', () => {
            expect(() => {
                requestParser({ page: 'foo' });
            }).to.throw(Error);
        });
    });

    describe('order', () => {
        it('should parse "order" property', () => {
            const request = { order: 'name:asc' };
            requestParser(request);
            expect(request).to.be.an('object');
        });

        it('throws an error if "order" is invalid', () => {
            expect(() => {
                requestParser({ order: 42 });
            }).to.throw(Error);
        });
    });

    describe('search', () => {
        it('should parse "order" property', () => {
            const request = { search: 'foo' };
            requestParser(request);
            expect(request).to.be.an('object');
        });
    });

    describe('select', () => {
        it('should parse "select" property', () => {
            const request = { select: 'title,instruments.id,quote[countryId]' };
            requestParser(request);
            expect(request).to.be.an('object');
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
            const request = { filter: 'type.id=1' };
            requestParser(request);
            expect(request).to.be.an('object');
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
