'use strict';

const { expect } = require('chai');

const orderParser = require('../').order;

describe('order-parser', () => {
    it('should be a function', () => {
        expect(orderParser).to.be.a('function');
    });

    it('should throw an error for non-string arguments', () => {
        expect(() => {
            orderParser(1);
        }).to.throw(Error);
        expect(() => {
            orderParser({});
        }).to.throw(Error);
        expect(() => {
            orderParser([]);
        }).to.throw(Error);
    });

    it('does not accept empty strings', () => {
        expect(() => {
            orderParser('');
        }).to.throw(Error);
        expect(() => {
            orderParser(',');
        }).to.throw(Error);
    });

    it('accepts single order parameters', () => {
        expect(() => {
            orderParser('name:asc');
        }).not.to.throw(Error);
    });

    it('accepts multiple order parameters', () => {
        expect(() => {
            orderParser('name:asc,type:desc');
        }).not.to.throw(Error);
    });

    it('should throw an error for invalid order parameters', () => {
        expect(() => {
            orderParser('foo');
        }).to.throw(Error);
        expect(() => {
            orderParser('name:asc,type');
        }).to.throw(Error);
        expect(() => {
            orderParser('name:asc:foo');
        }).to.throw(Error);
    });

    it('should throw an error for invalid order directions', () => {
        expect(() => {
            orderParser('name:as');
        }).to.throw(Error);
        expect(() => {
            orderParser('name:ASC');
        }).to.throw(Error);
    });

    describe('"random" direction', () => {
        it('should be the only order element', () => {
            expect(() => {
                orderParser(':random');
            }).to.throw(Error);
            expect(() => {
                orderParser('name:asc,:random');
            }).to.throw(Error);
        });

        it('should have no attribute', () => {
            expect(() => {
                orderParser('name:random');
            }).not.to.throw(Error);
        });
    });

    describe('single order parameters', () => {
        const o = orderParser('name:asc');

        it('should transform the argument into an array', () => {
            expect(o).to.be.an('array');
            expect(o).to.have.length(1);
        });

        it('should return an array of objects', () => {
            expect(o[0]).to.be.an('object');
            expect(o[0]).to.have.ownProperty('attribute');
            expect(o[0]).to.have.ownProperty('direction');
            expect(o[0].attribute).to.be.an('array');
            expect(o[0].attribute[0]).to.equal('name');
            expect(o[0].direction).to.equal('asc');
        });
    });

    describe('multiple order parameters', () => {
        const o = orderParser('foo:asc,bar:desc');

        it('should transform the argument into an array', () => {
            expect(o).to.be.an('array');
            expect(o).to.have.length(2);
        });

        it('should return an array of objects', () => {
            expect(o[0]).to.be.an('object');
            expect(o[0]).to.have.ownProperty('attribute');
            expect(o[0]).to.have.ownProperty('direction');
            expect(o[0].attribute).to.be.an('array');
            expect(o[0].attribute[0]).to.equal('foo');
            expect(o[0].direction).to.equal('asc');

            expect(o[1]).to.be.an('object');
            expect(o[1]).to.have.ownProperty('attribute');
            expect(o[1]).to.have.ownProperty('direction');
            expect(o[1].attribute).to.be.an('array');
            expect(o[1].attribute[0]).to.equal('bar');
            expect(o[1].direction).to.equal('desc');
        });
    });

    describe('nested attibutes', () => {
        const o = orderParser('instrument.id:asc');

        it('should transform the argument into an array', () => {
            expect(o).to.be.an('array');
            expect(o).to.have.length(1);
        });

        it('should return an array of objects', () => {
            expect(o[0]).to.be.an('object');
            expect(o[0]).to.have.ownProperty('attribute');
            expect(o[0]).to.have.ownProperty('direction');
            expect(o[0].attribute).to.be.an('array');
            expect(o[0].attribute[0]).to.equal('instrument');
            expect(o[0].attribute[1]).to.equal('id');
            expect(o[0].direction).to.equal('asc');
        });
    });
});
