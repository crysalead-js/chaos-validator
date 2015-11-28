import co from 'co';
import { extend, merge } from 'extend-merge';
import dateFormat from 'date-format';

/**
 * The `Checker` class provides static access to commonly used data validation logic.
 *
 * ## Rules (at class level)
 *
 * The `Checker` class includes a series of commonly-used rules by default, any of which may be
 * used in calls to `is()` or called directly as a method statically or throw an instance.
 * Additionally, rules can have a variety of different _formats_ in which they may be specified.
 *
 * Example:
 * {{{
 * import { Checker } from 'chaos-validator';
 *
 * Checker.is('email', 'foo@example.com'); // Promise
 * }}}
 *
 * The following is the list of the built-in rules, but keep in mind that any rule may be
 * overridden by adding a new rule of the same name using the `.set()` method.
 *
 * - `accepted`: Checks that the value is or looks like a boolean value. The following types of
 *   values are interpreted as boolean and will pass the check.
 *   - boolean (`true`, `false`, `'true'`, `'false'`)
 *   - boolean number (`1`, `0`, `'1'`, `'0'`)
 *   - boolean text string (`'on'`, `'off'`, `'yes'`, `'no'`)
 *
 * - `alphaNumeric`: Checks that a string contains only integer or letters.
 *
 * - `boolean`: Checks that the value is or looks like a boolean value. The following types of
 *   values are interpreted as boolean and will pass the check (`true`, `false`, `0`, `1`, `'0'`, `'1'`)
 *
 * - `creditCard`: Checks that a value is a valid credit card number. This rule is divided into a
 *   series of formats: `'amex'`, `'bankcard'`, `'diners'`, `'disc'`, `'electron'`, `'enroute'`,
 *   `'jcb'`, `'maestro'`, `'mc'`, `'solo'`, `'switch'`, `'visa'`, `'voyager'`, `'fast'`. If no
 *   format value is specified, the value defaults to `'any'`, which will validate the value if
 *   _any_ of the available formats match. You can also use the `'fast'` format, which does a
 *   high-speed, low-fidelity check to ensure that the value looks like a real credit card number.
 *   This rule includes one option, `'deep'`, which (if set to `true`) validates the value using the
 *   [Luhn algorithm](http://en.wikipedia.org/wiki/Luhn_algorithm) if the format validation is
 *   successful. See the `luhn` validator below for more details.
 *
 * - `date`: Checks that a value is a valid date.
 *
 * - `dateBefore`: Checks that a date is greater than given date. The available option is `'date'`,
 *   which designate the minimum required date.
 *
 * - `dateAfter`: Checks that a date is lower than given date. The available options is `'date'`,
 *   which designate the maximum required date.
 *
 * - `decimal`: Checks that a value is a valid decimal. Takes one option, `'precision'`, which is
 *   an optional integer value defining the level of precision the decimal number must match.
 *
 * - `email`: Checks that a value is (probably) a valid email address. The subject of validating
 *   an actual email address is complicated and problematic. A regular expression that correctly
 *   validates addresses against [RFC 5322](http://tools.ietf.org/html/rfc5322) would be several
 *   pages long, with the drawback of being unable to keep up as new top-level domains are added.
 *   Instead, this validator uses PHP's internal input filtering API to check the format, and
 *   provides an option, `'deep'` ( _boolean_) which, if set to `true`, will validate that the email
 *   address' domain contains a valid MX record. Keep in mind, this is just one of the many ways to
 *   validate an email address in the overall context of an application. For other ideas or
 *   examples, [ask Sean](http://seancoates.com/).
 *
 * - `empty`: Checks that a field is left blank **OR** only whitespace characters are present in its
 *   value. Whitespace characters include spaces, tabs, carriage returns and newlines.
 *
 * - `equalTo`: This rule will ensure that the value is equal to another field. The available
 *   options are `'key'` and `'data'`, which designate the matching key and the data array the
 *   value must match on.
 *
 * - `inList`: Checks that a value is in a pre-defined list of values. This validator accepts one
 *   option, `'list'`, which is an array containing acceptable values.
 *
 * - `inRange`: Checks that a numeric value is within a specified range. This value has two options,
 *    `'upper'` and `'lower'`, which specify the boundary of the value.
 *
 * - `integer`: Checks that a value is an integer.
 *
 * - `ip`: Validates a string as a valid IPv4 or IPv6 address.
 *
 * - `length`: Checks that a string length is less than given length. The available option is `'length'`,
 *   which designate the required length of the string.
 *
 * - `lengthBetween`: Checks that a string length is within a specified range. Spaces are included
 *   in the character count. The available options are `'min'` and `'max'`, which designate the
 *   minimum and maximum length of the string.
 *
 * - `lengthMax`: Checks that a string length is less than given length. The available option is `'length'`,
 *   which designate the maximum required length of the string.
 *
 * - `lengthMin`: Checks that a string length is greater than given length. The available option is `'length'`,
 *   which designate the minimum required length of the string.
 *
 * - `luhn`: Checks that a value is a valid credit card number according to the
 *   [Luhn algorithm](http://en.wikipedia.org/wiki/Luhn_algorithm). (See also: the `creditCard`
 *   validator).
 *
 * - `max`: Checks that a value is less than a given maximum. The available options is `'max'`,
 *   which designate the maximum required.
 *
 * - `min`: Checks that a value is greater than a given minimum. The available options is `'min'`,
 *   which designate the minimum required.
 *
 * - `money`: Checks that a value is a valid monetary amount. This rule has two formats, `'right'`
 *   and `'left'`, which indicates which side the monetary symbol (i.e. ) appears on.
 *
 * - `numeric`: Checks that a value is numeric.
 *
 * - `phone`: Check that a value is a valid phone number, non-locale-specific phone number.
 *
 * - `regex`: Checks that a value appears to be a valid regular expression, possibly
 *   containing PCRE-compatible options flags.
 *
 * - `time`: Checks that a value is a valid time. Validates time as 24hr (HH:MM) or am/pm
 *   ([ H]H:MM[a|p]m). Does not allow / validate seconds.
 *
 * - `url`: Checks that a value is a valid URL according to
 *   [RFC 2395](http://www.faqs.org/rfcs/rfc2396.html). Uses PHP's filter API, and accepts any
 *   options accepted for
 *   [the validation URL filter](http://www.php.net/manual/en/filter.filters.validate.php).
 *
 * - `uuid`: Checks that a value is a valid UUID.
 */
class Checker {

  /**
   * Sets or replaces one or several built-in validation rules.
   *
   * For example:
   * {{{
   * co(function*() {
   *   Checker.set('zeroToNine', /^[0-9]/);
   *   var isValid = yield Checker.is('zeroToNine', '5'); // true
   *   isValid = yield Checker.is('zeroToNine', '20'); // false
   * });
   * }}}
   *
   * Alternatively, the first parameter may be an array of rules expressed as key/value pairs,
   * as in the following:
   * {{{
   * Checker.set({
   *  zeroToNine: /^[0-9]/,
   *  tenToNineteen: /^1[0-9]/,
   * });
   * }}}
   *
   * In addition to regular expressions, validation rules can also be defined as full anonymous
   * functions:
   * {{{
   * import Account from './model/account';
   *
   * co(function*() {
   *   Checker.set('accountActive', function(value, options) {
   *     if (typeof value === 'object') {
   *       return value.is_active ? Promise.accept(value) : Promise.reject();
   *     }
   *     var promise = new Promise();
   *     Account.id(value).then(function(entity) {
   *       if (!entity || !entity.is_active) {
   *         return Promise.reject();
   *       }
   *       Promise.accept(entity)
   *     });
   *     return promise;
   *   });
   *
   *   var testAccount = Account.create({ is_active: false });
   *   yield Checker.is('accountActive', testAccount); // false
   *   yield Checker.is('accountActive', 123); // true
   * });
   * }}}
   *
   * These functions can take up to 3 parameters:
   *  - `value`   _mixed_ : This is the actual value to be validated (as in the above example).
   *  - `options` _Object_: This parameter allows a validation rule to implement custom options.
   *                        - `'check'` _string_: Often, validation rules come in multiple "formats", for example:
   *                           credit cards, which vary by type of card. Defining multiple formats allows you to
   *                           retain flexibility in how you validate data. The value of `'check'` can be a specific
   *                           validation handler name or `'any'` which should pass if any validation handler matches.
   *
   * @param mixed name The name of the validation rule (string), or an array of key/value pairs
   *                   of names and rules.
   * @param mixed rule If name is a string, this should be a string regular expression, or a
   *                   closure that returns a boolean indicating success. Should be left blank if
   *                   `name` is an Object.
   */
  static set(name, rule) {
    var handler;
    if (typeof name === 'string') {
      handler = {};
      handler[name] = rule;
    } else {
      handler = extend({}, name);
    }
    this._handlers = extend({}, this._handlers, handler);
  }

  /**
   * Checks if a validation handler exists.
   *
   * @param string name A validation handler name.
   */
  static has(name) {
    return this._handlers[name] !== undefined;
  }

  /**
   * Returns a validation handler.
   *
   * @param string name A validation handler name.
   */
  static get(name) {
    if (this._handlers[name] !== undefined) {
       return this._handlers[name];
    }
    throw new Error("Unexisting `" + name + "` as validation handler.");
  }

  /**
   * Gets/sets the available validation handlers.
   *
   * @param  Object  handlers The handlers to set.
   * @param  Boolean append   Indicating if the handlers need to be appended or replaced.
   * @return Object           The list of available validation handlers
   */
  static handlers(handlers, append) {
    if (!arguments.length) {
      return extend({}, this._handlers);
    }
    append = append === undefined ? true : append;
    if (append) {
      extend(this._handlers, handlers);
    } else {
      this._handlers = handlers;
    }
    return this.handlers();
  }

  /**
   * Checks a single value against a validation handler.
   *
   * @param  String  rule    The validation handler name.
   * @param  mixed   value   The value to check.
   * @param  Object  options The options object.
   * @param  Object  params  The options object.
   * @return Promise         Returns a promise.
   */
  static is(name, value, options, params) {
    return co(function* () {
      var not = false;
      if (name.substring(0, 4) === 'not:') {
        name = name.substring(4);
        not = true;
      }
      var handlers = this.get(name);
      var result = yield this.check(value, handlers, options, params)

      return result !== not;
    }.bind(this));
  }

  /**
   * Perform validation checks against a value using an array of all possible formats for a rule,
   * and an array specifying which formats within the rule to use.
   *
   * Checks a single value against a validation handler.
   *
   * @param  mixed   value    The value to check.
   * @param  mixed   handlers The handler function or an object of handlers.
   * @param  Object  options  The options object.
   * @param  Object  params   A result object with parameters ready to be displayed.
   * @return Promise          Returns a promise.
   */
  static check(value, handlers, options, params) {
    return co(function* () {
      options = options || {};
      params = params || {};

      var defaults = { check: 'any' };
      options = extend({}, defaults, options);

      if (typeof handlers === 'function') {
        return handlers.apply(handlers, [value, options, params]);
      }

      if (handlers instanceof RegExp) {
        return handlers.test(value);
      }

      var success = true;
      var any = options.check === 'any';
      var formats = Array.isArray(options.check) ? options.check : [options.check];

      for (var key in handlers) {
        var handler = handlers[key];

        if (!any && formats.indexOf(key) === -1) {
          continue;
        }
        if (yield this.check(value, handlers[key], options, params)) {
          return true;
        } else {
          success = false;
        }
      }
      return success;
    }.bind(this));
  }

  /**
   * Gets/sets a particular error message.
   *
   * @param  String name    A validation handler name.
   * @param  String message The error message to set or none to get it.
   * @return String         The error message.
   */
  static message(name, message) {
    if (arguments.length === 2) {
      return this._messages[name] = message;
    }
    return this._messages[name] !== undefined ? this._messages[name] : this._messages['_default_'];
  }

  /**
   * Gets/sets error messages.
   *
   * @param  Object messages The error message array to set or none to get the setted ones.
   * @return Object          The error messages.
   */
  static messages(messages, append) {
    if (append === undefined) {
      append = true;
    }
    if (arguments.length) {
      if (append) {
        extend(this._messages, messages);
      } else {
        this._messages = messages;
      }
    }
    return extend({}, { _default_: 'is invalid' }, this._messages);
  }

  /**
   * Resets or removes all defined error messages.
   *
   * @param Boolean totaly If `true` error messages will be completly deleted and not reseted.
   */
  static reset(totaly)
  {
    this._handlers = {};
    this._messages = { _default_: 'is invalid' };

    if (totaly === true) {
      return;
    }

    this.messages({
      accepted: 'must be accepted',
      alphaNumeric: 'must contain only letters a-z and/or numbers 0-9',
      boolean: 'must be a boolean',
      creditCard: 'must be a valid credit card number',
      date: 'is not a valid date',
      dateAfter: 'must be date after ${date}',
      dateBefore: 'must be date before ${date}',
      decimal: 'must be decimal',
      email: 'is not a valid email address',
      equalTo: 'must be the equal to the field `${key}`',
      empty: 'must be a empty',
      'not:empty': 'must not be a empty',
      inList: 'must contain a valid value',
      'not:inList': 'must contain a valid value',
      inRange: 'must be inside the range',
      'not:inRange': 'must be ouside the range',
      integer: 'must be an integer',
      ip: 'must be an ip',
      length: 'must be longer than ${length}',
      lengthBetween: 'must be between ${min} and ${max} characters',
      lengthMax: 'must contain less than ${length} characters',
      lengthMin: 'must contain greater than ${length} characters',
      luhn: 'must be a valid credit card number',
      max: 'must be no more than ${max}',
      min: 'must be at least ${min}',
      money: 'must be a valid monetary amount',
      numeric: 'must be numeric',
      phone: 'must be a phone number',
      regex: 'contains invalid characters',
      required: 'is required',
      time: 'must be a valid time',
      url: 'not a URL'
    });

    this.set({
      accepted: function(value, options, params) {
        var bool = typeof value === 'boolean';
        var v = typeof v === 'string' ? value.toLowerCase() : value;
        return (bool || v === 0 || v === 1 || v === '0' || v === '1' || v === '' || v === 'true' || v === 'false' || v === 'yes' || v === 'no' || v === 'on' || v === 'off') && v != null;
      },
      alphaNumeric: function(value, options, params) {
        var rules = { 'alphaNumeric': /^[\u0041-\u005A\u0061-\u007A\u00AA\u00B5\u00BA\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0\u08A2-\u08AC\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097F\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C3D\u0C58\u0C59\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D60\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191C\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19C1-\u19C7\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA697\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA793\uA7A0-\uA7AA\uA7F8-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA80-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC-0-9\u0660-\u0669\u06F0-\u06F9\u07C0-\u07C9\u0966-\u096F\u09E6-\u09EF\u0A66-\u0A6F\u0AE6-\u0AEF\u0B66-\u0B6F\u0BE6-\u0BEF\u0C66-\u0C6F\u0CE6-\u0CEF\u0D66-\u0D6F\u0DE6-\u0DEF\u0E50-\u0E59\u0ED0-\u0ED9\u0F20-\u0F29\u1040-\u1049\u1090-\u1099\u17E0-\u17E9\u1810-\u1819\u1946-\u194F\u19D0-\u19D9\u1A80-\u1A89\u1A90-\u1A99\u1B50-\u1B59\u1BB0-\u1BB9\u1C40-\u1C49\u1C50-\u1C59\uA620-\uA629\uA8D0-\uA8D9\uA900-\uA909\uA9D0-\uA9D9\uA9F0-\uA9F9\uAA50-\uAA59\uABF0-\uABF9\uFF10-\uFF19]+$/ };
        return (!value && value !== '0') ? false : this.check(value, rules, options, params);
      }.bind(this),
      boolean: function(value, options, params) {
        return [0, 1, '0', '1', true, false].indexOf(value) !== -1;
      },
      creditCard: function(value, options, params) {
        return co(function*() {
          var rules = {
            amex: /^3[4|7]\d{13}$/,
            bankcard: /^56(10\d\d|022[1-5])\d{10}$/,
            diners: /^(?:3(0[0-5]|[68]\d)\d{11})|(?:5[1-5]\d{14})$/,
            disc: /^(?:6011|650\d)\d{12}$/,
            electron: /^(?:417500|4917\d{2}|4913\d{2})\d{10}$/,
            enroute: /^2(?:014|149)\d{11}$/,
            jcb: /^(3\d{4}|2100|1800)\d{11}$/,
            maestro: /^(?:5020|6\d{3})\d{12}$/,
            mc: /^5[1-5]\d{14}$/,
            solo: /^(6334[5-9][0-9]|6767[0-9]{2})\d{10}(\d{2,3})?$/,
            'switch': /^(?:49(03(0[2-9]|3[5-9])|11(0[1-2]|7[4-9]|8[1-2])|36[0-9]{2})\d{10}(\d{2,3})?)|(?:564182\d{10}(\d{2,3})?)|(6(3(33[0-4][0-9])|759[0-9]{2})\d{10}(\d{2,3})?)$/,
            visa: /^4\d{12}(\d{3})?$/,
            voyager: /^8699[0-9]{11}$/,
            fast: /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6011[0-9]{12}|3(?:0[0-5]|[68][0-9])[0-9]{11}|3[47][0-9]{13})$/
          };
          options = extend({ deep: false }, options);

          value = value.replace(/[- ]/g, '');

          if (value.length < 13) {
            return false;
          }
          var result = yield this.check(value, rules, options, params);
          if (!result) {
            return false;
          }
          return options.deep ? this.is('luhn', value) : true;
        }.bind(this));
      }.bind(this),
      date: function(value, options, params) {
        if (!(value instanceof Date)) {
          value = new Date(value);
        }
        return !Number.isNaN(value.getTime());
      },
      dateAfter: function(value, options, params) {
        options = options || {};
        if (options.date === undefined) {
          return false;
        }
        var after = options.date;
        if (!(after instanceof Date)) {
          after = new Date(after);
        }
        if (!(value instanceof Date)) {
          value = new Date(value);
        }
        params.date = dateFormat('yyyy-MM-dd hh:mm:ss', after);
        return value >= after;
      },
      dateBefore: function(value, options, params) {
        options = options || {};
        if (options.date === undefined) {
          return false;
        }
        before = options.date;
        if (!(before instanceof Date)) {
          before = new Date(before);
        }
        if (!(value instanceof Date)) {
          value = new Date(value);
        }
        params.date = dateFormat('yyyy-MM-dd hh:mm:ss', before);
        return value <= before;
      },
      decimal: function(value, options, params) {
        options = options || {};
        var p = options.precision;
        var regexp = p ? new RegExp('^[-+]?[0-9]*\.[0-9]{' + p + '}$') : /^[-+]?([0-9]+|[0-9]*\.[0-9]+(?:e[0-9]+)?)$/;
        return this.check(String(value), regexp, options, params);
      }.bind(this),
      email: function(value, options, params) {
        if (!value) {
          return false;
        }

        if (value.length > 254) {
          return false;
        }

        var valid = /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-?\.?[a-zA-Z0-9])*(\.[a-zA-Z](-?[a-zA-Z0-9])*)+$/.test(value);
        if (!valid){
          return false;
        }

        var parts = value.split('@');
        if (parts[0].length > 64) {
          return false;
        }

        var domainNames = parts[1].split('.');
        if (domainNames.some(function(part) { return part.length > 63; })) {
          return false;
        }

        return true;
      },
      empty: /^\s*$/,
      equalTo: function(value, options, params) {
        options = options || {};
        if (options.key === undefined) {
          return false;
        }
        var field = options.key;
        return options.data !== undefined && options.data[field] !== undefined && value == options.data[field];
      },
      inList: function(value, options) {
        options = extend({ list: []}, options);
        var strict = typeof value === 'boolean' || value === '' || value == null;
        if (strict) {
          return options.list.indexOf(value) !== -1;
        }
        for (var item of options.list) {
          if (item == value) {
            return true;
          }
        }
        return false;
      },
      inRange: function(value, options, params) {
        options = options || {};

        if (Number.isNaN(Number.parseFloat(value)) || !Number.isFinite(value)) {
          return false;
        }
        switch (true) {
          case (options.upper !== undefined && options.lower !== undefined):
            return (value >= options.lower && value <= options.upper);
          case (options.upper !== undefined):
            return (value <= options.upper);
          case (options.lower !== undefined):
            return (value >= options.lower);
        }
        return value !== Infinity;
      },
      integer: /^(?:[-+]?(?:0|[1-9][0-9]*))$/,
      ip: function(value, options, params) {
        if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(value)) {
          return true;
        } else if (/(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))/.test(value)) {
          return true;
        }
        return false;
      },
      length: function(value, options, params) {
        options = options || {};
        return options.length !== undefined && typeof value === 'string' && value.length === options.length;
      },
      lengthBetween: function(value, options, params) {
        options = options || {};
        return options.min !== undefined && options.max !== undefined && typeof value === 'string' && value.length >= options.min && value.length <= options.max;
      },
      lengthMax: function(value, options, params) {
        options = options || {};
        return options.length !== undefined && typeof value === 'string' && value.length <= options.length;
      },
      lengthMin: function(value, options, params) {
        options = options || {};
        return options.length !== undefined && typeof value === 'string' && value.length >= options.length;
      },
      luhn: function(value, options, params) {
        if (typeof value !== 'string' || value === '') {
          return false;
        }
        var sum = 0;
        var length = value.length;
        var position;

        for (position = 1 - (length % 2); position < length; position += 2) {
          sum += Number.parseInt(value.charAt(position));
        }
        for (position = (length % 2); position < length; position += 2) {
          var number = Number.parseInt(value.charAt(position)) * 2;
          sum += (number < 10) ? number : number - 9;
        }
        return (sum % 10 === 0);
      },
      max: function(value, options, params) {
        options = options || {};
        return options.max !== undefined && value <= options.max;
      },
      min: function(value, options, params) {
        options = options || {};
        return options.min !== undefined && value >= options.min;
      },
      money: {
        right: /^(?!0,?\d)(?:\d{1,3}(?:([, .])\d{3})?(?:\1\d{3})*|(?:\d+))([,.]\d{2})?(?!\u00a2)[\x24\xA2-\xA5\u058F\u060B\u09F2\u09F3\u09FB\u0AF1\u0BF9\u0E3F\u17DB\u20A0-\u20BE\uA838\uFDFC\uFE69\uFF04\uFFE0\uFFE1\uFFE5\uFFE6]?$/,
        left: /^(?!\u00a2)[\x24\xA2-\xA5\u058F\u060B\u09F2\u09F3\u09FB\u0AF1\u0BF9\u0E3F\u17DB\u20A0-\u20BE\uA838\uFDFC\uFE69\uFF04\uFFE0\uFFE1\uFFE5\uFFE6]?(?!0,?\d)(?:\d{1,3}(?:([, .])\d{3})?(?:\1\d{3})*|(?:\d+))([,.]\d{2})?$/
      },
      numeric: function(value, options, params) {
        value = Number.parseFloat(value);
        return !Number.isNaN(value) && Number.isFinite(value);
      },
      phone: /^\+?[0-9\(\)\-]{10,20}$/,
      regex: function(value, options, params) {
        return value instanceof RegExp;
      },
      time: /^((0?[1-9]|1[012])(:[0-5]\d){0,2}([AP]M|[ap]m))|^([01]\d|2[0-3])(:[0-5]\d){0,2}$/,
      url:  /^(?:\w+:)?\/\/([^\s\.]+\.\S{2}|localhost[\:?\d]*)\S*$/,
      uuid: /^[A-Fa-f0-9]{8}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{12}$/
    });
  }
}

/**
 * Global validation handlers.
 *
 * @var Object
 */
Checker._handlers = {};

/**
 * The error messages.
 *
 * @var Object
 */
Checker._messages = {};

Checker.reset();

export default Checker;
