import co from 'co';
import { Checker } from '../../src';

describe("Checker", function() {

  afterEach(function() {
    Checker.reset();
  });

  describe(".set()", function() {

    it("adds some local handlers", function() {

      Checker.set('zeroToNine', /^[0-9]/);
      Checker.set('tenToNineteen', /^1[0-9]/);

      expect(Checker.handlers()).toContainKeys('zeroToNine', 'tenToNineteen');

    });

    it("sets validation handlers", function() {

      Checker.set('zeroToNine', /^[0-9]/);
      Checker.set('tenToNineteen', /^1[0-9]/);

      expect(Checker.has('zeroToNine')).toBe(true);
      expect(Checker.has('tenToNineteen')).toBe(true);

      expect(Checker.get('zeroToNine')).toEqual(/^[0-9]/);
      expect(Checker.get('tenToNineteen')).toEqual(/^1[0-9]/);

    });

  });

  describe(".get()", function() {

    it("throws an exceptions for unexisting validation handler", function() {

      var closure = function() {
        Checker.get('abc');
      };

      expect(closure).toThrow(new Error("Unexisting `abc` as validation handler."));

    });

  });

  describe(".handlers()", function() {

    beforeEach(function() {

      Checker.reset(true);
      Checker.set('zeroToNine', /^[0-9]/);

    });

    it("gets some handlers", function() {

      expect(Checker.handlers()).toEqual({ zeroToNine: /^[0-9]/ });

    });

    it("appends some handlers", function() {

      var expected = { zeroToNine: /^[0-9]/, tenToNineteen: /^1[0-9]/ };
      expect(Checker.handlers({ tenToNineteen: /^1[0-9]/ })).toEqual(expected);
      expect(Checker.handlers()).toEqual(expected);

    });

    it("sets some handlers", function() {

      var expected = { tenToNineteen: /^1[0-9]/ };
      expect(Checker.handlers({ tenToNineteen: /^1[0-9]/ }, false)).toEqual(expected);
      expect(Checker.handlers()).toEqual(expected);

    });

  });

  describe(".is()", function() {

    it("checks accepted values", function(done) {

      co(function*() {
        expect(yield Checker.is('accepted', true)).toBe(true);
        expect(yield Checker.is('accepted', false)).toBe(true);
        expect(yield Checker.is('accepted', 'true')).toBe(true);
        expect(yield Checker.is('accepted', 'false')).toBe(true);
        expect(yield Checker.is('accepted', 0)).toBe(true);
        expect(yield Checker.is('accepted', 1)).toBe(true);
        expect(yield Checker.is('accepted', '0')).toBe(true);
        expect(yield Checker.is('accepted', '1')).toBe(true);
        expect(yield Checker.is('accepted', 'on')).toBe(true);
        expect(yield Checker.is('accepted', 'off')).toBe(true);
        expect(yield Checker.is('accepted', 'yes')).toBe(true);
        expect(yield Checker.is('accepted', 'no')).toBe(true);
        expect(yield Checker.is('accepted', '')).toBe(true);

        expect(yield Checker.is('accepted', '11')).toBe(false);
        expect(yield Checker.is('accepted', '-1')).toBe(false);
        expect(yield Checker.is('accepted', 11)).toBe(false);
        expect(yield Checker.is('accepted', -1)).toBe(false);
        expect(yield Checker.is('accepted', 'test')).toBe(false);
        expect(yield Checker.is('accepted', null)).toBe(false);
        done();
      });

    });

    it("checks alpha numeric values", function(done) {

      co(function*() {
        expect(yield Checker.is('alphaNumeric', 'frferrf')).toBe(true);
        expect(yield Checker.is('alphaNumeric', '12234')).toBe(true);
        expect(yield Checker.is('alphaNumeric', '1w2e2r3t4y')).toBe(true);
        expect(yield Checker.is('alphaNumeric', '0')).toBe(true);
        expect(yield Checker.is('alphaNumeric', 'abçďĕʑʘπй')).toBe(true);
        expect(yield Checker.is('alphaNumeric', 'ˇˆๆゞ')).toBe(true);
        expect(yield Checker.is('alphaNumeric', 'אกあアꀀ豈')).toBe(true);
        expect(yield Checker.is('alphaNumeric', 'ǅᾈᾨ')).toBe(true);
        expect(yield Checker.is('alphaNumeric', 'ÆΔΩЖÇ')).toBe(true);
        expect(yield Checker.is('alphaNumeric', '日本語でも')).toBe(true);
        expect(yield Checker.is('alphaNumeric', 'をありがとうございました')).toBe(true);

        expect(yield Checker.is('alphaNumeric', '12 234')).toBe(false);
        expect(yield Checker.is('alphaNumeric', 'dfd 234')).toBe(false);
        expect(yield Checker.is('alphaNumeric', 'こんにちは！')).toBe(false);
        expect(yield Checker.is('alphaNumeric', "\n")).toBe(false);
        expect(yield Checker.is('alphaNumeric', "\t")).toBe(false);
        expect(yield Checker.is('alphaNumeric', "\r")).toBe(false);
        expect(yield Checker.is('alphaNumeric', ' ')).toBe(false);
        expect(yield Checker.is('alphaNumeric', '')).toBe(false);
        done();
      });

    });

    it("checks empty values", function(done) {

      co(function*() {
        expect(yield Checker.is('empty', '')).toBe(true);
        expect(yield Checker.is('empty', '  ')).toBe(true);
        expect(yield Checker.is('empty', "\n\t")).toBe(true);

        expect(yield Checker.is('empty', '12234')).toBe(false);
        expect(yield Checker.is('empty', 'dfdQSD')).toBe(false);
        expect(yield Checker.is('empty', 'こんにちは！')).toBe(false);
        done();
      });

    });

    it("checks accepted values", function(done) {

      co(function*() {
        expect(yield Checker.is('boolean', true)).toBe(true);
        expect(yield Checker.is('boolean', false)).toBe(true);
        expect(yield Checker.is('boolean', 0)).toBe(true);
        expect(yield Checker.is('boolean', 1)).toBe(true);
        expect(yield Checker.is('boolean', '0')).toBe(true);
        expect(yield Checker.is('boolean', '1')).toBe(true);

        expect(yield Checker.is('boolean', 'true')).toBe(false);
        expect(yield Checker.is('boolean', 'false')).toBe(false);
        expect(yield Checker.is('boolean', 'on')).toBe(false);
        expect(yield Checker.is('boolean', 'off')).toBe(false);
        expect(yield Checker.is('boolean', 'yes')).toBe(false);
        expect(yield Checker.is('boolean', 'no')).toBe(false);
        expect(yield Checker.is('boolean', '')).toBe(false);
        expect(yield Checker.is('boolean', '11')).toBe(false);
        expect(yield Checker.is('boolean', '-1')).toBe(false);
        expect(yield Checker.is('boolean', 11)).toBe(false);
        expect(yield Checker.is('boolean', -1)).toBe(false);
        expect(yield Checker.is('boolean', 'test')).toBe(false);
        expect(yield Checker.is('boolean', null)).toBe(false);
        done();
      });

    });

    it("checks credit card values", function(done) {

      co(function*() {
        /* American Express */
        expect(yield Checker.is('creditCard', '370482756063980', { check: 'amex' })).toBe(true);
        expect(yield Checker.is('creditCard', '3491-0643-3773-483', { check: 'amex' })).toBe(true);
        expect(yield Checker.is('creditCard', '344671486204764', { check: 'amex' })).toBe(true);
        expect(yield Checker.is('creditCard', '341779292230411', { check: 'amex' })).toBe(true);
        expect(yield Checker.is('creditCard', '341646919853372', { check: 'amex' })).toBe(true);
        expect(yield Checker.is('creditCard', '348498616319346', { check: 'amex', deep: true })).toBe(true);
        expect(yield Checker.is('creditCard', '5610376649499352', { check: 'amex' })).toBe(false);

        /* BankCard */
        expect(yield Checker.is('creditCard', '5610 7458 6741 3420', { check: 'bankcard' })).toBe(true);
        expect(yield Checker.is('creditCard', '5610376649499352', { check: 'bankcard' })).toBe(true);
        expect(yield Checker.is('creditCard', '5610091936000694', { check: 'bankcard' })).toBe(true);
        expect(yield Checker.is('creditCard', '5610139705753702', { check: 'bankcard' })).toBe(true);
        expect(yield Checker.is('creditCard', '5602226032150551', { check: 'bankcard' })).toBe(true);
        expect(yield Checker.is('creditCard', '5602223993735777', { check: 'bankcard' })).toBe(true);
        expect(yield Checker.is('creditCard', '30155483651028', { check: 'bankcard' })).toBe(false);

        /* Diners Club 14 */
        expect(yield Checker.is('creditCard', '30155483651028', { check: 'diners' })).toBe(true);
        expect(yield Checker.is('creditCard', '36371312803821', { check: 'diners' })).toBe(true);
        expect(yield Checker.is('creditCard', '38801277489875', { check: 'diners' })).toBe(true);
        expect(yield Checker.is('creditCard', '30348560464296', { check: 'diners' })).toBe(true);
        expect(yield Checker.is('creditCard', '38053196067461', { check: 'diners' })).toBe(true);
        expect(yield Checker.is('creditCard', '36520379984870', { check: 'diners' })).toBe(true);

        /* 2004 MasterCard/Diners Club Alliance International 14 */
        expect(yield Checker.is('creditCard', '36747701998969', { check: 'diners' })).toBe(true);
        expect(yield Checker.is('creditCard', '36427861123159', { check: 'diners' })).toBe(true);
        expect(yield Checker.is('creditCard', '36150537602386', { check: 'diners' })).toBe(true);
        expect(yield Checker.is('creditCard', '36582388820610', { check: 'diners' })).toBe(true);
        expect(yield Checker.is('creditCard', '36729045250216', { check: 'diners' })).toBe(true);

        /* 2004 MasterCard/Diners Club Alliance US & Canada 16 */
        expect(yield Checker.is('creditCard', '5597511346169950', { check: 'diners' })).toBe(true);
        expect(yield Checker.is('creditCard', '5526443162217562', { check: 'diners' })).toBe(true);
        expect(yield Checker.is('creditCard', '5577265786122391', { check: 'diners' })).toBe(true);
        expect(yield Checker.is('creditCard', '5534061404676989', { check: 'diners' })).toBe(true);
        expect(yield Checker.is('creditCard', '5545313588374502', { check: 'diners' })).toBe(true);
        expect(yield Checker.is('creditCard', '6011802876467237', { check: 'diners' })).toBe(false);

        /* Discover */
        expect(yield Checker.is('creditCard', '6011802876467237', { check: 'disc' })).toBe(true);
        expect(yield Checker.is('creditCard', '6506432777720955', { check: 'disc' })).toBe(true);
        expect(yield Checker.is('creditCard', '6011126265283942', { check: 'disc' })).toBe(true);
        expect(yield Checker.is('creditCard', '6500976374623323', { check: 'disc' })).toBe(true);
        expect(yield Checker.is('creditCard', '201496944158937', { check: 'disc' })).toBe(false);

        /* enRoute */
        expect(yield Checker.is('creditCard', '201496944158937', { check: 'enroute' })).toBe(true);
        expect(yield Checker.is('creditCard', '214945833739665', { check: 'enroute' })).toBe(true);
        expect(yield Checker.is('creditCard', '214982692491187', { check: 'enroute' })).toBe(true);
        expect(yield Checker.is('creditCard', '214981579370225', { check: 'enroute' })).toBe(true);
        expect(yield Checker.is('creditCard', '201447595859877', { check: 'enroute' })).toBe(true);
        expect(yield Checker.is('creditCard', '210034762247893', { check: 'enroute' })).toBe(false);

        /* JCB 15 digit */
        expect(yield Checker.is('creditCard', '210034762247893', { check: 'jcb' })).toBe(true);
        expect(yield Checker.is('creditCard', '180078671678892', { check: 'jcb' })).toBe(true);
        expect(yield Checker.is('creditCard', '210057919192738', { check: 'jcb' })).toBe(true);
        expect(yield Checker.is('creditCard', '180031358949367', { check: 'jcb' })).toBe(true);
        expect(yield Checker.is('creditCard', '180033802147846', { check: 'jcb' })).toBe(true);

        /* JCB 16 digit */
        expect(yield Checker.is('creditCard', '3096806857839939', { check: 'jcb' })).toBe(true);
        expect(yield Checker.is('creditCard', '3158699503187091', { check: 'jcb' })).toBe(true);
        expect(yield Checker.is('creditCard', '3112549607186579', { check: 'jcb' })).toBe(true);
        expect(yield Checker.is('creditCard', '3528274546125962', { check: 'jcb' })).toBe(true);
        expect(yield Checker.is('creditCard', '3528890967705733', { check: 'jcb' })).toBe(true);
        expect(yield Checker.is('creditCard', '3337198811307545', { check: 'jcb' })).toBe(true);
        expect(yield Checker.is('creditCard', '5020147409985219', { check: 'jcb' })).toBe(false);

        /* Maestro (debit card) */
        expect(yield Checker.is('creditCard', '5020147409985219', { check: 'maestro' })).toBe(true);
        expect(yield Checker.is('creditCard', '5020931809905616', { check: 'maestro' })).toBe(true);
        expect(yield Checker.is('creditCard', '6339931536544062', { check: 'maestro' })).toBe(true);
        expect(yield Checker.is('creditCard', '6465028615704406', { check: 'maestro' })).toBe(true);
        expect(yield Checker.is('creditCard', '5580424361774366', { check: 'maestro' })).toBe(false);

        /* MasterCard */
        expect(yield Checker.is('creditCard', '5580424361774366', { check: 'mc' })).toBe(true);
        expect(yield Checker.is('creditCard', '5589563059318282', { check: 'mc' })).toBe(true);
        expect(yield Checker.is('creditCard', '5387558333690047', { check: 'mc' })).toBe(true);
        expect(yield Checker.is('creditCard', '5163919215247175', { check: 'mc' })).toBe(true);
        expect(yield Checker.is('creditCard', '5467639122779531', { check: 'mc' })).toBe(true);
        expect(yield Checker.is('creditCard', '5297350261550024', { check: 'mc' })).toBe(true);
        expect(yield Checker.is('creditCard', '5162739131368058', { check: 'mc' })).toBe(true);
        expect(yield Checker.is('creditCard', '6767432107064987', { check: 'mc' })).toBe(false);

        /* Solo 16 */
        expect(yield Checker.is('creditCard', '6767432107064987', { check: 'solo' })).toBe(true);
        expect(yield Checker.is('creditCard', '6334667758225411', { check: 'solo' })).toBe(true);
        expect(yield Checker.is('creditCard', '6767037421954068', { check: 'solo' })).toBe(true);
        expect(yield Checker.is('creditCard', '6767823306394854', { check: 'solo' })).toBe(true);
        expect(yield Checker.is('creditCard', '6767493947881311', { check: 'solo' })).toBe(true);
        expect(yield Checker.is('creditCard', '6767194235798817', { check: 'solo' })).toBe(true);

        /* Solo 18 */
        expect(yield Checker.is('creditCard', '676714834398858593', { check: 'solo' })).toBe(true);
        expect(yield Checker.is('creditCard', '676751666435130857', { check: 'solo' })).toBe(true);
        expect(yield Checker.is('creditCard', '676781908573924236', { check: 'solo' })).toBe(true);
        expect(yield Checker.is('creditCard', '633487484858610484', { check: 'solo' })).toBe(true);
        expect(yield Checker.is('creditCard', '633453764680740694', { check: 'solo' })).toBe(true);
        expect(yield Checker.is('creditCard', '676768613295414451', { check: 'solo' })).toBe(true);

        /* Solo 19 */
        expect(yield Checker.is('creditCard', '6767838565218340113', { check: 'solo' })).toBe(true);
        expect(yield Checker.is('creditCard', '6767760119829705181', { check: 'solo' })).toBe(true);
        expect(yield Checker.is('creditCard', '6767265917091593668', { check: 'solo' })).toBe(true);
        expect(yield Checker.is('creditCard', '6334647959628261714', { check: 'solo' })).toBe(true);
        expect(yield Checker.is('creditCard', '6334527312384101382', { check: 'solo' })).toBe(true);
        expect(yield Checker.is('creditCard', '5641829171515733', { check: 'solo' })).toBe(false);

        /* Switch 16 */
        expect(yield Checker.is('creditCard', '5641829171515733', { check: 'switch' })).toBe(true);
        expect(yield Checker.is('creditCard', '5641824852820809', { check: 'switch' })).toBe(true);
        expect(yield Checker.is('creditCard', '6759129648956909', { check: 'switch' })).toBe(true);
        expect(yield Checker.is('creditCard', '4936119165483420', { check: 'switch' })).toBe(true);
        expect(yield Checker.is('creditCard', '4936190990500993', { check: 'switch' })).toBe(true);
        expect(yield Checker.is('creditCard', '6333372765092554', { check: 'switch' })).toBe(true);
        expect(yield Checker.is('creditCard', '5641821330950570', { check: 'switch' })).toBe(true);
        expect(yield Checker.is('creditCard', '6759841558826118', { check: 'switch' })).toBe(true);
        expect(yield Checker.is('creditCard', '4936164540922452', { check: 'switch' })).toBe(true);

        /* Switch 18 */
        expect(yield Checker.is('creditCard', '493622764224625174', { check: 'switch' })).toBe(true);
        expect(yield Checker.is('creditCard', '564182823396913535', { check: 'switch' })).toBe(true);
        expect(yield Checker.is('creditCard', '675917308304801234', { check: 'switch' })).toBe(true);
        expect(yield Checker.is('creditCard', '675919890024220298', { check: 'switch' })).toBe(true);
        expect(yield Checker.is('creditCard', '633308376862556751', { check: 'switch' })).toBe(true);
        expect(yield Checker.is('creditCard', '633334008833727504', { check: 'switch' })).toBe(true);
        expect(yield Checker.is('creditCard', '493631941273687169', { check: 'switch' })).toBe(true);
        expect(yield Checker.is('creditCard', '564182971729706785', { check: 'switch' })).toBe(true);
        expect(yield Checker.is('creditCard', '633303461188963496', { check: 'switch' })).toBe(true);

        /* Switch 19 */
        expect(yield Checker.is('creditCard', '6759603460617628716', { check: 'switch' })).toBe(true);
        expect(yield Checker.is('creditCard', '4936705825268647681', { check: 'switch' })).toBe(true);
        expect(yield Checker.is('creditCard', '5641829846600479183', { check: 'switch' })).toBe(true);
        expect(yield Checker.is('creditCard', '4936321036970553134', { check: 'switch' })).toBe(true);
        expect(yield Checker.is('creditCard', '4936111816358702773', { check: 'switch' })).toBe(true);
        expect(yield Checker.is('creditCard', '4936196077254804290', { check: 'switch' })).toBe(true);
        expect(yield Checker.is('creditCard', '6759558831206830183', { check: 'switch' })).toBe(true);
        expect(yield Checker.is('creditCard', '5641827998830403137', { check: 'switch' })).toBe(true);
        expect(yield Checker.is('creditCard', '4024007174754', { check: 'switch' })).toBe(false);

        /* Visa 13 digit */
        expect(yield Checker.is('creditCard', '4024007174754', { check: 'visa' })).toBe(true);
        expect(yield Checker.is('creditCard', '4104816460717', { check: 'visa' })).toBe(true);
        expect(yield Checker.is('creditCard', '4716229700437', { check: 'visa' })).toBe(true);
        expect(yield Checker.is('creditCard', '4539305400213', { check: 'visa' })).toBe(true);
        expect(yield Checker.is('creditCard', '4485906062491', { check: 'visa' })).toBe(true);
        expect(yield Checker.is('creditCard', '4539365115149', { check: 'visa' })).toBe(true);
        expect(yield Checker.is('creditCard', '4485146516702', { check: 'visa' })).toBe(true);

        /* Visa 16 digit */
        expect(yield Checker.is('creditCard', '4916375389940009', { check: 'visa' })).toBe(true);
        expect(yield Checker.is('creditCard', '4929167481032610', { check: 'visa' })).toBe(true);
        expect(yield Checker.is('creditCard', '4556242273553949', { check: 'visa' })).toBe(true);
        expect(yield Checker.is('creditCard', '4481007485188614', { check: 'visa' })).toBe(true);
        expect(yield Checker.is('creditCard', '4532800925229140', { check: 'visa' })).toBe(true);
        expect(yield Checker.is('creditCard', '4916845885268360', { check: 'visa' })).toBe(true);
        expect(yield Checker.is('creditCard', '4394514669078434', { check: 'visa' })).toBe(true);
        expect(yield Checker.is('creditCard', '4485611378115042', { check: 'visa' })).toBe(true);
        expect(yield Checker.is('creditCard', '869940697287073', { check: 'visa' })).toBe(false);

        /* Visa Electron */
        expect(yield Checker.is('creditCard', '4175003346287100', { check: 'electron' })).toBe(true);
        expect(yield Checker.is('creditCard', '4175009797419290', { check: 'electron' })).toBe(true);
        expect(yield Checker.is('creditCard', '4175005028142917', { check: 'electron' })).toBe(true);
        expect(yield Checker.is('creditCard', '4913940802385364', { check: 'electron' })).toBe(true);
        expect(yield Checker.is('creditCard', '869940697287073', { check: 'electron' })).toBe(false);

        /* Voyager */
        expect(yield Checker.is('creditCard', '869940697287073', { check: 'voyager' })).toBe(true);
        expect(yield Checker.is('creditCard', '869934523596112', { check: 'voyager' })).toBe(true);
        expect(yield Checker.is('creditCard', '869958670174621', { check: 'voyager' })).toBe(true);
        expect(yield Checker.is('creditCard', '869921250068209', { check: 'voyager' })).toBe(true);
        expect(yield Checker.is('creditCard', '869972521242198', { check: 'voyager' })).toBe(true);
        expect(yield Checker.is('creditCard', '370482756063980', { check: 'voyager' })).toBe(false);

        expect(yield Checker.is('creditCard', '123', { check: 'any' })).toBe(false);
        done();
      });
    });

    it("checks date values", function(done) {

      co(function*() {
        expect(yield Checker.is('date', '2015-07-19')).toBe(true);
        expect(yield Checker.is('date', new Date())).toBe(true);

        expect(yield Checker.is('date', {})).toBe(false);
        done();
      });

    });

    it("checks date values before another date", function(done) {

      co(function*() {
        expect(yield Checker.is('dateBefore', '2015-07-19', { date: '2015-07-20' })).toBe(true);
        var date = new Date('2015-07-19');
        var date2 = new Date('2015-07-20');
        expect(yield Checker.is('dateBefore', date, { date: date2 })).toBe(true);

        expect(yield Checker.is('dateBefore', '2015-07-19', { date: '2015-07-18' })).toBe(false);
        var date3 = new Date('2015-07-18');
        expect(yield Checker.is('dateBefore', '2015-07-19', { date: date3 })).toBe(false);

        expect(yield Checker.is('dateBefore', '2015-07-19')).toBe(false);
        done();
      });

    });

    it("checks date values after another date", function(done) {

      co(function*() {
        expect(yield Checker.is('dateAfter', '2015-07-19', { date: '2015-07-18' })).toBe(true);
        var date = new Date('2015-07-19');
        var date2 = new Date('2015-07-18');
        expect(yield Checker.is('dateAfter', date, { date: date2 })).toBe(true);

        expect(yield Checker.is('dateAfter', '2015-07-19', { date: '2015-07-20' })).toBe(false);
        var date3 = new Date('2015-07-20');
        expect(yield Checker.is('dateAfter', '2015-07-19', { date: date3 })).toBe(false);

        expect(yield Checker.is('dateAfter', '2015-07-19')).toBe(false);
        done();
      });

    });

    it("checks decimal values", function(done) {

      co(function*() {
        expect(yield Checker.is('decimal', '0.0')).toBe(true);
        expect(yield Checker.is('decimal', '0.000')).toBe(true);
        expect(yield Checker.is('decimal', '1.1')).toBe(true);
        expect(yield Checker.is('decimal', '11.11')).toBe(true);
        expect(yield Checker.is('decimal', '+0')).toBe(true);
        expect(yield Checker.is('decimal', '-0')).toBe(true);
        expect(yield Checker.is('decimal', '+1234.54321')).toBe(true);
        expect(yield Checker.is('decimal', '-1234.54321')).toBe(true);
        expect(yield Checker.is('decimal', '1234.54321')).toBe(true);
        expect(yield Checker.is('decimal', '+0123.45e6')).toBe(true);
        expect(yield Checker.is('decimal', '-0123.45e6')).toBe(true);
        expect(yield Checker.is('decimal', '0123.45e6')).toBe(true);
        expect(yield Checker.is('decimal', '1234')).toBe(true);
        expect(yield Checker.is('decimal', '-1234')).toBe(true);
        expect(yield Checker.is('decimal', '+1234')).toBe(true);

        expect(yield Checker.is('decimal', 'string')).toBe(false);
        done();
      });

    });

    it("checks decimal with places values", function(done) {

      co(function*() {
        expect(yield Checker.is('decimal', '.27', { precision: '2' })).toBe(true);
        expect(yield Checker.is('decimal', .27, { precision: 2 })).toBe(true);
        expect(yield Checker.is('decimal', -.27, { precision: 2 })).toBe(true);
        expect(yield Checker.is('decimal', +.27, { precision: 2 })).toBe(true);
        expect(yield Checker.is('decimal', '.277', { precision: '3' })).toBe(true);
        expect(yield Checker.is('decimal', .277, { precision: 3 })).toBe(true);
        expect(yield Checker.is('decimal', -.277, { precision: 3 })).toBe(true);
        expect(yield Checker.is('decimal', +.277, { precision: 3 })).toBe(true);
        expect(yield Checker.is('decimal', '1234.5678', { precision: '4' })).toBe(true);
        expect(yield Checker.is('decimal', 1234.5678, { precision: 4 })).toBe(true);
        expect(yield Checker.is('decimal', -1234.5678, { precision: 4 })).toBe(true);
        expect(yield Checker.is('decimal', +1234.5678, { precision: 4 })).toBe(true);

        expect(yield Checker.is('decimal', '1234.5678', { precision: '3' })).toBe(false);
        expect(yield Checker.is('decimal', 1234.5678, { precision: 3 })).toBe(false);
        expect(yield Checker.is('decimal', -1234.5678, { precision: 3 })).toBe(false);
        expect(yield Checker.is('decimal', +1234.5678, { precision: 3 })).toBe(false);
        done();
      });

    });

    it("checks values are equals", function(done) {

      co(function*() {
        expect(yield Checker.is('equalTo', 'abcdef', {
          key: 'password_confirmation',
          data: { password_confirmation: 'abcdef' }
        })).toBe(true);

        expect(yield Checker.is('equalTo', 'abcdef', {
          key: 'password_confirmation',
          data: { password_confirmation: 'defghi' }
        })).toBe(false);
        expect(yield Checker.is('equalTo', 'abcdef', { key: 'password_confirmation' })).toBe(false);
        expect(yield Checker.is('equalTo', 'abcdef')).toBe(false);
        done();
      });

    });

    it("checks emails values", function(done) {

      co(function*() {
        expect(yield Checker.is('email', 'abc.efg@domain.com')).toBe(true);
        expect(yield Checker.is('email', 'efg@domain.com')).toBe(true);
        expect(yield Checker.is('email', 'abc-efg@domain.com')).toBe(true);
        expect(yield Checker.is('email', 'abc_efg@domain.com')).toBe(true);
        expect(yield Checker.is('email', 'raw@test.ra.ru')).toBe(true);
        expect(yield Checker.is('email', 'abc-efg@domain-hyphened.com')).toBe(true);
        expect(yield Checker.is('email', "p.o'malley@domain.com")).toBe(true);
        expect(yield Checker.is('email', 'abc+efg@domain.com')).toBe(true);
        expect(yield Checker.is('email', 'abc&efg@domain.com')).toBe(true);
        expect(yield Checker.is('email', 'abc.efg@12345.com')).toBe(true);
        expect(yield Checker.is('email', 'abc.efg@12345.co.jp')).toBe(true);
        expect(yield Checker.is('email', 'abc@g.cn')).toBe(true);
        expect(yield Checker.is('email', 'abc@x.com')).toBe(true);
        expect(yield Checker.is('email', 'henrik@sbcglobal.net')).toBe(true);
        expect(yield Checker.is('email', 'sani@sbcglobal.net')).toBe(true);

        /* All ICANN TLDs */
        expect(yield Checker.is('email', 'abc@example.aero')).toBe(true);
        expect(yield Checker.is('email', 'abc@example.asia')).toBe(true);
        expect(yield Checker.is('email', 'abc@example.biz')).toBe(true);
        expect(yield Checker.is('email', 'abc@example.cat')).toBe(true);
        expect(yield Checker.is('email', 'abc@example.com')).toBe(true);
        expect(yield Checker.is('email', 'abc@example.coop')).toBe(true);
        expect(yield Checker.is('email', 'abc@example.edu')).toBe(true);
        expect(yield Checker.is('email', 'abc@example.gov')).toBe(true);
        expect(yield Checker.is('email', 'abc@example.info')).toBe(true);
        expect(yield Checker.is('email', 'abc@example.int')).toBe(true);
        expect(yield Checker.is('email', 'abc@example.jobs')).toBe(true);
        expect(yield Checker.is('email', 'abc@example.mil')).toBe(true);
        expect(yield Checker.is('email', 'abc@example.mobi')).toBe(true);
        expect(yield Checker.is('email', 'abc@example.museum')).toBe(true);
        expect(yield Checker.is('email', 'abc@example.name')).toBe(true);
        expect(yield Checker.is('email', 'abc@example.net')).toBe(true);
        expect(yield Checker.is('email', 'abc@example.org')).toBe(true);
        expect(yield Checker.is('email', 'abc@example.pro')).toBe(true);
        expect(yield Checker.is('email', 'abc@example.tel')).toBe(true);
        expect(yield Checker.is('email', 'abc@example.travel')).toBe(true);
        expect(yield Checker.is('email', 'someone@st.t-com.hr')).toBe(true);

        /* Strange, but valid addresses*/
        expect(yield Checker.is('email', '_somename@example.com')).toBe(true);
        expect(yield Checker.is('email', 'abc@example.c')).toBe(true);
        expect(yield Checker.is('email', 'abc@example.com.a')).toBe(true);
        expect(yield Checker.is('email', 'abc@example.toolong')).toBe(true);

        /* Invalid addresses */
        expect(yield Checker.is('email', 'abc@example.com.')).toBe(false);
        expect(yield Checker.is('email', 'abc@example..com')).toBe(false);
        expect(yield Checker.is('email', 'abc;@example.com')).toBe(false);
        expect(yield Checker.is('email', 'abc@example.com;')).toBe(false);
        expect(yield Checker.is('email', 'abc@efg@example.com')).toBe(false);
        expect(yield Checker.is('email', 'abc@@example.com')).toBe(false);
        expect(yield Checker.is('email', 'abc efg@example.com')).toBe(false);
        expect(yield Checker.is('email', 'abc,efg@example.com')).toBe(false);
        expect(yield Checker.is('email', 'abc@sub,example.com')).toBe(false);
        expect(yield Checker.is('email', "abc@sub'example.com")).toBe(false);
        expect(yield Checker.is('email', 'abc@sub/example.com')).toBe(false);
        expect(yield Checker.is('email', 'abc@yahoo!.com')).toBe(false);
        expect(yield Checker.is('email', "Nyrée.surname@example.com")).toBe(false);
        expect(yield Checker.is('email', 'abc@example_underscored.com')).toBe(false);
        expect(yield Checker.is('email', 'raw@test.ra.ru....com')).toBe(false);

        var fill = function(c, len) {
          return Array(len + 1).join(c);
        }

        expect(yield Checker.is('email', '')).toBe(false);
        expect(yield Checker.is('email', fill('a', 65) + '@example.com')).toBe(false);
        expect(yield Checker.is('email', 'abc@' + fill('a', 64) + '.com')).toBe(false);
        expect(yield Checker.is('email', fill('a', 62) + '@' + fill('b', 62)  + '.' + fill('c', 62)  + '.' + fill('d', 62) + '.com')).toBe(false);

        done();
      });

    });

    it("checks in list values", function(done) {

      co(function*() {
        expect(yield Checker.is('inList', 'one', { list: ['one', 'two'] })).toBe(true);
        expect(yield Checker.is('inList', 'two', { list: ['one', 'two'] })).toBe(true);
        expect(yield Checker.is('inList', 0, { list: [0, 1] })).toBe(true);
        expect(yield Checker.is('inList', 1, { list: [0, 1] })).toBe(true);
        expect(yield Checker.is('inList', 0, { list: ['0', '1'] })).toBe(true);
        expect(yield Checker.is('inList', '1', { list: ['0', '1'] })).toBe(true);
        expect(yield Checker.is('inList', 1, { list: ['0', '1'] })).toBe(true);
        expect(yield Checker.is('inList', '1', { list: ['0', '1'] })).toBe(true);

        expect(yield Checker.is('inList', '', { list: ['0', '1'] })).toBe(false);
        expect(yield Checker.is('inList', null, { list: ['0', '1'] })).toBe(false);
        expect(yield Checker.is('inList', false, { list: ['0', '1'] })).toBe(false);
        expect(yield Checker.is('inList', true, { list: ['0', '1'] })).toBe(false);

        expect(yield Checker.is('inList', '', { list: [0, 1] })).toBe(false);
        expect(yield Checker.is('inList', null, { list: [0, 1] })).toBe(false);
        expect(yield Checker.is('inList', false, { list: [0, 1] })).toBe(false);
        expect(yield Checker.is('inList', true, { list: [0, 1] })).toBe(false);

        expect(yield Checker.is('inList', 2, { list: [0, 1] })).toBe(false);
        expect(yield Checker.is('inList', 2, { list: ['0', '1'] })).toBe(false);
        expect(yield Checker.is('inList', '2', { list: [0, 1] })).toBe(false);
        expect(yield Checker.is('inList', '2', { list: ['0', '1'] })).toBe(false);
        expect(yield Checker.is('inList', 'three', { list: ['one', 'two'] })).toBe(false);
        done();
      });
    });

    it("checks in range values", function(done) {

      co(function*() {
        var value, result;

        var lower = 1;
        var upper = 10;

        value = 0;
        result = yield Checker.is('inRange', value, { lower: lower, upper: upper });
        expect(result).toBe(false);

        value = 1;
        result = yield Checker.is('inRange', value, { lower: lower, upper: upper });
        expect(result).toBe(true);

        value = 5;
        result = yield Checker.is('inRange', value, { lower: lower, upper: upper });
        expect(result).toBe(true);

        value = 10;
        result = yield Checker.is('inRange', value, { lower: lower, upper: upper });
        expect(result).toBe(true);

        value = 11;
        result = yield Checker.is('inRange', value, { lower: lower, upper: upper });
        expect(result).toBe(false);

        value = 'abc';
        result = yield Checker.is('inRange', value, { lower: lower, upper: upper });
        expect(result).toBe(false);

        result = yield Checker.is('inRange', -1, { upper: 1 });
        expect(result).toBe(true);

        result = yield Checker.is('inRange', 1, { upper: 1 });
        expect(result).toBe(true);

        result = yield Checker.is('inRange', 2, { upper: 1 });
        expect(result).toBe(false);

        result = yield Checker.is('inRange', 2, { lower: 1 });
        expect(result).toBe(true);

        result = yield Checker.is('inRange', 1, { lower: 1 });
        expect(result).toBe(true);

        result = yield Checker.is('inRange', 0, { lower: 1 });
        expect(result).toBe(false);

        expect(yield Checker.is('inRange', 0)).toBe(true);
        done();
      });
    });

    it("checks integer values", function(done) {

      co(function*() {
        expect(yield Checker.is('integer', '27')).toBe(true);
        expect(yield Checker.is('integer', '-27')).toBe(true);
        expect(yield Checker.is('integer', '+27')).toBe(true);
        expect(yield Checker.is('integer', 27)).toBe(true);
        expect(yield Checker.is('integer', -27)).toBe(true);
        expect(yield Checker.is('integer', +27)).toBe(true);

        expect(yield Checker.is('integer', .277)).toBe(false);
        expect(yield Checker.is('integer', '1234.5678')).toBe(false);
        expect(yield Checker.is('integer', 'abcd')).toBe(false);
        done();
      });

    });

    it("checks ip values", function(done) {

      co(function*() {
        expect(yield Checker.is('ip', '127.0.0.1')).toBe(true);
        expect(yield Checker.is('ip', '2607:f0d0:1002:51::4')).toBe(true);
        expect(yield Checker.is('ip', '2607:f0d0:1002:0051:0000:0000:0000:0004')).toBe(true);
        done();
      });

    });

    it("checks values matching length", function(done) {

      co(function*() {
        expect(yield Checker.is('length', 'abcde', { length: 5 })).toBe(true);

        expect(yield Checker.is('length', 'abcde', { length: 4 })).toBe(false);
        expect(yield Checker.is('length', 'abcde')).toBe(false);
        done();
      });

    });

    it("checks values matching length between", function(done) {

      co(function*() {
        expect(yield Checker.is('lengthBetween', 'abcde', { min: 1, max: 7 })).toBe(true);
        expect(yield Checker.is('lengthBetween', '', { min: 0, max: 7 })).toBe(true);

        expect(yield Checker.is('lengthBetween', 'abcd', { min: 1, max: 3 })).toBe(false);
        done();
      });

    });

    it("checks values matching max length", function(done) {

      co(function*() {
        expect(yield Checker.is('lengthMax', 'abcde', { length: 7 })).toBe(true);

        expect(yield Checker.is('lengthMax', 'abcd', { length: 3 })).toBe(false);
        expect(yield Checker.is('lengthMax', '')).toBe(false);
        done();
      });

    });

    it("checks values matching min length", function(done) {

      co(function*() {
        expect(yield Checker.is('lengthMin', 'abcde', { length: 1 })).toBe(true);

        expect(yield Checker.is('lengthMin', '', { length: 1 })).toBe(false);
        expect(yield Checker.is('lengthMin', 'abcd')).toBe(false);
        done();
      });

    });

    it("checks luhn values", function(done) {

      co(function*() {
        expect(yield Checker.is('luhn', '869972521242198')).toBe(true);

        expect(yield Checker.is('luhn', false)).toBe(false);
        expect(yield Checker.is('luhn', null)).toBe(false);
        expect(yield Checker.is('luhn', '')).toBe(false);
        expect(yield Checker.is('luhn', true)).toBe(false);
        done();
      });

    });

    it("checks values matching max", function(done) {

      co(function*() {
        expect(yield Checker.is('max', 5, { max: 7 })).toBe(true);

        expect(yield Checker.is('max', 5, { max: 3 })).toBe(false);
        expect(yield Checker.is('max', 5)).toBe(false);
        done();
      });

    });

    it("checks values matching min", function(done) {

      co(function*() {
        expect(yield Checker.is('min', 5, { min: 1 })).toBe(true);

        expect(yield Checker.is('min', 3, { min: 5 })).toBe(false);
        expect(yield Checker.is('min', 5)).toBe(false);
        done();
      });

    });

    it("checks money values", function(done) {

      co(function*() {
        expect(yield Checker.is('money', '3.25')).toBe(true);
        expect(yield Checker.is('money', '3.25€')).toBe(true);
        expect(yield Checker.is('money', '3.25')).toBe(true);
        expect(yield Checker.is('money', '3.25€', { check: 'right' })).toBe(true);
        expect(yield Checker.is('money', '$3.25', { check: 'left' })).toBe(true);

        expect(yield Checker.is('money', '325a')).toBe(false);
        expect(yield Checker.is('money', '3.25€', { check: 'left' })).toBe(false);
        expect(yield Checker.is('money', '$3.25', { check: 'right' })).toBe(false);
        done();
      });

    });

    it("checks not empty values", function(done) {

      co(function*() {
        expect(yield Checker.is('not:empty', 'abcdefg')).toBe(true);
        expect(yield Checker.is('not:empty', 'fasdf ')).toBe(true);
        expect(yield Checker.is('not:empty', 'foooóblabla')).toBe(true);
        expect(yield Checker.is('not:empty', 'abçďĕʑʘπй')).toBe(true);
        expect(yield Checker.is('not:empty', 'José')).toBe(true);
        expect(yield Checker.is('not:empty', 'é')).toBe(true);
        expect(yield Checker.is('not:empty', 'π')).toBe(true);

        expect(yield Checker.is('not:empty', "\t ")).toBe(false);
        expect(yield Checker.is('not:empty', "")).toBe(false);
        done();
      });
    });

    it("checks numeric values", function(done) {

      co(function*() {
        expect(yield Checker.is('numeric', 0)).toBe(true);
        expect(yield Checker.is('numeric', '0')).toBe(true);
        expect(yield Checker.is('numeric', '-0')).toBe(true);
        expect(yield Checker.is('numeric', '-')).toBe(false);
        done();
      });

    });

    it("checks phone values", function(done) {

      co(function*() {
        expect(yield Checker.is('numeric', '1234567890')).toBe(true);
        expect(yield Checker.is('numeric', '+1234567890')).toBe(true);
        done();
      });

    });

    it("checks regexp values", function(done) {

      co(function*() {
        expect(yield Checker.is('regex', /^123/)).toBe(true);
        expect(yield Checker.is('regex', /^abc/)).toBe(true);
        expect(yield Checker.is('regex', /^abc123/)).toBe(true);

        expect(yield Checker.is('regex', 'abcd')).toBe(false);
        done();
      });

    });

    it("checks time values", function(done) {

      co(function*() {
        expect(yield Checker.is('time', '07:15:00')).toBe(true);
        expect(yield Checker.is('time', '19:15:00')).toBe(true);
        expect(yield Checker.is('time', '7:15:00AM')).toBe(true);
        expect(yield Checker.is('time', '07:15:00pm')).toBe(true);

        expect(yield Checker.is('time', '07:615:00')).toBe(false);
        done();
      });
    });

    it("checks url values", function(done) {

      co(function*() {
        expect(yield Checker.is('url', 'http://example.com')).toBe(true);
        expect(yield Checker.is('url', 'http://www.domain.com/super?param=value')).toBe(true);

        expect(yield Checker.is('url', 'http:/example.com')).toBe(false);
        done();
      });

    });

    it("checks uuid values", function(done) {

      co(function*() {
        expect(yield Checker.is('uuid', '1c0a5830-6025-11de-8a39-0800200c9a66')).toBe(true);
        expect(yield Checker.is('uuid', '1c0a5831-6025-11de-8a39-0800200c9a66')).toBe(true);
        expect(yield Checker.is('uuid', '1c0a5832-6025-11de-8a39-0800200c9a66')).toBe(true);

        expect(yield Checker.is('uuid', 'zc0a5832-6025-11de-8a39-0800200c9a66')).toBe(false);
        expect(yield Checker.is('uuid', '1-1c0a5832-6025-11de-8a39-0800200c9a66')).toBe(false);
        done();
      });

    });

    it("checks the not option", function(done) {

      co(function*() {
        expect(yield Checker.is('inList', 'one', { list: ['one', 'two'] })).toBe(true);
        expect(yield Checker.is('not:inList', 'one', { list: ['one', 'two'] })).toBe(false);
        done();
      });

    });

  });

  describe(".message()", function() {

    it("gets a error message", function() {

      expect(Checker.message('required')).toBe('is required');

    });

    it("sets an error message", function() {

      expect(Checker.message('required', 'must be defined')).toBe('must be defined');
      expect(Checker.message('required')).toBe('must be defined');

    });
  });

  describe(".messages()", function() {

    beforeEach(function() {
      Checker.messages({ a: 'b' }, false);
    });

    it("gets error messages", function() {

      expect(Checker.messages()).toEqual({ a: 'b', _default_: 'is invalid' });

    });

    it("appends error messages", function() {

      var expected = { a: 'b', _default_: 'is invalid', c: 'd' };
      expect(Checker.messages({ c: 'd' })).toEqual(expected);
      expect(Checker.messages()).toEqual(expected);

    });

    it("sets error messages", function() {

      var expected = { c: 'd', _default_: 'is invalid' };
      expect(Checker.messages({ c: 'd' }, false)).toEqual(expected);
      expect(Checker.messages()).toEqual(expected);

    });
  });

});
