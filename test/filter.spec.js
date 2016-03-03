'use strict';

var expect = require('chai').expect;

var filterParser = require('../').filter;

describe('filter parser', function () {
    it('should be a function', function () {
        expect(filterParser).to.be.a('function');
    });

    it('should throw an error for non-string arguments', function () {
        expect((function () { filterParser(1); })).to.throw(Error);
        expect((function () { filterParser({}); })).to.throw(Error);
        expect((function () { filterParser([]); })).to.throw(Error);
    });

    it('does not accept empty strings', function () {
        expect((function () { filterParser(''); })).to.throw(Error);
    });

    describe('filter by single attribute', function () {
        it('accepts single filter parameters', function () {
            expect((function () { filterParser('type.id=1'); })).not.to.throw(Error);
        });

        it('parses single attributes', function () {
            expect(filterParser('id=1')).to.eql([
                [{attribute: ['id'], operator: 'equal', value: 1}]
            ]);
        });

        it('parses single composite attributes (resolves attribute)', function () {
            expect(filterParser('type.id=1')).to.eql([
                [{attribute: ['type', 'id'], operator: 'equal', value: 1}]
            ]);
        });
    });

    describe('multiple values', function () {
        it('accepts multiple values with ","', function () {
            expect((function () { filterParser('type.id=1,2,3'); })).not.to.throw(Error);
        });

        it('parses into arrays', function () {
            expect(filterParser('type.id=1,2,3')).to.eql([
                [{attribute: ['type', 'id'], operator: 'equal', value: [1, 2, 3]}]
            ]);
        });
    });

    describe('multiple attributes with "AND"', function () {
        it('accepts AND syntax', function () {
            expect((function () { filterParser('type.id=1 AND categories.id=2'); })).not.to.throw(Error);
        });

        it('parses into top-level array', function () {
            expect(filterParser('type.id=1 AND categories.id=2')).to.eql([
                [
                    {attribute: ['type', 'id'], operator: 'equal', value: 1},
                    {attribute: ['categories', 'id'], operator: 'equal', value: 2}
                ]
            ]);
        });
    });

    describe('multiple attributes with "OR"', function () {
        it('accepts OR syntax', function () {
            expect((function () { filterParser('type.id=1 OR categories.id=2'); })).not.to.throw(Error);
        });

        it('parses into second-level array', function () {
            expect(filterParser('type.id=1 OR categories.id=2')).to.eql([
                [{attribute: ['type', 'id'], operator: 'equal', value: 1}],
                [{attribute: ['categories', 'id'], operator: 'equal', value: 2}]
            ]);
        });

        it('parses into second-level array (multiple values)', function () {
            expect(filterParser('type.id=1,2,3 OR categories.id=2,65')).to.eql([
                [{attribute: ['type', 'id'], operator: 'equal', value: [1, 2, 3]}],
                [{attribute: ['categories', 'id'], operator: 'equal', value: [2, 65]}]
            ]);
        });
    });

    describe('multiple attributes, AND and OR', function () {
        it('resolves AND-precedence', function () {
            expect(filterParser('(type.id=1 OR countries.id=3) AND categories.id=2')).to.eql([
                [
                    {attribute: ['type', 'id'], operator: 'equal', value: 1},
                    {attribute: ['categories', 'id'], operator: 'equal', value: 2}
                ],
                [
                    {attribute: ['countries', 'id'], operator: 'equal', value: 3},
                    {attribute: ['categories', 'id'], operator: 'equal', value: 2}
                ]
            ]);
        });

        it('resolves AND-precedence (multiple values)', function () {
            expect(filterParser('(type.id=1,2,3 OR countries.id=3,23) AND categories.id=2,65')).to.eql([
                [
                    {attribute: ['type', 'id'], operator: 'equal', value: [1, 2, 3]},
                    {attribute: ['categories', 'id'], operator: 'equal', value: [2, 65]}
                ],
                [
                    {attribute: ['countries', 'id'], operator: 'equal', value: [3, 23]},
                    {attribute: ['categories', 'id'], operator: 'equal', value: [2, 65]}
                ]
            ]);
        });
    });

    describe('invalid syntax', function () {
        it('fails on missing operators', function () {
            expect(function () { filterParser('a=1 b=2'); }).to.throw(Error);
        });

        it('fails on additional garbage', function () {
            expect(function () { filterParser('a=1 asdfasdfsdfa'); }).to.throw(Error);
        });
    });

    describe('attribute paths', function () {
        it('allowes square brackets', function () {
            expect(filterParser('author.group[isPremium=true AND package.price>=10]')).to.eql([
                [
                    {attribute: ['author', 'group', 'isPremium'], operator: 'equal', value: true},
                    {attribute: ['author', 'group', 'package', 'price'], operator: 'greaterOrEqual', value: 10}
                ]
            ]);
        });

        it('converts short syntax (AND)', function () {
            expect(filterParser('author.group[isPremium AND active]=true')).to.eql([
                [
                    {attribute: ['author', 'group', 'isPremium'], operator: 'equal', value: true},
                    {attribute: ['author', 'group', 'active'], operator: 'equal', value: true}
                ]
            ]);
        });

        it('converts short syntax (OR)', function () {
            expect(filterParser('instrument[stock OR currency].active=true')).to.eql([
                [{attribute: ['instrument', 'stock', 'active'], operator: 'equal', value: true}],
                [{attribute: ['instrument', 'currency', 'active'], operator: 'equal', value: true}]
            ]);
        });

        it('converts short syntax (OR and AND)', function () {
            expect(filterParser('instrument[stock OR currency][active AND isPublic]=true')).to.eql([
                [
                    {attribute: ['instrument', 'stock', 'active'], operator: 'equal', value: true},
                    {attribute: ['instrument', 'stock', 'isPublic'], operator: 'equal', value: true}
                ],
                [
                    {attribute: ['instrument', 'currency', 'active'], operator: 'equal', value: true},
                    {attribute: ['instrument', 'currency', 'isPublic'], operator: 'equal', value: true}
                ]
            ]);
        });
    });

    describe('operators', function () {
        it('equal', function () {
            expect((filterParser('equal=1'))[0][0].operator).to.equal('equal');
        });

        it('notEqual', function () {
            expect((filterParser('equal!=1'))[0][0].operator).to.equal('notEqual');
        });

        it('greater', function () {
            expect((filterParser('equal>1'))[0][0].operator).to.equal('greater');
        });

        it('greaterOrEqual', function () {
            expect((filterParser('equal>=1'))[0][0].operator).to.equal('greaterOrEqual');
        });

        it('less', function () {
            expect((filterParser('equal<1'))[0][0].operator).to.equal('less');
        });

        it('lessOrEqual', function () {
            expect((filterParser('equal<=1'))[0][0].operator).to.equal('lessOrEqual');
        });
    });

    describe('data types', function () {
        it('int', function () {
            expect((filterParser('foo=0'))[0][0].value).to.be.a('number');
            expect((filterParser('foo=1'))[0][0].value).to.be.a('number');
        });

        it('float', function () {
            expect((filterParser('foo=0.0'))[0][0].value).to.be.a('number');
            expect((filterParser('foo=3.1415'))[0][0].value).to.be.a('number');
        });

        it('boolean', function () {
            expect((filterParser('foo=true'))[0][0].value).to.equal(true);
            expect((filterParser('foo=false'))[0][0].value).to.equal(false);
        });

        it('string', function () {
            expect((filterParser('foo="bar"'))[0][0].value).to.be.a('string');
            expect((filterParser('foo="bar\\"baz"'))[0][0].value).to.be.a('string');
            expect((filterParser('foo=""'))[0][0].value).to.be.a('string');
        });

        it('null', function () {
            expect((filterParser('foo=null'))[0][0].value).to.equal(null);
        });

        it('null is case sensitive', function () {
            expect((function () { filterParser('foo=Null'); })).to.throw(Error);
            expect((function () { filterParser('foo=NULL'); })).to.throw(Error);
        });
    });

    describe('complex examples', function () {
        it('parses "type.id=1 AND author.id=30 AND isPremium=false OR categories.id=20 OR title="DAX Tagesausblick""', function () {
            expect(filterParser('type.id=1 AND author.id=30 AND isPremium=false OR categories.id=20 OR title="DAX Tagesausblick"')).to.eql([
                [
                    {attribute: ['type', 'id'], operator: 'equal', value: 1},
                    {attribute: ['author', 'id'], operator: 'equal', value: 30},
                    {attribute: ['isPremium'], operator: 'equal', value: false},
                ],
                [
                    {attribute: ['categories', 'id'], operator: 'equal', value: 20}
                ],
                [
                    {attribute: ['title'], operator: 'equal', value: "DAX Tagesausblick"}
                ]
            ]);
        });

        it('parses "type.id=1 AND author.id=30 AND isPremium=false OR categories.id=20,65 OR title="DAX Tagesausblick""', function () {
            expect(filterParser('type.id=1 AND author.id=30 AND isPremium=false OR categories.id=20,65 OR title="DAX Tagesausblick"')).to.eql([
                [
                    {attribute: ['type', 'id'], operator: 'equal', value: 1},
                    {attribute: ['author', 'id'], operator: 'equal', value: 30},
                    {attribute: ['isPremium'], operator: 'equal', value: false},
                ],
                [
                    {attribute: ['categories', 'id'], operator: 'equal', value: [20, 65]}
                ],
                [
                    {attribute: ['title'], operator: 'equal', value: "DAX Tagesausblick"}
                ]
            ]);
        });
    });
});
