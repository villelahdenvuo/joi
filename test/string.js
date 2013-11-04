// Load modules

var Lab = require('lab');
var Joi = require('../lib');
var Support = require('./support/meta');


// Declare internals

var internals = {};


// Test shortcuts

var expect = Lab.expect;
var before = Lab.before;
var after = Lab.after;
var describe = Lab.experiment;
var it = Lab.test;
var verifyBehavior = Support.verifyValidatorBehavior;


describe('Joi.types.String', function () {

    var S = Joi.types.String;

    describe('#valid', function () {

        it('should throw error on input not matching type', function (done) {

            expect(function () {

                S().valid(1);
            }).to.throw;
            done();
        });

        it('should not throw on input matching type', function (done) {

            expect(function () {

                S().valid('joi');
            }).to.not.throw;
            done();
        });

        it('validates case sensitive values', function (done) {

            verifyBehavior(S().valid('a', 'b'), [['a', true], ['b', true], ['A', false], ['B', false]], done);
        });

        it('validates case insensitive values', function (done) {

            verifyBehavior(S().valid('a', 'b').insensitive(), [['a', true], ['b', true], ['A', true], ['B', true]], done);
        });
    });

    describe('#invalid', function () {

        it('should throw error on input not matching type', function (done) {

            expect(function () {

                S().invalid(1);
            }).to.throw;
            done();
        });

        it('should not throw on input matching type', function (done) {

            expect(function () {

                S().invalid('joi');
            }).to.not.throw;
            done();
        });

        it('invalidates case sensitive values', function (done) {

            verifyBehavior(S().invalid('a', 'b'), [['a', false], ['b', false], ['A', true], ['B', true]], done);
        });

        it('invalidates case insensitive values', function (done) {

            verifyBehavior(S().invalid('a', 'b').insensitive(), [['a', false], ['b', false], ['A', false], ['B', false]], done);
        });
    });

    describe('#validate', function () {

        it('should work', function (done) {

            expect(function () {

                var text = S();
                var result = text.validate('joi');
            }).to.not.throw;
            done();
        });

        it('should, by default, allow undefined, deny empty string', function (done) {

            var conditions = [
                [undefined, true],
                ['', false]
            ];
            verifyBehavior(S(), conditions, done);
        });

        it('should, when .required(), deny undefined, deny empty string', function (done) {

            var t = S().required();
            verifyBehavior(t, [
                [undefined, false],
                ['', false]
            ], done);
        });

        it('should, when .required(), print a friend error message for an empty string', function (done) {

            var t = S().required();
            var result = Joi.validate('', t);

            expect(result.message).to.contain('be empty');
            done();
        });

        it('should, when .required(), validate non-empty strings', function (done) {

            var t = S().required();
            verifyBehavior(t, [
                ['test', true],
                ['0', true],
                [null, false]
            ], done);
        });

        it('should validate invalid values', function (done) {

            var t = S().invalid('a', 'b', 'c');
            verifyBehavior(t, [
                ['x', true],
                ['a', false],
                ['c', false]
            ], done);
        });

        it('should invalidate invalid values', function (done) {

            var t = S().valid('a', 'b', 'c');
            verifyBehavior(t, [
                ['x', false],
                ['a', true],
                ['c', true]
            ], done);
        });

        it('should handle array arguments correctly', function (done) {

            var t = S().valid(['a', 'b', 'c']);
            verifyBehavior(t, [
                ['x', false],
                ['a', true],
                ['c', true]
            ], done);
        });

        it('should validate minimum length when min is used', function (done) {

            var t = S().min(3);
            verifyBehavior(t, [
                ['test', true],
                ['0', false],
                [null, false]
            ], done);
        });

        it('should validate minimum length when min is 0', function (done) {

            var t = S().min(0).required();
            verifyBehavior(t, [
                ['0', true],
                [null, false],
                [undefined, false]
            ], done);
        });

        it('should return false with minimum length and a null value passed in', function (done) {

            var t = S().min(3);
            verifyBehavior(t, [
                [null, false]
            ], done);
        });

        it('nullOk overrides min length requirement', function (done) {

            var t = S().min(3).nullOk();
            verifyBehavior(t, [
                [null, true]
            ], done);
        });

        it('should validate maximum length when max is used', function (done) {

            var t = S().max(3);
            verifyBehavior(t, [
                ['test', false],
                ['0', true],
                [null, false]
            ], done);
        });

        it('should return true with max and not required when value is undefined', function (done) {

            var t = S().max(3);
            verifyBehavior(t, [
                [undefined, true]
            ], done);
        });

        it('should validate regex', function (done) {

            var t = S().regex(/^[0-9][-][a-z]+$/);
            verifyBehavior(t, [
                ['van', false],
                ['0-www', true]
            ], done);
        });

        it('should validate alphanum when alphanum allows spaces', function (done) {

            var t = S().alphanum(true);
            verifyBehavior(t, [
                ['w0rld of w4lm4rtl4bs', true],
                ['abcd#f?h1j orly?', false]
            ], done);
        });

        it('should validate alphanum when alphanum doesn\'t allow spaces', function (done) {

            var t = S().alphanum(false);
            verifyBehavior(t, [
                ['w0rld of w4lm4rtl4bs', false],
                ['w0rldofw4lm4rtl4bs', true],
                ['abcd#f?h1j orly?', false]
            ], done);
        });

        it('should validate alphanum when allow spaces is null', function (done) {

            var t = S().alphanum(null);
            verifyBehavior(t, [
                ['w0rld of w4lm4rtl4bs', true],
                ['abcd#f?h1j orly?', false]
            ], done);
        });

        it('should validate email', function (done) {

            var t = S().email();
            verifyBehavior(t, [
                ['van@walmartlabs.com', true],
                ['@iaminvalid.com', false]
            ], done);
        });

        it('should validate email with a friendly error message', function (done) {

            var schema = { item: S().email() };
            var err = Joi.validate({ item: 'something' }, schema);

            expect(err.message).to.contain('must be a valid email');
            done();
        });

        it('should return false for denied value', function (done) {

            var text = S().deny('joi');
            var result = text.validate('joi');
            expect(result).to.exist;
            done();
        });

        it('should return true for allowed value', function (done) {

            var text = S().allow('hapi');
            var result = text.validate('result');
            expect(result).to.not.exist;
            done();
        });

        it('should validate with one validator (min)', function (done) {

            var text = S().min(3);
            var result = text.validate('joi');
            expect(result).to.not.exist;
            done();
        });

        it('should validate with two validators (min, required)', function (done) {

            var text = S().min(3).required();
            var result = text.validate('joi');
            expect(result).to.not.exist;

            var result2 = text.validate();
            expect(result2).to.exist;

            done();
        });

        it('should validate null with nullOk()', function (done) {

            verifyBehavior(S().nullOk(), [
                [null, true]
            ], done);
        });

        it('should validate "" (empty string) with emptyOk()', function (done) {

            verifyBehavior(S().emptyOk(), [
                ['', true],
                ['', true]
            ], done);
        });

        it('should handle combination of required and min', function (done) {

            var rule = S().required().min(3);
            verifyBehavior(rule, [
                ['x', false],
                ['123', true],
                ['', false],
                [null, false]
            ], done);
        });

        it('should handle combination of required and max', function (done) {

            var rule = S().required().max(3);
            verifyBehavior(rule, [
                ['x', true],
                ['123', true],
                ['1234', false],
                ['', false],
                [null, false]
            ], done);
        });

        it('should handle combination of emptyOk and min', function (done) {

            var rule = S().emptyOk().min(3);
            verifyBehavior(rule, [
                ['x', false],
                ['123', true],
                ['1234', true],
                ['', true],
                [null, false]
            ], done);
        });

        it('should handle combination of emptyOk and max', function (done) {

            var rule = S().emptyOk().max(3);
            verifyBehavior(rule, [
                ['x', true],
                ['123', true],
                ['1234', false],
                ['', true],
                [null, false]
            ], done);
        });

        it('should handle combination of nullOk and max', function (done) {
            var rule = S().nullOk().max(3);
            verifyBehavior(rule, [
                ['x', true],
                ['123', true],
                ['1234', false],
                ['', false],
                [null, true]
            ], done);
        });

        it('should handle combination of min and max', function (done) {

            var rule = S().min(2).max(3);
            verifyBehavior(rule, [
                ['x', false],
                ['123', true],
                ['1234', false],
                ['12', true],
                ['', false],
                [null, false]
            ], done);
        });

        it('should handle combination of min, max, and emptyOk', function (done) {

            var rule = S().min(2).max(3).emptyOk();
            verifyBehavior(rule, [
                ['x', false],
                ['123', true],
                ['1234', false],
                ['12', true],
                ['', true],
                [null, false]
            ], done);
        });

        it('should handle combination of min, max, and required', function (done) {

            var rule = S().min(2).max(3).required();
            verifyBehavior(rule, [
                ['x', false],
                ['123', true],
                ['1234', false],
                ['12', true],
                ['', false],
                [null, false]
            ], done);
        });

        it('should handle combination of min, max, and regex', function (done) {

            var rule = S().min(2).max(3).regex(/^a/);
            verifyBehavior(rule, [
                ['x', false],
                ['123', false],
                ['1234', false],
                ['12', false],
                ['ab', true],
                ['abc', true],
                ['abcd', false],
                ['', false],
                [null, false]
            ], done);
        });

        it('should handle combination of min, max, regex, and emptyOk', function (done) {

            var rule = S().min(2).max(3).regex(/^a/).emptyOk();
            verifyBehavior(rule, [
                ['x', false],
                ['123', false],
                ['1234', false],
                ['12', false],
                ['ab', true],
                ['abc', true],
                ['abcd', false],
                ['', true],
                [null, false]
            ], done);
        });

        it('should handle combination of min, max, regex, and required', function (done) {

            var rule = S().min(2).max(3).regex(/^a/).required();
            verifyBehavior(rule, [
                ['x', false],
                ['123', false],
                ['1234', false],
                ['12', false],
                ['ab', true],
                ['abc', true],
                ['abcd', false],
                ['', false],
                [null, false]
            ], done);
        });

        it('should handle combination of min, max, and alphanum', function (done) {

            var rule = S().min(2).max(3).alphanum();
            verifyBehavior(rule, [
                ['x', false],
                ['123', true],
                ['1234', false],
                ['12', true],
                ['ab', true],
                ['abc', true],
                ['abcd', false],
                ['*ab', false],
                ['', false],
                [null, false]
            ], done);
        });

        it('should handle combination of min, max, alphanum, and emptyOk', function (done) {

            var rule = S().min(2).max(3).alphanum().emptyOk();
            verifyBehavior(rule, [
                ['x', false],
                ['123', true],
                ['1234', false],
                ['12', true],
                ['ab', true],
                ['abc', true],
                ['abcd', false],
                ['*ab', false],
                ['', true],
                [null, false]
            ], done);
        });

        it('should handle combination of min, max, alphanum, and required', function (done) {

            var rule = S().min(2).max(3).alphanum().required();
            verifyBehavior(rule, [
                ['x', false],
                ['123', true],
                ['1234', false],
                ['12', true],
                ['ab', true],
                ['abc', true],
                ['abcd', false],
                ['*ab', false],
                ['', false],
                [null, false]
            ], done);
        });

        it('should handle combination of min, max, alphanum, and regex', function (done) {

            var rule = S().min(2).max(3).alphanum().regex(/^a/);
            verifyBehavior(rule, [
                ['x', false],
                ['123', false],
                ['1234', false],
                ['12', false],
                ['ab', true],
                ['abc', true],
                ['a2c', true],
                ['abcd', false],
                ['*ab', false],
                ['', false],
                [null, false]
            ], done);
        });

        it('should handle combination of min, max, alphanum, required, and regex', function (done) {

            var rule = S().min(2).max(3).alphanum().required().regex(/^a/);
            verifyBehavior(rule, [
                ['x', false],
                ['123', false],
                ['1234', false],
                ['12', false],
                ['ab', true],
                ['abc', true],
                ['a2c', true],
                ['abcd', false],
                ['*ab', false],
                ['', false],
                [null, false]
            ], done);
        });

        it('should handle combination of min, max, alphanum, emptyOk, and regex', function (done) {

            var rule = S().min(2).max(3).alphanum().emptyOk().regex(/^a/);
            verifyBehavior(rule, [
                ['x', false],
                ['123', false],
                ['1234', false],
                ['12', false],
                ['ab', true],
                ['abc', true],
                ['a2c', true],
                ['abcd', false],
                ['*ab', false],
                ['', true],
                [null, false]
            ], done);
        });

        it('should handle combination of email and min', function (done) {

            var rule = S().email().min(8);
            verifyBehavior(rule, [
                ['x@x.com', false],
                ['123@x.com', true],
                ['', false],
                [null, false]
            ], done);
        });

        it('should handle combination of email, min, and max', function (done) {

            var rule = S().email().min(8).max(10);
            verifyBehavior(rule, [
                ['x@x.com', false],
                ['123@x.com', true],
                ['1234@x.com', true],
                ['12345@x.com', false],
                ['', false],
                [null, false]
            ], done);
        });

        it('should handle combination of email, min, max, and deny', function (done) {

            var rule = S().email().min(8).max(10).deny('123@x.com');
            verifyBehavior(rule, [
                ['x@x.com', false],
                ['123@x.com', false],
                ['1234@x.com', true],
                ['12345@x.com', false],
                ['', false],
                [null, false]
            ], done);
        });

        it('should handle combination of email, min, max, and allow', function (done) {

            var rule = S().email().min(8).max(10).allow('x@x.com');
            verifyBehavior(rule, [
                ['x@x.com', true],
                ['123@x.com', true],
                ['1234@x.com', true],
                ['12345@x.com', false],
                ['', false],
                [null, false]
            ], done);
        });

        it('should handle combination of email, min, max, allow, and deny', function (done) {

            var rule = S().email().min(8).max(10).allow('x@x.com').deny('123@x.com');
            verifyBehavior(rule, [
                ['x@x.com', true],
                ['123@x.com', false],
                ['1234@x.com', true],
                ['12345@x.com', false],
                ['', false],
                [null, false]
            ], done);
        });

        it('should handle combination of email, min, max, allow, deny, and emptyOk', function (done) {

            var rule = S().email().min(8).max(10).allow('x@x.com').deny('123@x.com').emptyOk();
            verifyBehavior(rule, [
                ['x@x.com', true],
                ['123@x.com', false],
                ['1234@x.com', true],
                ['12345@x.com', false],
                ['', true],
                [null, false]
            ], done);
        });

        it('should handle combination of email, min, max, allow, and emptyOk', function (done) {

            var rule = S().email().min(8).max(10).allow('x@x.com').emptyOk();
            verifyBehavior(rule, [
                ['x@x.com', true],
                ['123@x.com', true],
                ['1234@x.com', true],
                ['12345@x.com', false],
                ['', true],
                [null, false]
            ], done);
        });

        it('should handle combination of email, min, max, allow, deny, and regex', function (done) {

            var rule = S().email().min(8).max(10).allow('x@x.com').deny('123@x.com').regex(/^1/);
            verifyBehavior(rule, [
                ['x@x.com', true],
                ['123@x.com', false],
                ['1234@x.com', true],
                ['12345@x.com', false],
                ['', false],
                [null, false]
            ], done);
        });

        it('should handle combination of email, min, max, allow, deny, regex, and emptyOk', function (done) {

            var rule = S().email().min(8).max(10).allow('x@x.com').deny('123@x.com').regex(/^1/).emptyOk();
            verifyBehavior(rule, [
                ['x@x.com', true],
                ['123@x.com', false],
                ['1234@x.com', true],
                ['12345@x.com', false],
                ['', true],
                [null, false]
            ], done);
        });

        it('should handle combination of email, min, max, and emptyOk', function (done) {

            var rule = S().email().min(8).max(10).emptyOk();
            verifyBehavior(rule, [
                ['x@x.com', false],
                ['123@x.com', true],
                ['1234@x.com', true],
                ['12345@x.com', false],
                ['', true],
                [null, false]
            ], done);
        });

        it('should handle combination of email, min, max, and regex', function (done) {

            var rule = S().email().min(8).max(10).regex(/^1234/);
            verifyBehavior(rule, [
                ['x@x.com', false],
                ['123@x.com', false],
                ['1234@x.com', true],
                ['12345@x.com', false],
                ['', false],
                [null, false]
            ], done);
        });

        it('should handle combination of email, min, max, regex, and emptyOk', function (done) {

            var rule = S().email().min(8).max(10).regex(/^1234/).emptyOk();
            verifyBehavior(rule, [
                ['x@x.com', false],
                ['123@x.com', false],
                ['1234@x.com', true],
                ['12345@x.com', false],
                ['', true],
                [null, false]
            ], done);
        });

        it('should handle combination of email, min, max, regex, and required', function (done) {

            var rule = S().email().min(8).max(10).regex(/^1234/).required();
            verifyBehavior(rule, [
                ['x@x.com', false],
                ['123@x.com', false],
                ['1234@x.com', true],
                ['12345@x.com', false],
                ['', false],
                [null, false]
            ], done);
        });
    });
});
