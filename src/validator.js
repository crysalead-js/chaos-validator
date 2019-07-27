var co = require('co');
var extend = require('extend-merge').extend;
var merge = require('extend-merge').merge;
var insert = require('string-placeholder');
var Checker = require('./checker');

/**
 * The `Validator` class provides the necessary logic to perform some validation on data.
 *
 * Example:
 * {{{
 * import { Validator } from 'chaos-validator';
 *
 * var validator = new Validator();
 * validator.rule('title', [
 *   { 'not:empty': { message: 'please enter a title' } }
 * ]);
 * validator.validates({ title: 'new title' }); // Promise
 * }}}
 *
 * @see Checker class for all built-in rules
 */
class Validator {

  /**
   * Gets/sets classes dependencies.
   *
   * @param  Object classes The classes dependencies to set or none to get it.
   * @return mixed          The classes dependencies.
   */
  static classes(classes) {
    if (arguments.length) {
      this._classes = extend({}, this._classes, classes);
    }
    return this._classes;
  }

  /**
   * Constructor
   *
   * @param Object config The config array. Possible values are:
   *                      - `'handlers'` _Object_   : Some custom handlers.
   *                      - `'error'`    _Function_ : The error message handler.
   */
  constructor(config) {
    var defaults = {
      meta: {},
      handlers: {},
      error: function(name, options, meta) {
        return insert(options.message ? options.message : this.message(name), options);
      }.bind(this)
    };

    config = merge({}, defaults, config);

    /**
     * Some optionnal meta data.
     *
     * @var Object
     */
    this._meta = {};

    /**
     * Local validation handlers.
     *
     * @var Object
     */
    this._handlers = {};

    /**
     * The validation rules.
     *
     * @var Object
     */
    this._rules = {};

    /**
     * The logged errors.
     *
     * @var Object
     */
    this._errors = {};

    /**
     * The error messages.
     *
     * @var Object
     */
    this._messages = {};

    /**
     * The error message handler.
     *
     * @var Closure
     */
    this._error = null;

    this.set(config.handlers);
    this.error(config.error);
    this.meta(config.meta);
  }

  /**
   * Sets one or several validation rules.
   *
   * For example:
   * {{{
   * co(function*() {
   *   var validator = new Validator();
   *   validator.set('zeroToNine', /^[0-9]/);
   *
   *   var isValid = yield validator.is('zeroToNine', '5'); // true
   *   isValid = yield validator.is('zeroToNine', '20'); // false
   * });
   * }}}
   *
   * Alternatively, the first parameter may be an array of rules expressed as key/value pairs,
   * as in the following:
   * {{{
   * validator = new Validator();
   * validator.set({
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
   *   var validator = new Validator();
   *   validator.set('accountActive', function(value, options) {
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
   *   yield validator.is('accountActive', testAccount); // false
   *   yield validator.is('accountActive', 123); // true
   * });
   *
   * }}}
   *
   * These functions can take up to 3 parameters:
   *  - `value`   _mixed_ : This is the actual value to be validated (as in the above example).
   *  - `options` _Object_: This parameter allows a validation rule to implement custom options.
   *                        - `'format'` _string_: Often, validation rules come in multiple "formats", for example:
   *                          postal codes, which vary by country or region. Defining multiple formats allows you to
   *                          retain flexibility in how you validate data. In cases where a user's country of origin
   *                          is known, the appropriate validation rule may be selected. In cases where it is not
   *                          known, the value of `format` may be `'any'`, which should pass if any format matches.
   *                          In cases where validation rule formats are not mutually exclusive, the value may be
   *                          `'all'`, in which case all must match.
   *
   *
   * @param mixed name The name of the validation rule (string), or an array of key/value pairs
   *                   of names and rules.
   * @param mixed rule If name is a string, this should be a string regular expression, or a
   *                   closure that returns a boolean indicating success. Should be left blank if
   *                   `name` is an Object.
   */
  set(name, rule) {
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
   * @param String name A validation handler name.
   */
  has(name) {
    var checker = this.constructor.classes().checker;
    return this._handlers[name] !== undefined || checker.has(name);
  }

  /**
   * Returns a validation handler.
   *
   * @param String name A validation handler name.
   */
  get(name) {
    if (this._handlers[name]) {
       return this._handlers[name];
    }
    var checker = this.constructor.classes().checker;
    if (checker.has(name)) {
       return checker.get(name);
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
  handlers(handlers, append) {
    if (!arguments.length) {
      var checker = this.constructor.classes().checker;
      return extend({}, checker.handlers(), this._handlers);
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
   * Sets rule(s).
   *
   * @param mixed name  A fieldname.
   * @param mixed rules The validations rules. Rules can be a string, an object or an array of them.
   */
  rule(field, rules) {
    var defaults = {
      message: null,
      required: true,
      skipNull: false,
      skipEmpty: false,
      format: 'any',
      not: false,
      on: null
    };

    if (Array.isArray(rules)) {
      for (var rule of rules) {
        this.rule(field, rule);
      }
      return;
    }

    var name;

    if (typeof rules === 'string') {
      name = rules;
      rules = {};
      rules[name] = {};
    }

    for (name in rules) {
      var options = rules[name];
      if (typeof options === 'string') {
        options = { message: options };
      }
      if (this._rules[field] === undefined) {
        this._rules[field] = {};
      }
      this._rules[field][name] = extend({}, defaults, options);
    }
  }

  /**
   * Validates a set of values against a specified rules list. This method may be used to validate
   * any arbitrary array of data against a set of validation rules.
   *
   * @param Object data    An array of key/value pairs, where the values are to be checked.
   * @param Array  rules   An array of rules to check the values in `values` against. Each key in
   *                       `rules` should match a key contained in `values`, and each value should be a
   *                       validation rule in one of the allowable formats. For example, if you are
   *                       validating a data set containing a `'credit_card'` key, possible values for
   *                       `rules` would be as follows:
   *                       - `['credit_card' => 'You must include a credit card number']`: This is the
   *                         simplest form of validation rule, in which the value is simply a message to
   *                         display if the rule fails. Using this format, all other validation settings
   *                         inherit from the defaults, including the validation rule itself, which only
   *                         checks to see that the corresponding key in `values` is present and contains
   *                         a value that is not empty. _Please note when globalizing validation messages:_
   *                         When specifying messages, it may be preferable to use a code string (i.e.
   *                         `'ERR_NO_TITLE'`) instead of the full text of the validation error. These code
   *                         strings may then be translated by the appropriate tools in the templating layer.
   *                       - `['credit_card' => ['creditCard', 'message' => 'Invalid CC #']]`:
   *                         In the second format, the validation rule (in this case `creditCard`) and
   *                         associated configuration are specified as an array, where the rule to use is
   *                         the first value in the array (no key), and additional settings are specified
   *                         as other keys in the array. Please see the list below for more information on
   *                         allowed keys.
   *                       - The final format allows you to apply multiple validation rules to a single
   *                         value, and it is specified as follows:
   *                         `['credit_card' => [
   *                              ['not:empty', 'message' => 'You must include credit card number'],
   *                              ['creditCard', 'message' => 'Your credit card number must be valid']
   *                         ]];`
   * @param Object options Validator-specific options.
   *                       Each rule defined as an array can contain any of the following settings
   *                       (in addition to the first value, which represents the rule to be used):
   *                       - `'message'` _string_: The error message to be returned if the validation
   *                         rule fails. See the note above regarding globalization of error messages.
   *                       - `'required`' _boolean_: Represents whether the value is required to be
   *                         present in `values`. If `'required'` is set to `false`, the validation rule
   *                         will be skipped if the corresponding key is not present. Defaults to `true`.
   *                       - `'skipNull'` _boolean_: This setting (if `true`) will cause the validation rule
   *                         to be skipped if the corresponding value is `null`.
   *                         Defaults to `false`.
   *                       - `'skipEmpty'` _boolean_: This setting (if `true`) will cause the validation rule
   *                         to be skipped if the corresponding value is empty (an empty string or `null`).
   *                         Defaults to `false`.
   *                       - `'format'` _string_: If the validation rule has multiple format definitions
   *                         (see the `add()` or `init()` methods), the name of the format to be used
   *                         can be specified here. Additionally, two special values can be used:
   *                         either `'any'`, which means that all formats will be checked and the rule
   *                         will pass if any format passes, or `'all'`, which requires all formats to
   *                         pass in order for the rule check to succeed.
   * @return Promise         Returns a promise.
   */
  validates(data, options) {
    return co(function* () {
      options = options || {};
      var events = options.events ? (Array.isArray(options.events) ? options.events : [options.events]) : [];

      this._errors = {};
      var error = this._error;

      var success = true;

      for (var field in this._rules) {
        var rules = this._rules[field];
        var values = this.constructor.values(data, field.split('.'));

        for (var name in rules) {
          var rule = rules[name];

          rule = extend({}, options, rule);
          rule.field = field;

          if (events.length && rule.on) {
            var on = Array.isArray(rule.on) ? rule.on : [rule.on];
            var intersect = events.filter(function(n) {
                return on.indexOf(n) !== -1
            });
            if (!intersect.length) {
              continue;
            }
          }

          if (!Object.keys(values).length && rule.required) {
            rule.message = undefined;
            if (this._errors[field] === undefined) {
              this._errors[field] = [];
            }
            this._errors[field].push(error('required', rule, this._meta));
            success = false;
            break;
          }

          for (var key in values) {
            var params = {};
            var value = values[key];

            if (value === null && rule.skipNull) {
              continue;
            }
            if (!value && rule.skipEmpty) {
              continue;
            }
            rule.data = data;
            var ok = yield this.is(name, value, rule, params);
            if (!ok) {
              if (this._errors[key] === undefined) {
                this._errors[key] = [];
              }
              this._errors[key].push(error(name, extend({}, rule, params), this._meta));
              success = false;
            }
          }
        }
      }
      return success;
    }.bind(this));
  }

  /**
   * Returns the errors from the last validate call.
   *
   * @return Object The occured errors.
   */
  errors() {
    return extend({}, this._errors);
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
  is(name, value, options, params) {
    return co(function* () {
      var not = false;
      if (name.substring(0, 4) === 'not:') {
        name = name.substring(4);
        not = true;
      }
      var handlers = this.get(name);
      var checker = this.constructor.classes().checker;
      var result = yield checker.check(value, handlers, options, params)

      return result !== not;
    }.bind(this));
  }

  /**
   * Extracts all values corresponding to a field names path.
   *
   * @param  Object data The data.
   * @param  Array  path An array of field names.
   * @param  String base The dotted fielname path of the data.
   * @return Object      The extracted values.
   */
  static values(data, path, base)
  {
    if (!path || !path.length) {
      var result = {};
      result[base ? base : '0'] = data;
      return result;
    }
    path = path.slice();
    var field = path.shift();

    if (field === '*') {
      var values = {};
      for (var key in data) {
        extend(values, this.values(data[key], path, base + '.' + key));
      }
      return values;
    } else if (data[field] === undefined) {
      return {};
    } else if (!path.length) {
      var tmp = {};
      tmp[base ? base + '.' + field : field] =  data[field];
      return tmp;
    } else {
      return this.values(data[field], path, base ? base + '.' + field : field);
    }
  }

  /**
   * Gets/sets a particular error message.
   *
   * @param  String name    A validation handler name.
   * @param  String message The error message to set or none to get it.
   * @return String         The error message.
   */
  message(name, message) {
    if (arguments.length === 2) {
      return this._messages[name] = message;
    }
    var checker = this.constructor.classes().checker;
    return this._messages[name] !== undefined ? this._messages[name] : checker.message(name);
  }

  /**
   * Gets/sets error messages.
   *
   * @param  Object messages The error message array to set or none to get the setted ones.
   * @return Object          The error messages.
   */
  messages(messages, append) {
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
    var checker = this.constructor.classes().checker;

    return extend({}, checker.messages(), this._messages);
  }

  /**
   * Gets/sets the error message handler.
   *
   * @param  Function handler The error message handler to set.
   * @return Function         The error message handler.
   */
  error(handler) {
    if (arguments.length) {
      return this._error = handler;
    }
    return this._error;
  }

  /**
   * Gets/sets the validator meta data.
   *
   * @param  Object meta The validator meta data to set.
   * @return Object      The validator meta data.
   */
  meta(meta) {
    if (arguments.length) {
      return this._meta = meta;
    }
    return this._meta;
  }
}

Validator._classes = {
  checker: Checker
}

module.exports = Validator;
