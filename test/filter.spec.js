'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert');
const filterParser = require('../').filter;

describe('filter parser', () => {
    it('should be a function', () => {
        assert.equal(typeof filterParser, 'function');
    });

    it('should throw an error for non-string arguments', () => {
        assert.throws(() => filterParser(1));
        assert.throws(() => filterParser({}));
        assert.throws(() => filterParser([]));
    });

    it('does not accept empty strings', () => {
        assert.throws(() => filterParser(''));
    });

    describe('filter by single attribute', () => {
        it('accepts single filter parameters', () => {
            assert.doesNotThrow(() => filterParser('type.id=1'));
        });

        it('parses single attributes', () => {
            assert.deepEqual(filterParser('id=1'), [[{ attribute: ['id'], operator: 'equal', value: 1 }]]);
        });

        it('parses single composite attributes (resolves attribute)', () => {
            assert.deepEqual(filterParser('type.id=1'), [[{ attribute: ['type', 'id'], operator: 'equal', value: 1 }]]);
        });
    });

    describe('multiple values', () => {
        it('accepts multiple values with ","', () => {
            assert.doesNotThrow(() => filterParser('type.id=1,2,3'));
        });

        it('parses into arrays', () => {
            assert.deepEqual(filterParser('type.id=1,2,3'), [
                [{ attribute: ['type', 'id'], operator: 'equal', value: [1, 2, 3] }]
            ]);
        });
    });

    describe('multiple attributes with "AND"', () => {
        it('accepts AND syntax', () => {
            assert.doesNotThrow(() => filterParser('type.id=1 AND categories.id=2'));
        });

        it('parses into top-level array', () => {
            assert.deepEqual(filterParser('type.id=1 AND categories.id=2'), [
                [
                    { attribute: ['type', 'id'], operator: 'equal', value: 1 },
                    { attribute: ['categories', 'id'], operator: 'equal', value: 2 }
                ]
            ]);
        });
    });

    describe('multiple attributes with "OR"', () => {
        it('accepts OR syntax', () => {
            assert.doesNotThrow(() => filterParser('type.id=1 OR categories.id=2'));
        });

        it('parses into second-level array', () => {
            assert.deepEqual(filterParser('type.id=1 OR categories.id=2'), [
                [{ attribute: ['type', 'id'], operator: 'equal', value: 1 }],
                [{ attribute: ['categories', 'id'], operator: 'equal', value: 2 }]
            ]);
        });

        it('parses into second-level array (multiple values)', () => {
            assert.deepEqual(filterParser('type.id=1,2,3 OR categories.id=2,65'), [
                [{ attribute: ['type', 'id'], operator: 'equal', value: [1, 2, 3] }],
                [{ attribute: ['categories', 'id'], operator: 'equal', value: [2, 65] }]
            ]);
        });
    });

    describe('multiple attributes, AND and OR', () => {
        it('resolves AND-precedence', () => {
            assert.deepEqual(filterParser('(type.id=1 OR countries.id=3) AND categories.id=2'), [
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
            assert.deepEqual(filterParser('(type.id=1,2,3 OR countries.id=3,23) AND categories.id=2,65'), [
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
            assert.throws(() => filterParser('a=1 b=2'));
        });

        it('fails on additional garbage', () => {
            assert.throws(() => filterParser('a=1 asdfasdfsdfa'));
        });

        it('fails on invalid range', () => {
            assert.throws(() => filterParser('a=1..2..3'));
        });

        it('fails on invalid range operator', () => {
            assert.throws(() => filterParser('a>1..2'));
        });
    });

    describe('attribute paths', () => {
        it('allowes square brackets', () => {
            assert.deepEqual(filterParser('author.group[isPremium=true AND package.price>=10]'), [
                [
                    { attribute: ['author', 'group', 'isPremium'], operator: 'equal', value: true },
                    { attribute: ['author', 'group', 'package', 'price'], operator: 'greaterOrEqual', value: 10 }
                ]
            ]);
        });

        it('converts short syntax (AND)', () => {
            assert.deepEqual(filterParser('author.group[isPremium AND active]=true'), [
                [
                    { attribute: ['author', 'group', 'isPremium'], operator: 'equal', value: true },
                    { attribute: ['author', 'group', 'active'], operator: 'equal', value: true }
                ]
            ]);
        });

        it('converts short syntax (OR)', () => {
            assert.deepEqual(filterParser('instrument[stock OR currency].active=true'), [
                [{ attribute: ['instrument', 'stock', 'active'], operator: 'equal', value: true }],
                [{ attribute: ['instrument', 'currency', 'active'], operator: 'equal', value: true }]
            ]);
        });

        it('converts short syntax (OR and AND)', () => {
            assert.deepEqual(filterParser('instrument[stock OR currency][active AND isPublic]=true'), [
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
            assert.equal(filterParser('equal=1')[0][0].operator, 'equal');
        });

        it('notEqual', () => {
            assert.equal(filterParser('equal!=1')[0][0].operator, 'notEqual');
        });

        it('greater', () => {
            assert.equal(filterParser('equal>1')[0][0].operator, 'greater');
        });

        it('greaterOrEqual', () => {
            assert.equal(filterParser('equal>=1')[0][0].operator, 'greaterOrEqual');
        });

        it('less', () => {
            assert.equal(filterParser('equal<1')[0][0].operator, 'less');
        });

        it('lessOrEqual', () => {
            assert.equal(filterParser('equal<=1')[0][0].operator, 'lessOrEqual');
        });

        it('between', () => {
            assert.equal(filterParser('foo=10..20')[0][0].operator, 'between');
        });

        it('notBetween', () => {
            assert.equal(filterParser('foo!=10..20')[0][0].operator, 'notBetween');
        });
    });

    describe('data types', () => {
        it('int', () => {
            assert.equal(typeof filterParser('foo=0')[0][0].value, 'number');
            assert.equal(typeof filterParser('foo=1')[0][0].value, 'number');
        });

        it('float', () => {
            assert.equal(typeof filterParser('foo=0.0')[0][0].value, 'number');
            assert.equal(typeof filterParser('foo=3.1415')[0][0].value, 'number');
        });

        it('boolean', () => {
            assert.equal(filterParser('foo=true')[0][0].value, true);
            assert.equal(filterParser('foo=false')[0][0].value, false);
        });

        it('string', () => {
            assert.equal(typeof filterParser('foo="bar"')[0][0].value, 'string');
            assert.equal(typeof filterParser('foo="bar\\"baz"')[0][0].value, 'string');
            assert.equal(typeof filterParser('foo=""')[0][0].value, 'string');
        });

        it('null', () => {
            assert.equal(filterParser('foo=null')[0][0].value, null);
        });

        it('null is case sensitive', () => {
            assert.throws(() => filterParser('foo=Null'));
            assert.throws(() => filterParser('foo=NULL'));
        });

        it('undefined', () => {
            assert.throws(() => filterParser('a=undefined'));
        });
    });

    describe('ranges', () => {
        it('parses ranges (int)', () => {
            assert.deepEqual(filterParser('foo=10..20'), [
                [{ attribute: ['foo'], operator: 'between', value: [10, 20] }]
            ]);
        });

        it('parses ranges (string)', () => {
            assert.deepEqual(filterParser('foo="2018-01-01".."2019-01-01"'), [
                [{ attribute: ['foo'], operator: 'between', value: ['2018-01-01', '2019-01-01'] }]
            ]);
        });
    });

    describe('complex examples', () => {
        it('parses "type.id=1 AND author.id=30 AND isPremium=false OR categories.id=20 OR title="DAX Tagesausblick""', () => {
            assert.deepEqual(
                filterParser(
                    'type.id=1 AND author.id=30 AND isPremium=false OR categories.id=20 OR title="DAX Tagesausblick"'
                ),
                [
                    [
                        { attribute: ['type', 'id'], operator: 'equal', value: 1 },
                        { attribute: ['author', 'id'], operator: 'equal', value: 30 },
                        { attribute: ['isPremium'], operator: 'equal', value: false }
                    ],
                    [{ attribute: ['categories', 'id'], operator: 'equal', value: 20 }],
                    [{ attribute: ['title'], operator: 'equal', value: 'DAX Tagesausblick' }]
                ]
            );
        });

        it('parses "type.id=1 AND author.id=30 AND isPremium=false OR categories.id=20,65 OR title="DAX Tagesausblick""', () => {
            assert.deepEqual(
                filterParser(
                    'type.id=1 AND author.id=30 AND isPremium=false OR categories.id=20,65 OR title="DAX Tagesausblick"'
                ),
                [
                    [
                        { attribute: ['type', 'id'], operator: 'equal', value: 1 },
                        { attribute: ['author', 'id'], operator: 'equal', value: 30 },
                        { attribute: ['isPremium'], operator: 'equal', value: false }
                    ],
                    [{ attribute: ['categories', 'id'], operator: 'equal', value: [20, 65] }],
                    [{ attribute: ['title'], operator: 'equal', value: 'DAX Tagesausblick' }]
                ]
            );
        });

        it('parses "country.id=49,63,71,73,75,77 AND componentOf.id=317363,133965,133954 AND (splits.simple.exDate="2019-09-03T22:00:00.000Z".."2019-09-04T21:59:59.999Z" OR splits.complex.exDate="2019-09-03T22:00:00.000Z".."2019-09-04T21:59:59.999Z")"', () => {
            assert.deepEqual(
                filterParser(
                    'country.id=49,63,71,73,75,77 AND componentOf.id=317363,133965,133954 AND (splits.simple.exDate="2019-09-03T22:00:00.000Z".."2019-09-04T21:59:59.999Z" OR splits.complex.exDate="2019-09-03T22:00:00.000Z".."2019-09-04T21:59:59.999Z")'
                ),
                [
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
                ]
            );
        });
    });
});
