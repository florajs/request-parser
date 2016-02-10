'use strict';

var expect = require('chai').expect;

var orderParser = require('../').order;

describe('order-parser', function () {
    it('should be a function', function () {
        expect(orderParser).to.be.a('function');
    });

    it('should throw an error for non-string arguments', function () {
        expect((function () { orderParser(1); })).to.throw(Error);
        expect((function () { orderParser({}); })).to.throw(Error);
        expect((function () { orderParser([]); })).to.throw(Error);
    });

    it('does not accept empty strings', function () {
        expect((function () { orderParser(''); })).to.throw(Error);
        expect((function () { orderParser(','); })).to.throw(Error);
    });

    it('accepts single order parameters', function () {
        expect((function () { orderParser('name:asc'); })).not.to.throw(Error);
    });

    it('accepts multiple order parameters', function () {
        expect((function () { orderParser('name:asc,type:desc'); })).not.to.throw(Error);
    });

    it('should throw an error for invalid order parameters', function () {
        expect((function () { orderParser('foo'); })).to.throw(Error);
        expect((function () { orderParser('name:asc,type'); })).to.throw(Error);
        expect((function () { orderParser('name:asc:foo'); })).to.throw(Error);
    });

    it('should throw an error for invalid order directions', function () {
        expect((function () { orderParser('name:as'); })).to.throw(Error);
        expect((function () { orderParser('name:ASC'); })).to.throw(Error);
    });

    describe('"random" direction', function () {
        it('should be the only order element', function () {
            expect((function () { orderParser(':random'); })).not.to.throw(Error);
            expect((function () { orderParser('name:asc,:random'); })).to.throw(Error);
        });

        it('should have no attribute', function () {
            expect((function () { orderParser('name:random'); })).to.throw(Error);
        });
    });

    describe('single order parameters', function () {
        var o = orderParser('name:asc');

        it('should transform the argument into an array', function () {
            expect(o).to.be.an('array');
            expect(o).to.have.length(1);
        });

        it('should return an array of objects', function () {
            expect(o[0]).to.be.an('object');
            expect(o[0]).to.have.ownProperty('attribute');
            expect(o[0]).to.have.ownProperty('direction');
            expect(o[0].attribute).to.be.an('array');
            expect(o[0].attribute[0]).to.equal('name');
            expect(o[0].direction).to.equal('asc');
        });
    });

    describe('multiple order parameters', function () {
        var o = orderParser('foo:asc,bar:desc');

        it('should transform the argument into an array', function () {
            expect(o).to.be.an('array');
            expect(o).to.have.length(2);
        });

        it('should return an array of objects', function () {
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

    describe('nested attibutes', function () {
        var o = orderParser('instrument.id:asc');

        it('should transform the argument into an array', function () {
            expect(o).to.be.an('array');
            expect(o).to.have.length(1);
        });

        it('should return an array of objects', function () {
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
