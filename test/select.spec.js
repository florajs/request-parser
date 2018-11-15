/* global describe, it */

'use strict';

const { expect } = require('chai');

const selectParser = require('../').select;

describe('select-parser', () => {
    it('should be a function', () => {
        expect(selectParser).to.be.a('function');
    });

    it('should throw an error for non-string arguments', () => {
        expect(() => {
            selectParser(1);
        }).to.throw(Error);
        expect(() => {
            selectParser({});
        }).to.throw(Error);
        expect(() => {
            selectParser([]);
        }).to.throw(Error);
    });

    it('does not accept empty strings', () => {
        expect(() => {
            selectParser('');
        }).to.throw(Error);
        expect(() => {
            selectParser(',');
        }).to.throw(Error);
    });

    it('accepts single select parameters', () => {
        expect(() => {
            selectParser('title');
        }).not.to.throw(Error);
    });

    it('accepts multiple select parameters', () => {
        expect(() => {
            selectParser('title,instruments');
        }).not.to.throw(Error);
    });

    describe('attributes without parameters', () => {
        it('returns the parts as object keys', () => {
            expect(selectParser('foo')).to.eql({ foo: {} });
        });

        it('works for multiple parts', () => {
            expect(selectParser('foo,bar')).to.eql({ foo: {}, bar: {} });
        });
    });

    describe('single attributes with parameters', () => {
        it('parses single parameters', () => {
            expect(selectParser('foo(limit=3)')).to.eql({ foo: { limit: 3 } });
            expect(selectParser('foo(order=name:asc)')).to.eql({
                foo: { order: [{ direction: 'asc', attribute: ['name'] }] }
            });
        });

        it('accepts and passes through unknown parameters', () => {
            expect(() => {
                selectParser('foo(a=1)');
            }).not.to.throw(Error);
        });

        it('accepts array parameters in filter', () => {
            expect(selectParser('foo(filter=id=1,2)')).to.eql({
                foo: {
                    filter: [[{ attribute: ['id'], operator: 'equal', value: [1, 2] }]]
                }
            });
        });

        it('accepts strings in filter', () => {
            expect(selectParser('foo(filter=bar="baz")')).to.eql({
                foo: {
                    filter: [[{ attribute: ['bar'], operator: 'equal', value: 'baz' }]]
                }
            });
        });

        it('merges options: "a(b=c),a.b"', () => {
            expect(selectParser('a(b=c),a.b')).to.eql({ a: { b: 'c', select: { b: {} } } });
            expect(selectParser('a(b=c)(d=e),a.b')).to.eql({ a: { b: 'c', d: 'e', select: { b: {} } } });
        });

        it('throws an error if trying to merge options: "a(b=c),a(e=f)"', () => {
            expect(() => {
                selectParser('a(b=c),a(e=f)');
            }).to.throw(Error);
        });

        it('throws an error if options are redefined', () => {
            expect(() => {
                selectParser('a(b=c)(b=d)');
            }).to.throw(Error);
        });

        it('does not accept invalid operators', () => {
            expect(() => {
                selectParser('foo(limit>3)');
            }).to.throw(Error);
        });

        it('does not accept invalid parameters', () => {
            expect(() => {
                selectParser('foo(limit=foo)');
            }).to.throw(Error);
        });

        it('parses multiple parameters', () => {
            expect(selectParser('foo(limit=3)(order=name:asc)')).to.eql({
                foo: {
                    order: [{ direction: 'asc', attribute: ['name'] }],
                    limit: 3
                }
            });
        });
    });

    describe('multiple attributes with parameters', () => {
        it('parses single parameters', () => {
            expect(selectParser('title,foo(limit=3)')).to.eql({
                title: {},
                foo: { limit: 3 }
            });
            expect(selectParser('title(page=1),foo(limit=3)')).to.eql({
                title: { page: 1 },
                foo: { limit: 3 }
            });
        });
    });

    describe('attributes with children (brackets)', () => {
        it('fails on empty children "a[]"', () => {
            expect(() => {
                selectParser('a[]');
            }).to.throw(Error);
        });

        it('parses simple children "a[b]"', () => {
            expect(selectParser('a[b]')).to.eql({ a: { select: { b: {} } } });
        });

        it('parses nested children "a[b[c]]"', () => {
            expect(selectParser('a[b[c]]')).to.eql({ a: { select: { b: { select: { c: {} } } } } });
        });

        it('parses mixed attributes "a[b],c"', () => {
            expect(selectParser('a[b],c')).to.eql({ a: { select: { b: {} } }, c: {} });
        });

        it('parses mixed attributes "a[b],c[d]"', () => {
            expect(selectParser('a[b],c[d]')).to.eql({ a: { select: { b: {} } }, c: { select: { d: {} } } });
        });

        it('parses multiple children "a[b,c]', () => {
            expect(selectParser('a[b,c]')).to.eql({ a: { select: { b: {}, c: {} } } });
        });

        it('parses multiple children "a[b,c[d]]', () => {
            expect(selectParser('a[b,c[d]]')).to.eql({ a: { select: { b: {}, c: { select: { d: {} } } } } });
        });

        it('parses multiple children "a[b,c[d,e]]', () => {
            expect(selectParser('a[b,c[d]]')).to.eql({ a: { select: { b: {}, c: { select: { d: {} } } } } });
            expect(selectParser('a[b,c[d,e]]')).to.eql({ a: { select: { b: {}, c: { select: { d: {}, e: {} } } } } });
        });

        it('parses recursive children "a[b,c][d,e]"', () => {
            expect(selectParser('a[b,c][d,e]')).to.eql({
                a: {
                    select: {
                        b: { select: { d: {}, e: {} } },
                        c: { select: { d: {}, e: {} } }
                    }
                }
            });
        });

        it('parses recursive children "a[b,c.x][d,e]"', () => {
            expect(selectParser('a[b,c.x][d,e]')).to.eql({
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
            expect(selectParser('[b,c].d')).to.eql({ b: { select: { d: {} } }, c: { select: { d: {} } } });
        });

        it('parses brackets at top level (recursive) "[b,c][d,e]', () => {
            expect(selectParser('[b,c][d,e]')).to.eql({
                b: { select: { d: {}, e: {} } },
                c: { select: { d: {}, e: {} } }
            });
        });
    });

    describe('attributes with children (brackets) with parameters', () => {
        it('fails on empty children "a(limit=3)[]"', () => {
            expect(() => {
                selectParser('a(limit=3)[]');
            }).to.throw(Error);
        });

        it('parses simple parameters on root level', () => {
            expect(selectParser('a(limit=3)[b]')).to.eql({ a: { limit: 3, select: { b: {} } } });
        });

        it('parses simple parameters on children level', () => {
            expect(selectParser('a[b(limit=3)]')).to.eql({ a: { select: { b: { limit: 3 } } } });
        });

        it('parses simple parameters on all levels', () => {
            expect(selectParser('a(limit=3)[b(limit=4)]')).to.eql({ a: { limit: 3, select: { b: { limit: 4 } } } });
        });

        it('parses a complex example', () => {
            expect(selectParser('a(limit=1)[b(limit=2),x[y(limit=4)],zz],z')).to.eql({
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
            expect(selectParser('a.b')).to.eql({ a: { select: { b: {} } } });
        });

        it('fails on invalid identifier', () => {
            expect(() => {
                selectParser('a.*');
            }).to.throw(Error);
            expect(() => {
                selectParser('a.&');
            }).to.throw(Error);
        });

        it('parses children with parameters', () => {
            expect(selectParser('a(limit=3).b')).to.eql({ a: { limit: 3, select: { b: {} } } });
            expect(selectParser('a.b(limit=4)')).to.eql({ a: { select: { b: { limit: 4 } } } });
            expect(selectParser('a(limit=3).b(limit=4)')).to.eql({ a: { limit: 3, select: { b: { limit: 4 } } } });
        });

        it('fails on duplicate dots', () => {
            expect(() => {
                selectParser('a..b');
            }).to.throw(Error);
        });
    });

    describe('attributes with children (dot and bracket notation)', () => {
        it('parses "a.b,a[c]"', () => {
            expect(selectParser('a.b,a[b,c]')).to.eql({ a: { select: { b: {}, c: {} } } });
        });

        it('parses "a(limit=3).b,a[c]"', () => {
            // FIXME:
            // das zweite "a" ohne Parameter gehört angemeckert,
            // weil eigentlich "limit=3" dafür nicht gilt!
            expect(selectParser('a(limit=3).b,a[c]')).to.eql({ a: { limit: 3, select: { b: {}, c: {} } } });
        });

        it('parses "a.b,a(limit=3)[c]"', () => {
            // FIXME:
            // das "limit=3" gehört angemeckert, weil a schon ohne Limit requested wurde?
            expect(selectParser('a.b,a(limit=3)[c]')).to.eql({ a: { limit: 3, select: { b: {}, c: {} } } });
        });

        // ...
    });

    describe('complex examples', () => {
        it('parses "instruments[stock,index].countryId"', () => {
            expect(selectParser('instruments[stock,index].countryId')).to.eql({
                instruments: {
                    select: {
                        stock: { select: { countryId: {} } },
                        index: { select: { countryId: {} } }
                    }
                }
            });
        });

        it('parses "title,instruments(order=name:asc)(limit=3)(page=1).quotations(limit=4).quote"', () => {
            expect(selectParser('title,instruments(order=name:asc)(limit=3)(page=1).quotations(limit=4).quote')).to.eql(
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
            expect(
                selectParser(
                    'title,instruments(order=name:asc)(limit=3)(page=1).quotations(limit=4)[quote[value,changePerc]]'
                )
            ).to.eql({
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
            });
        });

        it('parses \'id,name,slug,itemType,description,image,media(filter=type="image").link\'', () => {
            expect(selectParser('id,name,slug,itemType,description,image,media(filter=type="image").link')).to.eql({
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
});
