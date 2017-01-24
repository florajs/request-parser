'use strict';

const { expect } = require('chai');

const aggregateParser = require('../').aggregate;

describe('aggregate parser', () => {
    it('should be a function', () => {
        expect(aggregateParser).to.be.a('function');
    });

    it('should throw an error (not implemented)', () => {
        expect((() => { aggregateParser({}); })).to.throw(Error);
    });
});
