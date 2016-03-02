'use strict';

var expect = require('chai').expect;

var selectParser = require('../').select;

describe('select-parser', function () {
    it('should be a function', function () {
        expect(selectParser).to.be.a('function');
    });

    it('should throw an error for non-string arguments', function () {
        expect((function () { selectParser(1); })).to.throw(Error);
        expect((function () { selectParser({}); })).to.throw(Error);
        expect((function () { selectParser([]); })).to.throw(Error);
    });

    it('does not accept empty strings', function () {
        expect((function () { selectParser(''); })).to.throw(Error);
        expect((function () { selectParser(','); })).to.throw(Error);
    });

    it('accepts single select parameters', function () {
        expect((function () { selectParser('title'); })).not.to.throw(Error);
    });

    it('accepts multiple select parameters', function () {
        expect((function () { selectParser('title,instruments'); })).not.to.throw(Error);
    });

    describe('attributes without parameters', function () {
        it('returns the parts as object keys', function () {
            expect(selectParser('foo')).to.eql({foo: {}});

        });

        it('works for multiple parts', function () {
            expect(selectParser('foo,bar')).to.eql({foo: {}, bar: {}});
        });
    });

    describe('single attributes with parameters', function () {
        it('parses single parameters', function () {
            expect(selectParser('foo(limit=3)')).to.eql({foo: {limit: 3}});
            expect(selectParser('foo(order=name:asc)')).to.eql({
                foo: {order: [{direction: "asc", attribute: ["name"]}]}
            });
        });

        it('accepts and passes through unknown parameters', function () {
            expect((function () { selectParser('foo(a=1)'); })).not.to.throw(Error);
        });

        it('accepts array parameters in filter', function () {
            expect(selectParser('foo(filter=id=1,2)')).to.eql({
                foo: {
                    filter: [[{attribute: ['id'], operator: 'equal', value: [1, 2]}]]
                }
            });
        });

        it('merges options: "a(b=c),a.b"', function () {
            expect(selectParser('a(b=c),a.b')).to.eql({a: {b: "c", select: {b: {}}}});
            expect(selectParser('a(b=c)(d=e),a.b')).to.eql({a: {b: "c", d: "e", select: {b: {}}}});
        });

        it('throws an error if trying to merge options: "a(b=c),a(e=f)"', function () {
            expect((function () { selectParser('a(b=c),a(e=f)'); })).to.throw(Error);
        });

        it('throws an error if options are redefined', function () {
            expect((function () { selectParser('a(b=c)(b=d)'); })).to.throw(Error);
        })

        it('does not accept invalid operators', function () {
            expect((function () { selectParser('foo(limit>3)'); })).to.throw(Error);
        });

        it('does not accept invalid parameters', function () {
            expect((function () { selectParser('foo(limit=foo)'); })).to.throw(Error);
        });

        it('parses multiple parameters', function () {
            expect(selectParser('foo(limit=3)(order=name:asc)')).to.eql({
                foo: {
                    order: [{direction: "asc", attribute: ["name"]}],
                    limit: 3,
                }
            });
        });
    });

    describe('multiple attributes with parameters', function () {
        it('parses single parameters', function () {
            expect(selectParser('title,foo(limit=3)')).to.eql({
                title: {},
                foo: {limit: 3}
            });
            expect(selectParser('title(page=1),foo(limit=3)')).to.eql({
                title: {page: 1},
                foo: {limit: 3}
            });
        });
    });

    describe('attributes with children (brackets)', function () {
        it('fails on empty children "a[]"', function () {
            expect(function () { selectParser('a[]'); }).to.throw(Error);
        });

        it('parses simple children "a[b]"', function () {
            expect(selectParser('a[b]')).to.eql({a: {select: {b: {}}}});
        });

        it('parses nested children "a[b[c]]"', function () {
            expect(selectParser('a[b[c]]')).to.eql({a: {select: {b: {select: {c: {}}}}}});
        });

        it('parses mixed attributes "a[b],c"', function () {
            expect(selectParser('a[b],c')).to.eql({a: {select: {b: {}}}, c: {}});
        });

        it('parses mixed attributes "a[b],c[d]"', function () {
            expect(selectParser('a[b],c[d]')).to.eql({a: {select: {b: {}}}, c: {select: {d: {}}}});
        });

        it('parses multiple children "a[b,c]', function () {
            expect(selectParser('a[b,c]')).to.eql({a: {select: {b: {}, c: {}}}});
        });

        it('parses multiple children "a[b,c[d]]', function () {
            expect(selectParser('a[b,c[d]]')).to.eql({a: {select: {b: {}, c: {select: {d: {}}}}}});
        });

        it('parses multiple children "a[b,c[d,e]]', function () {
            expect(selectParser('a[b,c[d]]')).to.eql({a: {select: {b: {}, c: {select: {d: {}}}}}});
            expect(selectParser('a[b,c[d,e]]')).to.eql({a: {select: {b: {}, c: {select: {d: {}, e: {}}}}}});
        });

        it('parses recursive children "a[b,c][d,e]"', function () {
            expect(selectParser('a[b,c][d,e]')).to.eql({a: {select: {
                b: {select: {d: {}, e: {}}},
                c: {select: {d: {}, e: {}}}
            }}});
        });

        it('parses recursive children "a[b,c.x][d,e]"', function () {
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

        it('parses brackets at top level "[b,c].d"', function () {
            expect(selectParser('[b,c].d')).to.eql({b: {select: {d: {}}}, c: {select: {d: {}}}});
        });

        it('parses brackets at top level (recursive) "[b,c][d,e]', function () {
            expect(selectParser('[b,c][d,e]')).to.eql({b: {select: {d: {}, e: {}}}, c: {select: {d: {}, e: {}}}});
        });
    });

    describe('attributes with children (brackets) with parameters', function () {
        it('fails on empty children "a(limit=3)[]"', function () {
            expect(function () { selectParser('a(limit=3)[]'); }).to.throw(Error);
        });

        it('parses simple parameters on root level', function () {
            expect(selectParser('a(limit=3)[b]')).to.eql({a: {limit: 3, select: {b: {}}}});
        });

        it('parses simple parameters on children level', function () {
            expect(selectParser('a[b(limit=3)]')).to.eql({a: {select: {b: {limit: 3}}}});
        });

        it('parses simple parameters on all levels', function () {
            expect(selectParser('a(limit=3)[b(limit=4)]')).to.eql({a: {limit: 3, select: {b: {limit: 4}}}});
        });

        it('parses a complex example', function () {
            expect(selectParser('a(limit=1)[b(limit=2),x[y(limit=4)],zz],z')).to.eql({
                a: {
                    limit: 1,
                    select: {
                        b: {limit: 2},
                        x: {
                            select: {y: {limit: 4}}
                        },
                        zz: {}
                    }
                },
                z: {}
            });
        });
    });

    describe('attributes with children (dot notation)', function () {
        it('parses "a.b"', function () {
            expect(selectParser('a.b')).to.eql({a: {select: {b: {}}}});
        });

        it('fails on invalid identifier', function () {
            expect(function () { selectParser('a.*'); }).to.throw(Error);
            expect(function () { selectParser('a.&'); }).to.throw(Error);
        });

        it('parses children with parameters', function () {
            expect(selectParser('a(limit=3).b')).to.eql({a: {limit: 3, select: {b: {}}}});
            expect(selectParser('a.b(limit=4)')).to.eql({a: {select: {b: {limit: 4}}}});
            expect(selectParser('a(limit=3).b(limit=4)')).to.eql({a: {limit: 3, select: {b: {limit: 4}}}});
        });

        it('fails on duplicate dots', function () {
            expect(function () { selectParser('a..b'); }).to.throw(Error);
        });
    });

    describe('attributes with children (dot and bracket notation)', function () {
        it('parses "a.b,a[c]"', function () {
            expect(selectParser('a.b,a[b,c]')).to.eql({ a: { select: { b: {}, c: {} } } });
        });

        it('parses "a(limit=3).b,a[c]"', function () {
            // FIXME:
            // das zweite "a" ohne Parameter gehört angemeckert,
            // weil eigentlich "limit=3" dafür nicht gilt!
            expect(selectParser('a(limit=3).b,a[c]')).to.eql({ a: { limit: 3, select: { b: {}, c: {} } } });
        });

        it('parses "a.b,a(limit=3)[c]"', function () {
            // FIXME:
            // das "limit=3" gehört angemeckert, weil a schon ohne Limit requested wurde?
            expect(selectParser('a.b,a(limit=3)[c]')).to.eql({ a: { limit: 3, select: { b: {}, c: {} } } });
        });

        // ...
    });

    describe('complex examples', function () {
        it('parses "instruments[stock,index].countryId"', function () {
            expect(selectParser('instruments[stock,index].countryId')).to.eql({
                instruments: {
                    select: {
                        stock: {select: {countryId: {}}},
                        index: {select: {countryId: {}}}
                    }
                }
            });
        });

        it('parses "title,instruments(order=name:asc)(limit=3)(page=1).quotations(limit=4).quote"', function () {
            expect(selectParser('title,instruments(order=name:asc)(limit=3)(page=1).quotations(limit=4).quote')).to.eql({
                title: {},
                instruments: {
                    order: [{attribute: ['name'], direction: 'asc'}],
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
            });
        });

        it('parses "title,instruments(order=name:asc)(limit=3)(page=1).quotations(limit=4)[quote[value,changePerc]]"', function () {
            expect(selectParser('title,instruments(order=name:asc)(limit=3)(page=1).quotations(limit=4)[quote[value,changePerc]]')).to.eql({
                title: {},
                instruments: {
                    order: [{attribute: ['name'], direction: 'asc'}],
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
    });
});
