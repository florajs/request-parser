'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const filterParser = require('../').filter;

describe('filter parser', () => {
    it('should be a function', () => {
        assert.equal(typeof filterParser, 'function');
    });

    Object.entries({
        number: 1,
        object: {},
        array: []
    }).forEach(([type, input]) =>
        it(`should throw an error for non-string arguments (${type})`, () =>
            assert.throws(() => filterParser(input), {
                name: 'RequestError',
                message: 'filter must be a string'
            }))
    );

    it('does not accept empty strings', () => {
        assert.throws(() => filterParser(''), {
            name: 'ArgumentError',
            message: 'Invalid query string'
        });
    });

    describe('filter by single attribute', () => {
        it('accepts single filter parameters', () => {
            assert.deepEqual(filterParser('type.id=1'), [[{ attribute: ['type', 'id'], operator: 'equal', value: 1 }]]);
        });

        it('parses single attributes', () => {
            assert.deepEqual(filterParser('id=1'), [[{ attribute: ['id'], operator: 'equal', value: 1 }]]);
        });

        it('parses single composite attributes (resolves attribute)', () => {
            assert.deepEqual(filterParser('type.id=1'), [[{ attribute: ['type', 'id'], operator: 'equal', value: 1 }]]);
        });
    });

    describe('multiple values', () => {
        Object.entries({
            '=': 'equal',
            '!=': 'notEqual'
        }).forEach(([symbol, operator]) =>
            it(`accepts multiple values with "${operator}"`, () => {
                assert.deepEqual(filterParser(`type.id${symbol}1,2,3`), [
                    [{ attribute: ['type', 'id'], operator, value: [1, 2, 3] }]
                ]);
            })
        );
    });

    describe('multiple attributes with "AND"', () => {
        it('accepts AND syntax', () => {
            assert.deepEqual(filterParser('type.id=1 AND categories.id=2'), [
                [
                    { attribute: ['type', 'id'], operator: 'equal', value: 1 },
                    { attribute: ['categories', 'id'], operator: 'equal', value: 2 }
                ]
            ]);
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
            assert.deepEqual(filterParser('type.id=1 OR categories.id=2'), [
                [{ attribute: ['type', 'id'], operator: 'equal', value: 1 }],
                [{ attribute: ['categories', 'id'], operator: 'equal', value: 2 }]
            ]);
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

        it('resolves AND-precedence with branches on both sides', () => {
            assert.deepEqual(filterParser('(type.id=1 OR countries.id=3) AND (categories.id=2 OR author.id=4)'), [
                [
                    { attribute: ['type', 'id'], operator: 'equal', value: 1 },
                    { attribute: ['categories', 'id'], operator: 'equal', value: 2 }
                ],
                [
                    { attribute: ['type', 'id'], operator: 'equal', value: 1 },
                    { attribute: ['author', 'id'], operator: 'equal', value: 4 }
                ],
                [
                    { attribute: ['countries', 'id'], operator: 'equal', value: 3 },
                    { attribute: ['categories', 'id'], operator: 'equal', value: 2 }
                ],
                [
                    { attribute: ['countries', 'id'], operator: 'equal', value: 3 },
                    { attribute: ['author', 'id'], operator: 'equal', value: 4 }
                ]
            ]);
        });

        it('resolves doubly nested round brackets', () => {
            assert.deepEqual(filterParser('((a=1))'), [[{ attribute: ['a'], operator: 'equal', value: 1 }]]);
        });
    });

    describe('invalid syntax', () => {
        it('fails on missing operators', () => {
            assert.throws(() => filterParser('a=1 b=2'), {
                name: 'ArgumentError',
                message: "Missing connective near 'b=2' (pos: 2)"
            });
        });

        it('fails on additional garbage', () => {
            assert.throws(() => filterParser('a=1 asdfasdfsdfa'), {
                name: 'ArgumentError',
                message: "Missing connective near 'asdf' (pos: 2)"
            });
        });

        it('fails on invalid range', () => {
            assert.throws(() => filterParser('a=1..2..3'), {
                name: 'ArgumentError',
                message: "Invalid range in near '..3' (pos: 6)"
            });
        });

        it('fails on invalid range operator', () => {
            assert.throws(() => filterParser('a>1..2'), {
                name: 'RequestError',
                message: 'invalid range operator'
            });
        });

        ['a=1,2..3', 'a=1..2,3'].forEach((input) =>
            it(`fails on range combined with a value list ('${input}')`, () => {
                assert.throws(() => filterParser(input), {
                    name: 'ArgumentError',
                    message: 'Failed to beautify: Expression not found'
                });
            })
        );

        Object.entries({
            'a=1AND b=2': "Invalid value type, missing string quotation marks for '1AND'?",
            'a=1 ANDb=2': "Missing connective near 'ANDb' (pos: 2)",
            'a=1OR b=2': "Invalid value type, missing string quotation marks for '1OR'?",
            'a=1 ORb=2': "Missing connective near 'ORb=' (pos: 2)"
        }).forEach(([input, message]) =>
            it(`fails on missing whitespace around connective ('${input}')`, () => {
                assert.throws(() => filterParser(input), {
                    name: 'ArgumentError',
                    message
                });
            })
        );

        it('fails on unclosed quotation mark', () => {
            assert.throws(() => filterParser('foo="bar'), {
                name: 'ArgumentError',
                message: "Missing closing quotation mark for string starting near 'oo=\"bar' (pos: 5)"
            });
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

        it('allows nested square brackets', () => {
            assert.deepEqual(filterParser('a[b[c=1]]'), [
                [{ attribute: ['a', 'b', 'c'], operator: 'equal', value: 1 }]
            ]);
        });

        it('allows a dotted path prefix with 3+ segments', () => {
            assert.deepEqual(filterParser('a.b.c[x=1]'), [
                [{ attribute: ['a', 'b', 'c', 'x'], operator: 'equal', value: 1 }]
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

        it('allows square brackets with OR condition (multiple branches)', () => {
            assert.deepEqual(filterParser('author.group[isPremium=true OR active=false]'), [
                [{ attribute: ['author', 'group', 'isPremium'], operator: 'equal', value: true }],
                [{ attribute: ['author', 'group', 'active'], operator: 'equal', value: false }]
            ]);
        });

        it('converts short syntax (3-fold AND)', () => {
            assert.deepEqual(
                filterParser('stock[hasExactValues AND hasEstimatedValues AND shareClass.isPrimaryShare]=true'),
                [
                    [
                        { attribute: ['stock', 'hasExactValues'], operator: 'equal', value: true },
                        { attribute: ['stock', 'hasEstimatedValues'], operator: 'equal', value: true },
                        { attribute: ['stock', 'shareClass', 'isPrimaryShare'], operator: 'equal', value: true }
                    ]
                ]
            );
        });

        it('converts short syntax (3-fold OR)', () => {
            assert.deepEqual(
                filterParser('stock[hasExactValues OR hasEstimatedValues OR shareClass.isPrimaryShare]=true'),
                [
                    [{ attribute: ['stock', 'hasExactValues'], operator: 'equal', value: true }],
                    [{ attribute: ['stock', 'hasEstimatedValues'], operator: 'equal', value: true }],
                    [{ attribute: ['stock', 'shareClass', 'isPrimaryShare'], operator: 'equal', value: true }]
                ]
            );
        });

        it('converts short syntax (mixed AND and OR precedence, AND before OR)', () => {
            assert.deepEqual(
                filterParser('stock[hasExactValues AND hasEstimatedValues OR shareClass.isPrimaryShare]=true'),
                [
                    [
                        { attribute: ['stock', 'hasExactValues'], operator: 'equal', value: true },
                        { attribute: ['stock', 'hasEstimatedValues'], operator: 'equal', value: true }
                    ],
                    [{ attribute: ['stock', 'shareClass', 'isPrimaryShare'], operator: 'equal', value: true }]
                ]
            );
        });

        it('converts short syntax (mixed AND and OR precedence, OR before AND)', () => {
            assert.deepEqual(
                filterParser('stock[hasExactValues OR hasEstimatedValues AND shareClass.isPrimaryShare]=true'),
                [
                    [{ attribute: ['stock', 'hasExactValues'], operator: 'equal', value: true }],
                    [
                        { attribute: ['stock', 'hasEstimatedValues'], operator: 'equal', value: true },
                        { attribute: ['stock', 'shareClass', 'isPrimaryShare'], operator: 'equal', value: true }
                    ]
                ]
            );
        });
    });

    describe('operators', () => {
        Object.entries({
            'equal=1': 'equal',
            'equal!=1': 'notEqual',
            'equal>1': 'greater',
            'equal>=1': 'greaterOrEqual',
            'equal<1': 'less',
            'equal<=1': 'lessOrEqual',
            'foo=10..20': 'between',
            'foo!=10..20': 'notBetween'
        }).forEach(([input, operator]) =>
            it(operator, () => {
                assert.equal(filterParser(input)[0][0].operator, operator);
            })
        );
    });

    describe('data types', () => {
        it('int', () => {
            assert.equal(filterParser('foo=0')[0][0].value, 0);
            assert.equal(filterParser('foo=1')[0][0].value, 1);
            assert.equal(filterParser('foo=-5')[0][0].value, -5, 'parse negative numbers');
        });

        it('float', () => {
            assert.equal(filterParser('foo=0.0')[0][0].value, 0.0);
            assert.equal(filterParser('foo=3.1415')[0][0].value, 3.1415);
        });

        it('boolean', () => {
            assert.equal(filterParser('foo=true')[0][0].value, true);
            assert.equal(filterParser('foo=false')[0][0].value, false);
        });

        it('string', () => {
            assert.equal(filterParser('foo="bar"')[0][0].value, 'bar');
            assert.equal(filterParser('foo="bar\\"baz"')[0][0].value, 'bar"baz');
            assert.equal(filterParser('foo=""')[0][0].value, '');
        });

        it('null', () => {
            assert.equal(filterParser('foo=null')[0][0].value, null);
        });

        ['Null', 'NULL'].forEach((value) =>
            it('null is case sensitive', () => {
                assert.throws(() => filterParser(`foo=${value}`), {
                    name: 'ArgumentError',
                    message: `Invalid value type, missing string quotation marks for '${value}'?`
                });
            })
        );

        ['nullable', 'truex', 'bar'].forEach((value) =>
            it(`rejects unquoted string values ('${value}')`, () => {
                assert.throws(() => filterParser(`foo=${value}`), {
                    name: 'ArgumentError',
                    message: `Invalid value type, missing string quotation marks for '${value}'?`
                });
            })
        );

        it('undefined', () => {
            assert.throws(() => filterParser('a=undefined'), {
                name: 'ArgumentError',
                message: 'Invalid value type, cannot be undefined'
            });
        });
    });

    describe('ranges', () => {
        Object.entries({
            '=': 'between',
            '!=': 'notBetween'
        }).forEach(([symbol, operator]) =>
            it(`parses ranges (int, ${operator})`, () => {
                assert.deepEqual(filterParser(`foo${symbol}10..20`), [
                    [{ attribute: ['foo'], operator, value: [10, 20] }]
                ]);
            })
        );

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
