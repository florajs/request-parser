/* global describe, it */

'use strict';

const { expect } = require('chai');

const idParser = require('../').id;

describe('id parser', () => {
    it('should be a function', () => {
        expect(idParser).to.be.a('function');
    });

    it('should return the input as string', () => {
        expect(idParser(1)).to.be.a('string');
        expect(idParser(1)).to.equal('1');
        expect(idParser(3.1415)).to.equal('3.1415');
        expect(idParser('foo')).to.equal('foo');
    });

    it('should only accept string or number', () => {
        expect(() => {
            idParser(1);
        }).not.to.throw(Error);
        expect(() => {
            idParser(3.1415);
        }).not.to.throw(Error);
        expect(() => {
            idParser('foo');
        }).not.to.throw(Error);
        expect(() => {
            idParser([]);
        }).to.throw(Error);
        expect(() => {
            idParser({});
        }).to.throw(Error);
        expect(() => {
            idParser();
        }).to.throw(Error);
    });
});
