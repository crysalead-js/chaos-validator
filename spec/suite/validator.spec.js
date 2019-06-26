var co = require('co');
var Checker = require('../../src/checker');
var Validator = require('../../src/validator');

describe("Validator", function() {

  afterEach(function() {
    Checker.reset();
  });

  describe(".constructor()", function() {

    it("correctly sets local validation handlers", function() {

      var validator = new Validator({
        handlers: {
          zeroToNine: '/^[0-9]$/',
          tenToNineteen: '/^1[0-9]$/'
        }
      });

      expect(validator.handlers()).toContainKeys('zeroToNine', 'tenToNineteen');

    });

  });

  describe(".meta()", function() {

    it("gets/sets meta data", function() {

      var validator = new Validator();

      var meta = { model: 'Post' };
      expect(validator.meta(meta)).toEqual(meta);
      expect(validator.meta()).toEqual(meta);

    });

  });

  describe(".error()", function() {

    it("gets/sets the error handler", function() {

      var validator = new Validator();

      var handler = function() { return 'hello world'; };
      expect(validator.error(handler)).toBe(handler);
      expect(validator.error()).toBe(handler);

    });

  });

  describe(".get()", function() {

    it("throws an exceptions for unexisting validation handler", function() {

      var closure = function() {
        var validator = new Validator();
        validator.get('abc');
      };

      expect(closure).toThrow(new Error("Unexisting `abc` as validation handler."));

    });

  });


  describe(".set()", function() {

    it("sets some local handlers", function() {

      var validator = new Validator();
      validator.set('zeroToNine', /^[0-9]$/);
      validator.set('tenToNineteen', /^1[0-9]$/);

      expect(validator.has('zeroToNine')).toBe(true);
      expect(validator.has('tenToNineteen')).toBe(true);

      expect(validator.get('zeroToNine')).toEqual(/^[0-9]$/);
      expect(validator.get('tenToNineteen')).toEqual(/^1[0-9]$/);

    });

    it("overrides handlers", function() {

      var validator = new Validator();
      validator.set('zeroToNine', /^[0-5]$/);
      validator.set('zeroToNine', /^[0-9]$/);

      expect(validator.get('zeroToNine')).toEqual(/^[0-9]$/);

    });

  });

  describe(".handlers()", function() {

    beforeEach(function() {

      Checker.reset(true);
      this.validator = new Validator();
      this.validator.set('zeroToNine', /^[0-9]$/);

    });

    it("gets some handlers", function() {

      expect(this.validator.handlers()).toEqual({ zeroToNine: /^[0-9]$/ });

    });

    it("appends some handlers", function() {

      var expected = { zeroToNine: /^[0-9]$/, tenToNineteen: /^1[0-9]$/ };
      expect(this.validator.handlers({ tenToNineteen: /^1[0-9]$/ })).toEqual(expected);
      expect(this.validator.handlers()).toEqual(expected);

    });

    it("sets some handlers", function() {

      var expected = { tenToNineteen: /^1[0-9]$/ };
      expect(this.validator.handlers({ tenToNineteen: /^1[0-9]$/ }, false)).toEqual(expected);
      expect(this.validator.handlers()).toEqual(expected);

    });

  });

  describe(".is()", function() {

    beforeEach(function() {
      spyOn(Checker, 'check').and.callThrough();
      this.validator = new Validator();
    });

    it("delegates to the checker", function() {
      var handler = Checker.get('alphaNumeric');
      this.validator.is('alphaNumeric', 'abcdef', { hello: 'world' });

      expect(Checker.check).toHaveBeenCalledWith('abcdef', handler , { hello: 'world' }, undefined);
    });
  });

  describe(".validates()", function() {

    beforeEach(function() {
      this.validator = new Validator();
    });

    it("fails for rules with missing data", function(done) {

      co(function*() {
        this.validator.rule('title', 'not:empty');

        expect(yield this.validator.validates({})).toBe(false);
        expect(this.validator.errors()).toEqual({ title: ['is required'] });

        expect(yield this.validator.validates({ title: '' })).toBe(false);
        expect(this.validator.errors()).toEqual({ title: ['must not be a empty'] });
        done();
      }.bind(this));

    });

    it("fails for rules with missing data and uses a custom message", function(done) {

      co(function*() {
        this.validator.rule('title', {
          'not:empty': { message: 'please enter a title' }
        });

        expect(yield this.validator.validates({})).toBe(false);
        expect(this.validator.errors()).toEqual({ title: ['is required'] });

        expect(yield this.validator.validates({ title: '' })).toBe(false);
        expect(this.validator.errors()).toEqual({ title: ['please enter a title'] });
        done();
      }.bind(this));

    });

    it("allows short syntax", function(done) {

      co(function*() {
        this.validator.rule('title', { 'not:empty': 'please enter a title' });

        expect(yield this.validator.validates({ title: '' })).toBe(false);
        expect(this.validator.errors()).toEqual({ title: ['please enter a title'] });
        done();
      }.bind(this));

    });

    it("checks all rules", function(done) {

      co(function*() {
        this.validator.rule('title', {
          'not:empty': { message: 'please enter a ${field}' },
          lengthBetween: { min: 1, max: 7, message: 'must be between ${min} and ${max} character long' }
        });

        expect(yield this.validator.validates({})).toBe(false);
        expect(this.validator.errors()).toEqual({ title: ['is required'] });

        expect(yield this.validator.validates({ title: '' })).toBe(false);
        expect(this.validator.errors()).toEqual({ title: [
          'please enter a title',
          'must be between 1 and 7 character long'
        ] });
        done();
      }.bind(this));

    });

    it("checks all rules using the alternative syntax", function(done) {

      co(function*() {
        this.validator.rule('title', [
          { 'not:empty': { message: 'please enter a ${field}' } },
          { lengthBetween: { min: 1, max: 7, message: 'must be between ${min} and ${max} character long' } }
        ]);

        expect(yield this.validator.validates({})).toBe(false);
        expect(this.validator.errors()).toEqual({ title: ['is required'] });

        expect(yield this.validator.validates({ title: '' })).toBe(false);
        expect(this.validator.errors()).toEqual({ title: [
          'please enter a title',
          'must be between 1 and 7 character long'
        ] });
        done();
      }.bind(this));

    });

    it("passes for rules with missing data but not required", function(done) {

      co(function*() {
        this.validator.rule('title', {
          'not:empty': {
            message: 'please enter a ${field}',
            required: false
          }
        });

        expect(yield this.validator.validates({})).toBe(true);
        expect(this.validator.errors()).toEqual({});
        done();
      }.bind(this));

    });

    it("passes for rules with empty data but allowed by skipEmpty", function(done) {

      co(function*() {
        this.validator.rule('title', {
          'not:empty': {
            message: 'please enter a ${field}',
            skipEmpty: true
          }
        });

        expect(yield this.validator.validates({ title: '' })).toBe(true);
        expect(this.validator.errors()).toEqual({});
        done();
      }.bind(this));

    });

    it("passes if valid", function(done) {

      co(function*() {
        this.validator.rule('title', 'not:empty');
        expect(yield this.validator.validates({ title: 'new title' })).toBe(true);

        expect(this.validator.errors()).toEqual({});
        done();
      }.bind(this));

    });

    it("checks rules which fit the event", function(done) {

      co(function*() {
        this.validator.rule('title', {
          'not:empty': {
            message: 'please enter a ${field}',
            on: 'create'
          }
        });

        expect(yield this.validator.validates({ title: '' }, { events: 'create' })).toBe(false);
        expect(this.validator.errors()).toEqual({ title: ['please enter a title'] });
        done();
      }.bind(this));

    });

    it("ignores rules which doesn't fit the event", function(done) {

      co(function*() {
        this.validator.rule('title', {
          'not:empty': {
            message: 'please enter a ${field}',
            on: 'create'
          }
        });

        expect(yield this.validator.validates({ title: '' }, { events: 'update' })).toBe(true);
        expect(this.validator.errors()).toEqual({});
        done();
      }.bind(this));

    });

    it("validates arrays of things", function(done) {

      co(function*() {
        this.validator.rule('emails.*', 'email');

        expect(yield this.validator.validates({ emails: ['willy@boy.com', 'johnny@boy.com'] })).toBe(true);
        expect(this.validator.errors()).toEqual({});
        done();
      }.bind(this));

    });

    it("provides errors reporting for arrays of things", function(done) {

      co(function*() {
        this.validator.rule('emails.*', 'email');

        expect(yield this.validator.validates({ emails: ['invalid', 'johnny@boy.com'] })).toBe(false);
        expect(this.validator.errors()).toEqual({ 'emails.0': ['is not a valid email address'] });

        expect(yield this.validator.validates({ emails: ['willy@boy.com', 'invalid'] })).toBe(false);
        expect(this.validator.errors()).toEqual({ 'emails.1': ['is not a valid email address'] });
        done();
      }.bind(this));

    });

    it("validates nested structure", function(done) {

      co(function*() {
        this.validator.rule('people.*.email', 'email');

        expect(yield this.validator.validates({
          people: [
            { email: 'willy@boy.com' },
            { email: 'johnny@boy.com' }
          ]
        })).toBe(true);

        expect(this.validator.errors()).toEqual({});
        done();
      }.bind(this));

    });

    it("provides errors reporting for nested structure", function(done) {

      co(function*() {
        this.validator.rule('people.*.email', 'email');

        expect(yield this.validator.validates({
          people: [
            { email: 'invalid' },
            { email: 'johnny@boy.com' }
          ]
        })).toBe(false);

        expect(this.validator.errors()).toEqual({ 'people.0.email': ['is not a valid email address'] });

        expect(yield this.validator.validates({
          people: [
            { email: 'willy@boy.com' },
            { email: 'invalid' }
          ]
        })).toBe(false);

        expect(this.validator.errors()).toEqual({ 'people.1.email': ['is not a valid email address'] });
        done();
      }.bind(this));
    });

    it("allows null as a value", function(done) {

      co(function*() {
        this.validator.rule('title', { 'not:empty': 'please enter a title' });

        expect(yield this.validator.validates({ title: null })).toBe(false);
        expect(this.validator.errors()).toEqual({ title: ['please enter a title'] });

        done();
      }.bind(this));

    });

  });

  describe(".message()", function() {

    beforeEach(function() {
      this.validator = new Validator();
    });

    it("checks defaults error message", function(done) {

      co(function*() {
        this.validator.rule('accepted', 'accepted');
        this.validator.rule('alphaNumeric', 'alphaNumeric');
        this.validator.rule('boolean', 'boolean');
        this.validator.rule('creditCard', 'creditCard');
        this.validator.rule('date', 'date');
        this.validator.rule('dateAfter', {
          dateAfter:  {
            date: new Date('2015-12-31 11:59:59')
          }
        });
        this.validator.rule('dateBefore', {
          dateBefore: {
            date: new Date('2014-12-31 11:59:59')
          }
        });
        this.validator.rule('decimal', 'decimal');
        this.validator.rule('email', 'email');
        this.validator.rule('equalTo', { equalTo: { key: 'fieldname' } });
        this.validator.rule('empty', 'empty');
        this.validator.rule('not:empty', 'not:empty');
        this.validator.rule('inList', 'inList');
        this.validator.rule('not:inList', 'not:inList');
        this.validator.rule('inRange', 'inRange');
        this.validator.rule('not:inRange', 'not:inRange');
        this.validator.rule('integer', 'integer');
        this.validator.rule('ip', 'ip');
        this.validator.rule('length', { length: { length: 5 } });
        this.validator.rule('lengthBetween', { lengthBetween: { min: 5, max: 15 } });
        this.validator.rule('lengthMax', { lengthMax: { length: 5 } });
        this.validator.rule('lengthMin', { lengthMin: { length: 5 } });
        this.validator.rule('luhn', 'luhn');
        this.validator.rule('max', { max: { max: 5 } });
        this.validator.rule('min', { min: { min: 5 } });
        this.validator.rule('money', 'money');
        this.validator.rule('numeric', 'numeric');
        this.validator.rule('phone', 'phone');
        this.validator.rule('regex', 'regex');
        this.validator.rule('required', 'not:empty');
        this.validator.rule('time', 'time');
        this.validator.rule('undefined', 'undefined');
        this.validator.rule('url', 'url');

        this.validator.set('undefined', function() {
          return false;
        });

        expect(yield this.validator.validates({
          accepted: '',
          alphaNumeric: '',
          boolean: '',
          creditCard: '',
          date: '',
          dateAfter: '2014-12-31 11:59:59',
          dateBefore: '2015-12-31 11:59:59',
          decimal: '',
          email: '',
          equalTo: '',
          empty: 'not empty',
          'not:empty': '',
          inList: '',
          'not:inList': '',
          inRange: '',
          'not:inRange': '',
          integer: '',
          ip: '',
          length: '',
          lengthBetween: '',
          lengthMax: '',
          lengthMin: '',
          luhn: '',
          max: '15',
          min: '',
          money: '',
          numeric: '',
          phone: '',
          regex: '',
          time: '',
          undefined: '',
          url: ''
        })).toBe(false);

        expect(this.validator.errors()).toEqual({
          alphaNumeric: ['must contain only letters a-z and/or numbers 0-9'],
          boolean: ['must be a boolean'],
          creditCard: ['must be a valid credit card number'],
          date: ['is not a valid date'],
          dateAfter: ['must be date after 2015-12-31 11:59:59'],
          dateBefore: ['must be date before 2014-12-31 11:59:59'],
          decimal: ['must be decimal'],
          email: ['is not a valid email address'],
          equalTo: ['must be the equal to the field `fieldname`'],
          empty: ['must be a empty'],
          'not:empty': ['must not be a empty'],
          inList: ['must contain a valid value'],
          inRange: ['must be inside the range'],
          integer: ['must be an integer'],
          ip: ['must be an ip'],
          length: ['must be longer than 5'],
          lengthBetween: ['must be between 5 and 15 characters'],
          lengthMin: ['must contain greater than 5 characters'],
          luhn: ['must be a valid credit card number'],
          max: ['must be no more than 5'],
          min: ['must be at least 5'],
          money: ['must be a valid monetary amount'],
          numeric: ['must be numeric'],
          phone: ['must be a phone number'],
          regex: ['contains invalid characters'],
          required: ['is required'],
          time: ['must be a valid time'],
          undefined: ['is invalid'],
          url: ['not a URL']
        });
        done();
      }.bind(this));

    });

    it("gets a error message", function() {

      expect(this.validator.message('required')).toBe('is required');

    });

    it("sets an error message", function() {

      expect(this.validator.message('required', 'must be defined')).toBe('must be defined');
      expect(this.validator.message('required')).toBe('must be defined');

    });

  });

  describe(".messages()", function() {

    it("appends error messages", function() {

      Checker.reset(true);
      var validator = new Validator();
      validator.messages({ a: 'b' });

      var expected = { a: 'b', c: 'd', _default_: 'is invalid' };
      expect(validator.messages({ c: 'd' })).toEqual(expected);
      expect(validator.messages()).toEqual(expected);

    });

    it("sets error messages", function() {

      Checker.reset(true);
      var validator = new Validator();
      validator.messages({ a: 'b' });

      var expected = { c: 'd', _default_: 'is invalid' };
      expect(validator.messages({ c: 'd' }, false)).toEqual(expected);
      expect(validator.messages()).toEqual(expected);

    });

  });

  describe(".values()", function() {

    it("returns the wrapped data when no path is defined", function() {

      var data = { title: 'new title' };

      expect(Validator.values(data)).toEqual({ '0': data });

    });

  });

});
