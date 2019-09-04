/* global describe, it */

'use strict';

const { expect } = require('chai');

const filterParser = require('../').filter;

describe('filter parser', () => {
    it('should be a function', () => {
        expect(filterParser).to.be.a('function');
    });

    it('should throw an error for non-string arguments', () => {
        expect(() => {
            filterParser(1);
        }).to.throw(Error);
        expect(() => {
            filterParser({});
        }).to.throw(Error);
        expect(() => {
            filterParser([]);
        }).to.throw(Error);
    });

    it('does not accept empty strings', () => {
        expect(() => {
            filterParser('');
        }).to.throw(Error);
    });

    describe('filter by single attribute', () => {
        it('accepts single filter parameters', () => {
            expect(() => {
                filterParser('type.id=1');
            }).not.to.throw(Error);
        });

        it('parses single attributes', () => {
            expect(filterParser('id=1')).to.eql([[{ attribute: ['id'], operator: 'equal', value: 1 }]]);
        });

        it('parses single composite attributes (resolves attribute)', () => {
            expect(filterParser('type.id=1')).to.eql([[{ attribute: ['type', 'id'], operator: 'equal', value: 1 }]]);
        });
    });

    describe('multiple values', () => {
        it('accepts multiple values with ","', () => {
            expect(() => {
                filterParser('type.id=1,2,3');
            }).not.to.throw(Error);
        });

        it('parses into arrays', () => {
            expect(filterParser('type.id=1,2,3')).to.eql([
                [{ attribute: ['type', 'id'], operator: 'equal', value: [1, 2, 3] }]
            ]);
        });
    });

    describe('multiple attributes with "AND"', () => {
        it('accepts AND syntax', () => {
            expect(() => {
                filterParser('type.id=1 AND categories.id=2');
            }).not.to.throw(Error);
        });

        it('parses into top-level array', () => {
            expect(filterParser('type.id=1 AND categories.id=2')).to.eql([
                [
                    { attribute: ['type', 'id'], operator: 'equal', value: 1 },
                    { attribute: ['categories', 'id'], operator: 'equal', value: 2 }
                ]
            ]);
        });
    });

    describe('multiple attributes with "OR"', () => {
        it('accepts OR syntax', () => {
            expect(() => {
                filterParser('type.id=1 OR categories.id=2');
            }).not.to.throw(Error);
        });

        it('parses into second-level array', () => {
            expect(filterParser('type.id=1 OR categories.id=2')).to.eql([
                [{ attribute: ['type', 'id'], operator: 'equal', value: 1 }],
                [{ attribute: ['categories', 'id'], operator: 'equal', value: 2 }]
            ]);
        });

        it('parses into second-level array (multiple values)', () => {
            expect(filterParser('type.id=1,2,3 OR categories.id=2,65')).to.eql([
                [{ attribute: ['type', 'id'], operator: 'equal', value: [1, 2, 3] }],
                [{ attribute: ['categories', 'id'], operator: 'equal', value: [2, 65] }]
            ]);
        });
    });

    describe('multiple attributes, AND and OR', () => {
        it('resolves AND-precedence', () => {
            expect(filterParser('(type.id=1 OR countries.id=3) AND categories.id=2')).to.eql([
                [
                    { attribute: ['type', 'id'], operator: 'equal', value: 1 },
                    { attribute: ['categories', 'id'], operator: 'equal', value: 2 }
                ],
                [
                    { attribute: ['countries', 'id'], operator: 'equal', value: 3 },
                    { attribute: ['categories', 'id'], operator: 'equal', value: 2 }
                ]
            ]);
        });

        it('resolves AND-precedence (multiple values)', () => {
            expect(filterParser('(type.id=1,2,3 OR countries.id=3,23) AND categories.id=2,65')).to.eql([
                [
                    { attribute: ['type', 'id'], operator: 'equal', value: [1, 2, 3] },
                    { attribute: ['categories', 'id'], operator: 'equal', value: [2, 65] }
                ],
                [
                    { attribute: ['countries', 'id'], operator: 'equal', value: [3, 23] },
                    { attribute: ['categories', 'id'], operator: 'equal', value: [2, 65] }
                ]
            ]);
        });
    });

    describe('invalid syntax', () => {
        it('fails on missing operators', () => {
            expect(() => {
                filterParser('a=1 b=2');
            }).to.throw(Error);
        });

        it('fails on additional garbage', () => {
            expect(() => {
                filterParser('a=1 asdfasdfsdfa');
            }).to.throw(Error);
        });

        it('fails on invalid range', () => {
            expect(() => {
                filterParser('a=1..2..3');
            }).to.throw(Error);
        });

        it('fails on invalid range operator', () => {
            expect(() => {
                filterParser('a>1..2');
            }).to.throw(Error);
        });
    });

    describe('attribute paths', () => {
        it('allowes square brackets', () => {
            expect(filterParser('author.group[isPremium=true AND package.price>=10]')).to.eql([
                [
                    { attribute: ['author', 'group', 'isPremium'], operator: 'equal', value: true },
                    { attribute: ['author', 'group', 'package', 'price'], operator: 'greaterOrEqual', value: 10 }
                ]
            ]);
        });

        it('converts short syntax (AND)', () => {
            expect(filterParser('author.group[isPremium AND active]=true')).to.eql([
                [
                    { attribute: ['author', 'group', 'isPremium'], operator: 'equal', value: true },
                    { attribute: ['author', 'group', 'active'], operator: 'equal', value: true }
                ]
            ]);
        });

        it('converts short syntax (OR)', () => {
            expect(filterParser('instrument[stock OR currency].active=true')).to.eql([
                [{ attribute: ['instrument', 'stock', 'active'], operator: 'equal', value: true }],
                [{ attribute: ['instrument', 'currency', 'active'], operator: 'equal', value: true }]
            ]);
        });

        it('converts short syntax (OR and AND)', () => {
            expect(filterParser('instrument[stock OR currency][active AND isPublic]=true')).to.eql([
                [
                    { attribute: ['instrument', 'stock', 'active'], operator: 'equal', value: true },
                    { attribute: ['instrument', 'stock', 'isPublic'], operator: 'equal', value: true }
                ],
                [
                    { attribute: ['instrument', 'currency', 'active'], operator: 'equal', value: true },
                    { attribute: ['instrument', 'currency', 'isPublic'], operator: 'equal', value: true }
                ]
            ]);
        });
    });

    describe('operators', () => {
        it('equal', () => {
            expect(filterParser('equal=1')[0][0].operator).to.equal('equal');
        });

        it('notEqual', () => {
            expect(filterParser('equal!=1')[0][0].operator).to.equal('notEqual');
        });

        it('greater', () => {
            expect(filterParser('equal>1')[0][0].operator).to.equal('greater');
        });

        it('greaterOrEqual', () => {
            expect(filterParser('equal>=1')[0][0].operator).to.equal('greaterOrEqual');
        });

        it('less', () => {
            expect(filterParser('equal<1')[0][0].operator).to.equal('less');
        });

        it('lessOrEqual', () => {
            expect(filterParser('equal<=1')[0][0].operator).to.equal('lessOrEqual');
        });

        it('between', () => {
            expect(filterParser('foo=10..20')[0][0].operator).to.equal('between');
        });

        it('notBetween', () => {
            expect(filterParser('foo!=10..20')[0][0].operator).to.equal('notBetween');
        });
    });

    describe('data types', () => {
        it('int', () => {
            expect(filterParser('foo=0')[0][0].value).to.be.a('number');
            expect(filterParser('foo=1')[0][0].value).to.be.a('number');
        });

        it('float', () => {
            expect(filterParser('foo=0.0')[0][0].value).to.be.a('number');
            expect(filterParser('foo=3.1415')[0][0].value).to.be.a('number');
        });

        it('boolean', () => {
            expect(filterParser('foo=true')[0][0].value).to.equal(true);
            expect(filterParser('foo=false')[0][0].value).to.equal(false);
        });

        it('string', () => {
            expect(filterParser('foo="bar"')[0][0].value).to.be.a('string');
            expect(filterParser('foo="bar\\"baz"')[0][0].value).to.be.a('string');
            expect(filterParser('foo=""')[0][0].value).to.be.a('string');
        });

        it('null', () => {
            expect(filterParser('foo=null')[0][0].value).to.equal(null);
        });

        it('null is case sensitive', () => {
            expect(() => {
                filterParser('foo=Null');
            }).to.throw(Error);
            expect(() => {
                filterParser('foo=NULL');
            }).to.throw(Error);
        });
    });

    describe('ranges', () => {
        it('parses ranges (int)', () => {
            expect(filterParser('foo=10..20')).to.eql([[{ attribute: ['foo'], operator: 'between', value: [10, 20] }]]);
        });

        it('parses ranges (string)', () => {
            expect(filterParser('foo="2018-01-01".."2019-01-01"')).to.eql([
                [{ attribute: ['foo'], operator: 'between', value: ['2018-01-01', '2019-01-01'] }]
            ]);
        });
    });

    describe('complex examples', () => {
        it('parses "type.id=1 AND author.id=30 AND isPremium=false OR categories.id=20 OR title="DAX Tagesausblick""', () => {
            expect(
                filterParser(
                    'type.id=1 AND author.id=30 AND isPremium=false OR categories.id=20 OR title="DAX Tagesausblick"'
                )
            ).to.eql([
                [
                    { attribute: ['type', 'id'], operator: 'equal', value: 1 },
                    { attribute: ['author', 'id'], operator: 'equal', value: 30 },
                    { attribute: ['isPremium'], operator: 'equal', value: false }
                ],
                [{ attribute: ['categories', 'id'], operator: 'equal', value: 20 }],
                [{ attribute: ['title'], operator: 'equal', value: 'DAX Tagesausblick' }]
            ]);
        });

        it('parses "type.id=1 AND author.id=30 AND isPremium=false OR categories.id=20,65 OR title="DAX Tagesausblick""', () => {
            expect(
                filterParser(
                    'type.id=1 AND author.id=30 AND isPremium=false OR categories.id=20,65 OR title="DAX Tagesausblick"'
                )
            ).to.eql([
                [
                    { attribute: ['type', 'id'], operator: 'equal', value: 1 },
                    { attribute: ['author', 'id'], operator: 'equal', value: 30 },
                    { attribute: ['isPremium'], operator: 'equal', value: false }
                ],
                [{ attribute: ['categories', 'id'], operator: 'equal', value: [20, 65] }],
                [{ attribute: ['title'], operator: 'equal', value: 'DAX Tagesausblick' }]
            ]);
        });

        it('parses "country.id=49,63,71,73,75,77 AND componentOf.id=317363,133965,133954 AND (splits.simple.exDate="2019-09-03T22:00:00.000Z".."2019-09-04T21:59:59.999Z" OR splits.complex.exDate="2019-09-03T22:00:00.000Z".."2019-09-04T21:59:59.999Z")"', () => {
            expect(
                filterParser(
                    'country.id=49,63,71,73,75,77 AND componentOf.id=317363,133965,133954 AND (splits.simple.exDate="2019-09-03T22:00:00.000Z".."2019-09-04T21:59:59.999Z" OR splits.complex.exDate="2019-09-03T22:00:00.000Z".."2019-09-04T21:59:59.999Z")'
                )
            ).to.eql([
                [
                    { attribute: ['country', 'id'], operator: 'equal', value: [49, 63, 71, 73, 75, 77] },
                    { attribute: ['componentOf', 'id'], operator: 'equal', value: [317363, 133965, 133954] },
                    {
                        attribute: ['splits', 'simple', 'exDate'],
                        operator: 'between',
                        value: ['2019-09-03T22:00:00.000Z', '2019-09-04T21:59:59.999Z']
                    }
                ],
                [
                    { attribute: ['country', 'id'], operator: 'equal', value: [49, 63, 71, 73, 75, 77] },
                    { attribute: ['componentOf', 'id'], operator: 'equal', value: [317363, 133965, 133954] },
                    {
                        attribute: ['splits', 'complex', 'exDate'],
                        operator: 'between',
                        value: ['2019-09-03T22:00:00.000Z', '2019-09-04T21:59:59.999Z']
                    }
                ]
            ]);
        });
    });
});
