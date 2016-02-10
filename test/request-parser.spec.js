'use strict';

var expect = require('chai').expect;

var requestParser = require('../').parse;

describe('request-parser', function () {
    it('should be a function', function () {
        expect(requestParser).to.be.a('function');
    });

    it('throws an error if parameter is not an object', function () {
        expect((function () { requestParser(); })).to.throw(Error);
        expect((function () { requestParser(42); })).to.throw(Error);
        expect((function () { requestParser("foo"); })).to.throw(Error);
    });

    it('should return an object', function () {
        expect(requestParser({})).to.be.an('object');
    });

    it('accepts and passes through unknown properties', function () {
        expect(requestParser({"foo": "bar"})).to.eql({"foo": "bar"});
    });

    describe('id', function () {
        it('should parse "id" property', function () {
            var parsed = requestParser({"id": 42});
            expect(parsed).to.be.an('object');
        });
    });

    describe('aggregate', function () {
        it('is not implemented', function () {
            expect((function () { requestParser({"aggregate": {}}); })).to.throw(Error);
        });
    });

    describe('limit', function () {
        it('should parse "limit" property', function () {
            var parsed = requestParser({"limit": 42});
            expect(parsed).to.be.an('object');
        });

        it('throws an error if "limit" is invalid', function () {
            expect((function () { requestParser({"limit": "foo"}); })).to.throw(Error);
        });
    });

    describe('page', function () {
        it('should parse "page" property', function () {
            var parsed = requestParser({"page": 42});
            expect(parsed).to.be.an('object');
        });

        it('throws an error if "page" is invalid', function () {
            expect((function () { requestParser({"page": "foo"}); })).to.throw(Error);
        });
    });

    describe('order', function () {
        it('should parse "order" property', function () {
            var parsed = requestParser({"order": "name:asc"});
            expect(parsed).to.be.an('object');
        });

        it('throws an error if "order" is invalid', function () {
            expect((function () { requestParser({"order": 42}); })).to.throw(Error);
        });
    });

    describe('search', function () {
        it('should parse "order" property', function () {
            var parsed = requestParser({"search": "foo"});
            expect(parsed).to.be.an('object');
        });
    });

    describe('select', function () {
        it('should parse "select" property', function () {
            var parsed = requestParser({"select": "title,instruments.id,quote[countryId]"});
            expect(parsed).to.be.an('object');
        });

        it('throws an error if "select" is invalid', function () {
            expect((function () { requestParser({"select": 42}); })).to.throw(Error);
            expect((function () { requestParser({"select": ""}); })).to.throw(Error);
            expect((function () { requestParser({"select": {foo: "bar"}}); })).to.throw(Error);
        });
    });

    describe('filter', function () {
        it('should parse "filter" property', function () {
            var parsed = requestParser({"filter": "type.id=1"});
            expect(parsed).to.be.an('object');
        });

        it('throws an error if "filter" is invalid', function () {
            expect((function () { requestParser({"filter": 42}); })).to.throw(Error);
            expect((function () { requestParser({"filter": ""}); })).to.throw(Error);
            expect((function () { requestParser({"filter": {foo: "bar"}}); })).to.throw(Error);
        });
    });
});
