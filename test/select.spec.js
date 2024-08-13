'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert');
const selectParser = require('../').select;

describe('select-parser', () => {
    it('should be a function', () => {
        assert.equal(typeof selectParser, 'function');
    });

    it('should throw an error for non-string arguments', () => {
        assert.throws(() => selectParser(1));
        assert.throws(() => selectParser({}));
        assert.throws(() => selectParser([]));
    });

    it('does not accept empty strings', () => {
        assert.throws(() => selectParser(''));
        assert.throws(() => selectParser(','));
    });

    it('accepts single select parameters', () => {
        assert.doesNotThrow(() => selectParser('title'));
    });

    it('accepts multiple select parameters', () => {
        assert.doesNotThrow(() => selectParser('title,instruments'));
    });

    describe('attributes without parameters', () => {
        it('returns the parts as object keys', () => {
            assert.deepEqual(selectParser('foo'), { foo: {} });
        });

        it('works for multiple parts', () => {
            assert.deepEqual(selectParser('foo,bar'), { foo: {}, bar: {} });
        });
    });

    describe('single attributes with parameters', () => {
        it('parses single parameters', () => {
            assert.deepEqual(selectParser('foo(limit=3)'), { foo: { limit: 3 } });
            assert.deepEqual(selectParser('foo(order=name:asc)'), {
                foo: { order: [{ direction: 'asc', attribute: ['name'] }] }
            });
        });

        it('accepts and passes through unknown parameters', () => {
            assert.doesNotThrow(() => selectParser('foo(a=1)'));
        });

        it('accepts array parameters in filter', () => {
            assert.deepEqual(selectParser('foo(filter=id=1,2)'), {
                foo: {
                    filter: [[{ attribute: ['id'], operator: 'equal', value: [1, 2] }]]
                }
            });
        });

        it('accepts strings in filter', () => {
            assert.deepEqual(selectParser('foo(filter=bar="baz")'), {
                foo: {
                    filter: [[{ attribute: ['bar'], operator: 'equal', value: 'baz' }]]
                }
            });
        });

        it('accepts parentheses in filter', () => {
            assert.deepEqual(selectParser('foo(filter=bar="baz" AND (attr2=3 OR attr3="4"))'), {
                foo: {
                    filter: [
                        [
                            { attribute: ['bar'], operator: 'equal', value: 'baz' },
                            { attribute: ['attr2'], operator: 'equal', value: 3 }
                        ],
                        [
                            { attribute: ['bar'], operator: 'equal', value: 'baz' },
                            { attribute: ['attr3'], operator: 'equal', value: '4' }
                        ]
                    ]
                }
            });
        });

        it('merges options: "a(b=c),a.b"', () => {
            assert.deepEqual(selectParser('a(b=c),a.b'), { a: { b: 'c', select: { b: {} } } });
            assert.deepEqual(selectParser('a(b=c)(d=e),a.b'), { a: { b: 'c', d: 'e', select: { b: {} } } });
        });

        it('throws an error if trying to merge options: "a(b=c),a(e=f)"', () => {
            assert.throws(() => selectParser('a(b=c),a(e=f)'));
        });

        it('throws an error if options are redefined', () => {
            assert.throws(() => selectParser('a(b=c)(b=d)'));
        });

        it('does not accept invalid operators', () => {
            assert.throws(() => selectParser('foo(limit>3)'));
        });

        it('does not accept invalid parameters', () => {
            assert.throws(() => selectParser('foo(limit=foo)'));
        });

        it('parses multiple parameters', () => {
            assert.deepEqual(selectParser('foo(limit=3)(order=name:asc)'), {
                foo: {
                    order: [{ direction: 'asc', attribute: ['name'] }],
                    limit: 3
                }
            });
        });
    });

    describe('multiple attributes with parameters', () => {
        it('parses single parameters', () => {
            assert.deepEqual(selectParser('title,foo(limit=3)'), {
                title: {},
                foo: { limit: 3 }
            });
            assert.deepEqual(selectParser('title(page=1),foo(limit=3)'), {
                title: { page: 1 },
                foo: { limit: 3 }
            });
        });
    });

    describe('attributes with children (brackets)', () => {
        it('fails on empty children "a[]"', () => {
            assert.throws(() => selectParser('a[]'));
        });

        it('parses simple children "a[b]"', () => {
            assert.deepEqual(selectParser('a[b]'), { a: { select: { b: {} } } });
        });

        it('parses nested children "a[b[c]]"', () => {
            assert.deepEqual(selectParser('a[b[c]]'), { a: { select: { b: { select: { c: {} } } } } });
        });

        it('parses mixed attributes "a[b],c"', () => {
            assert.deepEqual(selectParser('a[b],c'), { a: { select: { b: {} } }, c: {} });
        });

        it('parses mixed attributes "a[b],c[d]"', () => {
            assert.deepEqual(selectParser('a[b],c[d]'), { a: { select: { b: {} } }, c: { select: { d: {} } } });
        });

        it('parses multiple children "a[b,c]', () => {
            assert.deepEqual(selectParser('a[b,c]'), { a: { select: { b: {}, c: {} } } });
        });

        it('parses multiple children "a[b,c[d]]', () => {
            assert.deepEqual(selectParser('a[b,c[d]]'), { a: { select: { b: {}, c: { select: { d: {} } } } } });
        });

        it('parses multiple children "a[b,c[d,e]]', () => {
            assert.deepEqual(selectParser('a[b,c[d]]'), { a: { select: { b: {}, c: { select: { d: {} } } } } });
            assert.deepEqual(selectParser('a[b,c[d,e]]'), {
                a: { select: { b: {}, c: { select: { d: {}, e: {} } } } }
            });
        });

        it('parses recursive children "a[b,c][d,e]"', () => {
            assert.deepEqual(selectParser('a[b,c][d,e]'), {
                a: {
                    select: {
                        b: { select: { d: {}, e: {} } },
                        c: { select: { d: {}, e: {} } }
                    }
                }
            });
        });

        it('parses recursive children "a[b,c.x][d,e]"', () => {
            assert.deepEqual(selectParser('a[b,c.x][d,e]'), {
                a: {
                    select: {
                        b: {
                            select: {
                                d: {},
                                e: {}
                            }
                        },
                        c: {
                            select: {
                                x: {
                                    select: {
                                        d: {},
                                        e: {}
                                    }
                                }
                            }
                        }
                    }
                }
            });
        });

        it('parses brackets at top level "[b,c].d"', () => {
            assert.deepEqual(selectParser('[b,c].d'), { b: { select: { d: {} } }, c: { select: { d: {} } } });
        });

        it('parses brackets at top level (recursive) "[b,c][d,e]', () => {
            assert.deepEqual(selectParser('[b,c][d,e]'), {
                b: { select: { d: {}, e: {} } },
                c: { select: { d: {}, e: {} } }
            });
        });
    });

    describe('attributes with children (brackets) with parameters', () => {
        it('fails on empty children "a(limit=3)[]"', () => {
            assert.throws(() => selectParser('a(limit=3)[]'));
        });

        it('parses simple parameters on root level', () => {
            assert.deepEqual(selectParser('a(limit=3)[b]'), { a: { limit: 3, select: { b: {} } } });
        });

        it('parses simple parameters on children level', () => {
            assert.deepEqual(selectParser('a[b(limit=3)]'), { a: { select: { b: { limit: 3 } } } });
        });

        it('parses simple parameters on all levels', () => {
            assert.deepEqual(selectParser('a(limit=3)[b(limit=4)]'), { a: { limit: 3, select: { b: { limit: 4 } } } });
        });

        it('parses a complex example', () => {
            assert.deepEqual(selectParser('a(limit=1)[b(limit=2),x[y(limit=4)],zz],z'), {
                a: {
                    limit: 1,
                    select: {
                        b: { limit: 2 },
                        x: {
                            select: { y: { limit: 4 } }
                        },
                        zz: {}
                    }
                },
                z: {}
            });
        });
    });

    describe('attributes with children (dot notation)', () => {
        it('parses "a.b"', () => {
            assert.deepEqual(selectParser('a.b'), { a: { select: { b: {} } } });
        });

        it('fails on invalid identifier', () => {
            assert.throws(() => selectParser('a.*'));
            assert.throws(() => selectParser('a.&'));
        });

        it('parses children with parameters', () => {
            assert.deepEqual(selectParser('a(limit=3).b'), { a: { limit: 3, select: { b: {} } } });
            assert.deepEqual(selectParser('a.b(limit=4)'), { a: { select: { b: { limit: 4 } } } });
            assert.deepEqual(selectParser('a(limit=3).b(limit=4)'), { a: { limit: 3, select: { b: { limit: 4 } } } });
        });

        it('fails on duplicate dots', () => {
            assert.throws(() => selectParser('a..b'));
        });
    });

    describe('attributes with children (dot and bracket notation)', () => {
        it('parses "a.b,a[c]"', () => {
            assert.deepEqual(selectParser('a.b,a[b,c]'), { a: { select: { b: {}, c: {} } } });
        });

        it('parses "a(limit=3).b,a[c]"', () => {
            // FIXME:
            // das zweite "a" ohne Parameter gehört angemeckert,
            // weil eigentlich "limit=3" dafür nicht gilt!
            assert.deepEqual(selectParser('a(limit=3).b,a[c]'), { a: { limit: 3, select: { b: {}, c: {} } } });
        });

        it('parses "a.b,a(limit=3)[c]"', () => {
            // FIXME:
            // das "limit=3" gehört angemeckert, weil a schon ohne Limit requested wurde?
            assert.deepEqual(selectParser('a.b,a(limit=3)[c]'), { a: { limit: 3, select: { b: {}, c: {} } } });
        });

        // ...
    });

    describe('complex examples', () => {
        it('parses "instruments[stock,index].countryId"', () => {
            assert.deepEqual(selectParser('instruments[stock,index].countryId'), {
                instruments: {
                    select: {
                        stock: { select: { countryId: {} } },
                        index: { select: { countryId: {} } }
                    }
                }
            });
        });

        it('parses "title,instruments(order=name:asc)(limit=3)(page=1).quotations(limit=4).quote"', () => {
            assert.deepEqual(
                selectParser('title,instruments(order=name:asc)(limit=3)(page=1).quotations(limit=4).quote'),
                {
                    title: {},
                    instruments: {
                        order: [{ attribute: ['name'], direction: 'asc' }],
                        limit: 3,
                        page: 1,
                        select: {
                            quotations: {
                                limit: 4,
                                select: {
                                    quote: {}
                                }
                            }
                        }
                    }
                }
            );
        });

        it('parses "title,instruments(order=name:asc)(limit=3)(page=1).quotations(limit=4)[quote[value,changePerc]]"', () => {
            assert.deepEqual(
                selectParser(
                    'title,instruments(order=name:asc)(limit=3)(page=1).quotations(limit=4)[quote[value,changePerc]]'
                ),
                {
                    title: {},
                    instruments: {
                        order: [{ attribute: ['name'], direction: 'asc' }],
                        limit: 3,
                        page: 1,
                        select: {
                            quotations: {
                                limit: 4,
                                select: {
                                    quote: {
                                        select: {
                                            value: {},
                                            changePerc: {}
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            );
        });

        it('parses \'id,name,slug,itemType,description,image,media(filter=type="image").link\'', () => {
            assert.deepEqual(selectParser('id,name,slug,itemType,description,image,media(filter=type="image").link'), {
                description: {},
                id: {},
                image: {},
                itemType: {},
                media: {
                    filter: [
                        [
                            {
                                attribute: ['type'],
                                operator: 'equal',
                                value: 'image'
                            }
                        ]
                    ],
                    select: { link: {} }
                },
                name: {},
                slug: {}
            });
        });
    });

    describe('options.enableBraces', () => {
        it('throws error if attribute contains braces', () => {
            assert.throws(() => selectParser('foo,bar,{baz}'), { name: 'SyntaxError' });
        });

        it('allows curly braces if enableBraces=true', () => {
            assert.doesNotThrow(() => selectParser('foo,bar,{baz}', { enableBraces: true }));
            assert.deepEqual(selectParser('foo,bar,{baz}', { enableBraces: true }), {
                foo: {},
                bar: {},
                '{baz}': {}
            });
            assert.deepEqual(selectParser('foo,bar,{baz}.test', { enableBraces: true }), {
                foo: {},
                bar: {},
                '{baz}': {
                    select: {
                        test: {}
                    }
                }
            });
        });

        it('disallows curly braces at non-root level even if enableBraces=true', () => {
            assert.throws(() => selectParser('foo,bar,test.{baz}', { enableBraces: true }), { name: 'SyntaxError' });
        });
    });
});
