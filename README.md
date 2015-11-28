# chaos-validator

[![Build Status](https://travis-ci.org/crysalead-js/chaos-validator.png?branch=master)](https://travis-ci.org/crysalead-js/chaos-validator)
[![Coverage Status](https://coveralls.io/repos/crysalead-js/chaos-validator/badge.svg)](https://coveralls.io/r/crysalead-js/chaos-validator)

## Install

```bash
npm install chaos-validator
```

### Simple Validation Usage

```php
import { Validator } from 'chaos-validator';

co(function* () {
  var v = new Validator();

  v.rule('title', [
    'not:empty',
    { lengthBetween: { min: 3, max: 20 } }
  ]);

  yield v.validate({ title: 'new title' }); // true

  v.errors(); // errors
});

```

Each validation rule can be defined by an array of validation rules. Rule name can be prefixed by `'not:'` to match its opposite requirement. A validation rule can be defined using an object. In this case the key will be the validation rule name and the value will define options values. Bellow some possible ones:

* message: The error message displayed if this rule fails.
* required (boolean): Specifies that data for this field must be submitted in order to validate. Defaults to `true`.
* skipEmpty (boolean): Causes the rule to be skipped if the value is null or empty. Defaults to `false`.
* check: The name of a particular validation handler to use, or `'any'` to check them all until one passes.

### Multi-dimensional Arrays Validation

To validate array the dotted notation can be used like in following:

```php
var v = new Validator();
v.rule('emails.*', 'email');

v.validate({ emails: ['willy@boy.com', 'johnny@boy.com'] }).then(...);
```

It's also possible to validate deeply nested data structures using the same dotted syntax:

```php
var v = new Validator();
v.rule('people.*.email', 'email');

v.validate({
  people: [
    { email: 'willy@boy.com' },
    { email: 'johnny@boy.com' }
  ]
}).then(...);
```

### Built-in Validation Handlers

 * accepted      - must be accepted,
 * alphaNumeric  - must contain only letters a-z and/or numbers 0-9,
 * boolean       - must be a boolean,
 * creditCard    - must be a valid credit card number,
 * date          - is not a valid date,
 * dateAfter     - must be date after ${date},
 * dateBefore    - must be date before ${date},
 * decimal       - must be decimal,
 * email         - is not a valid email address,
 * equalTo       - must be the equal to the field `${key}`,
 * empty         - must be a empty,
 * inList        - must contain a valid value,
 * inRange       - must be inside the range,
 * integer       - must be an integer,
 * ip            - must be an ip,
 * length        - must be longer than ${length},
 * lengthBetween - must be between ${min} and ${max} characters,
 * lengthMax     - must contain less than ${length} characters,
 * lengthMin     - must contain greater than ${length} characters,
 * luhn          - must be a valid credit card number,
 * max           - must be no more than ${max},
 * min           - must be at least ${min},
 * money         - must be a valid monetary amount,
 * numeric       - must be numeric,
 * phone         - must be a phone number,
 * regex         - contains invalid characters,
 * required      - is required,
 * time          - must be a valid time,
 * url           - not a URL

All validation can be used with the 'not:' prefix, for example 'not:empty' will fail if the value is empty.

Note: only `'not:empty'`, `'not:inList'` and `'not:inRange'` have a default error message defined so if you intend tu use the `not:` prefix on another validation handler, don't forget to use `.messages()` to set it.

### Adding Custom Validation Rules

While the validator features a number of handy rules, you'll inevitably want to create your own validation rules. This done (at runtime) by calling `set()` to specify new rule logic.

The simplest form of rule addition is by Regular Expression:

```php
var v = new Validator();
v.set('zeroToNine', /^[0-9]$/);
```

Often, validation rules come in multiple "formats", for example credit cards, which vary by type of card. Defining multiple formats allows you to retain flexibility in how you validate data.

```php
var v = new Validator();
v.set('postalCode', {
  us: /^\d{5}(?:[-\s]\d{4})?$/,
  fr: /^(F-)?((2[A|B])|[0-9]{2})[0-9]{3}$/,
  uk: /^(GIR|[A-Z]\d[A-Z\d]??|[A-Z]{2}\d[A-Z\d]??)[ ]??(\d[A-Z]{2})$/
});

v.message('postalCode', 'invalid postal code');

v.rule('zip', 'postalCode');

v.validate({ zip: '30700' }, { check: 'fr' }).then(...);  // check only the fr validation handler.
v.validate({ zip: '30700' }, { check: 'any' }).then(...); // default behavior.
```

And if you need more than pattern recognition, you can also supply rules as anonymous functions:

```php
var v = new Validator();
v.set('zeroToNine', function(value, options, params) {
  return /^[0-9]$/.test(value);
});
```

### Setting Default Validation Messages

Instead of setting `'message'` for each rule, you can set a default message for each validation handler using `.messages()` like in the following example:

```php
var v = new Validator();
v.set('zeroToNine', /^[0-9]$/);

Checker.messages({
  zeroToNine: 'must be between 0 to 9'
});

v.rule('checksum', 'zeroToNine');
v.validate({ checksum: '25' }).then(function() {
  v.errors(); // returns { zeroToNine: ['must be between 0 to 9'] }
});
```

### Adding Global Validation Rules

The `Validator` class is based on the `Checker` class for performing validations. To add a global validation handler available for all `Validator` instance, you'll need to add it to the `Checker` class instead.

```php
import { Validator, Checker } from 'chaos-validator';

co(function* () {
  Checker.set('zeroToNine', /^[0-9]$/);
  Checker.message('zeroToNine', 'must be between 0 to 9');

  var v = new Validator();
  v.rule('checksum', 'zeroToNine');
  yield v.validate({ checksum: '25' });
  v.errors(); // { zeroToNine: ['must be between 0 to 9'] }
});
```

### Customizing Error Messages

It's sometimes interesting to display some custom data inside error messages. For example some boundaries or a particular label name. To make it work all parameters need to be added to the validation rule like the following:

```php
var v = new Validator();

v.rule('title', {
  not:empty: {
    message: 'please enter a ${label}',
    label: 'title'
  },
  lengthBetween: {
    min: 3,
    max: 20,
    message: 'must be between ${min} and ${max} character long'
  }
});
```

### Globalization

Since there's a lot of different ways to solve globalization, no assumption on how it should be done have been made. Instead you can define your own error message handler to fit your globalization architecture.

```php
import placeholder from 'string-placeholder';

var v = new Validator({
  error: function(name, options, meta) {
    options = options || {};
    var message = translate(options.message ? options.message : name); // <- put here your logic to perform translations
    return placeholder(message, options);
  }
});
```

## Testing

```
cd chaos-validator
npm install
npm test
```