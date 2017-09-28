/*  Prototype JavaScript framework, version 1.7
 *  (c) 2005-2010 Sam Stephenson
 *
 *  Prototype is freely distributable under the terms of an MIT-style license.
 *  For details, see the Prototype web site: http://www.prototypejs.org/
 *
 *--------------------------------------------------------------------------*/

var Prototype = {

  Version: '1.7',

  Browser: (function(){
    var ua = navigator.userAgent;
    var isOpera = Object.prototype.toString.call(window.opera) == '[object Opera]';
    return {
      IE:             !!window.attachEvent && !isOpera,
      Opera:          isOpera,
      WebKit:         ua.indexOf('AppleWebKit/') > -1,
      Gecko:          ua.indexOf('Gecko') > -1 && ua.indexOf('KHTML') === -1,
      MobileSafari:   /Apple.*Mobile/.test(ua)
    }
  })(),

  BrowserFeatures: {
    XPath: !!document.evaluate,

    SelectorsAPI: !!document.querySelector,

    ElementExtensions: (function() {
      var constructor = window.Element || window.HTMLElement;
      return !!(constructor && constructor.prototype);
    })(),
    SpecificElementExtensions: (function() {
      if (typeof window.HTMLDivElement !== 'undefined')
        return true;

      var div = document.createElement('div'),
          form = document.createElement('form'),
          isSupported = false;

      if (div['__proto__'] && (div['__proto__'] !== form['__proto__'])) {
        isSupported = true;
      }

      div = form = null;

      return isSupported;
    })()
  },

  ScriptFragment: '<script[^>]*>([\\S\\s]*?)<\/script>',
  JSONFilter: /^\/\*-secure-([\s\S]*)\*\/\s*$/,

  emptyFunction: function() { },

  K: function(x) { return x }
};

if (Prototype.Browser.MobileSafari)
  Prototype.BrowserFeatures.SpecificElementExtensions = false;


var Abstract = { };


var Try = {
  these: function() {
    var returnValue;

    for (var i = 0, length = arguments.length; i < length; i++) {
      var lambda = arguments[i];
      try {
        returnValue = lambda();
        break;
      } catch (e) { }
    }

    return returnValue;
  }
};

/* Based on Alex Arnell's inheritance implementation. */

var Class = (function() {

  var IS_DONTENUM_BUGGY = (function(){
    for (var p in { toString: 1 }) {
      if (p === 'toString') return false;
    }
    return true;
  })();

  function subclass() {};
  function create() {
    var parent = null, properties = $A(arguments);
    if (Object.isFunction(properties[0]))
      parent = properties.shift();

    function klass() {
      this.initialize.apply(this, arguments);
    }

    Object.extend(klass, Class.Methods);
    klass.superclass = parent;
    klass.subclasses = [];

    if (parent) {
      subclass.prototype = parent.prototype;
      klass.prototype = new subclass;
      parent.subclasses.push(klass);
    }

    for (var i = 0, length = properties.length; i < length; i++)
      klass.addMethods(properties[i]);

    if (!klass.prototype.initialize)
      klass.prototype.initialize = Prototype.emptyFunction;

    klass.prototype.constructor = klass;
    return klass;
  }

  function addMethods(source) {
    var ancestor   = this.superclass && this.superclass.prototype,
        properties = Object.keys(source);

    if (IS_DONTENUM_BUGGY) {
      if (source.toString != Object.prototype.toString)
        properties.push("toString");
      if (source.valueOf != Object.prototype.valueOf)
        properties.push("valueOf");
    }

    for (var i = 0, length = properties.length; i < length; i++) {
      var property = properties[i], value = source[property];
      if (ancestor && Object.isFunction(value) &&
          value.argumentNames()[0] == "$super") {
        var method = value;
        value = (function(m) {
          return function() { return ancestor[m].apply(this, arguments); };
        })(property).wrap(method);

        value.valueOf = method.valueOf.bind(method);
        value.toString = method.toString.bind(method);
      }
      this.prototype[property] = value;
    }

    return this;
  }

  return {
    create: create,
    Methods: {
      addMethods: addMethods
    }
  };
})();
(function() {

  var _toString = Object.prototype.toString,
      NULL_TYPE = 'Null',
      UNDEFINED_TYPE = 'Undefined',
      BOOLEAN_TYPE = 'Boolean',
      NUMBER_TYPE = 'Number',
      STRING_TYPE = 'String',
      OBJECT_TYPE = 'Object',
      FUNCTION_CLASS = '[object Function]',
      BOOLEAN_CLASS = '[object Boolean]',
      NUMBER_CLASS = '[object Number]',
      STRING_CLASS = '[object String]',
      ARRAY_CLASS = '[object Array]',
      DATE_CLASS = '[object Date]',
      NATIVE_JSON_STRINGIFY_SUPPORT = window.JSON &&
        typeof JSON.stringify === 'function' &&
        JSON.stringify(0) === '0' &&
        typeof JSON.stringify(Prototype.K) === 'undefined';

  function Type(o) {
    switch(o) {
      case null: return NULL_TYPE;
      case (void 0): return UNDEFINED_TYPE;
    }
    var type = typeof o;
    switch(type) {
      case 'boolean': return BOOLEAN_TYPE;
      case 'number':  return NUMBER_TYPE;
      case 'string':  return STRING_TYPE;
    }
    return OBJECT_TYPE;
  }

  function extend(destination, source) {
    for (var property in source)
      destination[property] = source[property];
    return destination;
  }

  function inspect(object) {
    try {
      if (isUndefined(object)) return 'undefined';
      if (object === null) return 'null';
      return object.inspect ? object.inspect() : String(object);
    } catch (e) {
      if (e instanceof RangeError) return '...';
      throw e;
    }
  }

  function toJSON(value) {
    return Str('', { '': value }, []);
  }

  function Str(key, holder, stack) {
    var value = holder[key],
        type = typeof value;

    if (Type(value) === OBJECT_TYPE && typeof value.toJSON === 'function') {
      value = value.toJSON(key);
    }

    var _class = _toString.call(value);

    switch (_class) {
      case NUMBER_CLASS:
      case BOOLEAN_CLASS:
      case STRING_CLASS:
        value = value.valueOf();
    }

    switch (value) {
      case null: return 'null';
      case true: return 'true';
      case false: return 'false';
    }

    type = typeof value;
    switch (type) {
      case 'string':
        return value.inspect(true);
      case 'number':
        return isFinite(value) ? String(value) : 'null';
      case 'object':

        for (var i = 0, length = stack.length; i < length; i++) {
          if (stack[i] === value) { throw new TypeError(); }
        }
        stack.push(value);

        var partial = [];
        if (_class === ARRAY_CLASS) {
          for (var i = 0, length = value.length; i < length; i++) {
            var str = Str(i, value, stack);
            partial.push(typeof str === 'undefined' ? 'null' : str);
          }
          partial = '[' + partial.join(',') + ']';
        } else {
          var keys = Object.keys(value);
          for (var i = 0, length = keys.length; i < length; i++) {
            var key = keys[i], str = Str(key, value, stack);
            if (typeof str !== "undefined") {
               partial.push(key.inspect(true)+ ':' + str);
             }
          }
          partial = '{' + partial.join(',') + '}';
        }
        stack.pop();
        return partial;
    }
  }

  function stringify(object) {
    return JSON.stringify(object);
  }

  function toQueryString(object) {
    return $H(object).toQueryString();
  }

  function toHTML(object) {
    return object && object.toHTML ? object.toHTML() : String.interpret(object);
  }

  function keys(object) {
    if (Type(object) !== OBJECT_TYPE) { throw new TypeError(); }
    var results = [];
    for (var property in object) {
      if (object.hasOwnProperty(property)) {
        results.push(property);
      }
    }
    return results;
  }

  function values(object) {
    var results = [];
    for (var property in object)
      results.push(object[property]);
    return results;
  }

  function clone(object) {
    return extend({ }, object);
  }

  function isElement(object) {
    return !!(object && object.nodeType == 1);
  }

  function isArray(object) {
    return _toString.call(object) === ARRAY_CLASS;
  }

  var hasNativeIsArray = (typeof Array.isArray == 'function')
    && Array.isArray([]) && !Array.isArray({});

  if (hasNativeIsArray) {
    isArray = Array.isArray;
  }

  function isHash(object) {
    return object instanceof Hash;
  }

  function isFunction(object) {
    return _toString.call(object) === FUNCTION_CLASS;
  }

  function isString(object) {
    return _toString.call(object) === STRING_CLASS;
  }

  function isNumber(object) {
    return _toString.call(object) === NUMBER_CLASS;
  }

  function isDate(object) {
    return _toString.call(object) === DATE_CLASS;
  }

  function isUndefined(object) {
    return typeof object === "undefined";
  }

  extend(Object, {
    extend:        extend,
    inspect:       inspect,
    toJSON:        NATIVE_JSON_STRINGIFY_SUPPORT ? stringify : toJSON,
    toQueryString: toQueryString,
    toHTML:        toHTML,
    keys:          Object.keys || keys,
    values:        values,
    clone:         clone,
    isElement:     isElement,
    isArray:       isArray,
    isHash:        isHash,
    isFunction:    isFunction,
    isString:      isString,
    isNumber:      isNumber,
    isDate:        isDate,
    isUndefined:   isUndefined
  });
})();
Object.extend(Function.prototype, (function() {
  var slice = Array.prototype.slice;

  function update(array, args) {
    var arrayLength = array.length, length = args.length;
    while (length--) array[arrayLength + length] = args[length];
    return array;
  }

  function merge(array, args) {
    array = slice.call(array, 0);
    return update(array, args);
  }

  function argumentNames() {
    var names = this.toString().match(/^[\s\(]*function[^(]*\(([^)]*)\)/)[1]
      .replace(/\/\/.*?[\r\n]|\/\*(?:.|[\r\n])*?\*\//g, '')
      .replace(/\s+/g, '').split(',');
    return names.length == 1 && !names[0] ? [] : names;
  }

  function bind(context) {
    if (arguments.length < 2 && Object.isUndefined(arguments[0])) return this;
    var __method = this, args = slice.call(arguments, 1);
    return function() {
      var a = merge(args, arguments);
      return __method.apply(context, a);
    }
  }

  function bindAsEventListener(context) {
    var __method = this, args = slice.call(arguments, 1);
    return function(event) {
      var a = update([event || window.event], args);
      return __method.apply(context, a);
    }
  }

  function curry() {
    if (!arguments.length) return this;
    var __method = this, args = slice.call(arguments, 0);
    return function() {
      var a = merge(args, arguments);
      return __method.apply(this, a);
    }
  }

  function delay(timeout) {
    var __method = this, args = slice.call(arguments, 1);
    timeout = timeout * 1000;
    return window.setTimeout(function() {
      return __method.apply(__method, args);
    }, timeout);
  }

  function defer() {
    var args = update([0.01], arguments);
    return this.delay.apply(this, args);
  }

  function wrap(wrapper) {
    var __method = this;
    return function() {
      var a = update([__method.bind(this)], arguments);
      return wrapper.apply(this, a);
    }
  }

  function methodize() {
    if (this._methodized) return this._methodized;
    var __method = this;
    return this._methodized = function() {
      var a = update([this], arguments);
      return __method.apply(null, a);
    };
  }

  return {
    argumentNames:       argumentNames,
    bind:                bind,
    bindAsEventListener: bindAsEventListener,
    curry:               curry,
    delay:               delay,
    defer:               defer,
    wrap:                wrap,
    methodize:           methodize
  }
})());



(function(proto) {


  function toISOString() {
    return this.getUTCFullYear() + '-' +
      (this.getUTCMonth() + 1).toPaddedString(2) + '-' +
      this.getUTCDate().toPaddedString(2) + 'T' +
      this.getUTCHours().toPaddedString(2) + ':' +
      this.getUTCMinutes().toPaddedString(2) + ':' +
      this.getUTCSeconds().toPaddedString(2) + 'Z';
  }


  function toJSON() {
    return this.toISOString();
  }

  if (!proto.toISOString) proto.toISOString = toISOString;
  if (!proto.toJSON) proto.toJSON = toJSON;

})(Date.prototype);


RegExp.prototype.match = RegExp.prototype.test;

RegExp.escape = function(str) {
  return String(str).replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
};
var PeriodicalExecuter = Class.create({
  initialize: function(callback, frequency) {
    this.callback = callback;
    this.frequency = frequency;
    this.currentlyExecuting = false;

    this.registerCallback();
  },

  registerCallback: function() {
    this.timer = setInterval(this.onTimerEvent.bind(this), this.frequency * 1000);
  },

  execute: function() {
    this.callback(this);
  },

  stop: function() {
    if (!this.timer) return;
    clearInterval(this.timer);
    this.timer = null;
  },

  onTimerEvent: function() {
    if (!this.currentlyExecuting) {
      try {
        this.currentlyExecuting = true;
        this.execute();
        this.currentlyExecuting = false;
      } catch(e) {
        this.currentlyExecuting = false;
        throw e;
      }
    }
  }
});
Object.extend(String, {
  interpret: function(value) {
    return value == null ? '' : String(value);
  },
  specialChar: {
    '\b': '\\b',
    '\t': '\\t',
    '\n': '\\n',
    '\f': '\\f',
    '\r': '\\r',
    '\\': '\\\\'
  }
});

Object.extend(String.prototype, (function() {
  var NATIVE_JSON_PARSE_SUPPORT = window.JSON &&
    typeof JSON.parse === 'function' &&
    JSON.parse('{"test": true}').test;

  function prepareReplacement(replacement) {
    if (Object.isFunction(replacement)) return replacement;
    var template = new Template(replacement);
    return function(match) { return template.evaluate(match) };
  }

  function gsub(pattern, replacement) {
    var result = '', source = this, match;
    replacement = prepareReplacement(replacement);

    if (Object.isString(pattern))
      pattern = RegExp.escape(pattern);

    if (!(pattern.length || pattern.source)) {
      replacement = replacement('');
      return replacement + source.split('').join(replacement) + replacement;
    }

    while (source.length > 0) {
      if (match = source.match(pattern)) {
        result += source.slice(0, match.index);
        result += String.interpret(replacement(match));
        source  = source.slice(match.index + match[0].length);
      } else {
        result += source, source = '';
      }
    }
    return result;
  }

  function sub(pattern, replacement, count) {
    replacement = prepareReplacement(replacement);
    count = Object.isUndefined(count) ? 1 : count;

    return this.gsub(pattern, function(match) {
      if (--count < 0) return match[0];
      return replacement(match);
    });
  }

  function scan(pattern, iterator) {
    this.gsub(pattern, iterator);
    return String(this);
  }

  function truncate(length, truncation) {
    length = length || 30;
    truncation = Object.isUndefined(truncation) ? '...' : truncation;
    return this.length > length ?
      this.slice(0, length - truncation.length) + truncation : String(this);
  }

  function strip() {
    return this.replace(/^\s+/, '').replace(/\s+$/, '');
  }

  function stripTags() {
    return this.replace(/<\w+(\s+("[^"]*"|'[^']*'|[^>])+)?>|<\/\w+>/gi, '');
  }

  function stripScripts() {
    return this.replace(new RegExp(Prototype.ScriptFragment, 'img'), '');
  }

  function extractScripts() {
    var matchAll = new RegExp(Prototype.ScriptFragment, 'img'),
        matchOne = new RegExp(Prototype.ScriptFragment, 'im');
    return (this.match(matchAll) || []).map(function(scriptTag) {
      return (scriptTag.match(matchOne) || ['', ''])[1];
    });
  }

  function evalScripts() {
    return this.extractScripts().map(function(script) { return eval(script) });
  }

  function escapeHTML() {
    return this.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function unescapeHTML() {
    return this.stripTags().replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
  }


  function toQueryParams(separator) {
    var match = this.strip().match(/([^?#]*)(#.*)?$/);
    if (!match) return { };

    return match[1].split(separator || '&').inject({ }, function(hash, pair) {
      if ((pair = pair.split('='))[0]) {
        var key = decodeURIComponent(pair.shift()),
            value = pair.length > 1 ? pair.join('=') : pair[0];

        if (value != undefined) value = decodeURIComponent(value);

        if (key in hash) {
          if (!Object.isArray(hash[key])) hash[key] = [hash[key]];
          hash[key].push(value);
        }
        else hash[key] = value;
      }
      return hash;
    });
  }

  function toArray() {
    return this.split('');
  }

  function succ() {
    return this.slice(0, this.length - 1) +
      String.fromCharCode(this.charCodeAt(this.length - 1) + 1);
  }

  function times(count) {
    return count < 1 ? '' : new Array(count + 1).join(this);
  }

  function camelize() {
    return this.replace(/-+(.)?/g, function(match, chr) {
      return chr ? chr.toUpperCase() : '';
    });
  }

  function capitalize() {
    return this.charAt(0).toUpperCase() + this.substring(1).toLowerCase();
  }

  function underscore() {
    return this.replace(/::/g, '/')
               .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
               .replace(/([a-z\d])([A-Z])/g, '$1_$2')
               .replace(/-/g, '_')
               .toLowerCase();
  }

  function dasherize() {
    return this.replace(/_/g, '-');
  }

  function inspect(useDoubleQuotes) {
    var escapedString = this.replace(/[\x00-\x1f\\]/g, function(character) {
      if (character in String.specialChar) {
        return String.specialChar[character];
      }
      return '\\u00' + character.charCodeAt().toPaddedString(2, 16);
    });
    if (useDoubleQuotes) return '"' + escapedString.replace(/"/g, '\\"') + '"';
    return "'" + escapedString.replace(/'/g, '\\\'') + "'";
  }

  function unfilterJSON(filter) {
    return this.replace(filter || Prototype.JSONFilter, '$1');
  }

  function isJSON() {
    var str = this;
    if (str.blank()) return false;
    str = str.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@');
    str = str.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']');
    str = str.replace(/(?:^|:|,)(?:\s*\[)+/g, '');
    return (/^[\],:{}\s]*$/).test(str);
  }

  function evalJSON(sanitize) {
    var json = this.unfilterJSON(),
        cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
    if (cx.test(json)) {
      json = json.replace(cx, function (a) {
        return '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
      });
    }
    try {
      if (!sanitize || json.isJSON()) return eval('(' + json + ')');
    } catch (e) { }
    throw new SyntaxError('Badly formed JSON string: ' + this.inspect());
  }

  function parseJSON() {
    var json = this.unfilterJSON();
    return JSON.parse(json);
  }

  function include(pattern) {
    return this.indexOf(pattern) > -1;
  }

  function startsWith(pattern) {
    return this.lastIndexOf(pattern, 0) === 0;
  }

  function endsWith(pattern) {
    var d = this.length - pattern.length;
    return d >= 0 && this.indexOf(pattern, d) === d;
  }

  function empty() {
    return this == '';
  }

  function blank() {
    return /^\s*$/.test(this);
  }

  function interpolate(object, pattern) {
    return new Template(this, pattern).evaluate(object);
  }

  return {
    gsub:           gsub,
    sub:            sub,
    scan:           scan,
    truncate:       truncate,
    strip:          String.prototype.trim || strip,
    stripTags:      stripTags,
    stripScripts:   stripScripts,
    extractScripts: extractScripts,
    evalScripts:    evalScripts,
    escapeHTML:     escapeHTML,
    unescapeHTML:   unescapeHTML,
    toQueryParams:  toQueryParams,
    parseQuery:     toQueryParams,
    toArray:        toArray,
    succ:           succ,
    times:          times,
    camelize:       camelize,
    capitalize:     capitalize,
    underscore:     underscore,
    dasherize:      dasherize,
    inspect:        inspect,
    unfilterJSON:   unfilterJSON,
    isJSON:         isJSON,
    evalJSON:       NATIVE_JSON_PARSE_SUPPORT ? parseJSON : evalJSON,
    include:        include,
    startsWith:     startsWith,
    endsWith:       endsWith,
    empty:          empty,
    blank:          blank,
    interpolate:    interpolate
  };
})());

var Template = Class.create({
  initialize: function(template, pattern) {
    this.template = template.toString();
    this.pattern = pattern || Template.Pattern;
  },

  evaluate: function(object) {
    if (object && Object.isFunction(object.toTemplateReplacements))
      object = object.toTemplateReplacements();

    return this.template.gsub(this.pattern, function(match) {
      if (object == null) return (match[1] + '');

      var before = match[1] || '';
      if (before == '\\') return match[2];

      var ctx = object, expr = match[3],
          pattern = /^([^.[]+|\[((?:.*?[^\\])?)\])(\.|\[|$)/;

      match = pattern.exec(expr);
      if (match == null) return before;

      while (match != null) {
        var comp = match[1].startsWith('[') ? match[2].replace(/\\\\]/g, ']') : match[1];
        ctx = ctx[comp];
        if (null == ctx || '' == match[3]) break;
        expr = expr.substring('[' == match[3] ? match[1].length : match[0].length);
        match = pattern.exec(expr);
      }

      return before + String.interpret(ctx);
    });
  }
});
Template.Pattern = /(^|.|\r|\n)(#\{(.*?)\})/;

var $break = { };

var Enumerable = (function() {
  function each(iterator, context) {
    var index = 0;
    try {
      this._each(function(value) {
        iterator.call(context, value, index++);
      });
    } catch (e) {
      if (e != $break) throw e;
    }
    return this;
  }

  function eachSlice(number, iterator, context) {
    var index = -number, slices = [], array = this.toArray();
    if (number < 1) return array;
    while ((index += number) < array.length)
      slices.push(array.slice(index, index+number));
    return slices.collect(iterator, context);
  }

  function all(iterator, context) {
    iterator = iterator || Prototype.K;
    var result = true;
    this.each(function(value, index) {
      result = result && !!iterator.call(context, value, index);
      if (!result) throw $break;
    });
    return result;
  }

  function any(iterator, context) {
    iterator = iterator || Prototype.K;
    var result = false;
    this.each(function(value, index) {
      if (result = !!iterator.call(context, value, index))
        throw $break;
    });
    return result;
  }

  function collect(iterator, context) {
    iterator = iterator || Prototype.K;
    var results = [];
    this.each(function(value, index) {
      results.push(iterator.call(context, value, index));
    });
    return results;
  }

  function detect(iterator, context) {
    var result;
    this.each(function(value, index) {
      if (iterator.call(context, value, index)) {
        result = value;
        throw $break;
      }
    });
    return result;
  }

  function findAll(iterator, context) {
    var results = [];
    this.each(function(value, index) {
      if (iterator.call(context, value, index))
        results.push(value);
    });
    return results;
  }

  function grep(filter, iterator, context) {
    iterator = iterator || Prototype.K;
    var results = [];

    if (Object.isString(filter))
      filter = new RegExp(RegExp.escape(filter));

    this.each(function(value, index) {
      if (filter.match(value))
        results.push(iterator.call(context, value, index));
    });
    return results;
  }

  function include(object) {
    if (Object.isFunction(this.indexOf))
      if (this.indexOf(object) != -1) return true;

    var found = false;
    this.each(function(value) {
      if (value == object) {
        found = true;
        throw $break;
      }
    });
    return found;
  }

  function inGroupsOf(number, fillWith) {
    fillWith = Object.isUndefined(fillWith) ? null : fillWith;
    return this.eachSlice(number, function(slice) {
      while(slice.length < number) slice.push(fillWith);
      return slice;
    });
  }

  function inject(memo, iterator, context) {
    this.each(function(value, index) {
      memo = iterator.call(context, memo, value, index);
    });
    return memo;
  }

  function invoke(method) {
    var args = $A(arguments).slice(1);
    return this.map(function(value) {
      return value[method].apply(value, args);
    });
  }

  function max(iterator, context) {
    iterator = iterator || Prototype.K;
    var result;
    this.each(function(value, index) {
      value = iterator.call(context, value, index);
      if (result == null || value >= result)
        result = value;
    });
    return result;
  }

  function min(iterator, context) {
    iterator = iterator || Prototype.K;
    var result;
    this.each(function(value, index) {
      value = iterator.call(context, value, index);
      if (result == null || value < result)
        result = value;
    });
    return result;
  }

  function partition(iterator, context) {
    iterator = iterator || Prototype.K;
    var trues = [], falses = [];
    this.each(function(value, index) {
      (iterator.call(context, value, index) ?
        trues : falses).push(value);
    });
    return [trues, falses];
  }

  function pluck(property) {
    var results = [];
    this.each(function(value) {
      results.push(value[property]);
    });
    return results;
  }

  function reject(iterator, context) {
    var results = [];
    this.each(function(value, index) {
      if (!iterator.call(context, value, index))
        results.push(value);
    });
    return results;
  }

  function sortBy(iterator, context) {
    return this.map(function(value, index) {
      return {
        value: value,
        criteria: iterator.call(context, value, index)
      };
    }).sort(function(left, right) {
      var a = left.criteria, b = right.criteria;
      return a < b ? -1 : a > b ? 1 : 0;
    }).pluck('value');
  }

  function toArray() {
    return this.map();
  }

  function zip() {
    var iterator = Prototype.K, args = $A(arguments);
    if (Object.isFunction(args.last()))
      iterator = args.pop();

    var collections = [this].concat(args).map($A);
    return this.map(function(value, index) {
      return iterator(collections.pluck(index));
    });
  }

  function size() {
    return this.toArray().length;
  }

  function inspect() {
    return '#<Enumerable:' + this.toArray().inspect() + '>';
  }









  return {
    each:       each,
    eachSlice:  eachSlice,
    all:        all,
    every:      all,
    any:        any,
    some:       any,
    collect:    collect,
    map:        collect,
    detect:     detect,
    findAll:    findAll,
    select:     findAll,
    filter:     findAll,
    grep:       grep,
    include:    include,
    member:     include,
    inGroupsOf: inGroupsOf,
    inject:     inject,
    invoke:     invoke,
    max:        max,
    min:        min,
    partition:  partition,
    pluck:      pluck,
    reject:     reject,
    sortBy:     sortBy,
    toArray:    toArray,
    entries:    toArray,
    zip:        zip,
    size:       size,
    inspect:    inspect,
    find:       detect
  };
})();

function $A(iterable) {
  if (!iterable) return [];
  if ('toArray' in Object(iterable)) return iterable.toArray();
  var length = iterable.length || 0, results = new Array(length);
  while (length--) results[length] = iterable[length];
  return results;
}


function $w(string) {
  if (!Object.isString(string)) return [];
  string = string.strip();
  return string ? string.split(/\s+/) : [];
}

Array.from = $A;


(function() {
  var arrayProto = Array.prototype,
      slice = arrayProto.slice,
      _each = arrayProto.forEach; // use native browser JS 1.6 implementation if available

  function each(iterator, context) {
    for (var i = 0, length = this.length >>> 0; i < length; i++) {
      if (i in this) iterator.call(context, this[i], i, this);
    }
  }
  if (!_each) _each = each;

  function clear() {
    this.length = 0;
    return this;
  }

  function first() {
    return this[0];
  }

  function last() {
    return this[this.length - 1];
  }

  function compact() {
    return this.select(function(value) {
      return value != null;
    });
  }

  function flatten() {
    return this.inject([], function(array, value) {
      if (Object.isArray(value))
        return array.concat(value.flatten());
      array.push(value);
      return array;
    });
  }

  function without() {
    var values = slice.call(arguments, 0);
    return this.select(function(value) {
      return !values.include(value);
    });
  }

  function reverse(inline) {
    return (inline === false ? this.toArray() : this)._reverse();
  }

  function uniq(sorted) {
    return this.inject([], function(array, value, index) {
      if (0 == index || (sorted ? array.last() != value : !array.include(value)))
        array.push(value);
      return array;
    });
  }

  function intersect(array) {
    return this.uniq().findAll(function(item) {
      return array.detect(function(value) { return item === value });
    });
  }


  function clone() {
    return slice.call(this, 0);
  }

  function size() {
    return this.length;
  }

  function inspect() {
    return '[' + this.map(Object.inspect).join(', ') + ']';
  }

  function indexOf(item, i) {
    i || (i = 0);
    var length = this.length;
    if (i < 0) i = length + i;
    for (; i < length; i++)
      if (this[i] === item) return i;
    return -1;
  }

  function lastIndexOf(item, i) {
    i = isNaN(i) ? this.length : (i < 0 ? this.length + i : i) + 1;
    var n = this.slice(0, i).reverse().indexOf(item);
    return (n < 0) ? n : i - n - 1;
  }

  function concat() {
    var array = slice.call(this, 0), item;
    for (var i = 0, length = arguments.length; i < length; i++) {
      item = arguments[i];
      if (Object.isArray(item) && !('callee' in item)) {
        for (var j = 0, arrayLength = item.length; j < arrayLength; j++)
          array.push(item[j]);
      } else {
        array.push(item);
      }
    }
    return array;
  }

  Object.extend(arrayProto, Enumerable);

  if (!arrayProto._reverse)
    arrayProto._reverse = arrayProto.reverse;

  Object.extend(arrayProto, {
    _each:     _each,
    clear:     clear,
    first:     first,
    last:      last,
    compact:   compact,
    flatten:   flatten,
    without:   without,
    reverse:   reverse,
    uniq:      uniq,
    intersect: intersect,
    clone:     clone,
    toArray:   clone,
    size:      size,
    inspect:   inspect
  });

  var CONCAT_ARGUMENTS_BUGGY = (function() {
    return [].concat(arguments)[0][0] !== 1;
  })(1,2)

  if (CONCAT_ARGUMENTS_BUGGY) arrayProto.concat = concat;

  if (!arrayProto.indexOf) arrayProto.indexOf = indexOf;
  if (!arrayProto.lastIndexOf) arrayProto.lastIndexOf = lastIndexOf;
})();
function $H(object) {
  return new Hash(object);
};

var Hash = Class.create(Enumerable, (function() {
  function initialize(object) {
    this._object = Object.isHash(object) ? object.toObject() : Object.clone(object);
  }


  function _each(iterator) {
    for (var key in this._object) {
      var value = this._object[key], pair = [key, value];
      pair.key = key;
      pair.value = value;
      iterator(pair);
    }
  }

  function set(key, value) {
    return this._object[key] = value;
  }

  function get(key) {
    if (this._object[key] !== Object.prototype[key])
      return this._object[key];
  }

  function unset(key) {
    var value = this._object[key];
    delete this._object[key];
    return value;
  }

  function toObject() {
    return Object.clone(this._object);
  }



  function keys() {
    return this.pluck('key');
  }

  function values() {
    return this.pluck('value');
  }

  function index(value) {
    var match = this.detect(function(pair) {
      return pair.value === value;
    });
    return match && match.key;
  }

  function merge(object) {
    return this.clone().update(object);
  }

  function update(object) {
    return new Hash(object).inject(this, function(result, pair) {
      result.set(pair.key, pair.value);
      return result;
    });
  }

  function toQueryPair(key, value) {
    if (Object.isUndefined(value)) return key;
    return key + '=' + encodeURIComponent(String.interpret(value));
  }

  function toQueryString() {
    return this.inject([], function(results, pair) {
      var key = encodeURIComponent(pair.key), values = pair.value;

      if (values && typeof values == 'object') {
        if (Object.isArray(values)) {
          var queryValues = [];
          for (var i = 0, len = values.length, value; i < len; i++) {
            value = values[i];
            queryValues.push(toQueryPair(key, value));
          }
          return results.concat(queryValues);
        }
      } else results.push(toQueryPair(key, values));
      return results;
    }).join('&');
  }

  function inspect() {
    return '#<Hash:{' + this.map(function(pair) {
      return pair.map(Object.inspect).join(': ');
    }).join(', ') + '}>';
  }

  function clone() {
    return new Hash(this);
  }

  return {
    initialize:             initialize,
    _each:                  _each,
    set:                    set,
    get:                    get,
    unset:                  unset,
    toObject:               toObject,
    toTemplateReplacements: toObject,
    keys:                   keys,
    values:                 values,
    index:                  index,
    merge:                  merge,
    update:                 update,
    toQueryString:          toQueryString,
    inspect:                inspect,
    toJSON:                 toObject,
    clone:                  clone
  };
})());

Hash.from = $H;
Object.extend(Number.prototype, (function() {
  function toColorPart() {
    return this.toPaddedString(2, 16);
  }

  function succ() {
    return this + 1;
  }

  function times(iterator, context) {
    $R(0, this, true).each(iterator, context);
    return this;
  }

  function toPaddedString(length, radix) {
    var string = this.toString(radix || 10);
    return '0'.times(length - string.length) + string;
  }

  function abs() {
    return Math.abs(this);
  }

  function round() {
    return Math.round(this);
  }

  function ceil() {
    return Math.ceil(this);
  }

  function floor() {
    return Math.floor(this);
  }

  return {
    toColorPart:    toColorPart,
    succ:           succ,
    times:          times,
    toPaddedString: toPaddedString,
    abs:            abs,
    round:          round,
    ceil:           ceil,
    floor:          floor
  };
})());

function $R(start, end, exclusive) {
  return new ObjectRange(start, end, exclusive);
}

var ObjectRange = Class.create(Enumerable, (function() {
  function initialize(start, end, exclusive) {
    this.start = start;
    this.end = end;
    this.exclusive = exclusive;
  }

  function _each(iterator) {
    var value = this.start;
    while (this.include(value)) {
      iterator(value);
      value = value.succ();
    }
  }

  function include(value) {
    if (value < this.start)
      return false;
    if (this.exclusive)
      return value < this.end;
    return value <= this.end;
  }

  return {
    initialize: initialize,
    _each:      _each,
    include:    include
  };
})());



var Ajax = {
  getTransport: function() {
    return Try.these(
      function() {return new XMLHttpRequest()},
      function() {return new ActiveXObject('Msxml2.XMLHTTP')},
      function() {return new ActiveXObject('Microsoft.XMLHTTP')}
    ) || false;
  },

  activeRequestCount: 0
};

Ajax.Responders = {
  responders: [],

  _each: function(iterator) {
    this.responders._each(iterator);
  },

  register: function(responder) {
    if (!this.include(responder))
      this.responders.push(responder);
  },

  unregister: function(responder) {
    this.responders = this.responders.without(responder);
  },

  dispatch: function(callback, request, transport, json) {
    this.each(function(responder) {
      if (Object.isFunction(responder[callback])) {
        try {
          responder[callback].apply(responder, [request, transport, json]);
        } catch (e) { }
      }
    });
  }
};

Object.extend(Ajax.Responders, Enumerable);

Ajax.Responders.register({
  onCreate:   function() { Ajax.activeRequestCount++ },
  onComplete: function() { Ajax.activeRequestCount-- }
});
Ajax.Base = Class.create({
  initialize: function(options) {
    this.options = {
      method:       'post',
      asynchronous: true,
      contentType:  'application/x-www-form-urlencoded',
      encoding:     'UTF-8',
      parameters:   '',
      evalJSON:     true,
      evalJS:       true
    };
    Object.extend(this.options, options || { });

    this.options.method = this.options.method.toLowerCase();

    if (Object.isHash(this.options.parameters))
      this.options.parameters = this.options.parameters.toObject();
  }
});
Ajax.Request = Class.create(Ajax.Base, {
  _complete: false,

  initialize: function($super, url, options) {
    $super(options);
    this.transport = Ajax.getTransport();
    this.request(url);
  },

  request: function(url) {
    this.url = url;
    this.method = this.options.method;
    var params = Object.isString(this.options.parameters) ?
          this.options.parameters :
          Object.toQueryString(this.options.parameters);

    if (!['get', 'post'].include(this.method)) {
      params += (params ? '&' : '') + "_method=" + this.method;
      this.method = 'post';
    }

    if (params && this.method === 'get') {
      this.url += (this.url.include('?') ? '&' : '?') + params;
    }

    this.parameters = params.toQueryParams();

    try {
      var response = new Ajax.Response(this);
      if (this.options.onCreate) this.options.onCreate(response);
      Ajax.Responders.dispatch('onCreate', this, response);

      this.transport.open(this.method.toUpperCase(), this.url,
        this.options.asynchronous);

      if (this.options.asynchronous) this.respondToReadyState.bind(this).defer(1);

      this.transport.onreadystatechange = this.onStateChange.bind(this);
      this.setRequestHeaders();

      this.body = this.method == 'post' ? (this.options.postBody || params) : null;
      this.transport.send(this.body);

      /* Force Firefox to handle ready state 4 for synchronous requests */
      if (!this.options.asynchronous && this.transport.overrideMimeType)
        this.onStateChange();

    }
    catch (e) {
      this.dispatchException(e);
    }
  },

  onStateChange: function() {
    var readyState = this.transport.readyState;
    if (readyState > 1 && !((readyState == 4) && this._complete))
      this.respondToReadyState(this.transport.readyState);
  },

  setRequestHeaders: function() {
    var headers = {
      'X-Requested-With': 'XMLHttpRequest',
      'X-Prototype-Version': Prototype.Version,
      'Accept': 'text/javascript, text/html, application/xml, text/xml, */*'
    };

    if (this.method == 'post') {
      headers['Content-type'] = this.options.contentType +
        (this.options.encoding ? '; charset=' + this.options.encoding : '');

      /* Force "Connection: close" for older Mozilla browsers to work
       * around a bug where XMLHttpRequest sends an incorrect
       * Content-length header. See Mozilla Bugzilla #246651.
       */
      if (this.transport.overrideMimeType &&
          (navigator.userAgent.match(/Gecko\/(\d{4})/) || [0,2005])[1] < 2005)
            headers['Connection'] = 'close';
    }

    if (typeof this.options.requestHeaders == 'object') {
      var extras = this.options.requestHeaders;

      if (Object.isFunction(extras.push))
        for (var i = 0, length = extras.length; i < length; i += 2)
          headers[extras[i]] = extras[i+1];
      else
        $H(extras).each(function(pair) { headers[pair.key] = pair.value });
    }

    for (var name in headers)
      this.transport.setRequestHeader(name, headers[name]);
  },

  success: function() {
    var status = this.getStatus();
    return !status || (status >= 200 && status < 300) || status == 304;
  },

  getStatus: function() {
    try {
      if (this.transport.status === 1223) return 204;
      return this.transport.status || 0;
    } catch (e) { return 0 }
  },

  respondToReadyState: function(readyState) {
    var state = Ajax.Request.Events[readyState], response = new Ajax.Response(this);

    if (state == 'Complete') {
      try {
        this._complete = true;
        (this.options['on' + response.status]
         || this.options['on' + (this.success() ? 'Success' : 'Failure')]
         || Prototype.emptyFunction)(response, response.headerJSON);
      } catch (e) {
        this.dispatchException(e);
      }

      var contentType = response.getHeader('Content-type');
      if (this.options.evalJS == 'force'
          || (this.options.evalJS && this.isSameOrigin() && contentType
          && contentType.match(/^\s*(text|application)\/(x-)?(java|ecma)script(;.*)?\s*$/i)))
        this.evalResponse();
    }

    try {
      (this.options['on' + state] || Prototype.emptyFunction)(response, response.headerJSON);
      Ajax.Responders.dispatch('on' + state, this, response, response.headerJSON);
    } catch (e) {
      this.dispatchException(e);
    }

    if (state == 'Complete') {
      this.transport.onreadystatechange = Prototype.emptyFunction;
    }
  },

  isSameOrigin: function() {
    var m = this.url.match(/^\s*https?:\/\/[^\/]*/);
    return !m || (m[0] == '#{protocol}//#{domain}#{port}'.interpolate({
      protocol: location.protocol,
      domain: document.domain,
      port: location.port ? ':' + location.port : ''
    }));
  },

  getHeader: function(name) {
    try {
      return this.transport.getResponseHeader(name) || null;
    } catch (e) { return null; }
  },

  evalResponse: function() {
    try {
      return eval((this.transport.responseText || '').unfilterJSON());
    } catch (e) {
      this.dispatchException(e);
    }
  },

  dispatchException: function(exception) {
    (this.options.onException || Prototype.emptyFunction)(this, exception);
    Ajax.Responders.dispatch('onException', this, exception);
  }
});

Ajax.Request.Events =
  ['Uninitialized', 'Loading', 'Loaded', 'Interactive', 'Complete'];








Ajax.Response = Class.create({
  initialize: function(request){
    this.request = request;
    var transport  = this.transport  = request.transport,
        readyState = this.readyState = transport.readyState;

    if ((readyState > 2 && !Prototype.Browser.IE) || readyState == 4) {
      this.status       = this.getStatus();
      this.statusText   = this.getStatusText();
      this.responseText = String.interpret(transport.responseText);
      this.headerJSON   = this._getHeaderJSON();
    }

    if (readyState == 4) {
      var xml = transport.responseXML;
      this.responseXML  = Object.isUndefined(xml) ? null : xml;
      this.responseJSON = this._getResponseJSON();
    }
  },

  status:      0,

  statusText: '',

  getStatus: Ajax.Request.prototype.getStatus,

  getStatusText: function() {
    try {
      return this.transport.statusText || '';
    } catch (e) { return '' }
  },

  getHeader: Ajax.Request.prototype.getHeader,

  getAllHeaders: function() {
    try {
      return this.getAllResponseHeaders();
    } catch (e) { return null }
  },

  getResponseHeader: function(name) {
    return this.transport.getResponseHeader(name);
  },

  getAllResponseHeaders: function() {
    return this.transport.getAllResponseHeaders();
  },

  _getHeaderJSON: function() {
    var json = this.getHeader('X-JSON');
    if (!json) return null;
    json = decodeURIComponent(escape(json));
    try {
      return json.evalJSON(this.request.options.sanitizeJSON ||
        !this.request.isSameOrigin());
    } catch (e) {
      this.request.dispatchException(e);
    }
  },

  _getResponseJSON: function() {
    var options = this.request.options;
    if (!options.evalJSON || (options.evalJSON != 'force' &&
      !(this.getHeader('Content-type') || '').include('application/json')) ||
        this.responseText.blank())
          return null;
    try {
      return this.responseText.evalJSON(options.sanitizeJSON ||
        !this.request.isSameOrigin());
    } catch (e) {
      this.request.dispatchException(e);
    }
  }
});

Ajax.Updater = Class.create(Ajax.Request, {
  initialize: function($super, container, url, options) {
    this.container = {
      success: (container.success || container),
      failure: (container.failure || (container.success ? null : container))
    };

    options = Object.clone(options);
    var onComplete = options.onComplete;
    options.onComplete = (function(response, json) {
      this.updateContent(response.responseText);
      if (Object.isFunction(onComplete)) onComplete(response, json);
    }).bind(this);

    $super(url, options);
  },

  updateContent: function(responseText) {
    var receiver = this.container[this.success() ? 'success' : 'failure'],
        options = this.options;

    if (!options.evalScripts) responseText = responseText.stripScripts();

    if (receiver = $(receiver)) {
      if (options.insertion) {
        if (Object.isString(options.insertion)) {
          var insertion = { }; insertion[options.insertion] = responseText;
          receiver.insert(insertion);
        }
        else options.insertion(receiver, responseText);
      }
      else receiver.update(responseText);
    }
  }
});

Ajax.PeriodicalUpdater = Class.create(Ajax.Base, {
  initialize: function($super, container, url, options) {
    $super(options);
    this.onComplete = this.options.onComplete;

    this.frequency = (this.options.frequency || 2);
    this.decay = (this.options.decay || 1);

    this.updater = { };
    this.container = container;
    this.url = url;

    this.start();
  },

  start: function() {
    this.options.onComplete = this.updateComplete.bind(this);
    this.onTimerEvent();
  },

  stop: function() {
    this.updater.options.onComplete = undefined;
    clearTimeout(this.timer);
    (this.onComplete || Prototype.emptyFunction).apply(this, arguments);
  },

  updateComplete: function(response) {
    if (this.options.decay) {
      this.decay = (response.responseText == this.lastText ?
        this.decay * this.options.decay : 1);

      this.lastText = response.responseText;
    }
    this.timer = this.onTimerEvent.bind(this).delay(this.decay * this.frequency);
  },

  onTimerEvent: function() {
    this.updater = new Ajax.Updater(this.container, this.url, this.options);
  }
});


function $(element) {
  if (arguments.length > 1) {
    for (var i = 0, elements = [], length = arguments.length; i < length; i++)
      elements.push($(arguments[i]));
    return elements;
  }
  if (Object.isString(element))
    element = document.getElementById(element);
  return Element.extend(element);
}

if (Prototype.BrowserFeatures.XPath) {
  document._getElementsByXPath = function(expression, parentElement) {
    var results = [];
    var query = document.evaluate(expression, $(parentElement) || document,
      null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    for (var i = 0, length = query.snapshotLength; i < length; i++)
      results.push(Element.extend(query.snapshotItem(i)));
    return results;
  };
}

/*--------------------------------------------------------------------------*/

if (!Node) var Node = { };

if (!Node.ELEMENT_NODE) {
  Object.extend(Node, {
    ELEMENT_NODE: 1,
    ATTRIBUTE_NODE: 2,
    TEXT_NODE: 3,
    CDATA_SECTION_NODE: 4,
    ENTITY_REFERENCE_NODE: 5,
    ENTITY_NODE: 6,
    PROCESSING_INSTRUCTION_NODE: 7,
    COMMENT_NODE: 8,
    DOCUMENT_NODE: 9,
    DOCUMENT_TYPE_NODE: 10,
    DOCUMENT_FRAGMENT_NODE: 11,
    NOTATION_NODE: 12
  });
}



(function(global) {
  function shouldUseCache(tagName, attributes) {
    if (tagName === 'select') return false;
    if ('type' in attributes) return false;
    return true;
  }

  var HAS_EXTENDED_CREATE_ELEMENT_SYNTAX = (function(){
    try {
      var el = document.createElement('<input name="x">');
      return el.tagName.toLowerCase() === 'input' && el.name === 'x';
    }
    catch(err) {
      return false;
    }
  })();

  var element = global.Element;

  global.Element = function(tagName, attributes) {
    attributes = attributes || { };
    tagName = tagName.toLowerCase();
    var cache = Element.cache;

    if (HAS_EXTENDED_CREATE_ELEMENT_SYNTAX && attributes.name) {
      tagName = '<' + tagName + ' name="' + attributes.name + '">';
      delete attributes.name;
      return Element.writeAttribute(document.createElement(tagName), attributes);
    }

    if (!cache[tagName]) cache[tagName] = Element.extend(document.createElement(tagName));

    var node = shouldUseCache(tagName, attributes) ?
     cache[tagName].cloneNode(false) : document.createElement(tagName);

    return Element.writeAttribute(node, attributes);
  };

  Object.extend(global.Element, element || { });
  if (element) global.Element.prototype = element.prototype;

})(this);

Element.idCounter = 1;
Element.cache = { };

Element._purgeElement = function(element) {
  var uid = element._prototypeUID;
  if (uid) {
    Element.stopObserving(element);
    element._prototypeUID = void 0;
    delete Element.Storage[uid];
  }
}

Element.Methods = {
  visible: function(element) {
    return $(element).style.display != 'none';
  },

  toggle: function(element) {
    element = $(element);
    Element[Element.visible(element) ? 'hide' : 'show'](element);
    return element;
  },

  hide: function(element) {
    element = $(element);
    element.style.display = 'none';
    return element;
  },

  show: function(element) {
    element = $(element);
    element.style.display = '';
    return element;
  },

  remove: function(element) {
    element = $(element);
    element.parentNode.removeChild(element);
    return element;
  },

  update: (function(){

    var SELECT_ELEMENT_INNERHTML_BUGGY = (function(){
      var el = document.createElement("select"),
          isBuggy = true;
      el.innerHTML = "<option value=\"test\">test</option>";
      if (el.options && el.options[0]) {
        isBuggy = el.options[0].nodeName.toUpperCase() !== "OPTION";
      }
      el = null;
      return isBuggy;
    })();

    var TABLE_ELEMENT_INNERHTML_BUGGY = (function(){
      try {
        var el = document.createElement("table");
        if (el && el.tBodies) {
          el.innerHTML = "<tbody><tr><td>test</td></tr></tbody>";
          var isBuggy = typeof el.tBodies[0] == "undefined";
          el = null;
          return isBuggy;
        }
      } catch (e) {
        return true;
      }
    })();

    var LINK_ELEMENT_INNERHTML_BUGGY = (function() {
      try {
        var el = document.createElement('div');
        el.innerHTML = "<link>";
        var isBuggy = (el.childNodes.length === 0);
        el = null;
        return isBuggy;
      } catch(e) {
        return true;
      }
    })();

    var ANY_INNERHTML_BUGGY = SELECT_ELEMENT_INNERHTML_BUGGY ||
     TABLE_ELEMENT_INNERHTML_BUGGY || LINK_ELEMENT_INNERHTML_BUGGY;

    var SCRIPT_ELEMENT_REJECTS_TEXTNODE_APPENDING = (function () {
      var s = document.createElement("script"),
          isBuggy = false;
      try {
        s.appendChild(document.createTextNode(""));
        isBuggy = !s.firstChild ||
          s.firstChild && s.firstChild.nodeType !== 3;
      } catch (e) {
        isBuggy = true;
      }
      s = null;
      return isBuggy;
    })();


    function update(element, content) {
      element = $(element);
      var purgeElement = Element._purgeElement;

      var descendants = element.getElementsByTagName('*'),
       i = descendants.length;
      while (i--) purgeElement(descendants[i]);

      if (content && content.toElement)
        content = content.toElement();

      if (Object.isElement(content))
        return element.update().insert(content);

      content = Object.toHTML(content);

      var tagName = element.tagName.toUpperCase();

      if (tagName === 'SCRIPT' && SCRIPT_ELEMENT_REJECTS_TEXTNODE_APPENDING) {
        element.text = content;
        return element;
      }

      if (ANY_INNERHTML_BUGGY) {
        if (tagName in Element._insertionTranslations.tags) {
          while (element.firstChild) {
            element.removeChild(element.firstChild);
          }
          Element._getContentFromAnonymousElement(tagName, content.stripScripts())
            .each(function(node) {
              element.appendChild(node)
            });
        } else if (LINK_ELEMENT_INNERHTML_BUGGY && Object.isString(content) && content.indexOf('<link') > -1) {
          while (element.firstChild) {
            element.removeChild(element.firstChild);
          }
          var nodes = Element._getContentFromAnonymousElement(tagName, content.stripScripts(), true);
          nodes.each(function(node) { element.appendChild(node) });
        }
        else {
          element.innerHTML = content.stripScripts();
        }
      }
      else {
        element.innerHTML = content.stripScripts();
      }

      content.evalScripts.bind(content).defer();
      return element;
    }

    return update;
  })(),

  replace: function(element, content) {
    element = $(element);
    if (content && content.toElement) content = content.toElement();
    else if (!Object.isElement(content)) {
      content = Object.toHTML(content);
      var range = element.ownerDocument.createRange();
      range.selectNode(element);
      content.evalScripts.bind(content).defer();
      content = range.createContextualFragment(content.stripScripts());
    }
    element.parentNode.replaceChild(content, element);
    return element;
  },

  insert: function(element, insertions) {
    element = $(element);

    if (Object.isString(insertions) || Object.isNumber(insertions) ||
        Object.isElement(insertions) || (insertions && (insertions.toElement || insertions.toHTML)))
          insertions = {bottom:insertions};

    var content, insert, tagName, childNodes;

    for (var position in insertions) {
      content  = insertions[position];
      position = position.toLowerCase();
      insert = Element._insertionTranslations[position];

      if (content && content.toElement) content = content.toElement();
      if (Object.isElement(content)) {
        insert(element, content);
        continue;
      }

      content = Object.toHTML(content);

      tagName = ((position == 'before' || position == 'after')
        ? element.parentNode : element).tagName.toUpperCase();

      childNodes = Element._getContentFromAnonymousElement(tagName, content.stripScripts());

      if (position == 'top' || position == 'after') childNodes.reverse();
      childNodes.each(insert.curry(element));

      content.evalScripts.bind(content).defer();
    }

    return element;
  },

  wrap: function(element, wrapper, attributes) {
    element = $(element);
    if (Object.isElement(wrapper))
      $(wrapper).writeAttribute(attributes || { });
    else if (Object.isString(wrapper)) wrapper = new Element(wrapper, attributes);
    else wrapper = new Element('div', wrapper);
    if (element.parentNode)
      element.parentNode.replaceChild(wrapper, element);
    wrapper.appendChild(element);
    return wrapper;
  },

  inspect: function(element) {
    element = $(element);
    var result = '<' + element.tagName.toLowerCase();
    $H({'id': 'id', 'className': 'class'}).each(function(pair) {
      var property = pair.first(),
          attribute = pair.last(),
          value = (element[property] || '').toString();
      if (value) result += ' ' + attribute + '=' + value.inspect(true);
    });
    return result + '>';
  },

  recursivelyCollect: function(element, property, maximumLength) {
    element = $(element);
    maximumLength = maximumLength || -1;
    var elements = [];

    while (element = element[property]) {
      if (element.nodeType == 1)
        elements.push(Element.extend(element));
      if (elements.length == maximumLength)
        break;
    }

    return elements;
  },

  ancestors: function(element) {
    return Element.recursivelyCollect(element, 'parentNode');
  },

  descendants: function(element) {
    return Element.select(element, "*");
  },

  firstDescendant: function(element) {
    element = $(element).firstChild;
    while (element && element.nodeType != 1) element = element.nextSibling;
    return $(element);
  },

  immediateDescendants: function(element) {
    var results = [], child = $(element).firstChild;
    while (child) {
      if (child.nodeType === 1) {
        results.push(Element.extend(child));
      }
      child = child.nextSibling;
    }
    return results;
  },

  previousSiblings: function(element, maximumLength) {
    return Element.recursivelyCollect(element, 'previousSibling');
  },

  nextSiblings: function(element) {
    return Element.recursivelyCollect(element, 'nextSibling');
  },

  siblings: function(element) {
    element = $(element);
    return Element.previousSiblings(element).reverse()
      .concat(Element.nextSiblings(element));
  },

  match: function(element, selector) {
    element = $(element);
    if (Object.isString(selector))
      return Prototype.Selector.match(element, selector);
    return selector.match(element);
  },

  up: function(element, expression, index) {
    element = $(element);
    if (arguments.length == 1) return $(element.parentNode);
    var ancestors = Element.ancestors(element);
    return Object.isNumber(expression) ? ancestors[expression] :
      Prototype.Selector.find(ancestors, expression, index);
  },

  down: function(element, expression, index) {
    element = $(element);
    if (arguments.length == 1) return Element.firstDescendant(element);
    return Object.isNumber(expression) ? Element.descendants(element)[expression] :
      Element.select(element, expression)[index || 0];
  },

  previous: function(element, expression, index) {
    element = $(element);
    if (Object.isNumber(expression)) index = expression, expression = false;
    if (!Object.isNumber(index)) index = 0;

    if (expression) {
      return Prototype.Selector.find(element.previousSiblings(), expression, index);
    } else {
      return element.recursivelyCollect("previousSibling", index + 1)[index];
    }
  },

  next: function(element, expression, index) {
    element = $(element);
    if (Object.isNumber(expression)) index = expression, expression = false;
    if (!Object.isNumber(index)) index = 0;

    if (expression) {
      return Prototype.Selector.find(element.nextSiblings(), expression, index);
    } else {
      var maximumLength = Object.isNumber(index) ? index + 1 : 1;
      return element.recursivelyCollect("nextSibling", index + 1)[index];
    }
  },


  select: function(element) {
    element = $(element);
    var expressions = Array.prototype.slice.call(arguments, 1).join(', ');
    return Prototype.Selector.select(expressions, element);
  },

  adjacent: function(element) {
    element = $(element);
    var expressions = Array.prototype.slice.call(arguments, 1).join(', ');
    return Prototype.Selector.select(expressions, element.parentNode).without(element);
  },

  identify: function(element) {
    element = $(element);
    var id = Element.readAttribute(element, 'id');
    if (id) return id;
    do { id = 'anonymous_element_' + Element.idCounter++ } while ($(id));
    Element.writeAttribute(element, 'id', id);
    return id;
  },

  readAttribute: function(element, name) {
    element = $(element);
    if (Prototype.Browser.IE) {
      var t = Element._attributeTranslations.read;
      if (t.values[name]) return t.values[name](element, name);
      if (t.names[name]) name = t.names[name];
      if (name.include(':')) {
        return (!element.attributes || !element.attributes[name]) ? null :
         element.attributes[name].value;
      }
    }
    return element.getAttribute(name);
  },

  writeAttribute: function(element, name, value) {
    element = $(element);
    var attributes = { }, t = Element._attributeTranslations.write;

    if (typeof name == 'object') attributes = name;
    else attributes[name] = Object.isUndefined(value) ? true : value;

    for (var attr in attributes) {
      name = t.names[attr] || attr;
      value = attributes[attr];
      if (t.values[attr]) name = t.values[attr](element, value);
      if (value === false || value === null)
        element.removeAttribute(name);
      else if (value === true)
        element.setAttribute(name, name);
      else element.setAttribute(name, value);
    }
    return element;
  },

  getHeight: function(element) {
    return Element.getDimensions(element).height;
  },

  getWidth: function(element) {
    return Element.getDimensions(element).width;
  },

  classNames: function(element) {
    return new Element.ClassNames(element);
  },

  hasClassName: function(element, className) {
    if (!(element = $(element))) return;
    var elementClassName = element.className;
    return (elementClassName.length > 0 && (elementClassName == className ||
      new RegExp("(^|\\s)" + className + "(\\s|$)").test(elementClassName)));
  },

  addClassName: function(element, className) {
    if (!(element = $(element))) return;
    if (!Element.hasClassName(element, className))
      element.className += (element.className ? ' ' : '') + className;
    return element;
  },

  removeClassName: function(element, className) {
    if (!(element = $(element))) return;
    element.className = element.className.replace(
      new RegExp("(^|\\s+)" + className + "(\\s+|$)"), ' ').strip();
    return element;
  },

  toggleClassName: function(element, className) {
    if (!(element = $(element))) return;
    return Element[Element.hasClassName(element, className) ?
      'removeClassName' : 'addClassName'](element, className);
  },

  cleanWhitespace: function(element) {
    element = $(element);
    var node = element.firstChild;
    while (node) {
      var nextNode = node.nextSibling;
      if (node.nodeType == 3 && !/\S/.test(node.nodeValue))
        element.removeChild(node);
      node = nextNode;
    }
    return element;
  },

  empty: function(element) {
    return $(element).innerHTML.blank();
  },

  descendantOf: function(element, ancestor) {
    element = $(element), ancestor = $(ancestor);

    if (element.compareDocumentPosition)
      return (element.compareDocumentPosition(ancestor) & 8) === 8;

    if (ancestor.contains)
      return ancestor.contains(element) && ancestor !== element;

    while (element = element.parentNode)
      if (element == ancestor) return true;

    return false;
  },

  scrollTo: function(element) {
    element = $(element);
    var pos = Element.cumulativeOffset(element);
    window.scrollTo(pos[0], pos[1]);
    return element;
  },

  getStyle: function(element, style) {
    element = $(element);
    style = style == 'float' ? 'cssFloat' : style.camelize();
    var value = element.style[style];
    if (!value || value == 'auto') {
      var css = document.defaultView.getComputedStyle(element, null);
      value = css ? css[style] : null;
    }
    if (style == 'opacity') return value ? parseFloat(value) : 1.0;
    return value == 'auto' ? null : value;
  },

  getOpacity: function(element) {
    return $(element).getStyle('opacity');
  },

  setStyle: function(element, styles) {
    element = $(element);
    var elementStyle = element.style, match;
    if (Object.isString(styles)) {
      element.style.cssText += ';' + styles;
      return styles.include('opacity') ?
        element.setOpacity(styles.match(/opacity:\s*(\d?\.?\d*)/)[1]) : element;
    }
    for (var property in styles)
      if (property == 'opacity') element.setOpacity(styles[property]);
      else
        elementStyle[(property == 'float' || property == 'cssFloat') ?
          (Object.isUndefined(elementStyle.styleFloat) ? 'cssFloat' : 'styleFloat') :
            property] = styles[property];

    return element;
  },

  setOpacity: function(element, value) {
    element = $(element);
    element.style.opacity = (value == 1 || value === '') ? '' :
      (value < 0.00001) ? 0 : value;
    return element;
  },

  makePositioned: function(element) {
    element = $(element);
    var pos = Element.getStyle(element, 'position');
    if (pos == 'static' || !pos) {
      element._madePositioned = true;
      element.style.position = 'relative';
      if (Prototype.Browser.Opera) {
        element.style.top = 0;
        element.style.left = 0;
      }
    }
    return element;
  },

  undoPositioned: function(element) {
    element = $(element);
    if (element._madePositioned) {
      element._madePositioned = undefined;
      element.style.position =
        element.style.top =
        element.style.left =
        element.style.bottom =
        element.style.right = '';
    }
    return element;
  },

  makeClipping: function(element) {
    element = $(element);
    if (element._overflow) return element;
    element._overflow = Element.getStyle(element, 'overflow') || 'auto';
    if (element._overflow !== 'hidden')
      element.style.overflow = 'hidden';
    return element;
  },

  undoClipping: function(element) {
    element = $(element);
    if (!element._overflow) return element;
    element.style.overflow = element._overflow == 'auto' ? '' : element._overflow;
    element._overflow = null;
    return element;
  },

  clonePosition: function(element, source) {
    var options = Object.extend({
      setLeft:    true,
      setTop:     true,
      setWidth:   true,
      setHeight:  true,
      offsetTop:  0,
      offsetLeft: 0
    }, arguments[2] || { });

    source = $(source);
    var p = Element.viewportOffset(source), delta = [0, 0], parent = null;

    element = $(element);

    if (Element.getStyle(element, 'position') == 'absolute') {
      parent = Element.getOffsetParent(element);
      delta = Element.viewportOffset(parent);
    }

    if (parent == document.body) {
      delta[0] -= document.body.offsetLeft;
      delta[1] -= document.body.offsetTop;
    }

    if (options.setLeft)   element.style.left  = (p[0] - delta[0] + options.offsetLeft) + 'px';
    if (options.setTop)    element.style.top   = (p[1] - delta[1] + options.offsetTop) + 'px';
    if (options.setWidth)  element.style.width = source.offsetWidth + 'px';
    if (options.setHeight) element.style.height = source.offsetHeight + 'px';
    return element;
  }
};

Object.extend(Element.Methods, {
  getElementsBySelector: Element.Methods.select,

  childElements: Element.Methods.immediateDescendants
});

Element._attributeTranslations = {
  write: {
    names: {
      className: 'class',
      htmlFor:   'for'
    },
    values: { }
  }
};

if (Prototype.Browser.Opera) {
  Element.Methods.getStyle = Element.Methods.getStyle.wrap(
    function(proceed, element, style) {
      switch (style) {
        case 'height': case 'width':
          if (!Element.visible(element)) return null;

          var dim = parseInt(proceed(element, style), 10);

          if (dim !== element['offset' + style.capitalize()])
            return dim + 'px';

          var properties;
          if (style === 'height') {
            properties = ['border-top-width', 'padding-top',
             'padding-bottom', 'border-bottom-width'];
          }
          else {
            properties = ['border-left-width', 'padding-left',
             'padding-right', 'border-right-width'];
          }
          return properties.inject(dim, function(memo, property) {
            var val = proceed(element, property);
            return val === null ? memo : memo - parseInt(val, 10);
          }) + 'px';
        default: return proceed(element, style);
      }
    }
  );

  Element.Methods.readAttribute = Element.Methods.readAttribute.wrap(
    function(proceed, element, attribute) {
      if (attribute === 'title') return element.title;
      return proceed(element, attribute);
    }
  );
}

else if (Prototype.Browser.IE) {
  Element.Methods.getStyle = function(element, style) {
    element = $(element);
    style = (style == 'float' || style == 'cssFloat') ? 'styleFloat' : style.camelize();
    var value = element.style[style];
    if (!value && element.currentStyle) value = element.currentStyle[style];

    if (style == 'opacity') {
      if (value = (element.getStyle('filter') || '').match(/alpha\(opacity=(.*)\)/))
        if (value[1]) return parseFloat(value[1]) / 100;
      return 1.0;
    }

    if (value == 'auto') {
      if ((style == 'width' || style == 'height') && (element.getStyle('display') != 'none'))
        return element['offset' + style.capitalize()] + 'px';
      return null;
    }
    return value;
  };

  Element.Methods.setOpacity = function(element, value) {
    function stripAlpha(filter){
      return filter.replace(/alpha\([^\)]*\)/gi,'');
    }
    element = $(element);
    var currentStyle = element.currentStyle;
    if ((currentStyle && !currentStyle.hasLayout) ||
      (!currentStyle && element.style.zoom == 'normal'))
        element.style.zoom = 1;

    var filter = element.getStyle('filter'), style = element.style;
    if (value == 1 || value === '') {
      (filter = stripAlpha(filter)) ?
        style.filter = filter : style.removeAttribute('filter');
      return element;
    } else if (value < 0.00001) value = 0;
    style.filter = stripAlpha(filter) +
      'alpha(opacity=' + (value * 100) + ')';
    return element;
  };

  Element._attributeTranslations = (function(){

    var classProp = 'className',
        forProp = 'for',
        el = document.createElement('div');

    el.setAttribute(classProp, 'x');

    if (el.className !== 'x') {
      el.setAttribute('class', 'x');
      if (el.className === 'x') {
        classProp = 'class';
      }
    }
    el = null;

    el = document.createElement('label');
    el.setAttribute(forProp, 'x');
    if (el.htmlFor !== 'x') {
      el.setAttribute('htmlFor', 'x');
      if (el.htmlFor === 'x') {
        forProp = 'htmlFor';
      }
    }
    el = null;

    return {
      read: {
        names: {
          'class':      classProp,
          'className':  classProp,
          'for':        forProp,
          'htmlFor':    forProp
        },
        values: {
          _getAttr: function(element, attribute) {
            return element.getAttribute(attribute);
          },
          _getAttr2: function(element, attribute) {
            return element.getAttribute(attribute, 2);
          },
          _getAttrNode: function(element, attribute) {
            var node = element.getAttributeNode(attribute);
            return node ? node.value : "";
          },
          _getEv: (function(){

            var el = document.createElement('div'), f;
            el.onclick = Prototype.emptyFunction;
            var value = el.getAttribute('onclick');

            if (String(value).indexOf('{') > -1) {
              f = function(element, attribute) {
                attribute = element.getAttribute(attribute);
                if (!attribute) return null;
                attribute = attribute.toString();
                attribute = attribute.split('{')[1];
                attribute = attribute.split('}')[0];
                return attribute.strip();
              };
            }
            else if (value === '') {
              f = function(element, attribute) {
                attribute = element.getAttribute(attribute);
                if (!attribute) return null;
                return attribute.strip();
              };
            }
            el = null;
            return f;
          })(),
          _flag: function(element, attribute) {
            return $(element).hasAttribute(attribute) ? attribute : null;
          },
          style: function(element) {
            return element.style.cssText.toLowerCase();
          },
          title: function(element) {
            return element.title;
          }
        }
      }
    }
  })();

  Element._attributeTranslations.write = {
    names: Object.extend({
      cellpadding: 'cellPadding',
      cellspacing: 'cellSpacing'
    }, Element._attributeTranslations.read.names),
    values: {
      checked: function(element, value) {
        element.checked = !!value;
      },

      style: function(element, value) {
        element.style.cssText = value ? value : '';
      }
    }
  };

  Element._attributeTranslations.has = {};

  $w('colSpan rowSpan vAlign dateTime accessKey tabIndex ' +
      'encType maxLength readOnly longDesc frameBorder').each(function(attr) {
    Element._attributeTranslations.write.names[attr.toLowerCase()] = attr;
    Element._attributeTranslations.has[attr.toLowerCase()] = attr;
  });

  (function(v) {
    Object.extend(v, {
      href:        v._getAttr2,
      src:         v._getAttr2,
      type:        v._getAttr,
      action:      v._getAttrNode,
      disabled:    v._flag,
      checked:     v._flag,
      readonly:    v._flag,
      multiple:    v._flag,
      onload:      v._getEv,
      onunload:    v._getEv,
      onclick:     v._getEv,
      ondblclick:  v._getEv,
      onmousedown: v._getEv,
      onmouseup:   v._getEv,
      onmouseover: v._getEv,
      onmousemove: v._getEv,
      onmouseout:  v._getEv,
      onfocus:     v._getEv,
      onblur:      v._getEv,
      onkeypress:  v._getEv,
      onkeydown:   v._getEv,
      onkeyup:     v._getEv,
      onsubmit:    v._getEv,
      onreset:     v._getEv,
      onselect:    v._getEv,
      onchange:    v._getEv
    });
  })(Element._attributeTranslations.read.values);

  if (Prototype.BrowserFeatures.ElementExtensions) {
    (function() {
      function _descendants(element) {
        var nodes = element.getElementsByTagName('*'), results = [];
        for (var i = 0, node; node = nodes[i]; i++)
          if (node.tagName !== "!") // Filter out comment nodes.
            results.push(node);
        return results;
      }

      Element.Methods.down = function(element, expression, index) {
        element = $(element);
        if (arguments.length == 1) return element.firstDescendant();
        return Object.isNumber(expression) ? _descendants(element)[expression] :
          Element.select(element, expression)[index || 0];
      }
    })();
  }

}

else if (Prototype.Browser.Gecko && /rv:1\.8\.0/.test(navigator.userAgent)) {
  Element.Methods.setOpacity = function(element, value) {
    element = $(element);
    element.style.opacity = (value == 1) ? 0.999999 :
      (value === '') ? '' : (value < 0.00001) ? 0 : value;
    return element;
  };
}

else if (Prototype.Browser.WebKit) {
  Element.Methods.setOpacity = function(element, value) {
    element = $(element);
    element.style.opacity = (value == 1 || value === '') ? '' :
      (value < 0.00001) ? 0 : value;

    if (value == 1)
      if (element.tagName.toUpperCase() == 'IMG' && element.width) {
        element.width++; element.width--;
      } else try {
        var n = document.createTextNode(' ');
        element.appendChild(n);
        element.removeChild(n);
      } catch (e) { }

    return element;
  };
}

if ('outerHTML' in document.documentElement) {
  Element.Methods.replace = function(element, content) {
    element = $(element);

    if (content && content.toElement) content = content.toElement();
    if (Object.isElement(content)) {
      element.parentNode.replaceChild(content, element);
      return element;
    }

    content = Object.toHTML(content);
    var parent = element.parentNode, tagName = parent.tagName.toUpperCase();

    if (Element._insertionTranslations.tags[tagName]) {
      var nextSibling = element.next(),
          fragments = Element._getContentFromAnonymousElement(tagName, content.stripScripts());
      parent.removeChild(element);
      if (nextSibling)
        fragments.each(function(node) { parent.insertBefore(node, nextSibling) });
      else
        fragments.each(function(node) { parent.appendChild(node) });
    }
    else element.outerHTML = content.stripScripts();

    content.evalScripts.bind(content).defer();
    return element;
  };
}

Element._returnOffset = function(l, t) {
  var result = [l, t];
  result.left = l;
  result.top = t;
  return result;
};

Element._getContentFromAnonymousElement = function(tagName, html, force) {
  var div = new Element('div'),
      t = Element._insertionTranslations.tags[tagName];

  var workaround = false;
  if (t) workaround = true;
  else if (force) {
    workaround = true;
    t = ['', '', 0];
  }

  if (workaround) {
    div.innerHTML = '&nbsp;' + t[0] + html + t[1];
    div.removeChild(div.firstChild);
    for (var i = t[2]; i--; ) {
      div = div.firstChild;
    }
  }
  else {
    div.innerHTML = html;
  }
  return $A(div.childNodes);
};

Element._insertionTranslations = {
  before: function(element, node) {
    element.parentNode.insertBefore(node, element);
  },
  top: function(element, node) {
    element.insertBefore(node, element.firstChild);
  },
  bottom: function(element, node) {
    element.appendChild(node);
  },
  after: function(element, node) {
    element.parentNode.insertBefore(node, element.nextSibling);
  },
  tags: {
    TABLE:  ['<table>',                '</table>',                   1],
    TBODY:  ['<table><tbody>',         '</tbody></table>',           2],
    TR:     ['<table><tbody><tr>',     '</tr></tbody></table>',      3],
    TD:     ['<table><tbody><tr><td>', '</td></tr></tbody></table>', 4],
    SELECT: ['<select>',               '</select>',                  1]
  }
};

(function() {
  var tags = Element._insertionTranslations.tags;
  Object.extend(tags, {
    THEAD: tags.TBODY,
    TFOOT: tags.TBODY,
    TH:    tags.TD
  });
})();

Element.Methods.Simulated = {
  hasAttribute: function(element, attribute) {
    attribute = Element._attributeTranslations.has[attribute] || attribute;
    var node = $(element).getAttributeNode(attribute);
    return !!(node && node.specified);
  }
};

Element.Methods.ByTag = { };

Object.extend(Element, Element.Methods);

(function(div) {

  if (!Prototype.BrowserFeatures.ElementExtensions && div['__proto__']) {
    window.HTMLElement = { };
    window.HTMLElement.prototype = div['__proto__'];
    Prototype.BrowserFeatures.ElementExtensions = true;
  }

  div = null;

})(document.createElement('div'));

Element.extend = (function() {

  function checkDeficiency(tagName) {
    if (typeof window.Element != 'undefined') {
      var proto = window.Element.prototype;
      if (proto) {
        var id = '_' + (Math.random()+'').slice(2),
            el = document.createElement(tagName);
        proto[id] = 'x';
        var isBuggy = (el[id] !== 'x');
        delete proto[id];
        el = null;
        return isBuggy;
      }
    }
    return false;
  }

  function extendElementWith(element, methods) {
    for (var property in methods) {
      var value = methods[property];
      if (Object.isFunction(value) && !(property in element))
        element[property] = value.methodize();
    }
  }

  var HTMLOBJECTELEMENT_PROTOTYPE_BUGGY = checkDeficiency('object');

  if (Prototype.BrowserFeatures.SpecificElementExtensions) {
    if (HTMLOBJECTELEMENT_PROTOTYPE_BUGGY) {
      return function(element) {
        if (element && typeof element._extendedByPrototype == 'undefined') {
          var t = element.tagName;
          if (t && (/^(?:object|applet|embed)$/i.test(t))) {
            extendElementWith(element, Element.Methods);
            extendElementWith(element, Element.Methods.Simulated);
            extendElementWith(element, Element.Methods.ByTag[t.toUpperCase()]);
          }
        }
        return element;
      }
    }
    return Prototype.K;
  }

  var Methods = { }, ByTag = Element.Methods.ByTag;

  var extend = Object.extend(function(element) {
    if (!element || typeof element._extendedByPrototype != 'undefined' ||
        element.nodeType != 1 || element == window) return element;

    var methods = Object.clone(Methods),
        tagName = element.tagName.toUpperCase();

    if (ByTag[tagName]) Object.extend(methods, ByTag[tagName]);

    extendElementWith(element, methods);

    element._extendedByPrototype = Prototype.emptyFunction;
    return element;

  }, {
    refresh: function() {
      if (!Prototype.BrowserFeatures.ElementExtensions) {
        Object.extend(Methods, Element.Methods);
        Object.extend(Methods, Element.Methods.Simulated);
      }
    }
  });

  extend.refresh();
  return extend;
})();

if (document.documentElement.hasAttribute) {
  Element.hasAttribute = function(element, attribute) {
    return element.hasAttribute(attribute);
  };
}
else {
  Element.hasAttribute = Element.Methods.Simulated.hasAttribute;
}

Element.addMethods = function(methods) {
  var F = Prototype.BrowserFeatures, T = Element.Methods.ByTag;

  if (!methods) {
    Object.extend(Form, Form.Methods);
    Object.extend(Form.Element, Form.Element.Methods);
    Object.extend(Element.Methods.ByTag, {
      "FORM":     Object.clone(Form.Methods),
      "INPUT":    Object.clone(Form.Element.Methods),
      "SELECT":   Object.clone(Form.Element.Methods),
      "TEXTAREA": Object.clone(Form.Element.Methods),
      "BUTTON":   Object.clone(Form.Element.Methods)
    });
  }

  if (arguments.length == 2) {
    var tagName = methods;
    methods = arguments[1];
  }

  if (!tagName) Object.extend(Element.Methods, methods || { });
  else {
    if (Object.isArray(tagName)) tagName.each(extend);
    else extend(tagName);
  }

  function extend(tagName) {
    tagName = tagName.toUpperCase();
    if (!Element.Methods.ByTag[tagName])
      Element.Methods.ByTag[tagName] = { };
    Object.extend(Element.Methods.ByTag[tagName], methods);
  }

  function copy(methods, destination, onlyIfAbsent) {
    onlyIfAbsent = onlyIfAbsent || false;
    for (var property in methods) {
      var value = methods[property];
      if (!Object.isFunction(value)) continue;
      if (!onlyIfAbsent || !(property in destination))
        destination[property] = value.methodize();
    }
  }

  function findDOMClass(tagName) {
    var klass;
    var trans = {
      "OPTGROUP": "OptGroup", "TEXTAREA": "TextArea", "P": "Paragraph",
      "FIELDSET": "FieldSet", "UL": "UList", "OL": "OList", "DL": "DList",
      "DIR": "Directory", "H1": "Heading", "H2": "Heading", "H3": "Heading",
      "H4": "Heading", "H5": "Heading", "H6": "Heading", "Q": "Quote",
      "INS": "Mod", "DEL": "Mod", "A": "Anchor", "IMG": "Image", "CAPTION":
      "TableCaption", "COL": "TableCol", "COLGROUP": "TableCol", "THEAD":
      "TableSection", "TFOOT": "TableSection", "TBODY": "TableSection", "TR":
      "TableRow", "TH": "TableCell", "TD": "TableCell", "FRAMESET":
      "FrameSet", "IFRAME": "IFrame"
    };
    if (trans[tagName]) klass = 'HTML' + trans[tagName] + 'Element';
    if (window[klass]) return window[klass];
    klass = 'HTML' + tagName + 'Element';
    if (window[klass]) return window[klass];
    klass = 'HTML' + tagName.capitalize() + 'Element';
    if (window[klass]) return window[klass];

    var element = document.createElement(tagName),
        proto = element['__proto__'] || element.constructor.prototype;

    element = null;
    return proto;
  }

  var elementPrototype = window.HTMLElement ? HTMLElement.prototype :
   Element.prototype;

  if (F.ElementExtensions) {
    copy(Element.Methods, elementPrototype);
    copy(Element.Methods.Simulated, elementPrototype, true);
  }

  if (F.SpecificElementExtensions) {
    for (var tag in Element.Methods.ByTag) {
      var klass = findDOMClass(tag);
      if (Object.isUndefined(klass)) continue;
      copy(T[tag], klass.prototype);
    }
  }

  Object.extend(Element, Element.Methods);
  delete Element.ByTag;

  if (Element.extend.refresh) Element.extend.refresh();
  Element.cache = { };
};


document.viewport = {

  getDimensions: function() {
    return { width: this.getWidth(), height: this.getHeight() };
  },

  getScrollOffsets: function() {
    return Element._returnOffset(
      window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft,
      window.pageYOffset || document.documentElement.scrollTop  || document.body.scrollTop);
  }
};

(function(viewport) {
  var B = Prototype.Browser, doc = document, element, property = {};

  function getRootElement() {
    if (B.WebKit && !doc.evaluate)
      return document;

    if (B.Opera && window.parseFloat(window.opera.version()) < 9.5)
      return document.body;

    return document.documentElement;
  }

  function define(D) {
    if (!element) element = getRootElement();

    property[D] = 'client' + D;

    viewport['get' + D] = function() { return element[property[D]] };
    return viewport['get' + D]();
  }

  viewport.getWidth  = define.curry('Width');

  viewport.getHeight = define.curry('Height');
})(document.viewport);


Element.Storage = {
  UID: 1
};

Element.addMethods({
  getStorage: function(element) {
    if (!(element = $(element))) return;

    var uid;
    if (element === window) {
      uid = 0;
    } else {
      if (typeof element._prototypeUID === "undefined")
        element._prototypeUID = Element.Storage.UID++;
      uid = element._prototypeUID;
    }

    if (!Element.Storage[uid])
      Element.Storage[uid] = $H();

    return Element.Storage[uid];
  },

  store: function(element, key, value) {
    if (!(element = $(element))) return;

    if (arguments.length === 2) {
      Element.getStorage(element).update(key);
    } else {
      Element.getStorage(element).set(key, value);
    }

    return element;
  },

  retrieve: function(element, key, defaultValue) {
    if (!(element = $(element))) return;
    var hash = Element.getStorage(element), value = hash.get(key);

    if (Object.isUndefined(value)) {
      hash.set(key, defaultValue);
      value = defaultValue;
    }

    return value;
  },

  clone: function(element, deep) {
    if (!(element = $(element))) return;
    var clone = element.cloneNode(deep);
    clone._prototypeUID = void 0;
    if (deep) {
      var descendants = Element.select(clone, '*'),
          i = descendants.length;
      while (i--) {
        descendants[i]._prototypeUID = void 0;
      }
    }
    return Element.extend(clone);
  },

  purge: function(element) {
    if (!(element = $(element))) return;
    var purgeElement = Element._purgeElement;

    purgeElement(element);

    var descendants = element.getElementsByTagName('*'),
     i = descendants.length;

    while (i--) purgeElement(descendants[i]);

    return null;
  }
});

(function() {

  function toDecimal(pctString) {
    var match = pctString.match(/^(\d+)%?$/i);
    if (!match) return null;
    return (Number(match[1]) / 100);
  }

  function getPixelValue(value, property, context) {
    var element = null;
    if (Object.isElement(value)) {
      element = value;
      value = element.getStyle(property);
    }

    if (value === null) {
      return null;
    }

    if ((/^(?:-)?\d+(\.\d+)?(px)?$/i).test(value)) {
      return window.parseFloat(value);
    }

    var isPercentage = value.include('%'), isViewport = (context === document.viewport);

    if (/\d/.test(value) && element && element.runtimeStyle && !(isPercentage && isViewport)) {
      var style = element.style.left, rStyle = element.runtimeStyle.left;
      element.runtimeStyle.left = element.currentStyle.left;
      element.style.left = value || 0;
      value = element.style.pixelLeft;
      element.style.left = style;
      element.runtimeStyle.left = rStyle;

      return value;
    }

    if (element && isPercentage) {
      context = context || element.parentNode;
      var decimal = toDecimal(value);
      var whole = null;
      var position = element.getStyle('position');

      var isHorizontal = property.include('left') || property.include('right') ||
       property.include('width');

      var isVertical =  property.include('top') || property.include('bottom') ||
        property.include('height');

      if (context === document.viewport) {
        if (isHorizontal) {
          whole = document.viewport.getWidth();
        } else if (isVertical) {
          whole = document.viewport.getHeight();
        }
      } else {
        if (isHorizontal) {
          whole = $(context).measure('width');
        } else if (isVertical) {
          whole = $(context).measure('height');
        }
      }

      return (whole === null) ? 0 : whole * decimal;
    }

    return 0;
  }

  function toCSSPixels(number) {
    if (Object.isString(number) && number.endsWith('px')) {
      return number;
    }
    return number + 'px';
  }

  function isDisplayed(element) {
    var originalElement = element;
    while (element && element.parentNode) {
      var display = element.getStyle('display');
      if (display === 'none') {
        return false;
      }
      element = $(element.parentNode);
    }
    return true;
  }

  var hasLayout = Prototype.K;
  if ('currentStyle' in document.documentElement) {
    hasLayout = function(element) {
      if (!element.currentStyle.hasLayout) {
        element.style.zoom = 1;
      }
      return element;
    };
  }

  function cssNameFor(key) {
    if (key.include('border')) key = key + '-width';
    return key.camelize();
  }

  Element.Layout = Class.create(Hash, {
    initialize: function($super, element, preCompute) {
      $super();
      this.element = $(element);

      Element.Layout.PROPERTIES.each( function(property) {
        this._set(property, null);
      }, this);

      if (preCompute) {
        this._preComputing = true;
        this._begin();
        Element.Layout.PROPERTIES.each( this._compute, this );
        this._end();
        this._preComputing = false;
      }
    },

    _set: function(property, value) {
      return Hash.prototype.set.call(this, property, value);
    },

    set: function(property, value) {
      throw "Properties of Element.Layout are read-only.";
    },

    get: function($super, property) {
      var value = $super(property);
      return value === null ? this._compute(property) : value;
    },

    _begin: function() {
      if (this._prepared) return;

      var element = this.element;
      if (isDisplayed(element)) {
        this._prepared = true;
        return;
      }

      var originalStyles = {
        position:   element.style.position   || '',
        width:      element.style.width      || '',
        visibility: element.style.visibility || '',
        display:    element.style.display    || ''
      };

      element.store('prototype_original_styles', originalStyles);

      var position = element.getStyle('position'),
       width = element.getStyle('width');

      if (width === "0px" || width === null) {
        element.style.display = 'block';
        width = element.getStyle('width');
      }

      var context = (position === 'fixed') ? document.viewport :
       element.parentNode;

      element.setStyle({
        position:   'absolute',
        visibility: 'hidden',
        display:    'block'
      });

      var positionedWidth = element.getStyle('width');

      var newWidth;
      if (width && (positionedWidth === width)) {
        newWidth = getPixelValue(element, 'width', context);
      } else if (position === 'absolute' || position === 'fixed') {
        newWidth = getPixelValue(element, 'width', context);
      } else {
        var parent = element.parentNode, pLayout = $(parent).getLayout();

        newWidth = pLayout.get('width') -
         this.get('margin-left') -
         this.get('border-left') -
         this.get('padding-left') -
         this.get('padding-right') -
         this.get('border-right') -
         this.get('margin-right');
      }

      element.setStyle({ width: newWidth + 'px' });

      this._prepared = true;
    },

    _end: function() {
      var element = this.element;
      var originalStyles = element.retrieve('prototype_original_styles');
      element.store('prototype_original_styles', null);
      element.setStyle(originalStyles);
      this._prepared = false;
    },

    _compute: function(property) {
      var COMPUTATIONS = Element.Layout.COMPUTATIONS;
      if (!(property in COMPUTATIONS)) {
        throw "Property not found.";
      }

      return this._set(property, COMPUTATIONS[property].call(this, this.element));
    },

    toObject: function() {
      var args = $A(arguments);
      var keys = (args.length === 0) ? Element.Layout.PROPERTIES :
       args.join(' ').split(' ');
      var obj = {};
      keys.each( function(key) {
        if (!Element.Layout.PROPERTIES.include(key)) return;
        var value = this.get(key);
        if (value != null) obj[key] = value;
      }, this);
      return obj;
    },

    toHash: function() {
      var obj = this.toObject.apply(this, arguments);
      return new Hash(obj);
    },

    toCSS: function() {
      var args = $A(arguments);
      var keys = (args.length === 0) ? Element.Layout.PROPERTIES :
       args.join(' ').split(' ');
      var css = {};

      keys.each( function(key) {
        if (!Element.Layout.PROPERTIES.include(key)) return;
        if (Element.Layout.COMPOSITE_PROPERTIES.include(key)) return;

        var value = this.get(key);
        if (value != null) css[cssNameFor(key)] = value + 'px';
      }, this);
      return css;
    },

    inspect: function() {
      return "#<Element.Layout>";
    }
  });

  Object.extend(Element.Layout, {
    PROPERTIES: $w('height width top left right bottom border-left border-right border-top border-bottom padding-left padding-right padding-top padding-bottom margin-top margin-bottom margin-left margin-right padding-box-width padding-box-height border-box-width border-box-height margin-box-width margin-box-height'),

    COMPOSITE_PROPERTIES: $w('padding-box-width padding-box-height margin-box-width margin-box-height border-box-width border-box-height'),

    COMPUTATIONS: {
      'height': function(element) {
        if (!this._preComputing) this._begin();

        var bHeight = this.get('border-box-height');
        if (bHeight <= 0) {
          if (!this._preComputing) this._end();
          return 0;
        }

        var bTop = this.get('border-top'),
         bBottom = this.get('border-bottom');

        var pTop = this.get('padding-top'),
         pBottom = this.get('padding-bottom');

        if (!this._preComputing) this._end();

        return bHeight - bTop - bBottom - pTop - pBottom;
      },

      'width': function(element) {
        if (!this._preComputing) this._begin();

        var bWidth = this.get('border-box-width');
        if (bWidth <= 0) {
          if (!this._preComputing) this._end();
          return 0;
        }

        var bLeft = this.get('border-left'),
         bRight = this.get('border-right');

        var pLeft = this.get('padding-left'),
         pRight = this.get('padding-right');

        if (!this._preComputing) this._end();

        return bWidth - bLeft - bRight - pLeft - pRight;
      },

      'padding-box-height': function(element) {
        var height = this.get('height'),
         pTop = this.get('padding-top'),
         pBottom = this.get('padding-bottom');

        return height + pTop + pBottom;
      },

      'padding-box-width': function(element) {
        var width = this.get('width'),
         pLeft = this.get('padding-left'),
         pRight = this.get('padding-right');

        return width + pLeft + pRight;
      },

      'border-box-height': function(element) {
        if (!this._preComputing) this._begin();
        var height = element.offsetHeight;
        if (!this._preComputing) this._end();
        return height;
      },

      'border-box-width': function(element) {
        if (!this._preComputing) this._begin();
        var width = element.offsetWidth;
        if (!this._preComputing) this._end();
        return width;
      },

      'margin-box-height': function(element) {
        var bHeight = this.get('border-box-height'),
         mTop = this.get('margin-top'),
         mBottom = this.get('margin-bottom');

        if (bHeight <= 0) return 0;

        return bHeight + mTop + mBottom;
      },

      'margin-box-width': function(element) {
        var bWidth = this.get('border-box-width'),
         mLeft = this.get('margin-left'),
         mRight = this.get('margin-right');

        if (bWidth <= 0) return 0;

        return bWidth + mLeft + mRight;
      },

      'top': function(element) {
        var offset = element.positionedOffset();
        return offset.top;
      },

      'bottom': function(element) {
        var offset = element.positionedOffset(),
         parent = element.getOffsetParent(),
         pHeight = parent.measure('height');

        var mHeight = this.get('border-box-height');

        return pHeight - mHeight - offset.top;
      },

      'left': function(element) {
        var offset = element.positionedOffset();
        return offset.left;
      },

      'right': function(element) {
        var offset = element.positionedOffset(),
         parent = element.getOffsetParent(),
         pWidth = parent.measure('width');

        var mWidth = this.get('border-box-width');

        return pWidth - mWidth - offset.left;
      },

      'padding-top': function(element) {
        return getPixelValue(element, 'paddingTop');
      },

      'padding-bottom': function(element) {
        return getPixelValue(element, 'paddingBottom');
      },

      'padding-left': function(element) {
        return getPixelValue(element, 'paddingLeft');
      },

      'padding-right': function(element) {
        return getPixelValue(element, 'paddingRight');
      },

      'border-top': function(element) {
        return getPixelValue(element, 'borderTopWidth');
      },

      'border-bottom': function(element) {
        return getPixelValue(element, 'borderBottomWidth');
      },

      'border-left': function(element) {
        return getPixelValue(element, 'borderLeftWidth');
      },

      'border-right': function(element) {
        return getPixelValue(element, 'borderRightWidth');
      },

      'margin-top': function(element) {
        return getPixelValue(element, 'marginTop');
      },

      'margin-bottom': function(element) {
        return getPixelValue(element, 'marginBottom');
      },

      'margin-left': function(element) {
        return getPixelValue(element, 'marginLeft');
      },

      'margin-right': function(element) {
        return getPixelValue(element, 'marginRight');
      }
    }
  });

  if ('getBoundingClientRect' in document.documentElement) {
    Object.extend(Element.Layout.COMPUTATIONS, {
      'right': function(element) {
        var parent = hasLayout(element.getOffsetParent());
        var rect = element.getBoundingClientRect(),
         pRect = parent.getBoundingClientRect();

        return (pRect.right - rect.right).round();
      },

      'bottom': function(element) {
        var parent = hasLayout(element.getOffsetParent());
        var rect = element.getBoundingClientRect(),
         pRect = parent.getBoundingClientRect();

        return (pRect.bottom - rect.bottom).round();
      }
    });
  }

  Element.Offset = Class.create({
    initialize: function(left, top) {
      this.left = left.round();
      this.top  = top.round();

      this[0] = this.left;
      this[1] = this.top;
    },

    relativeTo: function(offset) {
      return new Element.Offset(
        this.left - offset.left,
        this.top  - offset.top
      );
    },

    inspect: function() {
      return "#<Element.Offset left: #{left} top: #{top}>".interpolate(this);
    },

    toString: function() {
      return "[#{left}, #{top}]".interpolate(this);
    },

    toArray: function() {
      return [this.left, this.top];
    }
  });

  function getLayout(element, preCompute) {
    return new Element.Layout(element, preCompute);
  }

  function measure(element, property) {
    return $(element).getLayout().get(property);
  }

  function getDimensions(element) {
    element = $(element);
    var display = Element.getStyle(element, 'display');

    if (display && display !== 'none') {
      return { width: element.offsetWidth, height: element.offsetHeight };
    }

    var style = element.style;
    var originalStyles = {
      visibility: style.visibility,
      position:   style.position,
      display:    style.display
    };

    var newStyles = {
      visibility: 'hidden',
      display:    'block'
    };

    if (originalStyles.position !== 'fixed')
      newStyles.position = 'absolute';

    Element.setStyle(element, newStyles);

    var dimensions = {
      width:  element.offsetWidth,
      height: element.offsetHeight
    };

    Element.setStyle(element, originalStyles);

    return dimensions;
  }

  function getOffsetParent(element) {
    element = $(element);

    if (isDocument(element) || isDetached(element) || isBody(element) || isHtml(element))
      return $(document.body);

    var isInline = (Element.getStyle(element, 'display') === 'inline');
    if (!isInline && element.offsetParent) return $(element.offsetParent);

    while ((element = element.parentNode) && element !== document.body) {
      if (Element.getStyle(element, 'position') !== 'static') {
        return isHtml(element) ? $(document.body) : $(element);
      }
    }

    return $(document.body);
  }


  function cumulativeOffset(element) {
    element = $(element);
    var valueT = 0, valueL = 0;
    if (element.parentNode) {
      do {
        valueT += element.offsetTop  || 0;
        valueL += element.offsetLeft || 0;
        element = element.offsetParent;
      } while (element);
    }
    return new Element.Offset(valueL, valueT);
  }

  function positionedOffset(element) {
    element = $(element);

    var layout = element.getLayout();

    var valueT = 0, valueL = 0;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;
      element = element.offsetParent;
      if (element) {
        if (isBody(element)) break;
        var p = Element.getStyle(element, 'position');
        if (p !== 'static') break;
      }
    } while (element);

    valueL -= layout.get('margin-top');
    valueT -= layout.get('margin-left');

    return new Element.Offset(valueL, valueT);
  }

  function cumulativeScrollOffset(element) {
    var valueT = 0, valueL = 0;
    do {
      valueT += element.scrollTop  || 0;
      valueL += element.scrollLeft || 0;
      element = element.parentNode;
    } while (element);
    return new Element.Offset(valueL, valueT);
  }

  function viewportOffset(forElement) {
    element = $(element);
    var valueT = 0, valueL = 0, docBody = document.body;

    var element = forElement;
    do {
      valueT += element.offsetTop  || 0;
      valueL += element.offsetLeft || 0;
      if (element.offsetParent == docBody &&
        Element.getStyle(element, 'position') == 'absolute') break;
    } while (element = element.offsetParent);

    element = forElement;
    do {
      if (element != docBody) {
        valueT -= element.scrollTop  || 0;
        valueL -= element.scrollLeft || 0;
      }
    } while (element = element.parentNode);
    return new Element.Offset(valueL, valueT);
  }

  function absolutize(element) {
    element = $(element);

    if (Element.getStyle(element, 'position') === 'absolute') {
      return element;
    }

    var offsetParent = getOffsetParent(element);
    var eOffset = element.viewportOffset(),
     pOffset = offsetParent.viewportOffset();

    var offset = eOffset.relativeTo(pOffset);
    var layout = element.getLayout();

    element.store('prototype_absolutize_original_styles', {
      left:   element.getStyle('left'),
      top:    element.getStyle('top'),
      width:  element.getStyle('width'),
      height: element.getStyle('height')
    });

    element.setStyle({
      position: 'absolute',
      top:    offset.top + 'px',
      left:   offset.left + 'px',
      width:  layout.get('width') + 'px',
      height: layout.get('height') + 'px'
    });

    return element;
  }

  function relativize(element) {
    element = $(element);
    if (Element.getStyle(element, 'position') === 'relative') {
      return element;
    }

    var originalStyles =
     element.retrieve('prototype_absolutize_original_styles');

    if (originalStyles) element.setStyle(originalStyles);
    return element;
  }

  if (Prototype.Browser.IE) {
    getOffsetParent = getOffsetParent.wrap(
      function(proceed, element) {
        element = $(element);

        if (isDocument(element) || isDetached(element) || isBody(element) || isHtml(element))
          return $(document.body);

        var position = element.getStyle('position');
        if (position !== 'static') return proceed(element);

        element.setStyle({ position: 'relative' });
        var value = proceed(element);
        element.setStyle({ position: position });
        return value;
      }
    );

    positionedOffset = positionedOffset.wrap(function(proceed, element) {
      element = $(element);
      if (!element.parentNode) return new Element.Offset(0, 0);
      var position = element.getStyle('position');
      if (position !== 'static') return proceed(element);

      var offsetParent = element.getOffsetParent();
      if (offsetParent && offsetParent.getStyle('position') === 'fixed')
        hasLayout(offsetParent);

      element.setStyle({ position: 'relative' });
      var value = proceed(element);
      element.setStyle({ position: position });
      return value;
    });
  } else if (Prototype.Browser.Webkit) {
    cumulativeOffset = function(element) {
      element = $(element);
      var valueT = 0, valueL = 0;
      do {
        valueT += element.offsetTop  || 0;
        valueL += element.offsetLeft || 0;
        if (element.offsetParent == document.body)
          if (Element.getStyle(element, 'position') == 'absolute') break;

        element = element.offsetParent;
      } while (element);

      return new Element.Offset(valueL, valueT);
    };
  }


  Element.addMethods({
    getLayout:              getLayout,
    measure:                measure,
    getDimensions:          getDimensions,
    getOffsetParent:        getOffsetParent,
    cumulativeOffset:       cumulativeOffset,
    positionedOffset:       positionedOffset,
    cumulativeScrollOffset: cumulativeScrollOffset,
    viewportOffset:         viewportOffset,
    absolutize:             absolutize,
    relativize:             relativize
  });

  function isBody(element) {
    return element.nodeName.toUpperCase() === 'BODY';
  }

  function isHtml(element) {
    return element.nodeName.toUpperCase() === 'HTML';
  }

  function isDocument(element) {
    return element.nodeType === Node.DOCUMENT_NODE;
  }

  function isDetached(element) {
    return element !== document.body &&
     !Element.descendantOf(element, document.body);
  }

  if ('getBoundingClientRect' in document.documentElement) {
    Element.addMethods({
      viewportOffset: function(element) {
        element = $(element);
        if (isDetached(element)) return new Element.Offset(0, 0);

        var rect = element.getBoundingClientRect(),
         docEl = document.documentElement;
        return new Element.Offset(rect.left - docEl.clientLeft,
         rect.top - docEl.clientTop);
      }
    });
  }
})();
window.$$ = function() {
  var expression = $A(arguments).join(', ');
  return Prototype.Selector.select(expression, document);
};

Prototype.Selector = (function() {

  function select() {
    throw new Error('Method "Prototype.Selector.select" must be defined.');
  }

  function match() {
    throw new Error('Method "Prototype.Selector.match" must be defined.');
  }

  function find(elements, expression, index) {
    index = index || 0;
    var match = Prototype.Selector.match, length = elements.length, matchIndex = 0, i;

    for (i = 0; i < length; i++) {
      if (match(elements[i], expression) && index == matchIndex++) {
        return Element.extend(elements[i]);
      }
    }
  }

  function extendElements(elements) {
    for (var i = 0, length = elements.length; i < length; i++) {
      Element.extend(elements[i]);
    }
    return elements;
  }


  var K = Prototype.K;

  return {
    select: select,
    match: match,
    find: find,
    extendElements: (Element.extend === K) ? K : extendElements,
    extendElement: Element.extend
  };
})();
Prototype._original_property = window.Sizzle;
/*!
 * Sizzle CSS Selector Engine - v1.0
 *  Copyright 2009, The Dojo Foundation
 *  Released under the MIT, BSD, and GPL Licenses.
 *  More information: http://sizzlejs.com/
 */
(function(){

var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^[\]]*\]|['"][^'"]*['"]|[^[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,
	done = 0,
	toString = Object.prototype.toString,
	hasDuplicate = false,
	baseHasDuplicate = true;

[0, 0].sort(function(){
	baseHasDuplicate = false;
	return 0;
});

var Sizzle = function(selector, context, results, seed) {
	results = results || [];
	var origContext = context = context || document;

	if ( context.nodeType !== 1 && context.nodeType !== 9 ) {
		return [];
	}

	if ( !selector || typeof selector !== "string" ) {
		return results;
	}

	var parts = [], m, set, checkSet, check, mode, extra, prune = true, contextXML = isXML(context),
		soFar = selector;

	while ( (chunker.exec(""), m = chunker.exec(soFar)) !== null ) {
		soFar = m[3];

		parts.push( m[1] );

		if ( m[2] ) {
			extra = m[3];
			break;
		}
	}

	if ( parts.length > 1 && origPOS.exec( selector ) ) {
		if ( parts.length === 2 && Expr.relative[ parts[0] ] ) {
			set = posProcess( parts[0] + parts[1], context );
		} else {
			set = Expr.relative[ parts[0] ] ?
				[ context ] :
				Sizzle( parts.shift(), context );

			while ( parts.length ) {
				selector = parts.shift();

				if ( Expr.relative[ selector ] )
					selector += parts.shift();

				set = posProcess( selector, set );
			}
		}
	} else {
		if ( !seed && parts.length > 1 && context.nodeType === 9 && !contextXML &&
				Expr.match.ID.test(parts[0]) && !Expr.match.ID.test(parts[parts.length - 1]) ) {
			var ret = Sizzle.find( parts.shift(), context, contextXML );
			context = ret.expr ? Sizzle.filter( ret.expr, ret.set )[0] : ret.set[0];
		}

		if ( context ) {
			var ret = seed ?
				{ expr: parts.pop(), set: makeArray(seed) } :
				Sizzle.find( parts.pop(), parts.length === 1 && (parts[0] === "~" || parts[0] === "+") && context.parentNode ? context.parentNode : context, contextXML );
			set = ret.expr ? Sizzle.filter( ret.expr, ret.set ) : ret.set;

			if ( parts.length > 0 ) {
				checkSet = makeArray(set);
			} else {
				prune = false;
			}

			while ( parts.length ) {
				var cur = parts.pop(), pop = cur;

				if ( !Expr.relative[ cur ] ) {
					cur = "";
				} else {
					pop = parts.pop();
				}

				if ( pop == null ) {
					pop = context;
				}

				Expr.relative[ cur ]( checkSet, pop, contextXML );
			}
		} else {
			checkSet = parts = [];
		}
	}

	if ( !checkSet ) {
		checkSet = set;
	}

	if ( !checkSet ) {
		throw "Syntax error, unrecognized expression: " + (cur || selector);
	}

	if ( toString.call(checkSet) === "[object Array]" ) {
		if ( !prune ) {
			results.push.apply( results, checkSet );
		} else if ( context && context.nodeType === 1 ) {
			for ( var i = 0; checkSet[i] != null; i++ ) {
				if ( checkSet[i] && (checkSet[i] === true || checkSet[i].nodeType === 1 && contains(context, checkSet[i])) ) {
					results.push( set[i] );
				}
			}
		} else {
			for ( var i = 0; checkSet[i] != null; i++ ) {
				if ( checkSet[i] && checkSet[i].nodeType === 1 ) {
					results.push( set[i] );
				}
			}
		}
	} else {
		makeArray( checkSet, results );
	}

	if ( extra ) {
		Sizzle( extra, origContext, results, seed );
		Sizzle.uniqueSort( results );
	}

	return results;
};

Sizzle.uniqueSort = function(results){
	if ( sortOrder ) {
		hasDuplicate = baseHasDuplicate;
		results.sort(sortOrder);

		if ( hasDuplicate ) {
			for ( var i = 1; i < results.length; i++ ) {
				if ( results[i] === results[i-1] ) {
					results.splice(i--, 1);
				}
			}
		}
	}

	return results;
};

Sizzle.matches = function(expr, set){
	return Sizzle(expr, null, null, set);
};

Sizzle.find = function(expr, context, isXML){
	var set, match;

	if ( !expr ) {
		return [];
	}

	for ( var i = 0, l = Expr.order.length; i < l; i++ ) {
		var type = Expr.order[i], match;

		if ( (match = Expr.leftMatch[ type ].exec( expr )) ) {
			var left = match[1];
			match.splice(1,1);

			if ( left.substr( left.length - 1 ) !== "\\" ) {
				match[1] = (match[1] || "").replace(/\\/g, "");
				set = Expr.find[ type ]( match, context, isXML );
				if ( set != null ) {
					expr = expr.replace( Expr.match[ type ], "" );
					break;
				}
			}
		}
	}

	if ( !set ) {
		set = context.getElementsByTagName("*");
	}

	return {set: set, expr: expr};
};

Sizzle.filter = function(expr, set, inplace, not){
	var old = expr, result = [], curLoop = set, match, anyFound,
		isXMLFilter = set && set[0] && isXML(set[0]);

	while ( expr && set.length ) {
		for ( var type in Expr.filter ) {
			if ( (match = Expr.match[ type ].exec( expr )) != null ) {
				var filter = Expr.filter[ type ], found, item;
				anyFound = false;

				if ( curLoop == result ) {
					result = [];
				}

				if ( Expr.preFilter[ type ] ) {
					match = Expr.preFilter[ type ]( match, curLoop, inplace, result, not, isXMLFilter );

					if ( !match ) {
						anyFound = found = true;
					} else if ( match === true ) {
						continue;
					}
				}

				if ( match ) {
					for ( var i = 0; (item = curLoop[i]) != null; i++ ) {
						if ( item ) {
							found = filter( item, match, i, curLoop );
							var pass = not ^ !!found;

							if ( inplace && found != null ) {
								if ( pass ) {
									anyFound = true;
								} else {
									curLoop[i] = false;
								}
							} else if ( pass ) {
								result.push( item );
								anyFound = true;
							}
						}
					}
				}

				if ( found !== undefined ) {
					if ( !inplace ) {
						curLoop = result;
					}

					expr = expr.replace( Expr.match[ type ], "" );

					if ( !anyFound ) {
						return [];
					}

					break;
				}
			}
		}

		if ( expr == old ) {
			if ( anyFound == null ) {
				throw "Syntax error, unrecognized expression: " + expr;
			} else {
				break;
			}
		}

		old = expr;
	}

	return curLoop;
};

var Expr = Sizzle.selectors = {
	order: [ "ID", "NAME", "TAG" ],
	match: {
		ID: /#((?:[\w\u00c0-\uFFFF-]|\\.)+)/,
		CLASS: /\.((?:[\w\u00c0-\uFFFF-]|\\.)+)/,
		NAME: /\[name=['"]*((?:[\w\u00c0-\uFFFF-]|\\.)+)['"]*\]/,
		ATTR: /\[\s*((?:[\w\u00c0-\uFFFF-]|\\.)+)\s*(?:(\S?=)\s*(['"]*)(.*?)\3|)\s*\]/,
		TAG: /^((?:[\w\u00c0-\uFFFF\*-]|\\.)+)/,
		CHILD: /:(only|nth|last|first)-child(?:\((even|odd|[\dn+-]*)\))?/,
		POS: /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^-]|$)/,
		PSEUDO: /:((?:[\w\u00c0-\uFFFF-]|\\.)+)(?:\((['"]*)((?:\([^\)]+\)|[^\2\(\)]*)+)\2\))?/
	},
	leftMatch: {},
	attrMap: {
		"class": "className",
		"for": "htmlFor"
	},
	attrHandle: {
		href: function(elem){
			return elem.getAttribute("href");
		}
	},
	relative: {
		"+": function(checkSet, part, isXML){
			var isPartStr = typeof part === "string",
				isTag = isPartStr && !/\W/.test(part),
				isPartStrNotTag = isPartStr && !isTag;

			if ( isTag && !isXML ) {
				part = part.toUpperCase();
			}

			for ( var i = 0, l = checkSet.length, elem; i < l; i++ ) {
				if ( (elem = checkSet[i]) ) {
					while ( (elem = elem.previousSibling) && elem.nodeType !== 1 ) {}

					checkSet[i] = isPartStrNotTag || elem && elem.nodeName === part ?
						elem || false :
						elem === part;
				}
			}

			if ( isPartStrNotTag ) {
				Sizzle.filter( part, checkSet, true );
			}
		},
		">": function(checkSet, part, isXML){
			var isPartStr = typeof part === "string";

			if ( isPartStr && !/\W/.test(part) ) {
				part = isXML ? part : part.toUpperCase();

				for ( var i = 0, l = checkSet.length; i < l; i++ ) {
					var elem = checkSet[i];
					if ( elem ) {
						var parent = elem.parentNode;
						checkSet[i] = parent.nodeName === part ? parent : false;
					}
				}
			} else {
				for ( var i = 0, l = checkSet.length; i < l; i++ ) {
					var elem = checkSet[i];
					if ( elem ) {
						checkSet[i] = isPartStr ?
							elem.parentNode :
							elem.parentNode === part;
					}
				}

				if ( isPartStr ) {
					Sizzle.filter( part, checkSet, true );
				}
			}
		},
		"": function(checkSet, part, isXML){
			var doneName = done++, checkFn = dirCheck;

			if ( !/\W/.test(part) ) {
				var nodeCheck = part = isXML ? part : part.toUpperCase();
				checkFn = dirNodeCheck;
			}

			checkFn("parentNode", part, doneName, checkSet, nodeCheck, isXML);
		},
		"~": function(checkSet, part, isXML){
			var doneName = done++, checkFn = dirCheck;

			if ( typeof part === "string" && !/\W/.test(part) ) {
				var nodeCheck = part = isXML ? part : part.toUpperCase();
				checkFn = dirNodeCheck;
			}

			checkFn("previousSibling", part, doneName, checkSet, nodeCheck, isXML);
		}
	},
	find: {
		ID: function(match, context, isXML){
			if ( typeof context.getElementById !== "undefined" && !isXML ) {
				var m = context.getElementById(match[1]);
				return m ? [m] : [];
			}
		},
		NAME: function(match, context, isXML){
			if ( typeof context.getElementsByName !== "undefined" ) {
				var ret = [], results = context.getElementsByName(match[1]);

				for ( var i = 0, l = results.length; i < l; i++ ) {
					if ( results[i].getAttribute("name") === match[1] ) {
						ret.push( results[i] );
					}
				}

				return ret.length === 0 ? null : ret;
			}
		},
		TAG: function(match, context){
			return context.getElementsByTagName(match[1]);
		}
	},
	preFilter: {
		CLASS: function(match, curLoop, inplace, result, not, isXML){
			match = " " + match[1].replace(/\\/g, "") + " ";

			if ( isXML ) {
				return match;
			}

			for ( var i = 0, elem; (elem = curLoop[i]) != null; i++ ) {
				if ( elem ) {
					if ( not ^ (elem.className && (" " + elem.className + " ").indexOf(match) >= 0) ) {
						if ( !inplace )
							result.push( elem );
					} else if ( inplace ) {
						curLoop[i] = false;
					}
				}
			}

			return false;
		},
		ID: function(match){
			return match[1].replace(/\\/g, "");
		},
		TAG: function(match, curLoop){
			for ( var i = 0; curLoop[i] === false; i++ ){}
			return curLoop[i] && isXML(curLoop[i]) ? match[1] : match[1].toUpperCase();
		},
		CHILD: function(match){
			if ( match[1] == "nth" ) {
				var test = /(-?)(\d*)n((?:\+|-)?\d*)/.exec(
					match[2] == "even" && "2n" || match[2] == "odd" && "2n+1" ||
					!/\D/.test( match[2] ) && "0n+" + match[2] || match[2]);

				match[2] = (test[1] + (test[2] || 1)) - 0;
				match[3] = test[3] - 0;
			}

			match[0] = done++;

			return match;
		},
		ATTR: function(match, curLoop, inplace, result, not, isXML){
			var name = match[1].replace(/\\/g, "");

			if ( !isXML && Expr.attrMap[name] ) {
				match[1] = Expr.attrMap[name];
			}

			if ( match[2] === "~=" ) {
				match[4] = " " + match[4] + " ";
			}

			return match;
		},
		PSEUDO: function(match, curLoop, inplace, result, not){
			if ( match[1] === "not" ) {
				if ( ( chunker.exec(match[3]) || "" ).length > 1 || /^\w/.test(match[3]) ) {
					match[3] = Sizzle(match[3], null, null, curLoop);
				} else {
					var ret = Sizzle.filter(match[3], curLoop, inplace, true ^ not);
					if ( !inplace ) {
						result.push.apply( result, ret );
					}
					return false;
				}
			} else if ( Expr.match.POS.test( match[0] ) || Expr.match.CHILD.test( match[0] ) ) {
				return true;
			}

			return match;
		},
		POS: function(match){
			match.unshift( true );
			return match;
		}
	},
	filters: {
		enabled: function(elem){
			return elem.disabled === false && elem.type !== "hidden";
		},
		disabled: function(elem){
			return elem.disabled === true;
		},
		checked: function(elem){
			return elem.checked === true;
		},
		selected: function(elem){
			elem.parentNode.selectedIndex;
			return elem.selected === true;
		},
		parent: function(elem){
			return !!elem.firstChild;
		},
		empty: function(elem){
			return !elem.firstChild;
		},
		has: function(elem, i, match){
			return !!Sizzle( match[3], elem ).length;
		},
		header: function(elem){
			return /h\d/i.test( elem.nodeName );
		},
		text: function(elem){
			return "text" === elem.type;
		},
		radio: function(elem){
			return "radio" === elem.type;
		},
		checkbox: function(elem){
			return "checkbox" === elem.type;
		},
		file: function(elem){
			return "file" === elem.type;
		},
		password: function(elem){
			return "password" === elem.type;
		},
		submit: function(elem){
			return "submit" === elem.type;
		},
		image: function(elem){
			return "image" === elem.type;
		},
		reset: function(elem){
			return "reset" === elem.type;
		},
		button: function(elem){
			return "button" === elem.type || elem.nodeName.toUpperCase() === "BUTTON";
		},
		input: function(elem){
			return /input|select|textarea|button/i.test(elem.nodeName);
		}
	},
	setFilters: {
		first: function(elem, i){
			return i === 0;
		},
		last: function(elem, i, match, array){
			return i === array.length - 1;
		},
		even: function(elem, i){
			return i % 2 === 0;
		},
		odd: function(elem, i){
			return i % 2 === 1;
		},
		lt: function(elem, i, match){
			return i < match[3] - 0;
		},
		gt: function(elem, i, match){
			return i > match[3] - 0;
		},
		nth: function(elem, i, match){
			return match[3] - 0 == i;
		},
		eq: function(elem, i, match){
			return match[3] - 0 == i;
		}
	},
	filter: {
		PSEUDO: function(elem, match, i, array){
			var name = match[1], filter = Expr.filters[ name ];

			if ( filter ) {
				return filter( elem, i, match, array );
			} else if ( name === "contains" ) {
				return (elem.textContent || elem.innerText || "").indexOf(match[3]) >= 0;
			} else if ( name === "not" ) {
				var not = match[3];

				for ( var i = 0, l = not.length; i < l; i++ ) {
					if ( not[i] === elem ) {
						return false;
					}
				}

				return true;
			}
		},
		CHILD: function(elem, match){
			var type = match[1], node = elem;
			switch (type) {
				case 'only':
				case 'first':
					while ( (node = node.previousSibling) )  {
						if ( node.nodeType === 1 ) return false;
					}
					if ( type == 'first') return true;
					node = elem;
				case 'last':
					while ( (node = node.nextSibling) )  {
						if ( node.nodeType === 1 ) return false;
					}
					return true;
				case 'nth':
					var first = match[2], last = match[3];

					if ( first == 1 && last == 0 ) {
						return true;
					}

					var doneName = match[0],
						parent = elem.parentNode;

					if ( parent && (parent.sizcache !== doneName || !elem.nodeIndex) ) {
						var count = 0;
						for ( node = parent.firstChild; node; node = node.nextSibling ) {
							if ( node.nodeType === 1 ) {
								node.nodeIndex = ++count;
							}
						}
						parent.sizcache = doneName;
					}

					var diff = elem.nodeIndex - last;
					if ( first == 0 ) {
						return diff == 0;
					} else {
						return ( diff % first == 0 && diff / first >= 0 );
					}
			}
		},
		ID: function(elem, match){
			return elem.nodeType === 1 && elem.getAttribute("id") === match;
		},
		TAG: function(elem, match){
			return (match === "*" && elem.nodeType === 1) || elem.nodeName === match;
		},
		CLASS: function(elem, match){
			return (" " + (elem.className || elem.getAttribute("class")) + " ")
				.indexOf( match ) > -1;
		},
		ATTR: function(elem, match){
			var name = match[1],
				result = Expr.attrHandle[ name ] ?
					Expr.attrHandle[ name ]( elem ) :
					elem[ name ] != null ?
						elem[ name ] :
						elem.getAttribute( name ),
				value = result + "",
				type = match[2],
				check = match[4];

			return result == null ?
				type === "!=" :
				type === "=" ?
				value === check :
				type === "*=" ?
				value.indexOf(check) >= 0 :
				type === "~=" ?
				(" " + value + " ").indexOf(check) >= 0 :
				!check ?
				value && result !== false :
				type === "!=" ?
				value != check :
				type === "^=" ?
				value.indexOf(check) === 0 :
				type === "$=" ?
				value.substr(value.length - check.length) === check :
				type === "|=" ?
				value === check || value.substr(0, check.length + 1) === check + "-" :
				false;
		},
		POS: function(elem, match, i, array){
			var name = match[2], filter = Expr.setFilters[ name ];

			if ( filter ) {
				return filter( elem, i, match, array );
			}
		}
	}
};

var origPOS = Expr.match.POS;

for ( var type in Expr.match ) {
	Expr.match[ type ] = new RegExp( Expr.match[ type ].source + /(?![^\[]*\])(?![^\(]*\))/.source );
	Expr.leftMatch[ type ] = new RegExp( /(^(?:.|\r|\n)*?)/.source + Expr.match[ type ].source );
}

var makeArray = function(array, results) {
	array = Array.prototype.slice.call( array, 0 );

	if ( results ) {
		results.push.apply( results, array );
		return results;
	}

	return array;
};

try {
	Array.prototype.slice.call( document.documentElement.childNodes, 0 );

} catch(e){
	makeArray = function(array, results) {
		var ret = results || [];

		if ( toString.call(array) === "[object Array]" ) {
			Array.prototype.push.apply( ret, array );
		} else {
			if ( typeof array.length === "number" ) {
				for ( var i = 0, l = array.length; i < l; i++ ) {
					ret.push( array[i] );
				}
			} else {
				for ( var i = 0; array[i]; i++ ) {
					ret.push( array[i] );
				}
			}
		}

		return ret;
	};
}

var sortOrder;

if ( document.documentElement.compareDocumentPosition ) {
	sortOrder = function( a, b ) {
		if ( !a.compareDocumentPosition || !b.compareDocumentPosition ) {
			if ( a == b ) {
				hasDuplicate = true;
			}
			return 0;
		}

		var ret = a.compareDocumentPosition(b) & 4 ? -1 : a === b ? 0 : 1;
		if ( ret === 0 ) {
			hasDuplicate = true;
		}
		return ret;
	};
} else if ( "sourceIndex" in document.documentElement ) {
	sortOrder = function( a, b ) {
		if ( !a.sourceIndex || !b.sourceIndex ) {
			if ( a == b ) {
				hasDuplicate = true;
			}
			return 0;
		}

		var ret = a.sourceIndex - b.sourceIndex;
		if ( ret === 0 ) {
			hasDuplicate = true;
		}
		return ret;
	};
} else if ( document.createRange ) {
	sortOrder = function( a, b ) {
		if ( !a.ownerDocument || !b.ownerDocument ) {
			if ( a == b ) {
				hasDuplicate = true;
			}
			return 0;
		}

		var aRange = a.ownerDocument.createRange(), bRange = b.ownerDocument.createRange();
		aRange.setStart(a, 0);
		aRange.setEnd(a, 0);
		bRange.setStart(b, 0);
		bRange.setEnd(b, 0);
		var ret = aRange.compareBoundaryPoints(Range.START_TO_END, bRange);
		if ( ret === 0 ) {
			hasDuplicate = true;
		}
		return ret;
	};
}

(function(){
	var form = document.createElement("div"),
		id = "script" + (new Date).getTime();
	form.innerHTML = "<a name='" + id + "'/>";

	var root = document.documentElement;
	root.insertBefore( form, root.firstChild );

	if ( !!document.getElementById( id ) ) {
		Expr.find.ID = function(match, context, isXML){
			if ( typeof context.getElementById !== "undefined" && !isXML ) {
				var m = context.getElementById(match[1]);
				return m ? m.id === match[1] || typeof m.getAttributeNode !== "undefined" && m.getAttributeNode("id").nodeValue === match[1] ? [m] : undefined : [];
			}
		};

		Expr.filter.ID = function(elem, match){
			var node = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");
			return elem.nodeType === 1 && node && node.nodeValue === match;
		};
	}

	root.removeChild( form );
	root = form = null; // release memory in IE
})();

(function(){

	var div = document.createElement("div");
	div.appendChild( document.createComment("") );

	if ( div.getElementsByTagName("*").length > 0 ) {
		Expr.find.TAG = function(match, context){
			var results = context.getElementsByTagName(match[1]);

			if ( match[1] === "*" ) {
				var tmp = [];

				for ( var i = 0; results[i]; i++ ) {
					if ( results[i].nodeType === 1 ) {
						tmp.push( results[i] );
					}
				}

				results = tmp;
			}

			return results;
		};
	}

	div.innerHTML = "<a href='#'></a>";
	if ( div.firstChild && typeof div.firstChild.getAttribute !== "undefined" &&
			div.firstChild.getAttribute("href") !== "#" ) {
		Expr.attrHandle.href = function(elem){
			return elem.getAttribute("href", 2);
		};
	}

	div = null; // release memory in IE
})();

if ( document.querySelectorAll ) (function(){
	var oldSizzle = Sizzle, div = document.createElement("div");
	div.innerHTML = "<p class='TEST'></p>";

	if ( div.querySelectorAll && div.querySelectorAll(".TEST").length === 0 ) {
		return;
	}

	Sizzle = function(query, context, extra, seed){
		context = context || document;

		if ( !seed && context.nodeType === 9 && !isXML(context) ) {
			try {
				return makeArray( context.querySelectorAll(query), extra );
			} catch(e){}
		}

		return oldSizzle(query, context, extra, seed);
	};

	for ( var prop in oldSizzle ) {
		Sizzle[ prop ] = oldSizzle[ prop ];
	}

	div = null; // release memory in IE
})();

if ( document.getElementsByClassName && document.documentElement.getElementsByClassName ) (function(){
	var div = document.createElement("div");
	div.innerHTML = "<div class='test e'></div><div class='test'></div>";

	if ( div.getElementsByClassName("e").length === 0 )
		return;

	div.lastChild.className = "e";

	if ( div.getElementsByClassName("e").length === 1 )
		return;

	Expr.order.splice(1, 0, "CLASS");
	Expr.find.CLASS = function(match, context, isXML) {
		if ( typeof context.getElementsByClassName !== "undefined" && !isXML ) {
			return context.getElementsByClassName(match[1]);
		}
	};

	div = null; // release memory in IE
})();

function dirNodeCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
	var sibDir = dir == "previousSibling" && !isXML;
	for ( var i = 0, l = checkSet.length; i < l; i++ ) {
		var elem = checkSet[i];
		if ( elem ) {
			if ( sibDir && elem.nodeType === 1 ){
				elem.sizcache = doneName;
				elem.sizset = i;
			}
			elem = elem[dir];
			var match = false;

			while ( elem ) {
				if ( elem.sizcache === doneName ) {
					match = checkSet[elem.sizset];
					break;
				}

				if ( elem.nodeType === 1 && !isXML ){
					elem.sizcache = doneName;
					elem.sizset = i;
				}

				if ( elem.nodeName === cur ) {
					match = elem;
					break;
				}

				elem = elem[dir];
			}

			checkSet[i] = match;
		}
	}
}

function dirCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
	var sibDir = dir == "previousSibling" && !isXML;
	for ( var i = 0, l = checkSet.length; i < l; i++ ) {
		var elem = checkSet[i];
		if ( elem ) {
			if ( sibDir && elem.nodeType === 1 ) {
				elem.sizcache = doneName;
				elem.sizset = i;
			}
			elem = elem[dir];
			var match = false;

			while ( elem ) {
				if ( elem.sizcache === doneName ) {
					match = checkSet[elem.sizset];
					break;
				}

				if ( elem.nodeType === 1 ) {
					if ( !isXML ) {
						elem.sizcache = doneName;
						elem.sizset = i;
					}
					if ( typeof cur !== "string" ) {
						if ( elem === cur ) {
							match = true;
							break;
						}

					} else if ( Sizzle.filter( cur, [elem] ).length > 0 ) {
						match = elem;
						break;
					}
				}

				elem = elem[dir];
			}

			checkSet[i] = match;
		}
	}
}

var contains = document.compareDocumentPosition ?  function(a, b){
	return a.compareDocumentPosition(b) & 16;
} : function(a, b){
	return a !== b && (a.contains ? a.contains(b) : true);
};

var isXML = function(elem){
	return elem.nodeType === 9 && elem.documentElement.nodeName !== "HTML" ||
		!!elem.ownerDocument && elem.ownerDocument.documentElement.nodeName !== "HTML";
};

var posProcess = function(selector, context){
	var tmpSet = [], later = "", match,
		root = context.nodeType ? [context] : context;

	while ( (match = Expr.match.PSEUDO.exec( selector )) ) {
		later += match[0];
		selector = selector.replace( Expr.match.PSEUDO, "" );
	}

	selector = Expr.relative[selector] ? selector + "*" : selector;

	for ( var i = 0, l = root.length; i < l; i++ ) {
		Sizzle( selector, root[i], tmpSet );
	}

	return Sizzle.filter( later, tmpSet );
};


window.Sizzle = Sizzle;

})();

;(function(engine) {
  var extendElements = Prototype.Selector.extendElements;

  function select(selector, scope) {
    return extendElements(engine(selector, scope || document));
  }

  function match(element, selector) {
    return engine.matches(selector, [element]).length == 1;
  }

  Prototype.Selector.engine = engine;
  Prototype.Selector.select = select;
  Prototype.Selector.match = match;
})(Sizzle);

window.Sizzle = Prototype._original_property;
delete Prototype._original_property;

var Form = {
  reset: function(form) {
    form = $(form);
    form.reset();
    return form;
  },

  serializeElements: function(elements, options) {
    if (typeof options != 'object') options = { hash: !!options };
    else if (Object.isUndefined(options.hash)) options.hash = true;
    var key, value, submitted = false, submit = options.submit, accumulator, initial;

    if (options.hash) {
      initial = {};
      accumulator = function(result, key, value) {
        if (key in result) {
          if (!Object.isArray(result[key])) result[key] = [result[key]];
          result[key].push(value);
        } else result[key] = value;
        return result;
      };
    } else {
      initial = '';
      accumulator = function(result, key, value) {
        return result + (result ? '&' : '') + encodeURIComponent(key) + '=' + encodeURIComponent(value);
      }
    }

    return elements.inject(initial, function(result, element) {
      if (!element.disabled && element.name) {
        key = element.name; value = $(element).getValue();
        if (value != null && element.type != 'file' && (element.type != 'submit' || (!submitted &&
            submit !== false && (!submit || key == submit) && (submitted = true)))) {
          result = accumulator(result, key, value);
        }
      }
      return result;
    });
  }
};

Form.Methods = {
  serialize: function(form, options) {
    return Form.serializeElements(Form.getElements(form), options);
  },

  getElements: function(form) {
    var elements = $(form).getElementsByTagName('*'),
        element,
        arr = [ ],
        serializers = Form.Element.Serializers;
    for (var i = 0; element = elements[i]; i++) {
      arr.push(element);
    }
    return arr.inject([], function(elements, child) {
      if (serializers[child.tagName.toLowerCase()])
        elements.push(Element.extend(child));
      return elements;
    })
  },

  getInputs: function(form, typeName, name) {
    form = $(form);
    var inputs = form.getElementsByTagName('input');

    if (!typeName && !name) return $A(inputs).map(Element.extend);

    for (var i = 0, matchingInputs = [], length = inputs.length; i < length; i++) {
      var input = inputs[i];
      if ((typeName && input.type != typeName) || (name && input.name != name))
        continue;
      matchingInputs.push(Element.extend(input));
    }

    return matchingInputs;
  },

  disable: function(form) {
    form = $(form);
    Form.getElements(form).invoke('disable');
    return form;
  },

  enable: function(form) {
    form = $(form);
    Form.getElements(form).invoke('enable');
    return form;
  },

  findFirstElement: function(form) {
    var elements = $(form).getElements().findAll(function(element) {
      return 'hidden' != element.type && !element.disabled;
    });
    var firstByIndex = elements.findAll(function(element) {
      return element.hasAttribute('tabIndex') && element.tabIndex >= 0;
    }).sortBy(function(element) { return element.tabIndex }).first();

    return firstByIndex ? firstByIndex : elements.find(function(element) {
      return /^(?:input|select|textarea)$/i.test(element.tagName);
    });
  },

  focusFirstElement: function(form) {
    form = $(form);
    var element = form.findFirstElement();
    if (element) element.activate();
    return form;
  },

  request: function(form, options) {
    form = $(form), options = Object.clone(options || { });

    var params = options.parameters, action = form.readAttribute('action') || '';
    if (action.blank()) action = window.location.href;
    options.parameters = form.serialize(true);

    if (params) {
      if (Object.isString(params)) params = params.toQueryParams();
      Object.extend(options.parameters, params);
    }

    if (form.hasAttribute('method') && !options.method)
      options.method = form.method;

    return new Ajax.Request(action, options);
  }
};

/*--------------------------------------------------------------------------*/


Form.Element = {
  focus: function(element) {
    $(element).focus();
    return element;
  },

  select: function(element) {
    $(element).select();
    return element;
  }
};

Form.Element.Methods = {

  serialize: function(element) {
    element = $(element);
    if (!element.disabled && element.name) {
      var value = element.getValue();
      if (value != undefined) {
        var pair = { };
        pair[element.name] = value;
        return Object.toQueryString(pair);
      }
    }
    return '';
  },

  getValue: function(element) {
    element = $(element);
    var method = element.tagName.toLowerCase();
    return Form.Element.Serializers[method](element);
  },

  setValue: function(element, value) {
    element = $(element);
    var method = element.tagName.toLowerCase();
    Form.Element.Serializers[method](element, value);
    return element;
  },

  clear: function(element) {
    $(element).value = '';
    return element;
  },

  present: function(element) {
    return $(element).value != '';
  },

  activate: function(element) {
    element = $(element);
    try {
      element.focus();
      if (element.select && (element.tagName.toLowerCase() != 'input' ||
          !(/^(?:button|reset|submit)$/i.test(element.type))))
        element.select();
    } catch (e) { }
    return element;
  },

  disable: function(element) {
    element = $(element);
    element.disabled = true;
    return element;
  },

  enable: function(element) {
    element = $(element);
    element.disabled = false;
    return element;
  }
};

/*--------------------------------------------------------------------------*/

var Field = Form.Element;

var $F = Form.Element.Methods.getValue;

/*--------------------------------------------------------------------------*/

Form.Element.Serializers = (function() {
  function input(element, value) {
    switch (element.type.toLowerCase()) {
      case 'checkbox':
      case 'radio':
        return inputSelector(element, value);
      default:
        return valueSelector(element, value);
    }
  }

  function inputSelector(element, value) {
    if (Object.isUndefined(value))
      return element.checked ? element.value : null;
    else element.checked = !!value;
  }

  function valueSelector(element, value) {
    if (Object.isUndefined(value)) return element.value;
    else element.value = value;
  }

  function select(element, value) {
    if (Object.isUndefined(value))
      return (element.type === 'select-one' ? selectOne : selectMany)(element);

    var opt, currentValue, single = !Object.isArray(value);
    for (var i = 0, length = element.length; i < length; i++) {
      opt = element.options[i];
      currentValue = this.optionValue(opt);
      if (single) {
        if (currentValue == value) {
          opt.selected = true;
          return;
        }
      }
      else opt.selected = value.include(currentValue);
    }
  }

  function selectOne(element) {
    var index = element.selectedIndex;
    return index >= 0 ? optionValue(element.options[index]) : null;
  }

  function selectMany(element) {
    var values, length = element.length;
    if (!length) return null;

    for (var i = 0, values = []; i < length; i++) {
      var opt = element.options[i];
      if (opt.selected) values.push(optionValue(opt));
    }
    return values;
  }

  function optionValue(opt) {
    return Element.hasAttribute(opt, 'value') ? opt.value : opt.text;
  }

  return {
    input:         input,
    inputSelector: inputSelector,
    textarea:      valueSelector,
    select:        select,
    selectOne:     selectOne,
    selectMany:    selectMany,
    optionValue:   optionValue,
    button:        valueSelector
  };
})();

/*--------------------------------------------------------------------------*/


Abstract.TimedObserver = Class.create(PeriodicalExecuter, {
  initialize: function($super, element, frequency, callback) {
    $super(callback, frequency);
    this.element   = $(element);
    this.lastValue = this.getValue();
  },

  execute: function() {
    var value = this.getValue();
    if (Object.isString(this.lastValue) && Object.isString(value) ?
        this.lastValue != value : String(this.lastValue) != String(value)) {
      this.callback(this.element, value);
      this.lastValue = value;
    }
  }
});

Form.Element.Observer = Class.create(Abstract.TimedObserver, {
  getValue: function() {
    return Form.Element.getValue(this.element);
  }
});

Form.Observer = Class.create(Abstract.TimedObserver, {
  getValue: function() {
    return Form.serialize(this.element);
  }
});

/*--------------------------------------------------------------------------*/

Abstract.EventObserver = Class.create({
  initialize: function(element, callback) {
    this.element  = $(element);
    this.callback = callback;

    this.lastValue = this.getValue();
    if (this.element.tagName.toLowerCase() == 'form')
      this.registerFormCallbacks();
    else
      this.registerCallback(this.element);
  },

  onElementEvent: function() {
    var value = this.getValue();
    if (this.lastValue != value) {
      this.callback(this.element, value);
      this.lastValue = value;
    }
  },

  registerFormCallbacks: function() {
    Form.getElements(this.element).each(this.registerCallback, this);
  },

  registerCallback: function(element) {
    if (element.type) {
      switch (element.type.toLowerCase()) {
        case 'checkbox':
        case 'radio':
          Event.observe(element, 'click', this.onElementEvent.bind(this));
          break;
        default:
          Event.observe(element, 'change', this.onElementEvent.bind(this));
          break;
      }
    }
  }
});

Form.Element.EventObserver = Class.create(Abstract.EventObserver, {
  getValue: function() {
    return Form.Element.getValue(this.element);
  }
});

Form.EventObserver = Class.create(Abstract.EventObserver, {
  getValue: function() {
    return Form.serialize(this.element);
  }
});
(function() {

  var Event = {
    KEY_BACKSPACE: 8,
    KEY_TAB:       9,
    KEY_RETURN:   13,
    KEY_ESC:      27,
    KEY_LEFT:     37,
    KEY_UP:       38,
    KEY_RIGHT:    39,
    KEY_DOWN:     40,
    KEY_DELETE:   46,
    KEY_HOME:     36,
    KEY_END:      35,
    KEY_PAGEUP:   33,
    KEY_PAGEDOWN: 34,
    KEY_INSERT:   45,

    cache: {}
  };

  var docEl = document.documentElement;
  var MOUSEENTER_MOUSELEAVE_EVENTS_SUPPORTED = 'onmouseenter' in docEl
    && 'onmouseleave' in docEl;



  var isIELegacyEvent = function(event) { return false; };

  if (window.attachEvent) {
    if (window.addEventListener) {
      isIELegacyEvent = function(event) {
        return !(event instanceof window.Event);
      };
    } else {
      isIELegacyEvent = function(event) { return true; };
    }
  }

  var _isButton;

  function _isButtonForDOMEvents(event, code) {
    return event.which ? (event.which === code + 1) : (event.button === code);
  }

  var legacyButtonMap = { 0: 1, 1: 4, 2: 2 };
  function _isButtonForLegacyEvents(event, code) {
    return event.button === legacyButtonMap[code];
  }

  function _isButtonForWebKit(event, code) {
    switch (code) {
      case 0: return event.which == 1 && !event.metaKey;
      case 1: return event.which == 2 || (event.which == 1 && event.metaKey);
      case 2: return event.which == 3;
      default: return false;
    }
  }

  if (window.attachEvent) {
    if (!window.addEventListener) {
      _isButton = _isButtonForLegacyEvents;
    } else {
      _isButton = function(event, code) {
        return isIELegacyEvent(event) ? _isButtonForLegacyEvents(event, code) :
         _isButtonForDOMEvents(event, code);
      }
    }
  } else if (Prototype.Browser.WebKit) {
    _isButton = _isButtonForWebKit;
  } else {
    _isButton = _isButtonForDOMEvents;
  }

  function isLeftClick(event)   { return _isButton(event, 0) }

  function isMiddleClick(event) { return _isButton(event, 1) }

  function isRightClick(event)  { return _isButton(event, 2) }

  function element(event) {
    event = Event.extend(event);

    var node = event.target, type = event.type,
     currentTarget = event.currentTarget;

    if (currentTarget && currentTarget.tagName) {
      if (type === 'load' || type === 'error' ||
        (type === 'click' && currentTarget.tagName.toLowerCase() === 'input'
          && currentTarget.type === 'radio'))
            node = currentTarget;
    }

    if (node.nodeType == Node.TEXT_NODE)
      node = node.parentNode;

    return Element.extend(node);
  }

  function findElement(event, expression) {
    var element = Event.element(event);

    if (!expression) return element;
    while (element) {
      if (Object.isElement(element) && Prototype.Selector.match(element, expression)) {
        return Element.extend(element);
      }
      element = element.parentNode;
    }
  }

  function pointer(event) {
    return { x: pointerX(event), y: pointerY(event) };
  }

  function pointerX(event) {
    var docElement = document.documentElement,
     body = document.body || { scrollLeft: 0 };

    return event.pageX || (event.clientX +
      (docElement.scrollLeft || body.scrollLeft) -
      (docElement.clientLeft || 0));
  }

  function pointerY(event) {
    var docElement = document.documentElement,
     body = document.body || { scrollTop: 0 };

    return  event.pageY || (event.clientY +
       (docElement.scrollTop || body.scrollTop) -
       (docElement.clientTop || 0));
  }


  function stop(event) {
    Event.extend(event);
    event.preventDefault();
    event.stopPropagation();

    event.stopped = true;
  }


  Event.Methods = {
    isLeftClick:   isLeftClick,
    isMiddleClick: isMiddleClick,
    isRightClick:  isRightClick,

    element:     element,
    findElement: findElement,

    pointer:  pointer,
    pointerX: pointerX,
    pointerY: pointerY,

    stop: stop
  };

  var methods = Object.keys(Event.Methods).inject({ }, function(m, name) {
    m[name] = Event.Methods[name].methodize();
    return m;
  });

  if (window.attachEvent) {
    function _relatedTarget(event) {
      var element;
      switch (event.type) {
        case 'mouseover':
        case 'mouseenter':
          element = event.fromElement;
          break;
        case 'mouseout':
        case 'mouseleave':
          element = event.toElement;
          break;
        default:
          return null;
      }
      return Element.extend(element);
    }

    var additionalMethods = {
      stopPropagation: function() { this.cancelBubble = true },
      preventDefault:  function() { this.returnValue = false },
      inspect: function() { return '[object Event]' }
    };

    Event.extend = function(event, element) {
      if (!event) return false;

      if (!isIELegacyEvent(event)) return event;

      if (event._extendedByPrototype) return event;
      event._extendedByPrototype = Prototype.emptyFunction;

      var pointer = Event.pointer(event);

      Object.extend(event, {
        target: event.srcElement || element,
        relatedTarget: _relatedTarget(event),
        pageX:  pointer.x,
        pageY:  pointer.y
      });

      Object.extend(event, methods);
      Object.extend(event, additionalMethods);

      return event;
    };
  } else {
    Event.extend = Prototype.K;
  }

  if (window.addEventListener) {
    Event.prototype = window.Event.prototype || document.createEvent('HTMLEvents').__proto__;
    Object.extend(Event.prototype, methods);
  }

  function _createResponder(element, eventName, handler) {
    var registry = Element.retrieve(element, 'prototype_event_registry');

    if (Object.isUndefined(registry)) {
      CACHE.push(element);
      registry = Element.retrieve(element, 'prototype_event_registry', $H());
    }

    var respondersForEvent = registry.get(eventName);
    if (Object.isUndefined(respondersForEvent)) {
      respondersForEvent = [];
      registry.set(eventName, respondersForEvent);
    }

    if (respondersForEvent.pluck('handler').include(handler)) return false;

    var responder;
    if (eventName.include(":")) {
      responder = function(event) {
        if (Object.isUndefined(event.eventName))
          return false;

        if (event.eventName !== eventName)
          return false;

        Event.extend(event, element);
        handler.call(element, event);
      };
    } else {
      if (!MOUSEENTER_MOUSELEAVE_EVENTS_SUPPORTED &&
       (eventName === "mouseenter" || eventName === "mouseleave")) {
        if (eventName === "mouseenter" || eventName === "mouseleave") {
          responder = function(event) {
            Event.extend(event, element);

            var parent = event.relatedTarget;
            while (parent && parent !== element) {
              try { parent = parent.parentNode; }
              catch(e) { parent = element; }
            }

            if (parent === element) return;

            handler.call(element, event);
          };
        }
      } else {
        responder = function(event) {
          Event.extend(event, element);
          handler.call(element, event);
        };
      }
    }

    responder.handler = handler;
    respondersForEvent.push(responder);
    return responder;
  }

  function _destroyCache() {
    for (var i = 0, length = CACHE.length; i < length; i++) {
      Event.stopObserving(CACHE[i]);
      CACHE[i] = null;
    }
  }

  var CACHE = [];

  if (Prototype.Browser.IE)
    window.attachEvent('onunload', _destroyCache);

  if (Prototype.Browser.WebKit)
    window.addEventListener('unload', Prototype.emptyFunction, false);


  var _getDOMEventName = Prototype.K,
      translations = { mouseenter: "mouseover", mouseleave: "mouseout" };

  if (!MOUSEENTER_MOUSELEAVE_EVENTS_SUPPORTED) {
    _getDOMEventName = function(eventName) {
      return (translations[eventName] || eventName);
    };
  }

  function observe(element, eventName, handler) {
    element = $(element);

    var responder = _createResponder(element, eventName, handler);

    if (!responder) return element;

    if (eventName.include(':')) {
      if (element.addEventListener)
        element.addEventListener("dataavailable", responder, false);
      else {
        element.attachEvent("ondataavailable", responder);
        element.attachEvent("onlosecapture", responder);
      }
    } else {
      var actualEventName = _getDOMEventName(eventName);

      if (element.addEventListener)
        element.addEventListener(actualEventName, responder, false);
      else
        element.attachEvent("on" + actualEventName, responder);
    }

    return element;
  }

  function stopObserving(element, eventName, handler) {
    element = $(element);

    var registry = Element.retrieve(element, 'prototype_event_registry');
    if (!registry) return element;

    if (!eventName) {
      registry.each( function(pair) {
        var eventName = pair.key;
        stopObserving(element, eventName);
      });
      return element;
    }

    var responders = registry.get(eventName);
    if (!responders) return element;

    if (!handler) {
      responders.each(function(r) {
        stopObserving(element, eventName, r.handler);
      });
      return element;
    }

    var i = responders.length, responder;
    while (i--) {
      if (responders[i].handler === handler) {
        responder = responders[i];
        break;
      }
    }
    if (!responder) return element;

    if (eventName.include(':')) {
      if (element.removeEventListener)
        element.removeEventListener("dataavailable", responder, false);
      else {
        element.detachEvent("ondataavailable", responder);
        element.detachEvent("onlosecapture", responder);
      }
    } else {
      var actualEventName = _getDOMEventName(eventName);
      if (element.removeEventListener)
        element.removeEventListener(actualEventName, responder, false);
      else
        element.detachEvent('on' + actualEventName, responder);
    }

    registry.set(eventName, responders.without(responder));

    return element;
  }

  function fire(element, eventName, memo, bubble) {
    element = $(element);

    if (Object.isUndefined(bubble))
      bubble = true;

    if (element == document && document.createEvent && !element.dispatchEvent)
      element = document.documentElement;

    var event;
    if (document.createEvent) {
      event = document.createEvent('HTMLEvents');
      event.initEvent('dataavailable', bubble, true);
    } else {
      event = document.createEventObject();
      event.eventType = bubble ? 'ondataavailable' : 'onlosecapture';
    }

    event.eventName = eventName;
    event.memo = memo || { };

    if (document.createEvent)
      element.dispatchEvent(event);
    else
      element.fireEvent(event.eventType, event);

    return Event.extend(event);
  }

  Event.Handler = Class.create({
    initialize: function(element, eventName, selector, callback) {
      this.element   = $(element);
      this.eventName = eventName;
      this.selector  = selector;
      this.callback  = callback;
      this.handler   = this.handleEvent.bind(this);
    },

    start: function() {
      Event.observe(this.element, this.eventName, this.handler);
      return this;
    },

    stop: function() {
      Event.stopObserving(this.element, this.eventName, this.handler);
      return this;
    },

    handleEvent: function(event) {
      var element = Event.findElement(event, this.selector);
      if (element) this.callback.call(this.element, event, element);
    }
  });

  function on(element, eventName, selector, callback) {
    element = $(element);
    if (Object.isFunction(selector) && Object.isUndefined(callback)) {
      callback = selector, selector = null;
    }

    return new Event.Handler(element, eventName, selector, callback).start();
  }

  Object.extend(Event, Event.Methods);

  Object.extend(Event, {
    fire:          fire,
    observe:       observe,
    stopObserving: stopObserving,
    on:            on
  });

  Element.addMethods({
    fire:          fire,

    observe:       observe,

    stopObserving: stopObserving,

    on:            on
  });

  Object.extend(document, {
    fire:          fire.methodize(),

    observe:       observe.methodize(),

    stopObserving: stopObserving.methodize(),

    on:            on.methodize(),

    loaded:        false
  });

  if (window.Event) Object.extend(window.Event, Event);
  else window.Event = Event;
})();

(function() {
  /* Support for the DOMContentLoaded event is based on work by Dan Webb,
     Matthias Miller, Dean Edwards, John Resig, and Diego Perini. */

  var timer;

  function fireContentLoadedEvent() {
    if (document.loaded) return;
    if (timer) window.clearTimeout(timer);
    document.loaded = true;
    document.fire('dom:loaded');
  }

  function checkReadyState() {
    if (document.readyState === 'complete') {
      document.stopObserving('readystatechange', checkReadyState);
      fireContentLoadedEvent();
    }
  }

  function pollDoScroll() {
    try { document.documentElement.doScroll('left'); }
    catch(e) {
      timer = pollDoScroll.defer();
      return;
    }
    fireContentLoadedEvent();
  }

  if (document.addEventListener) {
    document.addEventListener('DOMContentLoaded', fireContentLoadedEvent, false);
  } else {
    document.observe('readystatechange', checkReadyState);
    if (window == top)
      timer = pollDoScroll.defer();
  }

  Event.observe(window, 'load', fireContentLoadedEvent);
})();

Element.addMethods();

/*------------------------------- DEPRECATED -------------------------------*/

Hash.toQueryString = Object.toQueryString;

var Toggle = { display: Element.toggle };

Element.Methods.childOf = Element.Methods.descendantOf;

var Insertion = {
  Before: function(element, content) {
    return Element.insert(element, {before:content});
  },

  Top: function(element, content) {
    return Element.insert(element, {top:content});
  },

  Bottom: function(element, content) {
    return Element.insert(element, {bottom:content});
  },

  After: function(element, content) {
    return Element.insert(element, {after:content});
  }
};

var $continue = new Error('"throw $continue" is deprecated, use "return" instead');

var Position = {
  includeScrollOffsets: false,

  prepare: function() {
    this.deltaX =  window.pageXOffset
                || document.documentElement.scrollLeft
                || document.body.scrollLeft
                || 0;
    this.deltaY =  window.pageYOffset
                || document.documentElement.scrollTop
                || document.body.scrollTop
                || 0;
  },

  within: function(element, x, y) {
    if (this.includeScrollOffsets)
      return this.withinIncludingScrolloffsets(element, x, y);
    this.xcomp = x;
    this.ycomp = y;
    this.offset = Element.cumulativeOffset(element);

    return (y >= this.offset[1] &&
            y <  this.offset[1] + element.offsetHeight &&
            x >= this.offset[0] &&
            x <  this.offset[0] + element.offsetWidth);
  },

  withinIncludingScrolloffsets: function(element, x, y) {
    var offsetcache = Element.cumulativeScrollOffset(element);

    this.xcomp = x + offsetcache[0] - this.deltaX;
    this.ycomp = y + offsetcache[1] - this.deltaY;
    this.offset = Element.cumulativeOffset(element);

    return (this.ycomp >= this.offset[1] &&
            this.ycomp <  this.offset[1] + element.offsetHeight &&
            this.xcomp >= this.offset[0] &&
            this.xcomp <  this.offset[0] + element.offsetWidth);
  },

  overlap: function(mode, element) {
    if (!mode) return 0;
    if (mode == 'vertical')
      return ((this.offset[1] + element.offsetHeight) - this.ycomp) /
        element.offsetHeight;
    if (mode == 'horizontal')
      return ((this.offset[0] + element.offsetWidth) - this.xcomp) /
        element.offsetWidth;
  },


  cumulativeOffset: Element.Methods.cumulativeOffset,

  positionedOffset: Element.Methods.positionedOffset,

  absolutize: function(element) {
    Position.prepare();
    return Element.absolutize(element);
  },

  relativize: function(element) {
    Position.prepare();
    return Element.relativize(element);
  },

  realOffset: Element.Methods.cumulativeScrollOffset,

  offsetParent: Element.Methods.getOffsetParent,

  page: Element.Methods.viewportOffset,

  clone: function(source, target, options) {
    options = options || { };
    return Element.clonePosition(target, source, options);
  }
};

/*--------------------------------------------------------------------------*/

if (!document.getElementsByClassName) document.getElementsByClassName = function(instanceMethods){
  function iter(name) {
    return name.blank() ? null : "[contains(concat(' ', @class, ' '), ' " + name + " ')]";
  }

  instanceMethods.getElementsByClassName = Prototype.BrowserFeatures.XPath ?
  function(element, className) {
    className = className.toString().strip();
    var cond = /\s/.test(className) ? $w(className).map(iter).join('') : iter(className);
    return cond ? document._getElementsByXPath('.//*' + cond, element) : [];
  } : function(element, className) {
    className = className.toString().strip();
    var elements = [], classNames = (/\s/.test(className) ? $w(className) : null);
    if (!classNames && !className) return elements;

    var nodes = $(element).getElementsByTagName('*');
    className = ' ' + className + ' ';

    for (var i = 0, child, cn; child = nodes[i]; i++) {
      if (child.className && (cn = ' ' + child.className + ' ') && (cn.include(className) ||
          (classNames && classNames.all(function(name) {
            return !name.toString().blank() && cn.include(' ' + name + ' ');
          }))))
        elements.push(Element.extend(child));
    }
    return elements;
  };

  return function(className, parentElement) {
    return $(parentElement || document.body).getElementsByClassName(className);
  };
}(Element.Methods);

/*--------------------------------------------------------------------------*/

Element.ClassNames = Class.create();
Element.ClassNames.prototype = {
  initialize: function(element) {
    this.element = $(element);
  },

  _each: function(iterator) {
    this.element.className.split(/\s+/).select(function(name) {
      return name.length > 0;
    })._each(iterator);
  },

  set: function(className) {
    this.element.className = className;
  },

  add: function(classNameToAdd) {
    if (this.include(classNameToAdd)) return;
    this.set($A(this).concat(classNameToAdd).join(' '));
  },

  remove: function(classNameToRemove) {
    if (!this.include(classNameToRemove)) return;
    this.set($A(this).without(classNameToRemove).join(' '));
  },

  toString: function() {
    return $A(this).join(' ');
  }
};

Object.extend(Element.ClassNames.prototype, Enumerable);

/*--------------------------------------------------------------------------*/

(function() {
  window.Selector = Class.create({
    initialize: function(expression) {
      this.expression = expression.strip();
    },

    findElements: function(rootElement) {
      return Prototype.Selector.select(this.expression, rootElement);
    },

    match: function(element) {
      return Prototype.Selector.match(element, this.expression);
    },

    toString: function() {
      return this.expression;
    },

    inspect: function() {
      return "#<Selector: " + this.expression + ">";
    }
  });

  Object.extend(Selector, {
    matchElements: function(elements, expression) {
      var match = Prototype.Selector.match,
          results = [];

      for (var i = 0, length = elements.length; i < length; i++) {
        var element = elements[i];
        if (match(element, expression)) {
          results.push(Element.extend(element));
        }
      }
      return results;
    },

    findElement: function(elements, expression, index) {
      index = index || 0;
      var matchIndex = 0, element;
      for (var i = 0, length = elements.length; i < length; i++) {
        element = elements[i];
        if (Prototype.Selector.match(element, expression) && index === matchIndex++) {
          return Element.extend(element);
        }
      }
    },

    findChildElements: function(element, expressions) {
      var selector = expressions.toArray().join(', ');
      return Prototype.Selector.select(selector, element || document);
    }
  });
})();

// Credit Card Validation Javascript
// copyright 12th May 2003, by Stephen Chapman, Felgall Pty Ltd

// You have permission to copy and use this javascript provided that
// the content of the script is not changed in any way.

function validateCreditCard(s) {
    // remove non-numerics
    var v = "0123456789";
    var w = "";
    for (i=0; i < s.length; i++) {
        x = s.charAt(i);
        if (v.indexOf(x,0) != -1)
        w += x;
    }
    // validate number
    j = w.length / 2;
    k = Math.floor(j);
    m = Math.ceil(j) - k;
    c = 0;
    for (i=0; i<k; i++) {
        a = w.charAt(i*2+m) * 2;
        c += a > 9 ? Math.floor(a/10 + a%10) : a;
    }
    for (i=0; i<k+m; i++) c += w.charAt(i*2+1-m) * 1;
    return (c%10 == 0);
}


/*
* Really easy field validation with Prototype
* http://tetlaw.id.au/view/javascript/really-easy-field-validation
* Andrew Tetlaw
* Version 1.5.4.1 (2007-01-05)
*
* Copyright (c) 2007 Andrew Tetlaw
* Permission is hereby granted, free of charge, to any person
* obtaining a copy of this software and associated documentation
* files (the "Software"), to deal in the Software without
* restriction, including without limitation the rights to use, copy,
* modify, merge, publish, distribute, sublicense, and/or sell copies
* of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be
* included in all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
* EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
* MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
* NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
* BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
* ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
* CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
* SOFTWARE.
*
*/
var Validator = Class.create();

Validator.prototype = {
    initialize : function(className, error, test, options) {
        if(typeof test == 'function'){
            this.options = $H(options);
            this._test = test;
        } else {
            this.options = $H(test);
            this._test = function(){return true};
        }
        this.error = error || 'Validation failed.';
        this.className = className;
    },
    test : function(v, elm) {
        return (this._test(v,elm) && this.options.all(function(p){
            return Validator.methods[p.key] ? Validator.methods[p.key](v,elm,p.value) : true;
        }));
    }
}
Validator.methods = {
    pattern : function(v,elm,opt) {return Validation.get('IsEmpty').test(v) || opt.test(v)},
    minLength : function(v,elm,opt) {return v.length >= opt},
    maxLength : function(v,elm,opt) {return v.length <= opt},
    min : function(v,elm,opt) {return v >= parseFloat(opt)},
    max : function(v,elm,opt) {return v <= parseFloat(opt)},
    notOneOf : function(v,elm,opt) {return $A(opt).all(function(value) {
        return v != value;
    })},
    oneOf : function(v,elm,opt) {return $A(opt).any(function(value) {
        return v == value;
    })},
    is : function(v,elm,opt) {return v == opt},
    isNot : function(v,elm,opt) {return v != opt},
    equalToField : function(v,elm,opt) {return v == $F(opt)},
    notEqualToField : function(v,elm,opt) {return v != $F(opt)},
    include : function(v,elm,opt) {return $A(opt).all(function(value) {
        return Validation.get(value).test(v,elm);
    })}
}

var Validation = Class.create();
Validation.defaultOptions = {
    onSubmit : true,
    stopOnFirst : false,
    immediate : false,
    focusOnError : true,
    useTitles : false,
    addClassNameToContainer: false,
    containerClassName: '.input-box',
    onFormValidate : function(result, form) {},
    onElementValidate : function(result, elm) {}
};

Validation.prototype = {
    initialize : function(form, options){
        this.form = $(form);
        if (!this.form) {
            return;
        }
        this.options = Object.extend({
            onSubmit : Validation.defaultOptions.onSubmit,
            stopOnFirst : Validation.defaultOptions.stopOnFirst,
            immediate : Validation.defaultOptions.immediate,
            focusOnError : Validation.defaultOptions.focusOnError,
            useTitles : Validation.defaultOptions.useTitles,
            onFormValidate : Validation.defaultOptions.onFormValidate,
            onElementValidate : Validation.defaultOptions.onElementValidate
        }, options || {});
        if(this.options.onSubmit) Event.observe(this.form,'submit',this.onSubmit.bind(this),false);
        if(this.options.immediate) {
            Form.getElements(this.form).each(function(input) { // Thanks Mike!
                if (input.tagName.toLowerCase() == 'select') {
                    Event.observe(input, 'blur', this.onChange.bindAsEventListener(this));
                }
                if (input.type.toLowerCase() == 'radio' || input.type.toLowerCase() == 'checkbox') {
                    Event.observe(input, 'click', this.onChange.bindAsEventListener(this));
                } else {
                    Event.observe(input, 'change', this.onChange.bindAsEventListener(this));
                }
            }, this);
        }
    },
    onChange : function (ev) {
        Validation.isOnChange = true;
        Validation.validate(Event.element(ev),{
                useTitle : this.options.useTitles,
                onElementValidate : this.options.onElementValidate
        });
        Validation.isOnChange = false;
    },
    onSubmit :  function(ev){
        if(!this.validate()) Event.stop(ev);
    },
    validate : function() {
        var result = false;
        var useTitles = this.options.useTitles;
        var callback = this.options.onElementValidate;
        try {
            if(this.options.stopOnFirst) {
                result = Form.getElements(this.form).all(function(elm) {
                    if (elm.hasClassName('local-validation') && !this.isElementInForm(elm, this.form)) {
                        return true;
                    }
                    return Validation.validate(elm,{useTitle : useTitles, onElementValidate : callback});
                }, this);
            } else {
                result = Form.getElements(this.form).collect(function(elm) {
                    if (elm.hasClassName('local-validation') && !this.isElementInForm(elm, this.form)) {
                        return true;
                    }
                    return Validation.validate(elm,{useTitle : useTitles, onElementValidate : callback});
                }, this).all();
            }
        } catch (e) {
        }
        if(!result && this.options.focusOnError) {
            try{
                Form.getElements(this.form).findAll(function(elm){return $(elm).hasClassName('validation-failed')}).first().focus()
            }
            catch(e){
            }
        }
        this.options.onFormValidate(result, this.form);
        return result;
    },
    reset : function() {
        Form.getElements(this.form).each(Validation.reset);
    },
    isElementInForm : function(elm, form) {
        var domForm = elm.up('form');
        if (domForm == form) {
            return true;
        }
        return false;
    }
}

Object.extend(Validation, {
    validate : function(elm, options){
        options = Object.extend({
            useTitle : false,
            onElementValidate : function(result, elm) {}
        }, options || {});
        elm = $(elm);

        var cn = $w(elm.className);
        return result = cn.all(function(value) {
            var test = Validation.test(value,elm,options.useTitle);
            options.onElementValidate(test, elm);
            return test;
        });
    },
    insertAdvice : function(elm, advice){
        var container = $(elm).up('.field-row');
        if(container){
            Element.insert(container, {after: advice});
        } else if (elm.up('td.value')) {
            elm.up('td.value').insert({bottom: advice});
        } else if (elm.advaiceContainer && $(elm.advaiceContainer)) {
            $(elm.advaiceContainer).update(advice);
        }
        else {
            switch (elm.type.toLowerCase()) {
                case 'checkbox':
                case 'radio':
                    var p = elm.parentNode;
                    if(p) {
                        Element.insert(p, {'bottom': advice});
                    } else {
                        Element.insert(elm, {'after': advice});
                    }
                    break;
                default:
                    Element.insert(elm, {'after': advice});
            }
        }
    },
    showAdvice : function(elm, advice, adviceName){
        if(!elm.advices){
            elm.advices = new Hash();
        }
        else{
            elm.advices.each(function(pair){
                if (!advice || pair.value.id != advice.id) {
                    // hide non-current advice after delay
                    this.hideAdvice(elm, pair.value);
                }
            }.bind(this));
        }
        elm.advices.set(adviceName, advice);
        if(typeof Effect == 'undefined') {
            advice.style.display = 'block';
        } else {
            if(!advice._adviceAbsolutize) {
                new Effect.Appear(advice, {duration : 1 });
            } else {
                Position.absolutize(advice);
                advice.show();
                advice.setStyle({
                    'top':advice._adviceTop,
                    'left': advice._adviceLeft,
                    'width': advice._adviceWidth,
                    'z-index': 1000
                });
                advice.addClassName('advice-absolute');
            }
        }
    },
    hideAdvice : function(elm, advice){
        if (advice != null) {
            new Effect.Fade(advice, {duration : 1, afterFinishInternal : function() {advice.hide();}});
        }
    },
    updateCallback : function(elm, status) {
        if (typeof elm.callbackFunction != 'undefined') {
            eval(elm.callbackFunction+'(\''+elm.id+'\',\''+status+'\')');
        }
    },
    ajaxError : function(elm, errorMsg) {
        var name = 'validate-ajax';
        var advice = Validation.getAdvice(name, elm);
        if (advice == null) {
            advice = this.createAdvice(name, elm, false, errorMsg);
        }
        this.showAdvice(elm, advice, 'validate-ajax');
        this.updateCallback(elm, 'failed');

        elm.addClassName('validation-failed');
        elm.addClassName('validate-ajax');
        if (Validation.defaultOptions.addClassNameToContainer && Validation.defaultOptions.containerClassName != '') {
            var container = elm.up(Validation.defaultOptions.containerClassName);
            if (container && this.allowContainerClassName(elm)) {
                container.removeClassName('validation-passed');
                container.addClassName('validation-error');
            }
        }
    },
    allowContainerClassName: function (elm) {
        if (elm.type == 'radio' || elm.type == 'checkbox') {
            return elm.hasClassName('change-container-classname');
        }

        return true;
    },
    test : function(name, elm, useTitle) {
        var v = Validation.get(name);
        var prop = '__advice'+name.camelize();
        try {
        if(Validation.isVisible(elm) && !v.test($F(elm), elm)) {
            //if(!elm[prop]) {
                var advice = Validation.getAdvice(name, elm);
                if (advice == null) {
                    advice = this.createAdvice(name, elm, useTitle);
                }
                this.showAdvice(elm, advice, name);
                this.updateCallback(elm, 'failed');
            //}
            elm[prop] = 1;
            if (!elm.advaiceContainer) {
                elm.removeClassName('validation-passed');
                elm.addClassName('validation-failed');
            }

           if (Validation.defaultOptions.addClassNameToContainer && Validation.defaultOptions.containerClassName != '') {
                var container = elm.up(Validation.defaultOptions.containerClassName);
                if (container && this.allowContainerClassName(elm)) {
                    container.removeClassName('validation-passed');
                    container.addClassName('validation-error');
                }
            }
            return false;
        } else {
            var advice = Validation.getAdvice(name, elm);
            this.hideAdvice(elm, advice);
            this.updateCallback(elm, 'passed');
            elm[prop] = '';
            elm.removeClassName('validation-failed');
            elm.addClassName('validation-passed');
            if (Validation.defaultOptions.addClassNameToContainer && Validation.defaultOptions.containerClassName != '') {
                var container = elm.up(Validation.defaultOptions.containerClassName);
                if (container && !container.down('.validation-failed') && this.allowContainerClassName(elm)) {
                    if (!Validation.get('IsEmpty').test(elm.value) || !this.isVisible(elm)) {
                        container.addClassName('validation-passed');
                    } else {
                        container.removeClassName('validation-passed');
                    }
                    container.removeClassName('validation-error');
                }
            }
            return true;
        }
        } catch(e) {
            throw(e)
        }
    },
    isVisible : function(elm) {
        while(elm.tagName != 'BODY') {
            if(!$(elm).visible()) return false;
            elm = elm.parentNode;
        }
        return true;
    },
    getAdvice : function(name, elm) {
        return $('advice-' + name + '-' + Validation.getElmID(elm)) || $('advice-' + Validation.getElmID(elm));
    },
    createAdvice : function(name, elm, useTitle, customError) {
        var v = Validation.get(name);
        var errorMsg = useTitle ? ((elm && elm.title) ? elm.title : v.error) : v.error;
        if (customError) {
            errorMsg = customError;
        }
        try {
            if (Translator){
                errorMsg = Translator.translate(errorMsg);
            }
        }
        catch(e){}

        advice = '<div class="validation-advice" id="advice-' + name + '-' + Validation.getElmID(elm) +'" style="display:none">' + errorMsg + '</div>'


        Validation.insertAdvice(elm, advice);
        advice = Validation.getAdvice(name, elm);
        if($(elm).hasClassName('absolute-advice')) {
            var dimensions = $(elm).getDimensions();
            var originalPosition = Position.cumulativeOffset(elm);

            advice._adviceTop = (originalPosition[1] + dimensions.height) + 'px';
            advice._adviceLeft = (originalPosition[0])  + 'px';
            advice._adviceWidth = (dimensions.width)  + 'px';
            advice._adviceAbsolutize = true;
        }
        return advice;
    },
    getElmID : function(elm) {
        return elm.id ? elm.id : elm.name;
    },
    reset : function(elm) {
        elm = $(elm);
        var cn = $w(elm.className);
        cn.each(function(value) {
            var prop = '__advice'+value.camelize();
            if(elm[prop]) {
                var advice = Validation.getAdvice(value, elm);
                if (advice) {
                    advice.hide();
                }
                elm[prop] = '';
            }
            elm.removeClassName('validation-failed');
            elm.removeClassName('validation-passed');
            if (Validation.defaultOptions.addClassNameToContainer && Validation.defaultOptions.containerClassName != '') {
                var container = elm.up(Validation.defaultOptions.containerClassName);
                if (container) {
                    container.removeClassName('validation-passed');
                    container.removeClassName('validation-error');
                }
            }
        });
    },
    add : function(className, error, test, options) {
        var nv = {};
        nv[className] = new Validator(className, error, test, options);
        Object.extend(Validation.methods, nv);
    },
    addAllThese : function(validators) {
        var nv = {};
        $A(validators).each(function(value) {
                nv[value[0]] = new Validator(value[0], value[1], value[2], (value.length > 3 ? value[3] : {}));
            });
        Object.extend(Validation.methods, nv);
    },
    get : function(name) {
        return  Validation.methods[name] ? Validation.methods[name] : Validation.methods['_LikeNoIDIEverSaw_'];
    },
    methods : {
        '_LikeNoIDIEverSaw_' : new Validator('_LikeNoIDIEverSaw_','',{})
    }
});

Validation.add('IsEmpty', '', function(v) {
    return  (v == '' || (v == null) || (v.length == 0) || /^\s+$/.test(v));
});

Validation.addAllThese([
    ['validate-no-html-tags', 'HTML tags are not allowed', function(v) {
				return !/<(\/)?\w+/.test(v);
			}],
	['validate-select', 'Please select an option.', function(v) {
                return ((v != "none") && (v != null) && (v.length != 0));
            }],
    ['required-entry', '필수 입력란입니다.', function(v) {
                return !Validation.get('IsEmpty').test(v);
            }],
    ['validate-number', 'Please enter a valid number in this field.', function(v) {
                return Validation.get('IsEmpty').test(v)
                    || (!isNaN(parseNumber(v)) && /^\s*-?\d*(\.\d*)?\s*$/.test(v));
            }],
    ['validate-number-range', 'The value is not within the specified range.', function(v, elm) {
                if (Validation.get('IsEmpty').test(v)) {
                    return true;
                }

                var numValue = parseNumber(v);
                if (isNaN(numValue)) {
                    return false;
                }

                var reRange = /^number-range-(-?[\d.,]+)?-(-?[\d.,]+)?$/,
                    result = true;

                $w(elm.className).each(function(name) {
                    var m = reRange.exec(name);
                    if (m) {
                        result = result
                            && (m[1] == null || m[1] == '' || numValue >= parseNumber(m[1]))
                            && (m[2] == null || m[2] == '' || numValue <= parseNumber(m[2]));
                    }
                });

                return result;
            }],
    ['validate-digits', 'Please use numbers only in this field. Please avoid spaces or other characters such as dots or commas.', function(v) {
                return Validation.get('IsEmpty').test(v) ||  !/[^\d]/.test(v);
            }],
    ['validate-digits-range', 'The value is not within the specified range.', function(v, elm) {
                if (Validation.get('IsEmpty').test(v)) {
                    return true;
                }

                var numValue = parseNumber(v);
                if (isNaN(numValue)) {
                    return false;
                }

                var reRange = /^digits-range-(-?\d+)?-(-?\d+)?$/,
                    result = true;

                $w(elm.className).each(function(name) {
                    var m = reRange.exec(name);
                    if (m) {
                        result = result
                            && (m[1] == null || m[1] == '' || numValue >= parseNumber(m[1]))
                            && (m[2] == null || m[2] == '' || numValue <= parseNumber(m[2]));
                    }
                });

                return result;
            }],
    ['validate-alpha', 'Please use letters only (a-z or A-Z) in this field.', function (v) {
                return Validation.get('IsEmpty').test(v) ||  /^[a-zA-Z]+$/.test(v)
            }],
    ['validate-code', 'Please use only letters (a-z), numbers (0-9) or underscore(_) in this field, first character should be a letter.', function (v) {
                return Validation.get('IsEmpty').test(v) ||  /^[a-z]+[a-z0-9_]+$/.test(v)
            }],
    ['validate-alphanum', 'Please use only letters (a-z or A-Z) or numbers (0-9) only in this field. No spaces or other characters are allowed.', function(v) {
                return Validation.get('IsEmpty').test(v) || /^[a-zA-Z0-9]+$/.test(v)
            }],
    ['validate-alphanum-with-spaces', 'Please use only letters (a-z or A-Z), numbers (0-9) or spaces only in this field.', function(v) {
                    return Validation.get('IsEmpty').test(v) || /^[a-zA-Z0-9 ]+$/.test(v)
            }],
    ['validate-street', 'Please use only letters (a-z or A-Z) or numbers (0-9) or spaces and # only in this field.', function(v) {
                return Validation.get('IsEmpty').test(v) ||  /^[ \w]{3,}([A-Za-z]\.)?([ \w]*\#\d+)?(\r\n| )[ \w]{3,}/.test(v)
            }],
    ['validate-phoneStrict', '올바른 전화번호를 입력하세요. 예 : 010-456-7890 or 123-456-7890.', function(v) {
                return Validation.get('IsEmpty').test(v) || /^(\()?\d{3}(\))?(-|\s)?\d{3}(-|\s)\d{4}$/.test(v);
            }],
    ['validate-phoneLax', '올바른 전화번호를 입력하세요. 예 : 010-456-7890 or 123-456-7890.', function(v) {
                return Validation.get('IsEmpty').test(v) || /^((\d[-. ]?)?((\(\d{3}\))|\d{3}))?[-. ]?\d{3}[-. ]?\d{4}$/.test(v);
            }],
    ['validate-fax', 'Please enter a valid fax number. For example (123) 456-7890 or 123-456-7890.', function(v) {
                return Validation.get('IsEmpty').test(v) || /^(\()?\d{3}(\))?(-|\s)?\d{3}(-|\s)\d{4}$/.test(v);
            }],
    ['validate-date', '올바른 날짜를 입력하십시오.', function(v) {
                var test = new Date(v);
                return Validation.get('IsEmpty').test(v) || !isNaN(test);
            }],
    ['validate-email', '올바른 이메일 주소를 입력하세요. 예 : johndoe@domain.com.', function (v) {
                //return Validation.get('IsEmpty').test(v) || /\w{1,}[@][\w\-]{1,}([.]([\w\-]{1,})){1,3}$/.test(v)
                //return Validation.get('IsEmpty').test(v) || /^[\!\#$%\*/?|\^\{\}`~&\'\+\-=_a-z0-9][\!\#$%\*/?|\^\{\}`~&\'\+\-=_a-z0-9\.]{1,30}[\!\#$%\*/?|\^\{\}`~&\'\+\-=_a-z0-9]@([a-z0-9_-]{1,30}\.){1,5}[a-z]{2,4}$/i.test(v)
                return Validation.get('IsEmpty').test(v) || /^([a-z0-9,!\#\$%&'\*\+\/=\?\^_`\{\|\}~-]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z0-9,!\#\$%&'\*\+\/=\?\^_`\{\|\}~-]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*@([a-z0-9-]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z0-9-]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*\.(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]){2,})$/i.test(v)
            }],
    ['validate-emailSender', 'Please use only visible characters and spaces.', function (v) {
                return Validation.get('IsEmpty').test(v) ||  /^[\S ]+$/.test(v)
                    }],
    ['validate-password', '6자 이상으로 입력하십시오. 앞/뒤 공백은 삭제됩니다.', function(v) {
                var pass=v.strip(); /*strip leading and trailing spaces*/
                return !(pass.length>0 && pass.length < 6);
            }],
    ['validate-admin-password', '7 자 이상 입력하십시오. 암호는 숫자와 영문자를 모두 포함해야합니다.', function(v) {
                var pass=v.strip();
                if (0 == pass.length) {
                    return true;
                }
                if (!(/[a-z]/i.test(v)) || !(/[0-9]/.test(v))) {
                    return false;
                }
                return !(pass.length < 7);
            }],
    ['validate-cpassword', 'Please make sure your passwords match.', function(v) {
                var conf = $('confirmation') ? $('confirmation') : $$('.validate-cpassword')[0];
                var pass = false;
                if ($('password')) {
                    pass = $('password');
                }
                var passwordElements = $$('.validate-password');
                for (var i = 0; i < passwordElements.size(); i++) {
                    var passwordElement = passwordElements[i];
                    if (passwordElement.up('form').id == conf.up('form').id) {
                        pass = passwordElement;
                    }
                }
                if ($$('.validate-admin-password').size()) {
                    pass = $$('.validate-admin-password')[0];
                }
                return (pass.value == conf.value);
            }],
    ['validate-url', 'Please enter a valid URL. Protocol is required (http://, https:// or ftp://)', function (v) {
                v = (v || '').replace(/^\s+/, '').replace(/\s+$/, '');
                return Validation.get('IsEmpty').test(v) || /^(http|https|ftp):\/\/(([A-Z0-9]([A-Z0-9_-]*[A-Z0-9]|))(\.[A-Z0-9]([A-Z0-9_-]*[A-Z0-9]|))*)(:(\d+))?(\/[A-Z0-9~](([A-Z0-9_~-]|\.)*[A-Z0-9~]|))*\/?(.*)?$/i.test(v)
            }],
    ['validate-clean-url', 'Please enter a valid URL. For example http://www.example.com or www.example.com', function (v) {
                return Validation.get('IsEmpty').test(v) || /^(http|https|ftp):\/\/(([A-Z0-9][A-Z0-9_-]*)(\.[A-Z0-9][A-Z0-9_-]*)+.(com|org|net|dk|at|us|tv|info|uk|co.uk|biz|se)$)(:(\d+))?\/?/i.test(v) || /^(www)((\.[A-Z0-9][A-Z0-9_-]*)+.(com|org|net|dk|at|us|tv|info|uk|co.uk|biz|se)$)(:(\d+))?\/?/i.test(v)
            }],
    ['validate-identifier', 'Please enter a valid URL Key. For example "example-page", "example-page.html" or "anotherlevel/example-page".', function (v) {
                return Validation.get('IsEmpty').test(v) || /^[a-z0-9][a-z0-9_\/-]+(\.[a-z0-9_-]+)?$/.test(v)
            }],
    ['validate-xml-identifier', 'Please enter a valid XML-identifier. For example something_1, block5, id-4.', function (v) {
                return Validation.get('IsEmpty').test(v) || /^[A-Z][A-Z0-9_\/-]*$/i.test(v)
            }],
    ['validate-ssn', 'Please enter a valid social security number. For example 123-45-6789.', function(v) {
            return Validation.get('IsEmpty').test(v) || /^\d{3}-?\d{2}-?\d{4}$/.test(v);
            }],
    ['validate-zip', 'Please enter a valid zip code. For example 90602 or 90602-1234.', function(v) {
            return Validation.get('IsEmpty').test(v) || /(^\d{5}$)|(^\d{5}-\d{4}$)/.test(v);
            }],
    ['validate-zip-international', 'Please enter a valid zip code.', function(v) {
            //return Validation.get('IsEmpty').test(v) || /(^[A-z0-9]{2,10}([\s]{0,1}|[\-]{0,1})[A-z0-9]{2,10}$)/.test(v);
            return true;
            }],
    ['validate-date-au', 'Please use this date format: dd/mm/yyyy. For example 17/03/2006 for the 17th of March, 2006.', function(v) {
                if(Validation.get('IsEmpty').test(v)) return true;
                var regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
                if(!regex.test(v)) return false;
                var d = new Date(v.replace(regex, '$2/$1/$3'));
                return ( parseInt(RegExp.$2, 10) == (1+d.getMonth()) ) &&
                            (parseInt(RegExp.$1, 10) == d.getDate()) &&
                            (parseInt(RegExp.$3, 10) == d.getFullYear() );
            }],
    ['validate-currency-dollar', 'Please enter a valid $ amount. For example $100.00.', function(v) {
                // [$]1[##][,###]+[.##]
                // [$]1###+[.##]
                // [$]0.##
                // [$].##
                return Validation.get('IsEmpty').test(v) ||  /^\$?\-?([1-9]{1}[0-9]{0,2}(\,[0-9]{3})*(\.[0-9]{0,2})?|[1-9]{1}\d*(\.[0-9]{0,2})?|0(\.[0-9]{0,2})?|(\.[0-9]{1,2})?)$/.test(v)
            }],
    ['validate-one-required', 'Please select one of the above options.', function (v,elm) {
                var p = elm.parentNode;
                var options = p.getElementsByTagName('INPUT');
                return $A(options).any(function(elm) {
                    return $F(elm);
                });
            }],
    ['validate-one-required-by-name', 'Please select one of the options.', function (v,elm) {
                var inputs = $$('input[name="' + elm.name.replace(/([\\"])/g, '\\$1') + '"]');

                var error = 1;
                for(var i=0;i<inputs.length;i++) {
                    if((inputs[i].type == 'checkbox' || inputs[i].type == 'radio') && inputs[i].checked == true) {
                        error = 0;
                    }

                    if(Validation.isOnChange && (inputs[i].type == 'checkbox' || inputs[i].type == 'radio')) {
                        Validation.reset(inputs[i]);
                    }
                }

                if( error == 0 ) {
                    return true;
                } else {
                    return false;
                }
            }],
    ['validate-not-negative-number', 'Please enter a number 0 or greater in this field.', function(v) {
                if (Validation.get('IsEmpty').test(v)) {
                    return true;
                }
                v = parseNumber(v);
                return !isNaN(v) && v >= 0;
            }],
    ['validate-zero-or-greater', 'Please enter a number 0 or greater in this field.', function(v) {
            return Validation.get('validate-not-negative-number').test(v);
        }],
    ['validate-greater-than-zero', 'Please enter a number greater than 0 in this field.', function(v) {
            if (Validation.get('IsEmpty').test(v)) {
                return true;
            }
            v = parseNumber(v);
            return !isNaN(v) && v > 0;
        }],
    ['validate-state', 'Please select State/Province.', function(v) {
                return (v!=0 || v == '');
            }],
    ['validate-new-password', 'Please enter 6 or more characters. Leading or trailing spaces will be ignored.', function(v) {
                if (!Validation.get('validate-password').test(v)) return false;
                if (Validation.get('IsEmpty').test(v) && v != '') return false;
                return true;
            }],
    ['validate-cc-number', 'Please enter a valid credit card number.', function(v, elm) {
                // remove non-numerics
                var ccTypeContainer = $(elm.id.substr(0,elm.id.indexOf('_cc_number')) + '_cc_type');
                if (ccTypeContainer && typeof Validation.creditCartTypes.get(ccTypeContainer.value) != 'undefined'
                        && Validation.creditCartTypes.get(ccTypeContainer.value)[2] == false) {
                    if (!Validation.get('IsEmpty').test(v) && Validation.get('validate-digits').test(v)) {
                        return true;
                    } else {
                        return false;
                    }
                }
                return validateCreditCard(v);
            }],
    ['validate-cc-type', 'Credit card number does not match credit card type.', function(v, elm) {
                // remove credit card number delimiters such as "-" and space
                elm.value = removeDelimiters(elm.value);
                v         = removeDelimiters(v);

                var ccTypeContainer = $(elm.id.substr(0,elm.id.indexOf('_cc_number')) + '_cc_type');
                if (!ccTypeContainer) {
                    return true;
                }
                var ccType = ccTypeContainer.value;

                if (typeof Validation.creditCartTypes.get(ccType) == 'undefined') {
                    return false;
                }

                // Other card type or switch or solo card
                if (Validation.creditCartTypes.get(ccType)[0]==false) {
                    return true;
                }

                // Matched credit card type
                var ccMatchedType = '';

                Validation.creditCartTypes.each(function (pair) {
                    if (pair.value[0] && v.match(pair.value[0])) {
                        ccMatchedType = pair.key;
                        throw $break;
                    }
                });

                if(ccMatchedType != ccType) {
                    return false;
                }

                if (ccTypeContainer.hasClassName('validation-failed') && Validation.isOnChange) {
                    Validation.validate(ccTypeContainer);
                }

                return true;
            }],
     ['validate-cc-type-select', 'Card type does not match credit card number.', function(v, elm) {
                var ccNumberContainer = $(elm.id.substr(0,elm.id.indexOf('_cc_type')) + '_cc_number');
                if (Validation.isOnChange && Validation.get('IsEmpty').test(ccNumberContainer.value)) {
                    return true;
                }
                if (Validation.get('validate-cc-type').test(ccNumberContainer.value, ccNumberContainer)) {
                    Validation.validate(ccNumberContainer);
                }
                return Validation.get('validate-cc-type').test(ccNumberContainer.value, ccNumberContainer);
            }],
     ['validate-cc-exp', 'Incorrect credit card expiration date.', function(v, elm) {
                var ccExpMonth   = v;
                var ccExpYear    = $(elm.id.substr(0,elm.id.indexOf('_expiration')) + '_expiration_yr').value;
                var currentTime  = new Date();
                var currentMonth = currentTime.getMonth() + 1;
                var currentYear  = currentTime.getFullYear();
                if (ccExpMonth < currentMonth && ccExpYear == currentYear) {
                    return false;
                }
                return true;
            }],
     ['validate-cc-cvn', 'Please enter a valid credit card verification number.', function(v, elm) {
                var ccTypeContainer = $(elm.id.substr(0,elm.id.indexOf('_cc_cid')) + '_cc_type');
                if (!ccTypeContainer) {
                    return true;
                }
                var ccType = ccTypeContainer.value;

                if (typeof Validation.creditCartTypes.get(ccType) == 'undefined') {
                    return false;
                }

                var re = Validation.creditCartTypes.get(ccType)[1];

                if (v.match(re)) {
                    return true;
                }

                return false;
            }],
     ['validate-ajax', '', function(v, elm) { return true; }],
     ['validate-data', 'Please use only letters (a-z or A-Z), numbers (0-9) or underscore(_) in this field, first character should be a letter.', function (v) {
                if(v != '' && v) {
                    return /^[A-Za-z]+[A-Za-z0-9_]+$/.test(v);
                }
                return true;
            }],
     ['validate-css-length', 'Please input a valid CSS-length. For example 100px or 77pt or 20em or .5ex or 50%.', function (v) {
                if (v != '' && v) {
                    return /^[0-9\.]+(px|pt|em|ex|%)?$/.test(v) && (!(/\..*\./.test(v))) && !(/\.$/.test(v));
                }
                return true;
            }],
     ['validate-length', 'Text length does not satisfy specified text range.', function (v, elm) {
                var reMax = new RegExp(/^maximum-length-[0-9]+$/);
                var reMin = new RegExp(/^minimum-length-[0-9]+$/);
                var result = true;
                $w(elm.className).each(function(name, index) {
                    if (name.match(reMax) && result) {
                       var length = name.split('-')[2];
                       result = (v.length <= length);
                    }
                    if (name.match(reMin) && result && !Validation.get('IsEmpty').test(v)) {
                        var length = name.split('-')[2];
                        result = (v.length >= length);
                    }
                });
                return result;
            }],
     ['validate-percents', 'Please enter a number lower than 100.', {max:100}],
     ['required-file', 'Please select a file', function(v, elm) {
         var result = !Validation.get('IsEmpty').test(v);
         if (result === false) {
             ovId = elm.id + '_value';
             if ($(ovId)) {
                 result = !Validation.get('IsEmpty').test($(ovId).value);
             }
         }
         return result;
     }],
     ['validate-cc-ukss', 'Please enter issue number or start date for switch/solo card type.', function(v,elm) {
         var endposition;

         if (elm.id.match(/(.)+_cc_issue$/)) {
             endposition = elm.id.indexOf('_cc_issue');
         } else if (elm.id.match(/(.)+_start_month$/)) {
             endposition = elm.id.indexOf('_start_month');
         } else {
             endposition = elm.id.indexOf('_start_year');
         }

         var prefix = elm.id.substr(0,endposition);

         var ccTypeContainer = $(prefix + '_cc_type');

         if (!ccTypeContainer) {
               return true;
         }
         var ccType = ccTypeContainer.value;

         if(['SS','SM','SO'].indexOf(ccType) == -1){
             return true;
         }

         $(prefix + '_cc_issue').advaiceContainer
           = $(prefix + '_start_month').advaiceContainer
           = $(prefix + '_start_year').advaiceContainer
           = $(prefix + '_cc_type_ss_div').down('ul li.adv-container');

         var ccIssue   =  $(prefix + '_cc_issue').value;
         var ccSMonth  =  $(prefix + '_start_month').value;
         var ccSYear   =  $(prefix + '_start_year').value;

         var ccStartDatePresent = (ccSMonth && ccSYear) ? true : false;

         if (!ccStartDatePresent && !ccIssue){
             return false;
         }
         return true;
     }]
]);

function removeDelimiters (v) {
    v = v.replace(/\s/g, '');
    v = v.replace(/\-/g, '');
    return v;
}

function parseNumber(v)
{
    if (typeof v != 'string') {
        return parseFloat(v);
    }

    var isDot  = v.indexOf('.');
    var isComa = v.indexOf(',');

    if (isDot != -1 && isComa != -1) {
        if (isComa > isDot) {
            v = v.replace('.', '').replace(',', '.');
        }
        else {
            v = v.replace(',', '');
        }
    }
    else if (isComa != -1) {
        v = v.replace(',', '.');
    }

    return parseFloat(v);
}

/**
 * Hash with credit card types which can be simply extended in payment modules
 * 0 - regexp for card number
 * 1 - regexp for cvn
 * 2 - check or not credit card number trough Luhn algorithm by
 *     function validateCreditCard which you can find above in this file
 */
Validation.creditCartTypes = $H({
//    'SS': [new RegExp('^((6759[0-9]{12})|(5018|5020|5038|6304|6759|6761|6763[0-9]{12,19})|(49[013][1356][0-9]{12})|(6333[0-9]{12})|(6334[0-4]\d{11})|(633110[0-9]{10})|(564182[0-9]{10}))([0-9]{2,3})?$'), new RegExp('^([0-9]{3}|[0-9]{4})?$'), true],
    'SO': [new RegExp('^(6334[5-9]([0-9]{11}|[0-9]{13,14}))|(6767([0-9]{12}|[0-9]{14,15}))$'), new RegExp('^([0-9]{3}|[0-9]{4})?$'), true],
    'SM': [new RegExp('(^(5[0678])[0-9]{11,18}$)|(^(6[^05])[0-9]{11,18}$)|(^(601)[^1][0-9]{9,16}$)|(^(6011)[0-9]{9,11}$)|(^(6011)[0-9]{13,16}$)|(^(65)[0-9]{11,13}$)|(^(65)[0-9]{15,18}$)|(^(49030)[2-9]([0-9]{10}$|[0-9]{12,13}$))|(^(49033)[5-9]([0-9]{10}$|[0-9]{12,13}$))|(^(49110)[1-2]([0-9]{10}$|[0-9]{12,13}$))|(^(49117)[4-9]([0-9]{10}$|[0-9]{12,13}$))|(^(49118)[0-2]([0-9]{10}$|[0-9]{12,13}$))|(^(4936)([0-9]{12}$|[0-9]{14,15}$))'), new RegExp('^([0-9]{3}|[0-9]{4})?$'), true],
    'VI': [new RegExp('^4[0-9]{12}([0-9]{3})?$'), new RegExp('^[0-9]{3}$'), true],
    'MC': [new RegExp('^5[1-5][0-9]{14}$'), new RegExp('^[0-9]{3}$'), true],
    'AE': [new RegExp('^3[47][0-9]{13}$'), new RegExp('^[0-9]{4}$'), true],
    'DI': [new RegExp('^6011[0-9]{12}$'), new RegExp('^[0-9]{3}$'), true],
    'JCB': [new RegExp('^(3[0-9]{15}|(2131|1800)[0-9]{11})$'), new RegExp('^[0-9]{3,4}$'), true],
    'OT': [false, new RegExp('^([0-9]{3}|[0-9]{4})?$'), false]
});

// script.aculo.us effects.js v1.8.2, Tue Nov 18 18:30:58 +0100 2008

// Copyright (c) 2005-2008 Thomas Fuchs (http://script.aculo.us, http://mir.aculo.us)
// Contributors:
//  Justin Palmer (http://encytemedia.com/)
//  Mark Pilgrim (http://diveintomark.org/)
//  Martin Bialasinki
//
// script.aculo.us is freely distributable under the terms of an MIT-style license.
// For details, see the script.aculo.us web site: http://script.aculo.us/

// converts rgb() and #xxx to #xxxxxx format,
// returns self (or first argument) if not convertable
String.prototype.parseColor = function() {
  var color = '#';
  if (this.slice(0,4) == 'rgb(') {
    var cols = this.slice(4,this.length-1).split(',');
    var i=0; do { color += parseInt(cols[i]).toColorPart() } while (++i<3);
  } else {
    if (this.slice(0,1) == '#') {
      if (this.length==4) for(var i=1;i<4;i++) color += (this.charAt(i) + this.charAt(i)).toLowerCase();
      if (this.length==7) color = this.toLowerCase();
    }
  }
  return (color.length==7 ? color : (arguments[0] || this));
};

/*--------------------------------------------------------------------------*/

Element.collectTextNodes = function(element) {
  return $A($(element).childNodes).collect( function(node) {
    return (node.nodeType==3 ? node.nodeValue :
      (node.hasChildNodes() ? Element.collectTextNodes(node) : ''));
  }).flatten().join('');
};

Element.collectTextNodesIgnoreClass = function(element, className) {
  return $A($(element).childNodes).collect( function(node) {
    return (node.nodeType==3 ? node.nodeValue :
      ((node.hasChildNodes() && !Element.hasClassName(node,className)) ?
        Element.collectTextNodesIgnoreClass(node, className) : ''));
  }).flatten().join('');
};

Element.setContentZoom = function(element, percent) {
  element = $(element);
  element.setStyle({fontSize: (percent/100) + 'em'});
  if (Prototype.Browser.WebKit) window.scrollBy(0,0);
  return element;
};

Element.getInlineOpacity = function(element){
  return $(element).style.opacity || '';
};

Element.forceRerendering = function(element) {
  try {
    element = $(element);
    var n = document.createTextNode(' ');
    element.appendChild(n);
    element.removeChild(n);
  } catch(e) { }
};

/*--------------------------------------------------------------------------*/

var Effect = {
  _elementDoesNotExistError: {
    name: 'ElementDoesNotExistError',
    message: 'The specified DOM element does not exist, but is required for this effect to operate'
  },
  Transitions: {
    linear: Prototype.K,
    sinoidal: function(pos) {
      return (-Math.cos(pos*Math.PI)/2) + .5;
    },
    reverse: function(pos) {
      return 1-pos;
    },
    flicker: function(pos) {
      var pos = ((-Math.cos(pos*Math.PI)/4) + .75) + Math.random()/4;
      return pos > 1 ? 1 : pos;
    },
    wobble: function(pos) {
      return (-Math.cos(pos*Math.PI*(9*pos))/2) + .5;
    },
    pulse: function(pos, pulses) {
      return (-Math.cos((pos*((pulses||5)-.5)*2)*Math.PI)/2) + .5;
    },
    spring: function(pos) {
      return 1 - (Math.cos(pos * 4.5 * Math.PI) * Math.exp(-pos * 6));
    },
    none: function(pos) {
      return 0;
    },
    full: function(pos) {
      return 1;
    }
  },
  DefaultOptions: {
    duration:   1.0,   // seconds
    fps:        100,   // 100= assume 66fps max.
    sync:       false, // true for combining
    from:       0.0,
    to:         1.0,
    delay:      0.0,
    queue:      'parallel'
  },
  tagifyText: function(element) {
    var tagifyStyle = 'position:relative';
    if (Prototype.Browser.IE) tagifyStyle += ';zoom:1';

    element = $(element);
    $A(element.childNodes).each( function(child) {
      if (child.nodeType==3) {
        child.nodeValue.toArray().each( function(character) {
          element.insertBefore(
            new Element('span', {style: tagifyStyle}).update(
              character == ' ' ? String.fromCharCode(160) : character),
              child);
        });
        Element.remove(child);
      }
    });
  },
  multiple: function(element, effect) {
    var elements;
    if (((typeof element == 'object') ||
        Object.isFunction(element)) &&
       (element.length))
      elements = element;
    else
      elements = $(element).childNodes;

    var options = Object.extend({
      speed: 0.1,
      delay: 0.0
    }, arguments[2] || { });
    var masterDelay = options.delay;

    $A(elements).each( function(element, index) {
      new effect(element, Object.extend(options, { delay: index * options.speed + masterDelay }));
    });
  },
  PAIRS: {
    'slide':  ['SlideDown','SlideUp'],
    'blind':  ['BlindDown','BlindUp'],
    'appear': ['Appear','Fade']
  },
  toggle: function(element, effect) {
    element = $(element);
    effect = (effect || 'appear').toLowerCase();
    var options = Object.extend({
      queue: { position:'end', scope:(element.id || 'global'), limit: 1 }
    }, arguments[2] || { });
    Effect[element.visible() ?
      Effect.PAIRS[effect][1] : Effect.PAIRS[effect][0]](element, options);
  }
};

Effect.DefaultOptions.transition = Effect.Transitions.sinoidal;

/* ------------- core effects ------------- */

Effect.ScopedQueue = Class.create(Enumerable, {
  initialize: function() {
    this.effects  = [];
    this.interval = null;
  },
  _each: function(iterator) {
    this.effects._each(iterator);
  },
  add: function(effect) {
    var timestamp = new Date().getTime();

    var position = Object.isString(effect.options.queue) ?
      effect.options.queue : effect.options.queue.position;

    switch(position) {
      case 'front':
        // move unstarted effects after this effect
        this.effects.findAll(function(e){ return e.state=='idle' }).each( function(e) {
            e.startOn  += effect.finishOn;
            e.finishOn += effect.finishOn;
          });
        break;
      case 'with-last':
        timestamp = this.effects.pluck('startOn').max() || timestamp;
        break;
      case 'end':
        // start effect after last queued effect has finished
        timestamp = this.effects.pluck('finishOn').max() || timestamp;
        break;
    }

    effect.startOn  += timestamp;
    effect.finishOn += timestamp;

    if (!effect.options.queue.limit || (this.effects.length < effect.options.queue.limit))
      this.effects.push(effect);

    if (!this.interval)
      this.interval = setInterval(this.loop.bind(this), 15);
  },
  remove: function(effect) {
    this.effects = this.effects.reject(function(e) { return e==effect });
    if (this.effects.length == 0) {
      clearInterval(this.interval);
      this.interval = null;
    }
  },
  loop: function() {
    var timePos = new Date().getTime();
    for(var i=0, len=this.effects.length;i<len;i++)
      this.effects[i] && this.effects[i].loop(timePos);
  }
});

Effect.Queues = {
  instances: $H(),
  get: function(queueName) {
    if (!Object.isString(queueName)) return queueName;

    return this.instances.get(queueName) ||
      this.instances.set(queueName, new Effect.ScopedQueue());
  }
};
Effect.Queue = Effect.Queues.get('global');

Effect.Base = Class.create({
  position: null,
  start: function(options) {
    function codeForEvent(options,eventName){
      return (
        (options[eventName+'Internal'] ? 'this.options.'+eventName+'Internal(this);' : '') +
        (options[eventName] ? 'this.options.'+eventName+'(this);' : '')
      );
    }
    if (options && options.transition === false) options.transition = Effect.Transitions.linear;
    this.options      = Object.extend(Object.extend({ },Effect.DefaultOptions), options || { });
    this.currentFrame = 0;
    this.state        = 'idle';
    this.startOn      = this.options.delay*1000;
    this.finishOn     = this.startOn+(this.options.duration*1000);
    this.fromToDelta  = this.options.to-this.options.from;
    this.totalTime    = this.finishOn-this.startOn;
    this.totalFrames  = this.options.fps*this.options.duration;

    this.render = (function() {
      function dispatch(effect, eventName) {
        if (effect.options[eventName + 'Internal'])
          effect.options[eventName + 'Internal'](effect);
        if (effect.options[eventName])
          effect.options[eventName](effect);
      }

      return function(pos) {
        if (this.state === "idle") {
          this.state = "running";
          dispatch(this, 'beforeSetup');
          if (this.setup) this.setup();
          dispatch(this, 'afterSetup');
        }
        if (this.state === "running") {
          pos = (this.options.transition(pos) * this.fromToDelta) + this.options.from;
          this.position = pos;
          dispatch(this, 'beforeUpdate');
          if (this.update) this.update(pos);
          dispatch(this, 'afterUpdate');
        }
      };
    })();

    this.event('beforeStart');
    if (!this.options.sync)
      Effect.Queues.get(Object.isString(this.options.queue) ?
        'global' : this.options.queue.scope).add(this);
  },
  loop: function(timePos) {
    if (timePos >= this.startOn) {
      if (timePos >= this.finishOn) {
        this.render(1.0);
        this.cancel();
        this.event('beforeFinish');
        if (this.finish) this.finish();
        this.event('afterFinish');
        return;
      }
      var pos   = (timePos - this.startOn) / this.totalTime,
          frame = (pos * this.totalFrames).round();
      if (frame > this.currentFrame) {
        this.render(pos);
        this.currentFrame = frame;
      }
    }
  },
  cancel: function() {
    if (!this.options.sync)
      Effect.Queues.get(Object.isString(this.options.queue) ?
        'global' : this.options.queue.scope).remove(this);
    this.state = 'finished';
  },
  event: function(eventName) {
    if (this.options[eventName + 'Internal']) this.options[eventName + 'Internal'](this);
    if (this.options[eventName]) this.options[eventName](this);
  },
  inspect: function() {
    var data = $H();
    for(property in this)
      if (!Object.isFunction(this[property])) data.set(property, this[property]);
    return '#<Effect:' + data.inspect() + ',options:' + $H(this.options).inspect() + '>';
  }
});

Effect.Parallel = Class.create(Effect.Base, {
  initialize: function(effects) {
    this.effects = effects || [];
    this.start(arguments[1]);
  },
  update: function(position) {
    this.effects.invoke('render', position);
  },
  finish: function(position) {
    this.effects.each( function(effect) {
      effect.render(1.0);
      effect.cancel();
      effect.event('beforeFinish');
      if (effect.finish) effect.finish(position);
      effect.event('afterFinish');
    });
  }
});

Effect.Tween = Class.create(Effect.Base, {
  initialize: function(object, from, to) {
    object = Object.isString(object) ? $(object) : object;
    var args = $A(arguments), method = args.last(),
      options = args.length == 5 ? args[3] : null;
    this.method = Object.isFunction(method) ? method.bind(object) :
      Object.isFunction(object[method]) ? object[method].bind(object) :
      function(value) { object[method] = value };
    this.start(Object.extend({ from: from, to: to }, options || { }));
  },
  update: function(position) {
    this.method(position);
  }
});

Effect.Event = Class.create(Effect.Base, {
  initialize: function() {
    this.start(Object.extend({ duration: 0 }, arguments[0] || { }));
  },
  update: Prototype.emptyFunction
});

Effect.Opacity = Class.create(Effect.Base, {
  initialize: function(element) {
    this.element = $(element);
    if (!this.element) throw(Effect._elementDoesNotExistError);
    // make this work on IE on elements without 'layout'
    if (Prototype.Browser.IE && (!this.element.currentStyle.hasLayout))
      this.element.setStyle({zoom: 1});
    var options = Object.extend({
      from: this.element.getOpacity() || 0.0,
      to:   1.0
    }, arguments[1] || { });
    this.start(options);
  },
  update: function(position) {
    this.element.setOpacity(position);
  }
});

Effect.Move = Class.create(Effect.Base, {
  initialize: function(element) {
    this.element = $(element);
    if (!this.element) throw(Effect._elementDoesNotExistError);
    var options = Object.extend({
      x:    0,
      y:    0,
      mode: 'relative'
    }, arguments[1] || { });
    this.start(options);
  },
  setup: function() {
    this.element.makePositioned();
    this.originalLeft = parseFloat(this.element.getStyle('left') || '0');
    this.originalTop  = parseFloat(this.element.getStyle('top')  || '0');
    if (this.options.mode == 'absolute') {
      this.options.x = this.options.x - this.originalLeft;
      this.options.y = this.options.y - this.originalTop;
    }
  },
  update: function(position) {
    this.element.setStyle({
      left: (this.options.x  * position + this.originalLeft).round() + 'px',
      top:  (this.options.y  * position + this.originalTop).round()  + 'px'
    });
  }
});

// for backwards compatibility
Effect.MoveBy = function(element, toTop, toLeft) {
  return new Effect.Move(element,
    Object.extend({ x: toLeft, y: toTop }, arguments[3] || { }));
};

Effect.Scale = Class.create(Effect.Base, {
  initialize: function(element, percent) {
    this.element = $(element);
    if (!this.element) throw(Effect._elementDoesNotExistError);
    var options = Object.extend({
      scaleX: true,
      scaleY: true,
      scaleContent: true,
      scaleFromCenter: false,
      scaleMode: 'box',        // 'box' or 'contents' or { } with provided values
      scaleFrom: 100.0,
      scaleTo:   percent
    }, arguments[2] || { });
    this.start(options);
  },
  setup: function() {
    this.restoreAfterFinish = this.options.restoreAfterFinish || false;
    this.elementPositioning = this.element.getStyle('position');

    this.originalStyle = { };
    ['top','left','width','height','fontSize'].each( function(k) {
      this.originalStyle[k] = this.element.style[k];
    }.bind(this));

    this.originalTop  = this.element.offsetTop;
    this.originalLeft = this.element.offsetLeft;

    var fontSize = this.element.getStyle('font-size') || '100%';
    ['em','px','%','pt'].each( function(fontSizeType) {
      if (fontSize.indexOf(fontSizeType)>0) {
        this.fontSize     = parseFloat(fontSize);
        this.fontSizeType = fontSizeType;
      }
    }.bind(this));

    this.factor = (this.options.scaleTo - this.options.scaleFrom)/100;

    this.dims = null;
    if (this.options.scaleMode=='box')
      this.dims = [this.element.offsetHeight, this.element.offsetWidth];
    if (/^content/.test(this.options.scaleMode))
      this.dims = [this.element.scrollHeight, this.element.scrollWidth];
    if (!this.dims)
      this.dims = [this.options.scaleMode.originalHeight,
                   this.options.scaleMode.originalWidth];
  },
  update: function(position) {
    var currentScale = (this.options.scaleFrom/100.0) + (this.factor * position);
    if (this.options.scaleContent && this.fontSize)
      this.element.setStyle({fontSize: this.fontSize * currentScale + this.fontSizeType });
    this.setDimensions(this.dims[0] * currentScale, this.dims[1] * currentScale);
  },
  finish: function(position) {
    if (this.restoreAfterFinish) this.element.setStyle(this.originalStyle);
  },
  setDimensions: function(height, width) {
    var d = { };
    if (this.options.scaleX) d.width = width.round() + 'px';
    if (this.options.scaleY) d.height = height.round() + 'px';
    if (this.options.scaleFromCenter) {
      var topd  = (height - this.dims[0])/2;
      var leftd = (width  - this.dims[1])/2;
      if (this.elementPositioning == 'absolute') {
        if (this.options.scaleY) d.top = this.originalTop-topd + 'px';
        if (this.options.scaleX) d.left = this.originalLeft-leftd + 'px';
      } else {
        if (this.options.scaleY) d.top = -topd + 'px';
        if (this.options.scaleX) d.left = -leftd + 'px';
      }
    }
    this.element.setStyle(d);
  }
});

Effect.Highlight = Class.create(Effect.Base, {
  initialize: function(element) {
    this.element = $(element);
    if (!this.element) throw(Effect._elementDoesNotExistError);
    var options = Object.extend({ startcolor: '#ffff99' }, arguments[1] || { });
    this.start(options);
  },
  setup: function() {
    // Prevent executing on elements not in the layout flow
    if (this.element.getStyle('display')=='none') { this.cancel(); return; }
    // Disable background image during the effect
    this.oldStyle = { };
    if (!this.options.keepBackgroundImage) {
      this.oldStyle.backgroundImage = this.element.getStyle('background-image');
      this.element.setStyle({backgroundImage: 'none'});
    }
    if (!this.options.endcolor)
      this.options.endcolor = this.element.getStyle('background-color').parseColor('#ffffff');
    if (!this.options.restorecolor)
      this.options.restorecolor = this.element.getStyle('background-color');
    // init color calculations
    this._base  = $R(0,2).map(function(i){ return parseInt(this.options.startcolor.slice(i*2+1,i*2+3),16) }.bind(this));
    this._delta = $R(0,2).map(function(i){ return parseInt(this.options.endcolor.slice(i*2+1,i*2+3),16)-this._base[i] }.bind(this));
  },
  update: function(position) {
    this.element.setStyle({backgroundColor: $R(0,2).inject('#',function(m,v,i){
      return m+((this._base[i]+(this._delta[i]*position)).round().toColorPart()); }.bind(this)) });
  },
  finish: function() {
    this.element.setStyle(Object.extend(this.oldStyle, {
      backgroundColor: this.options.restorecolor
    }));
  }
});

Effect.ScrollTo = function(element) {
  var options = arguments[1] || { },
  scrollOffsets = document.viewport.getScrollOffsets(),
  elementOffsets = $(element).cumulativeOffset();

  if (options.offset) elementOffsets[1] += options.offset;

  return new Effect.Tween(null,
    scrollOffsets.top,
    elementOffsets[1],
    options,
    function(p){ scrollTo(scrollOffsets.left, p.round()); }
  );
};

/* ------------- combination effects ------------- */

Effect.Fade = function(element) {
  element = $(element);
  var oldOpacity = element.getInlineOpacity();
  var options = Object.extend({
    from: element.getOpacity() || 1.0,
    to:   0.0,
    afterFinishInternal: function(effect) {
      if (effect.options.to!=0) return;
      effect.element.hide().setStyle({opacity: oldOpacity});
    }
  }, arguments[1] || { });
  return new Effect.Opacity(element,options);
};

Effect.Appear = function(element) {
  element = $(element);
  var options = Object.extend({
  from: (element.getStyle('display') == 'none' ? 0.0 : element.getOpacity() || 0.0),
  to:   1.0,
  // force Safari to render floated elements properly
  afterFinishInternal: function(effect) {
    effect.element.forceRerendering();
  },
  beforeSetup: function(effect) {
    effect.element.setOpacity(effect.options.from).show();
  }}, arguments[1] || { });
  return new Effect.Opacity(element,options);
};

Effect.Puff = function(element) {
  element = $(element);
  var oldStyle = {
    opacity: element.getInlineOpacity(),
    position: element.getStyle('position'),
    top:  element.style.top,
    left: element.style.left,
    width: element.style.width,
    height: element.style.height
  };
  return new Effect.Parallel(
   [ new Effect.Scale(element, 200,
      { sync: true, scaleFromCenter: true, scaleContent: true, restoreAfterFinish: true }),
     new Effect.Opacity(element, { sync: true, to: 0.0 } ) ],
     Object.extend({ duration: 1.0,
      beforeSetupInternal: function(effect) {
        Position.absolutize(effect.effects[0].element);
      },
      afterFinishInternal: function(effect) {
         effect.effects[0].element.hide().setStyle(oldStyle); }
     }, arguments[1] || { })
   );
};

Effect.BlindUp = function(element) {
  element = $(element);
  element.makeClipping();
  return new Effect.Scale(element, 0,
    Object.extend({ scaleContent: false,
      scaleX: false,
      restoreAfterFinish: true,
      afterFinishInternal: function(effect) {
        effect.element.hide().undoClipping();
      }
    }, arguments[1] || { })
  );
};

Effect.BlindDown = function(element) {
  element = $(element);
  var elementDimensions = element.getDimensions();
  return new Effect.Scale(element, 100, Object.extend({
    scaleContent: false,
    scaleX: false,
    scaleFrom: 0,
    scaleMode: {originalHeight: elementDimensions.height, originalWidth: elementDimensions.width},
    restoreAfterFinish: true,
    afterSetup: function(effect) {
      effect.element.makeClipping().setStyle({height: '0px'}).show();
    },
    afterFinishInternal: function(effect) {
      effect.element.undoClipping();
    }
  }, arguments[1] || { }));
};

Effect.SwitchOff = function(element) {
  element = $(element);
  var oldOpacity = element.getInlineOpacity();
  return new Effect.Appear(element, Object.extend({
    duration: 0.4,
    from: 0,
    transition: Effect.Transitions.flicker,
    afterFinishInternal: function(effect) {
      new Effect.Scale(effect.element, 1, {
        duration: 0.3, scaleFromCenter: true,
        scaleX: false, scaleContent: false, restoreAfterFinish: true,
        beforeSetup: function(effect) {
          effect.element.makePositioned().makeClipping();
        },
        afterFinishInternal: function(effect) {
          effect.element.hide().undoClipping().undoPositioned().setStyle({opacity: oldOpacity});
        }
      });
    }
  }, arguments[1] || { }));
};

Effect.DropOut = function(element) {
  element = $(element);
  var oldStyle = {
    top: element.getStyle('top'),
    left: element.getStyle('left'),
    opacity: element.getInlineOpacity() };
  return new Effect.Parallel(
    [ new Effect.Move(element, {x: 0, y: 100, sync: true }),
      new Effect.Opacity(element, { sync: true, to: 0.0 }) ],
    Object.extend(
      { duration: 0.5,
        beforeSetup: function(effect) {
          effect.effects[0].element.makePositioned();
        },
        afterFinishInternal: function(effect) {
          effect.effects[0].element.hide().undoPositioned().setStyle(oldStyle);
        }
      }, arguments[1] || { }));
};

Effect.Shake = function(element) {
  element = $(element);
  var options = Object.extend({
    distance: 20,
    duration: 0.5
  }, arguments[1] || {});
  var distance = parseFloat(options.distance);
  var split = parseFloat(options.duration) / 10.0;
  var oldStyle = {
    top: element.getStyle('top'),
    left: element.getStyle('left') };
    return new Effect.Move(element,
      { x:  distance, y: 0, duration: split, afterFinishInternal: function(effect) {
    new Effect.Move(effect.element,
      { x: -distance*2, y: 0, duration: split*2,  afterFinishInternal: function(effect) {
    new Effect.Move(effect.element,
      { x:  distance*2, y: 0, duration: split*2,  afterFinishInternal: function(effect) {
    new Effect.Move(effect.element,
      { x: -distance*2, y: 0, duration: split*2,  afterFinishInternal: function(effect) {
    new Effect.Move(effect.element,
      { x:  distance*2, y: 0, duration: split*2,  afterFinishInternal: function(effect) {
    new Effect.Move(effect.element,
      { x: -distance, y: 0, duration: split, afterFinishInternal: function(effect) {
        effect.element.undoPositioned().setStyle(oldStyle);
  }}); }}); }}); }}); }}); }});
};

Effect.SlideDown = function(element) {
  element = $(element).cleanWhitespace();
  // SlideDown need to have the content of the element wrapped in a container element with fixed height!
  var oldInnerBottom = element.down().getStyle('bottom');
  var elementDimensions = element.getDimensions();
  return new Effect.Scale(element, 100, Object.extend({
    scaleContent: false,
    scaleX: false,
    scaleFrom: window.opera ? 0 : 1,
    scaleMode: {originalHeight: elementDimensions.height, originalWidth: elementDimensions.width},
    restoreAfterFinish: true,
    afterSetup: function(effect) {
      effect.element.makePositioned();
      effect.element.down().makePositioned();
      if (window.opera) effect.element.setStyle({top: ''});
      effect.element.makeClipping().setStyle({height: '0px'}).show();
    },
    afterUpdateInternal: function(effect) {
      effect.element.down().setStyle({bottom:
        (effect.dims[0] - effect.element.clientHeight) + 'px' });
    },
    afterFinishInternal: function(effect) {
      effect.element.undoClipping().undoPositioned();
      effect.element.down().undoPositioned().setStyle({bottom: oldInnerBottom}); }
    }, arguments[1] || { })
  );
};

Effect.SlideUp = function(element) {
  element = $(element).cleanWhitespace();
  var oldInnerBottom = element.down().getStyle('bottom');
  var elementDimensions = element.getDimensions();
  return new Effect.Scale(element, window.opera ? 0 : 1,
   Object.extend({ scaleContent: false,
    scaleX: false,
    scaleMode: 'box',
    scaleFrom: 100,
    scaleMode: {originalHeight: elementDimensions.height, originalWidth: elementDimensions.width},
    restoreAfterFinish: true,
    afterSetup: function(effect) {
      effect.element.makePositioned();
      effect.element.down().makePositioned();
      if (window.opera) effect.element.setStyle({top: ''});
      effect.element.makeClipping().show();
    },
    afterUpdateInternal: function(effect) {
      effect.element.down().setStyle({bottom:
        (effect.dims[0] - effect.element.clientHeight) + 'px' });
    },
    afterFinishInternal: function(effect) {
      effect.element.hide().undoClipping().undoPositioned();
      effect.element.down().undoPositioned().setStyle({bottom: oldInnerBottom});
    }
   }, arguments[1] || { })
  );
};

// Bug in opera makes the TD containing this element expand for a instance after finish
Effect.Squish = function(element) {
  return new Effect.Scale(element, window.opera ? 1 : 0, {
    restoreAfterFinish: true,
    beforeSetup: function(effect) {
      effect.element.makeClipping();
    },
    afterFinishInternal: function(effect) {
      effect.element.hide().undoClipping();
    }
  });
};

Effect.Grow = function(element) {
  element = $(element);
  var options = Object.extend({
    direction: 'center',
    moveTransition: Effect.Transitions.sinoidal,
    scaleTransition: Effect.Transitions.sinoidal,
    opacityTransition: Effect.Transitions.full
  }, arguments[1] || { });
  var oldStyle = {
    top: element.style.top,
    left: element.style.left,
    height: element.style.height,
    width: element.style.width,
    opacity: element.getInlineOpacity() };

  var dims = element.getDimensions();
  var initialMoveX, initialMoveY;
  var moveX, moveY;

  switch (options.direction) {
    case 'top-left':
      initialMoveX = initialMoveY = moveX = moveY = 0;
      break;
    case 'top-right':
      initialMoveX = dims.width;
      initialMoveY = moveY = 0;
      moveX = -dims.width;
      break;
    case 'bottom-left':
      initialMoveX = moveX = 0;
      initialMoveY = dims.height;
      moveY = -dims.height;
      break;
    case 'bottom-right':
      initialMoveX = dims.width;
      initialMoveY = dims.height;
      moveX = -dims.width;
      moveY = -dims.height;
      break;
    case 'center':
      initialMoveX = dims.width / 2;
      initialMoveY = dims.height / 2;
      moveX = -dims.width / 2;
      moveY = -dims.height / 2;
      break;
  }

  return new Effect.Move(element, {
    x: initialMoveX,
    y: initialMoveY,
    duration: 0.01,
    beforeSetup: function(effect) {
      effect.element.hide().makeClipping().makePositioned();
    },
    afterFinishInternal: function(effect) {
      new Effect.Parallel(
        [ new Effect.Opacity(effect.element, { sync: true, to: 1.0, from: 0.0, transition: options.opacityTransition }),
          new Effect.Move(effect.element, { x: moveX, y: moveY, sync: true, transition: options.moveTransition }),
          new Effect.Scale(effect.element, 100, {
            scaleMode: { originalHeight: dims.height, originalWidth: dims.width },
            sync: true, scaleFrom: window.opera ? 1 : 0, transition: options.scaleTransition, restoreAfterFinish: true})
        ], Object.extend({
             beforeSetup: function(effect) {
               effect.effects[0].element.setStyle({height: '0px'}).show();
             },
             afterFinishInternal: function(effect) {
               effect.effects[0].element.undoClipping().undoPositioned().setStyle(oldStyle);
             }
           }, options)
      );
    }
  });
};

Effect.Shrink = function(element) {
  element = $(element);
  var options = Object.extend({
    direction: 'center',
    moveTransition: Effect.Transitions.sinoidal,
    scaleTransition: Effect.Transitions.sinoidal,
    opacityTransition: Effect.Transitions.none
  }, arguments[1] || { });
  var oldStyle = {
    top: element.style.top,
    left: element.style.left,
    height: element.style.height,
    width: element.style.width,
    opacity: element.getInlineOpacity() };

  var dims = element.getDimensions();
  var moveX, moveY;

  switch (options.direction) {
    case 'top-left':
      moveX = moveY = 0;
      break;
    case 'top-right':
      moveX = dims.width;
      moveY = 0;
      break;
    case 'bottom-left':
      moveX = 0;
      moveY = dims.height;
      break;
    case 'bottom-right':
      moveX = dims.width;
      moveY = dims.height;
      break;
    case 'center':
      moveX = dims.width / 2;
      moveY = dims.height / 2;
      break;
  }

  return new Effect.Parallel(
    [ new Effect.Opacity(element, { sync: true, to: 0.0, from: 1.0, transition: options.opacityTransition }),
      new Effect.Scale(element, window.opera ? 1 : 0, { sync: true, transition: options.scaleTransition, restoreAfterFinish: true}),
      new Effect.Move(element, { x: moveX, y: moveY, sync: true, transition: options.moveTransition })
    ], Object.extend({
         beforeStartInternal: function(effect) {
           effect.effects[0].element.makePositioned().makeClipping();
         },
         afterFinishInternal: function(effect) {
           effect.effects[0].element.hide().undoClipping().undoPositioned().setStyle(oldStyle); }
       }, options)
  );
};

Effect.Pulsate = function(element) {
  element = $(element);
  var options    = arguments[1] || { },
    oldOpacity = element.getInlineOpacity(),
    transition = options.transition || Effect.Transitions.linear,
    reverser   = function(pos){
      return 1 - transition((-Math.cos((pos*(options.pulses||5)*2)*Math.PI)/2) + .5);
    };

  return new Effect.Opacity(element,
    Object.extend(Object.extend({  duration: 2.0, from: 0,
      afterFinishInternal: function(effect) { effect.element.setStyle({opacity: oldOpacity}); }
    }, options), {transition: reverser}));
};

Effect.Fold = function(element) {
  element = $(element);
  var oldStyle = {
    top: element.style.top,
    left: element.style.left,
    width: element.style.width,
    height: element.style.height };
  element.makeClipping();
  return new Effect.Scale(element, 5, Object.extend({
    scaleContent: false,
    scaleX: false,
    afterFinishInternal: function(effect) {
    new Effect.Scale(element, 1, {
      scaleContent: false,
      scaleY: false,
      afterFinishInternal: function(effect) {
        effect.element.hide().undoClipping().setStyle(oldStyle);
      } });
  }}, arguments[1] || { }));
};

Effect.Morph = Class.create(Effect.Base, {
  initialize: function(element) {
    this.element = $(element);
    if (!this.element) throw(Effect._elementDoesNotExistError);
    var options = Object.extend({
      style: { }
    }, arguments[1] || { });

    if (!Object.isString(options.style)) this.style = $H(options.style);
    else {
      if (options.style.include(':'))
        this.style = options.style.parseStyle();
      else {
        this.element.addClassName(options.style);
        this.style = $H(this.element.getStyles());
        this.element.removeClassName(options.style);
        var css = this.element.getStyles();
        this.style = this.style.reject(function(style) {
          return style.value == css[style.key];
        });
        options.afterFinishInternal = function(effect) {
          effect.element.addClassName(effect.options.style);
          effect.transforms.each(function(transform) {
            effect.element.style[transform.style] = '';
          });
        };
      }
    }
    this.start(options);
  },

  setup: function(){
    function parseColor(color){
      if (!color || ['rgba(0, 0, 0, 0)','transparent'].include(color)) color = '#ffffff';
      color = color.parseColor();
      return $R(0,2).map(function(i){
        return parseInt( color.slice(i*2+1,i*2+3), 16 );
      });
    }
    this.transforms = this.style.map(function(pair){
      var property = pair[0], value = pair[1], unit = null;

      if (value.parseColor('#zzzzzz') != '#zzzzzz') {
        value = value.parseColor();
        unit  = 'color';
      } else if (property == 'opacity') {
        value = parseFloat(value);
        if (Prototype.Browser.IE && (!this.element.currentStyle.hasLayout))
          this.element.setStyle({zoom: 1});
      } else if (Element.CSS_LENGTH.test(value)) {
          var components = value.match(/^([\+\-]?[0-9\.]+)(.*)$/);
          value = parseFloat(components[1]);
          unit = (components.length == 3) ? components[2] : null;
      }

      var originalValue = this.element.getStyle(property);
      return {
        style: property.camelize(),
        originalValue: unit=='color' ? parseColor(originalValue) : parseFloat(originalValue || 0),
        targetValue: unit=='color' ? parseColor(value) : value,
        unit: unit
      };
    }.bind(this)).reject(function(transform){
      return (
        (transform.originalValue == transform.targetValue) ||
        (
          transform.unit != 'color' &&
          (isNaN(transform.originalValue) || isNaN(transform.targetValue))
        )
      );
    });
  },
  update: function(position) {
    var style = { }, transform, i = this.transforms.length;
    while(i--)
      style[(transform = this.transforms[i]).style] =
        transform.unit=='color' ? '#'+
          (Math.round(transform.originalValue[0]+
            (transform.targetValue[0]-transform.originalValue[0])*position)).toColorPart() +
          (Math.round(transform.originalValue[1]+
            (transform.targetValue[1]-transform.originalValue[1])*position)).toColorPart() +
          (Math.round(transform.originalValue[2]+
            (transform.targetValue[2]-transform.originalValue[2])*position)).toColorPart() :
        (transform.originalValue +
          (transform.targetValue - transform.originalValue) * position).toFixed(3) +
            (transform.unit === null ? '' : transform.unit);
    this.element.setStyle(style, true);
  }
});

Effect.Transform = Class.create({
  initialize: function(tracks){
    this.tracks  = [];
    this.options = arguments[1] || { };
    this.addTracks(tracks);
  },
  addTracks: function(tracks){
    tracks.each(function(track){
      track = $H(track);
      var data = track.values().first();
      this.tracks.push($H({
        ids:     track.keys().first(),
        effect:  Effect.Morph,
        options: { style: data }
      }));
    }.bind(this));
    return this;
  },
  play: function(){
    return new Effect.Parallel(
      this.tracks.map(function(track){
        var ids = track.get('ids'), effect = track.get('effect'), options = track.get('options');
        var elements = [$(ids) || $$(ids)].flatten();
        return elements.map(function(e){ return new effect(e, Object.extend({ sync:true }, options)) });
      }).flatten(),
      this.options
    );
  }
});

Element.CSS_PROPERTIES = $w(
  'backgroundColor backgroundPosition borderBottomColor borderBottomStyle ' +
  'borderBottomWidth borderLeftColor borderLeftStyle borderLeftWidth ' +
  'borderRightColor borderRightStyle borderRightWidth borderSpacing ' +
  'borderTopColor borderTopStyle borderTopWidth bottom clip color ' +
  'fontSize fontWeight height left letterSpacing lineHeight ' +
  'marginBottom marginLeft marginRight marginTop markerOffset maxHeight '+
  'maxWidth minHeight minWidth opacity outlineColor outlineOffset ' +
  'outlineWidth paddingBottom paddingLeft paddingRight paddingTop ' +
  'right textIndent top width wordSpacing zIndex');

Element.CSS_LENGTH = /^(([\+\-]?[0-9\.]+)(em|ex|px|in|cm|mm|pt|pc|\%))|0$/;

String.__parseStyleElement = document.createElement('div');
String.prototype.parseStyle = function(){
  var style, styleRules = $H();
  if (Prototype.Browser.WebKit)
    style = new Element('div',{style:this}).style;
  else {
    String.__parseStyleElement.innerHTML = '<div style="' + this + '"></div>';
    style = String.__parseStyleElement.childNodes[0].style;
  }

  Element.CSS_PROPERTIES.each(function(property){
    if (style[property]) styleRules.set(property, style[property]);
  });

  if (Prototype.Browser.IE && this.include('opacity'))
    styleRules.set('opacity', this.match(/opacity:\s*((?:0|1)?(?:\.\d*)?)/)[1]);

  return styleRules;
};

if (document.defaultView && document.defaultView.getComputedStyle) {
  Element.getStyles = function(element) {
    var css = document.defaultView.getComputedStyle($(element), null);
    return Element.CSS_PROPERTIES.inject({ }, function(styles, property) {
      styles[property] = css[property];
      return styles;
    });
  };
} else {
  Element.getStyles = function(element) {
    element = $(element);
    var css = element.currentStyle, styles;
    styles = Element.CSS_PROPERTIES.inject({ }, function(results, property) {
      results[property] = css[property];
      return results;
    });
    if (!styles.opacity) styles.opacity = element.getOpacity();
    return styles;
  };
}

Effect.Methods = {
  morph: function(element, style) {
    element = $(element);
    new Effect.Morph(element, Object.extend({ style: style }, arguments[2] || { }));
    return element;
  },
  visualEffect: function(element, effect, options) {
    element = $(element);
    var s = effect.dasherize().camelize(), klass = s.charAt(0).toUpperCase() + s.substring(1);
    new Effect[klass](element, options);
    return element;
  },
  highlight: function(element, options) {
    element = $(element);
    new Effect.Highlight(element, options);
    return element;
  }
};

$w('fade appear grow shrink fold blindUp blindDown slideUp slideDown '+
  'pulsate shake puff squish switchOff dropOut').each(
  function(effect) {
    Effect.Methods[effect] = function(element, options){
      element = $(element);
      Effect[effect.charAt(0).toUpperCase() + effect.substring(1)](element, options);
      return element;
    };
  }
);

$w('getInlineOpacity forceRerendering setContentZoom collectTextNodes collectTextNodesIgnoreClass getStyles').each(
  function(f) { Effect.Methods[f] = Element[f]; }
);

Element.addMethods(Effect.Methods);
// script.aculo.us controls.js v1.8.2, Tue Nov 18 18:30:58 +0100 2008

// Copyright (c) 2005-2008 Thomas Fuchs (http://script.aculo.us, http://mir.aculo.us)
//           (c) 2005-2008 Ivan Krstic (http://blogs.law.harvard.edu/ivan)
//           (c) 2005-2008 Jon Tirsen (http://www.tirsen.com)
// Contributors:
//  Richard Livsey
//  Rahul Bhargava
//  Rob Wills
//
// script.aculo.us is freely distributable under the terms of an MIT-style license.
// For details, see the script.aculo.us web site: http://script.aculo.us/

// Autocompleter.Base handles all the autocompletion functionality
// that's independent of the data source for autocompletion. This
// includes drawing the autocompletion menu, observing keyboard
// and mouse events, and similar.
//
// Specific autocompleters need to provide, at the very least,
// a getUpdatedChoices function that will be invoked every time
// the text inside the monitored textbox changes. This method
// should get the text for which to provide autocompletion by
// invoking this.getToken(), NOT by directly accessing
// this.element.value. This is to allow incremental tokenized
// autocompletion. Specific auto-completion logic (AJAX, etc)
// belongs in getUpdatedChoices.
//
// Tokenized incremental autocompletion is enabled automatically
// when an autocompleter is instantiated with the 'tokens' option
// in the options parameter, e.g.:
// new Ajax.Autocompleter('id','upd', '/url/', { tokens: ',' });
// will incrementally autocomplete with a comma as the token.
// Additionally, ',' in the above example can be replaced with
// a token array, e.g. { tokens: [',', '\n'] } which
// enables autocompletion on multiple tokens. This is most
// useful when one of the tokens is \n (a newline), as it
// allows smart autocompletion after linebreaks.

if(typeof Effect == 'undefined')
  throw("controls.js requires including script.aculo.us' effects.js library");

var Autocompleter = { };
Autocompleter.Base = Class.create({
  baseInitialize: function(element, update, options) {
    element          = $(element);
    this.element     = element;
    this.update      = $(update);
    this.hasFocus    = false;
    this.changed     = false;
    this.active      = false;
    this.index       = 0;
    this.entryCount  = 0;
    this.oldElementValue = this.element.value;

    if(this.setOptions)
      this.setOptions(options);
    else
      this.options = options || { };

    this.options.paramName    = this.options.paramName || this.element.name;
    this.options.tokens       = this.options.tokens || [];
    this.options.frequency    = this.options.frequency || 0.4;
    this.options.minChars     = this.options.minChars || 1;
    this.options.onShow       = this.options.onShow ||
      function(element, update){
        if(!update.style.position || update.style.position=='absolute') {
          update.style.position = 'absolute';
          Position.clone(element, update, {
            setHeight: false,
            offsetTop: element.offsetHeight
          });
        }
        Effect.Appear(update,{duration:0.15});
      };
    this.options.onHide = this.options.onHide ||
      function(element, update){ new Effect.Fade(update,{duration:0.15}) };

    if(typeof(this.options.tokens) == 'string')
      this.options.tokens = new Array(this.options.tokens);
    // Force carriage returns as token delimiters anyway
    if (!this.options.tokens.include('\n'))
      this.options.tokens.push('\n');

    this.observer = null;

    this.element.setAttribute('autocomplete','off');

    Element.hide(this.update);

    Event.observe(this.element, 'blur', this.onBlur.bindAsEventListener(this));
    Event.observe(this.element, 'keydown', this.onKeyPress.bindAsEventListener(this));
  },

  show: function() {
    if(Element.getStyle(this.update, 'display')=='none') this.options.onShow(this.element, this.update);
    if(!this.iefix &&
      (Prototype.Browser.IE) &&
      (Element.getStyle(this.update, 'position')=='absolute')) {
      new Insertion.After(this.update,
       '<iframe id="' + this.update.id + '_iefix" '+
       'style="display:none;position:absolute;filter:progid:DXImageTransform.Microsoft.Alpha(opacity=0);" ' +
       'src="javascript:false;" frameborder="0" scrolling="no"></iframe>');
      this.iefix = $(this.update.id+'_iefix');
    }
    if(this.iefix) setTimeout(this.fixIEOverlapping.bind(this), 50);
  },

  fixIEOverlapping: function() {
    Position.clone(this.update, this.iefix, {setTop:(!this.update.style.height)});
    this.iefix.style.zIndex = 1;
    this.update.style.zIndex = 2;
    Element.show(this.iefix);
  },

  hide: function() {
    this.stopIndicator();
    if(Element.getStyle(this.update, 'display')!='none') this.options.onHide(this.element, this.update);
    if(this.iefix) Element.hide(this.iefix);
  },

  startIndicator: function() {
    if(this.options.indicator) Element.show(this.options.indicator);
  },

  stopIndicator: function() {
    if(this.options.indicator) Element.hide(this.options.indicator);
  },

  onKeyPress: function(event) {
    if(this.active)
      switch(event.keyCode) {
       case Event.KEY_TAB:
       case Event.KEY_RETURN:
         this.selectEntry();
         Event.stop(event);
       case Event.KEY_ESC:
         this.hide();
         this.active = false;
         Event.stop(event);
         return;
       case Event.KEY_LEFT:
       case Event.KEY_RIGHT:
         return;
       case Event.KEY_UP:
         this.markPrevious();
         this.render();
         Event.stop(event);
         return;
       case Event.KEY_DOWN:
         this.markNext();
         this.render();
         Event.stop(event);
         return;
      }
     else
       if(event.keyCode==Event.KEY_TAB || event.keyCode==Event.KEY_RETURN ||
         (Prototype.Browser.WebKit > 0 && event.keyCode == 0)) return;

    this.changed = true;
    this.hasFocus = true;

    if(this.observer) clearTimeout(this.observer);
      this.observer =
        setTimeout(this.onObserverEvent.bind(this), this.options.frequency*1000);
  },

  activate: function() {
    this.changed = false;
    this.hasFocus = true;
    this.getUpdatedChoices();
  },

  onHover: function(event) {
    var element = Event.findElement(event, 'LI');
    if(this.index != element.autocompleteIndex)
    {
        this.index = element.autocompleteIndex;
        this.render();
    }
    Event.stop(event);
  },

  onClick: function(event) {
    var element = Event.findElement(event, 'LI');
    this.index = element.autocompleteIndex;
    this.selectEntry();
    this.hide();
  },

  onBlur: function(event) {
    // needed to make click events working
    setTimeout(this.hide.bind(this), 250);
    this.hasFocus = false;
    this.active = false;
  },

  render: function() {
    if(this.entryCount > 0) {
      for (var i = 0; i < this.entryCount; i++)
        this.index==i ?
          Element.addClassName(this.getEntry(i),"selected") :
          Element.removeClassName(this.getEntry(i),"selected");
      if(this.hasFocus) {
        this.show();
        this.active = true;
      }
    } else {
      this.active = false;
      this.hide();
    }
  },

  markPrevious: function() {
    if(this.index > 0) this.index--;
      else this.index = this.entryCount-1;
    //this.getEntry(this.index).scrollIntoView(true); useless
  },

  markNext: function() {
    if(this.index < this.entryCount-1) this.index++;
      else this.index = 0;
    this.getEntry(this.index).scrollIntoView(false);
  },

  getEntry: function(index) {
    return this.update.firstChild.childNodes[index];
  },

  getCurrentEntry: function() {
    return this.getEntry(this.index);
  },

  selectEntry: function() {
    this.active = false;
    this.updateElement(this.getCurrentEntry());
  },

  updateElement: function(selectedElement) {
    if (this.options.updateElement) {
      this.options.updateElement(selectedElement);
      return;
    }
    var value = '';
    if (this.options.select) {
      var nodes = $(selectedElement).select('.' + this.options.select) || [];
      if(nodes.length>0) value = Element.collectTextNodes(nodes[0], this.options.select);
    } else
      value = Element.collectTextNodesIgnoreClass(selectedElement, 'informal');

    var bounds = this.getTokenBounds();
    if (bounds[0] != -1) {
      var newValue = this.element.value.substr(0, bounds[0]);
      var whitespace = this.element.value.substr(bounds[0]).match(/^\s+/);
      if (whitespace)
        newValue += whitespace[0];
      this.element.value = newValue + value + this.element.value.substr(bounds[1]);
    } else {
      this.element.value = value;
    }
    this.oldElementValue = this.element.value;
    this.element.focus();

    if (this.options.afterUpdateElement)
      this.options.afterUpdateElement(this.element, selectedElement);
  },

  updateChoices: function(choices) {
    if(!this.changed && this.hasFocus) {
      this.update.innerHTML = choices;
      Element.cleanWhitespace(this.update);
      Element.cleanWhitespace(this.update.down());

      if(this.update.firstChild && this.update.down().childNodes) {
        this.entryCount =
          this.update.down().childNodes.length;
        for (var i = 0; i < this.entryCount; i++) {
          var entry = this.getEntry(i);
          entry.autocompleteIndex = i;
          this.addObservers(entry);
        }
      } else {
        this.entryCount = 0;
      }

      this.stopIndicator();
      this.index = 0;

      if(this.entryCount==1 && this.options.autoSelect) {
        this.selectEntry();
        this.hide();
      } else {
        this.render();
      }
    }
  },

  addObservers: function(element) {
    Event.observe(element, "mouseover", this.onHover.bindAsEventListener(this));
    Event.observe(element, "click", this.onClick.bindAsEventListener(this));
  },

  onObserverEvent: function() {
    this.changed = false;
    this.tokenBounds = null;
    if(this.getToken().length>=this.options.minChars) {
      this.getUpdatedChoices();
    } else {
      this.active = false;
      this.hide();
    }
    this.oldElementValue = this.element.value;
  },

  getToken: function() {
    var bounds = this.getTokenBounds();
    return this.element.value.substring(bounds[0], bounds[1]).strip();
  },

  getTokenBounds: function() {
    if (null != this.tokenBounds) return this.tokenBounds;
    var value = this.element.value;
    if (value.strip().empty()) return [-1, 0];
    var diff = arguments.callee.getFirstDifferencePos(value, this.oldElementValue);
    var offset = (diff == this.oldElementValue.length ? 1 : 0);
    var prevTokenPos = -1, nextTokenPos = value.length;
    var tp;
    for (var index = 0, l = this.options.tokens.length; index < l; ++index) {
      tp = value.lastIndexOf(this.options.tokens[index], diff + offset - 1);
      if (tp > prevTokenPos) prevTokenPos = tp;
      tp = value.indexOf(this.options.tokens[index], diff + offset);
      if (-1 != tp && tp < nextTokenPos) nextTokenPos = tp;
    }
    return (this.tokenBounds = [prevTokenPos + 1, nextTokenPos]);
  }
});

Autocompleter.Base.prototype.getTokenBounds.getFirstDifferencePos = function(newS, oldS) {
  var boundary = Math.min(newS.length, oldS.length);
  for (var index = 0; index < boundary; ++index)
    if (newS[index] != oldS[index])
      return index;
  return boundary;
};

Ajax.Autocompleter = Class.create(Autocompleter.Base, {
  initialize: function(element, update, url, options) {
    this.baseInitialize(element, update, options);
    this.options.asynchronous  = true;
    this.options.onComplete    = this.onComplete.bind(this);
    this.options.defaultParams = this.options.parameters || null;
    this.url                   = url;
  },

  getUpdatedChoices: function() {
    this.startIndicator();

    var entry = encodeURIComponent(this.options.paramName) + '=' +
      encodeURIComponent(this.getToken());

    this.options.parameters = this.options.callback ?
      this.options.callback(this.element, entry) : entry;

    if(this.options.defaultParams)
      this.options.parameters += '&' + this.options.defaultParams;

    new Ajax.Request(this.url, this.options);
  },

  onComplete: function(request) {
    this.updateChoices(request.responseText);
  }
});

// The local array autocompleter. Used when you'd prefer to
// inject an array of autocompletion options into the page, rather
// than sending out Ajax queries, which can be quite slow sometimes.
//
// The constructor takes four parameters. The first two are, as usual,
// the id of the monitored textbox, and id of the autocompletion menu.
// The third is the array you want to autocomplete from, and the fourth
// is the options block.
//
// Extra local autocompletion options:
// - choices - How many autocompletion choices to offer
//
// - partialSearch - If false, the autocompleter will match entered
//                    text only at the beginning of strings in the
//                    autocomplete array. Defaults to true, which will
//                    match text at the beginning of any *word* in the
//                    strings in the autocomplete array. If you want to
//                    search anywhere in the string, additionally set
//                    the option fullSearch to true (default: off).
//
// - fullSsearch - Search anywhere in autocomplete array strings.
//
// - partialChars - How many characters to enter before triggering
//                   a partial match (unlike minChars, which defines
//                   how many characters are required to do any match
//                   at all). Defaults to 2.
//
// - ignoreCase - Whether to ignore case when autocompleting.
//                 Defaults to true.
//
// It's possible to pass in a custom function as the 'selector'
// option, if you prefer to write your own autocompletion logic.
// In that case, the other options above will not apply unless
// you support them.

Autocompleter.Local = Class.create(Autocompleter.Base, {
  initialize: function(element, update, array, options) {
    this.baseInitialize(element, update, options);
    this.options.array = array;
  },

  getUpdatedChoices: function() {
    this.updateChoices(this.options.selector(this));
  },

  setOptions: function(options) {
    this.options = Object.extend({
      choices: 10,
      partialSearch: true,
      partialChars: 2,
      ignoreCase: true,
      fullSearch: false,
      selector: function(instance) {
        var ret       = []; // Beginning matches
        var partial   = []; // Inside matches
        var entry     = instance.getToken();
        var count     = 0;

        for (var i = 0; i < instance.options.array.length &&
          ret.length < instance.options.choices ; i++) {

          var elem = instance.options.array[i];
          var foundPos = instance.options.ignoreCase ?
            elem.toLowerCase().indexOf(entry.toLowerCase()) :
            elem.indexOf(entry);

          while (foundPos != -1) {
            if (foundPos == 0 && elem.length != entry.length) {
              ret.push("<li><strong>" + elem.substr(0, entry.length) + "</strong>" +
                elem.substr(entry.length) + "</li>");
              break;
            } else if (entry.length >= instance.options.partialChars &&
              instance.options.partialSearch && foundPos != -1) {
              if (instance.options.fullSearch || /\s/.test(elem.substr(foundPos-1,1))) {
                partial.push("<li>" + elem.substr(0, foundPos) + "<strong>" +
                  elem.substr(foundPos, entry.length) + "</strong>" + elem.substr(
                  foundPos + entry.length) + "</li>");
                break;
              }
            }

            foundPos = instance.options.ignoreCase ?
              elem.toLowerCase().indexOf(entry.toLowerCase(), foundPos + 1) :
              elem.indexOf(entry, foundPos + 1);

          }
        }
        if (partial.length)
          ret = ret.concat(partial.slice(0, instance.options.choices - ret.length));
        return "<ul>" + ret.join('') + "</ul>";
      }
    }, options || { });
  }
});

// AJAX in-place editor and collection editor
// Full rewrite by Christophe Porteneuve <tdd@tddsworld.com> (April 2007).

// Use this if you notice weird scrolling problems on some browsers,
// the DOM might be a bit confused when this gets called so do this
// waits 1 ms (with setTimeout) until it does the activation
Field.scrollFreeActivate = function(field) {
  setTimeout(function() {
    Field.activate(field);
  }, 1);
};

Ajax.InPlaceEditor = Class.create({
  initialize: function(element, url, options) {
    this.url = url;
    this.element = element = $(element);
    this.prepareOptions();
    this._controls = { };
    arguments.callee.dealWithDeprecatedOptions(options); // DEPRECATION LAYER!!!
    Object.extend(this.options, options || { });
    if (!this.options.formId && this.element.id) {
      this.options.formId = this.element.id + '-inplaceeditor';
      if ($(this.options.formId))
        this.options.formId = '';
    }
    if (this.options.externalControl)
      this.options.externalControl = $(this.options.externalControl);
    if (!this.options.externalControl)
      this.options.externalControlOnly = false;
    this._originalBackground = this.element.getStyle('background-color') || 'transparent';
    this.element.title = this.options.clickToEditText;
    this._boundCancelHandler = this.handleFormCancellation.bind(this);
    this._boundComplete = (this.options.onComplete || Prototype.emptyFunction).bind(this);
    this._boundFailureHandler = this.handleAJAXFailure.bind(this);
    this._boundSubmitHandler = this.handleFormSubmission.bind(this);
    this._boundWrapperHandler = this.wrapUp.bind(this);
    this.registerListeners();
  },
  checkForEscapeOrReturn: function(e) {
    if (!this._editing || e.ctrlKey || e.altKey || e.shiftKey) return;
    if (Event.KEY_ESC == e.keyCode)
      this.handleFormCancellation(e);
    else if (Event.KEY_RETURN == e.keyCode)
      this.handleFormSubmission(e);
  },
  createControl: function(mode, handler, extraClasses) {
    var control = this.options[mode + 'Control'];
    var text = this.options[mode + 'Text'];
    if ('button' == control) {
      var btn = document.createElement('input');
      btn.type = 'submit';
      btn.value = text;
      btn.className = 'editor_' + mode + '_button';
      if ('cancel' == mode)
        btn.onclick = this._boundCancelHandler;
      this._form.appendChild(btn);
      this._controls[mode] = btn;
    } else if ('link' == control) {
      var link = document.createElement('a');
      link.href = '#';
      link.appendChild(document.createTextNode(text));
      link.onclick = 'cancel' == mode ? this._boundCancelHandler : this._boundSubmitHandler;
      link.className = 'editor_' + mode + '_link';
      if (extraClasses)
        link.className += ' ' + extraClasses;
      this._form.appendChild(link);
      this._controls[mode] = link;
    }
  },
  createEditField: function() {
    var text = (this.options.loadTextURL ? this.options.loadingText : this.getText());
    var fld;
    if (1 >= this.options.rows && !/\r|\n/.test(this.getText())) {
      fld = document.createElement('input');
      fld.type = 'text';
      var size = this.options.size || this.options.cols || 0;
      if (0 < size) fld.size = size;
    } else {
      fld = document.createElement('textarea');
      fld.rows = (1 >= this.options.rows ? this.options.autoRows : this.options.rows);
      fld.cols = this.options.cols || 40;
    }
    fld.name = this.options.paramName;
    fld.value = text; // No HTML breaks conversion anymore
    fld.className = 'editor_field';
    if (this.options.submitOnBlur)
      fld.onblur = this._boundSubmitHandler;
    this._controls.editor = fld;
    if (this.options.loadTextURL)
      this.loadExternalText();
    this._form.appendChild(this._controls.editor);
  },
  createForm: function() {
    var ipe = this;
    function addText(mode, condition) {
      var text = ipe.options['text' + mode + 'Controls'];
      if (!text || condition === false) return;
      ipe._form.appendChild(document.createTextNode(text));
    };
    this._form = $(document.createElement('form'));
    this._form.id = this.options.formId;
    this._form.addClassName(this.options.formClassName);
    this._form.onsubmit = this._boundSubmitHandler;
    this.createEditField();
    if ('textarea' == this._controls.editor.tagName.toLowerCase())
      this._form.appendChild(document.createElement('br'));
    if (this.options.onFormCustomization)
      this.options.onFormCustomization(this, this._form);
    addText('Before', this.options.okControl || this.options.cancelControl);
    this.createControl('ok', this._boundSubmitHandler);
    addText('Between', this.options.okControl && this.options.cancelControl);
    this.createControl('cancel', this._boundCancelHandler, 'editor_cancel');
    addText('After', this.options.okControl || this.options.cancelControl);
  },
  destroy: function() {
    if (this._oldInnerHTML)
      this.element.innerHTML = this._oldInnerHTML;
    this.leaveEditMode();
    this.unregisterListeners();
  },
  enterEditMode: function(e) {
    if (this._saving || this._editing) return;
    this._editing = true;
    this.triggerCallback('onEnterEditMode');
    if (this.options.externalControl)
      this.options.externalControl.hide();
    this.element.hide();
    this.createForm();
    this.element.parentNode.insertBefore(this._form, this.element);
    if (!this.options.loadTextURL)
      this.postProcessEditField();
    if (e) Event.stop(e);
  },
  enterHover: function(e) {
    if (this.options.hoverClassName)
      this.element.addClassName(this.options.hoverClassName);
    if (this._saving) return;
    this.triggerCallback('onEnterHover');
  },
  getText: function() {
    return this.element.innerHTML.unescapeHTML();
  },
  handleAJAXFailure: function(transport) {
    this.triggerCallback('onFailure', transport);
    if (this._oldInnerHTML) {
      this.element.innerHTML = this._oldInnerHTML;
      this._oldInnerHTML = null;
    }
  },
  handleFormCancellation: function(e) {
    this.wrapUp();
    if (e) Event.stop(e);
  },
  handleFormSubmission: function(e) {
    var form = this._form;
    var value = $F(this._controls.editor);
    this.prepareSubmission();
    var params = this.options.callback(form, value) || '';
    if (Object.isString(params))
      params = params.toQueryParams();
    params.editorId = this.element.id;
    if (this.options.htmlResponse) {
      var options = Object.extend({ evalScripts: true }, this.options.ajaxOptions);
      Object.extend(options, {
        parameters: params,
        onComplete: this._boundWrapperHandler,
        onFailure: this._boundFailureHandler
      });
      new Ajax.Updater({ success: this.element }, this.url, options);
    } else {
      var options = Object.extend({ method: 'get' }, this.options.ajaxOptions);
      Object.extend(options, {
        parameters: params,
        onComplete: this._boundWrapperHandler,
        onFailure: this._boundFailureHandler
      });
      new Ajax.Request(this.url, options);
    }
    if (e) Event.stop(e);
  },
  leaveEditMode: function() {
    this.element.removeClassName(this.options.savingClassName);
    this.removeForm();
    this.leaveHover();
    this.element.style.backgroundColor = this._originalBackground;
    this.element.show();
    if (this.options.externalControl)
      this.options.externalControl.show();
    this._saving = false;
    this._editing = false;
    this._oldInnerHTML = null;
    this.triggerCallback('onLeaveEditMode');
  },
  leaveHover: function(e) {
    if (this.options.hoverClassName)
      this.element.removeClassName(this.options.hoverClassName);
    if (this._saving) return;
    this.triggerCallback('onLeaveHover');
  },
  loadExternalText: function() {
    this._form.addClassName(this.options.loadingClassName);
    this._controls.editor.disabled = true;
    var options = Object.extend({ method: 'get' }, this.options.ajaxOptions);
    Object.extend(options, {
      parameters: 'editorId=' + encodeURIComponent(this.element.id),
      onComplete: Prototype.emptyFunction,
      onSuccess: function(transport) {
        this._form.removeClassName(this.options.loadingClassName);
        var text = transport.responseText;
        if (this.options.stripLoadedTextTags)
          text = text.stripTags();
        this._controls.editor.value = text;
        this._controls.editor.disabled = false;
        this.postProcessEditField();
      }.bind(this),
      onFailure: this._boundFailureHandler
    });
    new Ajax.Request(this.options.loadTextURL, options);
  },
  postProcessEditField: function() {
    var fpc = this.options.fieldPostCreation;
    if (fpc)
      $(this._controls.editor)['focus' == fpc ? 'focus' : 'activate']();
  },
  prepareOptions: function() {
    this.options = Object.clone(Ajax.InPlaceEditor.DefaultOptions);
    Object.extend(this.options, Ajax.InPlaceEditor.DefaultCallbacks);
    [this._extraDefaultOptions].flatten().compact().each(function(defs) {
      Object.extend(this.options, defs);
    }.bind(this));
  },
  prepareSubmission: function() {
    this._saving = true;
    this.removeForm();
    this.leaveHover();
    this.showSaving();
  },
  registerListeners: function() {
    this._listeners = { };
    var listener;
    $H(Ajax.InPlaceEditor.Listeners).each(function(pair) {
      listener = this[pair.value].bind(this);
      this._listeners[pair.key] = listener;
      if (!this.options.externalControlOnly)
        this.element.observe(pair.key, listener);
      if (this.options.externalControl)
        this.options.externalControl.observe(pair.key, listener);
    }.bind(this));
  },
  removeForm: function() {
    if (!this._form) return;
    this._form.remove();
    this._form = null;
    this._controls = { };
  },
  showSaving: function() {
    this._oldInnerHTML = this.element.innerHTML;
    this.element.innerHTML = this.options.savingText;
    this.element.addClassName(this.options.savingClassName);
    this.element.style.backgroundColor = this._originalBackground;
    this.element.show();
  },
  triggerCallback: function(cbName, arg) {
    if ('function' == typeof this.options[cbName]) {
      this.options[cbName](this, arg);
    }
  },
  unregisterListeners: function() {
    $H(this._listeners).each(function(pair) {
      if (!this.options.externalControlOnly)
        this.element.stopObserving(pair.key, pair.value);
      if (this.options.externalControl)
        this.options.externalControl.stopObserving(pair.key, pair.value);
    }.bind(this));
  },
  wrapUp: function(transport) {
    this.leaveEditMode();
    // Can't use triggerCallback due to backward compatibility: requires
    // binding + direct element
    this._boundComplete(transport, this.element);
  }
});

Object.extend(Ajax.InPlaceEditor.prototype, {
  dispose: Ajax.InPlaceEditor.prototype.destroy
});

Ajax.InPlaceCollectionEditor = Class.create(Ajax.InPlaceEditor, {
  initialize: function($super, element, url, options) {
    this._extraDefaultOptions = Ajax.InPlaceCollectionEditor.DefaultOptions;
    $super(element, url, options);
  },

  createEditField: function() {
    var list = document.createElement('select');
    list.name = this.options.paramName;
    list.size = 1;
    this._controls.editor = list;
    this._collection = this.options.collection || [];
    if (this.options.loadCollectionURL)
      this.loadCollection();
    else
      this.checkForExternalText();
    this._form.appendChild(this._controls.editor);
  },

  loadCollection: function() {
    this._form.addClassName(this.options.loadingClassName);
    this.showLoadingText(this.options.loadingCollectionText);
    var options = Object.extend({ method: 'get' }, this.options.ajaxOptions);
    Object.extend(options, {
      parameters: 'editorId=' + encodeURIComponent(this.element.id),
      onComplete: Prototype.emptyFunction,
      onSuccess: function(transport) {
        var js = transport.responseText.strip();
        if (!/^\[.*\]$/.test(js)) // TODO: improve sanity check
          throw('Server returned an invalid collection representation.');
        this._collection = eval(js);
        this.checkForExternalText();
      }.bind(this),
      onFailure: this.onFailure
    });
    new Ajax.Request(this.options.loadCollectionURL, options);
  },

  showLoadingText: function(text) {
    this._controls.editor.disabled = true;
    var tempOption = this._controls.editor.firstChild;
    if (!tempOption) {
      tempOption = document.createElement('option');
      tempOption.value = '';
      this._controls.editor.appendChild(tempOption);
      tempOption.selected = true;
    }
    tempOption.update((text || '').stripScripts().stripTags());
  },

  checkForExternalText: function() {
    this._text = this.getText();
    if (this.options.loadTextURL)
      this.loadExternalText();
    else
      this.buildOptionList();
  },

  loadExternalText: function() {
    this.showLoadingText(this.options.loadingText);
    var options = Object.extend({ method: 'get' }, this.options.ajaxOptions);
    Object.extend(options, {
      parameters: 'editorId=' + encodeURIComponent(this.element.id),
      onComplete: Prototype.emptyFunction,
      onSuccess: function(transport) {
        this._text = transport.responseText.strip();
        this.buildOptionList();
      }.bind(this),
      onFailure: this.onFailure
    });
    new Ajax.Request(this.options.loadTextURL, options);
  },

  buildOptionList: function() {
    this._form.removeClassName(this.options.loadingClassName);
    this._collection = this._collection.map(function(entry) {
      return 2 === entry.length ? entry : [entry, entry].flatten();
    });
    var marker = ('value' in this.options) ? this.options.value : this._text;
    var textFound = this._collection.any(function(entry) {
      return entry[0] == marker;
    }.bind(this));
    this._controls.editor.update('');
    var option;
    this._collection.each(function(entry, index) {
      option = document.createElement('option');
      option.value = entry[0];
      option.selected = textFound ? entry[0] == marker : 0 == index;
      option.appendChild(document.createTextNode(entry[1]));
      this._controls.editor.appendChild(option);
    }.bind(this));
    this._controls.editor.disabled = false;
    Field.scrollFreeActivate(this._controls.editor);
  }
});

//**** DEPRECATION LAYER FOR InPlace[Collection]Editor! ****
//**** This only  exists for a while,  in order to  let ****
//**** users adapt to  the new API.  Read up on the new ****
//**** API and convert your code to it ASAP!            ****

Ajax.InPlaceEditor.prototype.initialize.dealWithDeprecatedOptions = function(options) {
  if (!options) return;
  function fallback(name, expr) {
    if (name in options || expr === undefined) return;
    options[name] = expr;
  };
  fallback('cancelControl', (options.cancelLink ? 'link' : (options.cancelButton ? 'button' :
    options.cancelLink == options.cancelButton == false ? false : undefined)));
  fallback('okControl', (options.okLink ? 'link' : (options.okButton ? 'button' :
    options.okLink == options.okButton == false ? false : undefined)));
  fallback('highlightColor', options.highlightcolor);
  fallback('highlightEndColor', options.highlightendcolor);
};

Object.extend(Ajax.InPlaceEditor, {
  DefaultOptions: {
    ajaxOptions: { },
    autoRows: 3,                                // Use when multi-line w/ rows == 1
    cancelControl: 'link',                      // 'link'|'button'|false
    cancelText: 'cancel',
    clickToEditText: 'Click to edit',
    externalControl: null,                      // id|elt
    externalControlOnly: false,
    fieldPostCreation: 'activate',              // 'activate'|'focus'|false
    formClassName: 'inplaceeditor-form',
    formId: null,                               // id|elt
    highlightColor: '#ffff99',
    highlightEndColor: '#ffffff',
    hoverClassName: '',
    htmlResponse: true,
    loadingClassName: 'inplaceeditor-loading',
    loadingText: 'Loading...',
    okControl: 'button',                        // 'link'|'button'|false
    okText: 'ok',
    paramName: 'value',
    rows: 1,                                    // If 1 and multi-line, uses autoRows
    savingClassName: 'inplaceeditor-saving',
    savingText: 'Saving...',
    size: 0,
    stripLoadedTextTags: false,
    submitOnBlur: false,
    textAfterControls: '',
    textBeforeControls: '',
    textBetweenControls: ''
  },
  DefaultCallbacks: {
    callback: function(form) {
      return Form.serialize(form);
    },
    onComplete: function(transport, element) {
      // For backward compatibility, this one is bound to the IPE, and passes
      // the element directly.  It was too often customized, so we don't break it.
      new Effect.Highlight(element, {
        startcolor: this.options.highlightColor, keepBackgroundImage: true });
    },
    onEnterEditMode: null,
    onEnterHover: function(ipe) {
      ipe.element.style.backgroundColor = ipe.options.highlightColor;
      if (ipe._effect)
        ipe._effect.cancel();
    },
    onFailure: function(transport, ipe) {
      alert('Error communication with the server: ' + transport.responseText.stripTags());
    },
    onFormCustomization: null, // Takes the IPE and its generated form, after editor, before controls.
    onLeaveEditMode: null,
    onLeaveHover: function(ipe) {
      ipe._effect = new Effect.Highlight(ipe.element, {
        startcolor: ipe.options.highlightColor, endcolor: ipe.options.highlightEndColor,
        restorecolor: ipe._originalBackground, keepBackgroundImage: true
      });
    }
  },
  Listeners: {
    click: 'enterEditMode',
    keydown: 'checkForEscapeOrReturn',
    mouseover: 'enterHover',
    mouseout: 'leaveHover'
  }
});

Ajax.InPlaceCollectionEditor.DefaultOptions = {
  loadingCollectionText: 'Loading options...'
};

// Delayed observer, like Form.Element.Observer,
// but waits for delay after last key input
// Ideal for live-search fields

Form.Element.DelayedObserver = Class.create({
  initialize: function(element, delay, callback) {
    this.delay     = delay || 0.5;
    this.element   = $(element);
    this.callback  = callback;
    this.timer     = null;
    this.lastValue = $F(this.element);
    Event.observe(this.element,'keyup',this.delayedListener.bindAsEventListener(this));
  },
  delayedListener: function(event) {
    if(this.lastValue == $F(this.element)) return;
    if(this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(this.onTimerEvent.bind(this), this.delay * 1000);
    this.lastValue = $F(this.element);
  },
  onTimerEvent: function() {
    this.timer = null;
    this.callback(this.element, $F(this.element));
  }
});
/**
 * Magento Enterprise Edition
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the Magento Enterprise Edition License
 * that is bundled with this package in the file LICENSE_EE.txt.
 * It is also available through the world-wide-web at this URL:
 * http://www.magentocommerce.com/license/enterprise-edition
 * If you did not receive a copy of the license and are unable to
 * obtain it through the world-wide-web, please send an email
 * to license@magentocommerce.com so we can send you a copy immediately.
 *
 * DISCLAIMER
 *
 * Do not edit or add to this file if you wish to upgrade Magento to newer
 * versions in the future. If you wish to customize Magento for your
 * needs please refer to http://www.magentocommerce.com for more information.
 *
 * @category    Varien
 * @package     js
 * @copyright   Copyright (c) 2012 Magento Inc. (http://www.magentocommerce.com)
 * @license     http://www.magentocommerce.com/license/enterprise-edition
 */
function popWin(url,win,para) {
    var win = window.open(url,win,para);
    win.focus();
}

function setLocation(url){
    window.location.href = url;
}

function setPLocation(url, setFocus){
    if( setFocus ) {
        window.opener.focus();
    }
    window.opener.location.href = url;
}

function setLanguageCode(code, fromCode){
    //TODO: javascript cookies have different domain and path than php cookies
    var href = window.location.href;
    var after = '', dash;
    if (dash = href.match(/\#(.*)$/)) {
        href = href.replace(/\#(.*)$/, '');
        after = dash[0];
    }

    if (href.match(/[?]/)) {
        var re = /([?&]store=)[a-z0-9_]*/;
        if (href.match(re)) {
            href = href.replace(re, '$1'+code);
        } else {
            href += '&store='+code;
        }

        var re = /([?&]from_store=)[a-z0-9_]*/;
        if (href.match(re)) {
            href = href.replace(re, '');
        }
    } else {
        href += '?store='+code;
    }
    if (typeof(fromCode) != 'undefined') {
        href += '&from_store='+fromCode;
    }
    href += after;

    setLocation(href);
}

/**
 * Add classes to specified elements.
 * Supported classes are: 'odd', 'even', 'first', 'last'
 *
 * @param elements - array of elements to be decorated
 * [@param decorateParams] - array of classes to be set. If omitted, all available will be used
 */
function decorateGeneric(elements, decorateParams)
{
    var allSupportedParams = ['odd', 'even', 'first', 'last'];
    var _decorateParams = {};
    var total = elements.length;

    if (total) {
        // determine params called
        if (typeof(decorateParams) == 'undefined') {
            decorateParams = allSupportedParams;
        }
        if (!decorateParams.length) {
            return;
        }
        for (var k in allSupportedParams) {
            _decorateParams[allSupportedParams[k]] = false;
        }
        for (var k in decorateParams) {
            _decorateParams[decorateParams[k]] = true;
        }

        // decorate elements
        // elements[0].addClassName('first'); // will cause bug in IE (#5587)
        if (_decorateParams.first) {
            Element.addClassName(elements[0], 'first');
        }
        if (_decorateParams.last) {
            Element.addClassName(elements[total-1], 'last');
        }
        for (var i = 0; i < total; i++) {
            if ((i + 1) % 2 == 0) {
                if (_decorateParams.even) {
                    Element.addClassName(elements[i], 'even');
                }
            }
            else {
                if (_decorateParams.odd) {
                    Element.addClassName(elements[i], 'odd');
                }
            }
        }
    }
}

/**
 * Decorate table rows and cells, tbody etc
 * @see decorateGeneric()
 */
function decorateTable(table, options) {
    var table = $(table);
    if (table) {
        // set default options
        var _options = {
            'tbody'    : false,
            'tbody tr' : ['odd', 'even', 'first', 'last'],
            'thead tr' : ['first', 'last'],
            'tfoot tr' : ['first', 'last'],
            'tr td'    : ['last']
        };
        // overload options
        if (typeof(options) != 'undefined') {
            for (var k in options) {
                _options[k] = options[k];
            }
        }
        // decorate
        if (_options['tbody']) {
            decorateGeneric(table.select('tbody'), _options['tbody']);
        }
        if (_options['tbody tr']) {
            decorateGeneric(table.select('tbody tr'), _options['tbody tr']);
        }
        if (_options['thead tr']) {
            decorateGeneric(table.select('thead tr'), _options['thead tr']);
        }
        if (_options['tfoot tr']) {
            decorateGeneric(table.select('tfoot tr'), _options['tfoot tr']);
        }
        if (_options['tr td']) {
            var allRows = table.select('tr');
            if (allRows.length) {
                for (var i = 0; i < allRows.length; i++) {
                    decorateGeneric(allRows[i].getElementsByTagName('TD'), _options['tr td']);
                }
            }
        }
    }
}

/**
 * Set "odd", "even" and "last" CSS classes for list items
 * @see decorateGeneric()
 */
function decorateList(list, nonRecursive) {
    if ($(list)) {
        if (typeof(nonRecursive) == 'undefined') {
            var items = $(list).select('li')
        }
        else {
            var items = $(list).childElements();
        }
        decorateGeneric(items, ['odd', 'even', 'last']);
    }
}

/**
 * Set "odd", "even" and "last" CSS classes for list items
 * @see decorateGeneric()
 */
function decorateDataList(list) {
    list = $(list);
    if (list) {
        decorateGeneric(list.select('dt'), ['odd', 'even', 'last']);
        decorateGeneric(list.select('dd'), ['odd', 'even', 'last']);
    }
}

/**
 * Parse SID and produces the correct URL
 */
function parseSidUrl(baseUrl, urlExt) {
    var sidPos = baseUrl.indexOf('/?SID=');
    var sid = '';
    urlExt = (urlExt != undefined) ? urlExt : '';

    if(sidPos > -1) {
        sid = '?' + baseUrl.substring(sidPos + 2);
        baseUrl = baseUrl.substring(0, sidPos + 1);
    }

    return baseUrl+urlExt+sid;
}

/**
 * Formats currency using patern
 * format - JSON (pattern, decimal, decimalsDelimeter, groupsDelimeter)
 * showPlus - true (always show '+'or '-'),
 *      false (never show '-' even if number is negative)
 *      null (show '-' if number is negative)
 */

function formatCurrency(price, format, showPlus){
    var precision = isNaN(format.precision = Math.abs(format.precision)) ? 2 : format.precision;
    var requiredPrecision = isNaN(format.requiredPrecision = Math.abs(format.requiredPrecision)) ? 2 : format.requiredPrecision;

    //precision = (precision > requiredPrecision) ? precision : requiredPrecision;
    //for now we don't need this difference so precision is requiredPrecision
    precision = requiredPrecision;

    var integerRequired = isNaN(format.integerRequired = Math.abs(format.integerRequired)) ? 1 : format.integerRequired;

    var decimalSymbol = format.decimalSymbol == undefined ? "," : format.decimalSymbol;
    var groupSymbol = format.groupSymbol == undefined ? "." : format.groupSymbol;
    var groupLength = format.groupLength == undefined ? 3 : format.groupLength;

    var s = '';

    if (showPlus == undefined || showPlus == true) {
        s = price < 0 ? "-" : ( showPlus ? "+" : "");
    } else if (showPlus == false) {
        s = '';
    }

    var i = parseInt(price = Math.abs(+price || 0).toFixed(precision)) + "";
    var pad = (i.length < integerRequired) ? (integerRequired - i.length) : 0;
    while (pad) { i = '0' + i; pad--; }
    j = (j = i.length) > groupLength ? j % groupLength : 0;
    re = new RegExp("(\\d{" + groupLength + "})(?=\\d)", "g");

    /**
     * replace(/-/, 0) is only for fixing Safari bug which appears
     * when Math.abs(0).toFixed() executed on "0" number.
     * Result is "0.-0" :(
     */
    var r = (j ? i.substr(0, j) + groupSymbol : "") + i.substr(j).replace(re, "$1" + groupSymbol) + (precision ? decimalSymbol + Math.abs(price - i).toFixed(precision).replace(/-/, 0).slice(2) : "")
    var pattern = '';
    if (format.pattern.indexOf('{sign}') == -1) {
        pattern = s + format.pattern;
    } else {
        pattern = format.pattern.replace('{sign}', s);
    }

    return pattern.replace('%s', r).replace(/^\s\s*/, '').replace(/\s\s*$/, '');
};

function expandDetails(el, childClass) {
    if (Element.hasClassName(el,'show-details')) {
        $$(childClass).each(function(item){item.hide()});
        Element.removeClassName(el,'show-details');
    }
    else {
        $$(childClass).each(function(item){item.show()});
        Element.addClassName(el,'show-details');
    }
}

// Version 1.0
var isIE = navigator.appVersion.match(/MSIE/) == "MSIE";

if (!window.Varien)
    var Varien = new Object();

Varien.showLoading = function(){
    Element.show('loading-process');
}
Varien.hideLoading = function(){
    Element.hide('loading-process');
}
Varien.GlobalHandlers = {
    onCreate: function() {
        Varien.showLoading();
    },

    onComplete: function() {
        if(Ajax.activeRequestCount == 0) {
            Varien.hideLoading();
        }
    }
};

Ajax.Responders.register(Varien.GlobalHandlers);

/**
 * Quick Search form client model
 */
Varien.searchForm = Class.create();
Varien.searchForm.prototype = {
    initialize : function(form, field, emptyText){
        this.form   = $(form);
        this.field  = $(field);
        this.emptyText = emptyText;

        Event.observe(this.form,  'submit', this.submit.bind(this));
        Event.observe(this.field, 'focus', this.focus.bind(this));
        Event.observe(this.field, 'blur', this.blur.bind(this));
        this.blur();
    },

    submit : function(event){
        if (this.field.value == this.emptyText || this.field.value == ''){
            Event.stop(event);
            return false;
        }
        return true;
    },

    focus : function(event){
        if(this.field.value==this.emptyText){
            this.field.value='';
        }

    },

    blur : function(event){
        if(this.field.value==''){
            this.field.value=this.emptyText;
        }
    },

    initAutocomplete : function(url, destinationElement){
        new Ajax.Autocompleter(
            this.field,
            destinationElement,
            url,
            {
                paramName: this.field.name,
                method: 'get',
                minChars: 2,
                updateElement: this._selectAutocompleteItem.bind(this),
                onShow : function(element, update) {
                    if(!update.style.position || update.style.position=='absolute') {
                        update.style.position = 'absolute';
                        Position.clone(element, update, {
                            setHeight: false,
                            offsetTop: element.offsetHeight
                        });
                    }
                    Effect.Appear(update,{duration:0});
                }

            }
        );
    },

    _selectAutocompleteItem : function(element){
        if(element.title){
            this.field.value = element.title;
        }
        this.form.submit();
    }
}

Varien.Tabs = Class.create();
Varien.Tabs.prototype = {
  initialize: function(selector) {
    var self=this;
    $$(selector+' a').each(this.initTab.bind(this));
  },

  initTab: function(el) {
      el.href = 'javascript:void(0)';
      if ($(el.parentNode).hasClassName('active')) {
        this.showContent(el);
      }
      el.observe('click', this.showContent.bind(this, el));
  },

  showContent: function(a) {
    var li = $(a.parentNode), ul = $(li.parentNode);
    ul.getElementsBySelector('li', 'ol').each(function(el){
      var contents = $(el.id+'_contents');
      if (el==li) {
        el.addClassName('active');
        contents.show();
      } else {
        el.removeClassName('active');
        contents.hide();
      }
    });
  }
}

Varien.DateElement = Class.create();
Varien.DateElement.prototype = {
    initialize: function(type, content, required, format) {
        if (type == 'id') {
            // id prefix
            this.day    = $(content + 'day');
            this.month  = $(content + 'month');
            this.year   = $(content + 'year');
            this.full   = $(content + 'full');
            this.advice = $(content + 'date-advice');
        } else if (type == 'container') {
            // content must be container with data
            this.day    = content.day;
            this.month  = content.month;
            this.year   = content.year;
            this.full   = content.full;
            this.advice = content.advice;
        } else {
            return;
        }

        this.required = required;
        this.format   = format;

        this.day.addClassName('validate-custom');
        this.day.validate = this.validate.bind(this);
        this.month.addClassName('validate-custom');
        this.month.validate = this.validate.bind(this);
        this.year.addClassName('validate-custom');
        this.year.validate = this.validate.bind(this);

        this.setDateRange(false, false);
        this.year.setAttribute('autocomplete','off');

        this.advice.hide();
    },
    validate: function() {
        var error = false,
            day = parseInt(this.day.value.replace(/^0*/, '')) || 0,
            month = parseInt(this.month.value.replace(/^0*/, '')) || 0,
            year = parseInt(this.year.value) || 0;
        if (!day && !month && !year) {
            if (this.required) {
                error = 'This date is a required value.';
            } else {
                this.full.value = '';
            }
        } else if (!day || !month || !year) {
            error = 'Please enter a valid full date.';
        } else {
            var date = new Date, countDaysInMonth = 0, errorType = null;
            date.setYear(year);date.setMonth(month-1);date.setDate(32);
            countDaysInMonth = 32 - date.getDate();
            if(!countDaysInMonth || countDaysInMonth>31) countDaysInMonth = 31;

            if (day<1 || day>countDaysInMonth) {
                errorType = 'day';
                error = 'Please enter a valid day (1-%d).';
            } else if (month<1 || month>12) {
                errorType = 'month';
                error = 'Please enter a valid month (1-12).';
            } else {
                if(day % 10 == day) this.day.value = '0'+day;
                if(month % 10 == month) this.month.value = '0'+month;
                this.full.value = this.format.replace(/%[mb]/i, this.month.value).replace(/%[de]/i, this.day.value).replace(/%y/i, this.year.value);
                var testFull = this.month.value + '/' + this.day.value + '/'+ this.year.value;
                var test = new Date(testFull);
                if (isNaN(test)) {
                    error = 'Please enter a valid date.';
                } else {
                    this.setFullDate(test);
                }
            }
            var valueError = false;
            if (!error && !this.validateData()){//(year<1900 || year>curyear) {
                errorType = this.validateDataErrorType;//'year';
                valueError = this.validateDataErrorText;//'Please enter a valid year (1900-%d).';
                error = valueError;
            }
        }

        if (error !== false) {
            try {
                error = Translator.translate(error);
            }
            catch (e) {}
            if (!valueError) {
                this.advice.innerHTML = error.replace('%d', countDaysInMonth);
            } else {
                this.advice.innerHTML = this.errorTextModifier(error);
            }
            this.advice.show();
            return false;
        }

        // fixing elements class
        this.day.removeClassName('validation-failed');
        this.month.removeClassName('validation-failed');
        this.year.removeClassName('validation-failed');

        this.advice.hide();
        return true;
    },
    validateData: function() {
        var year = this.fullDate.getFullYear();
        var date = new Date;
        this.curyear = date.getFullYear();
        return (year>=1900 && year<=this.curyear);
    },
    validateDataErrorType: 'year',
    validateDataErrorText: 'Please enter a valid year (1900-%d).',
    errorTextModifier: function(text) {
        return text.replace('%d', this.curyear);
    },
    setDateRange: function(minDate, maxDate) {
        this.minDate = minDate;
        this.maxDate = maxDate;
    },
    setFullDate: function(date) {
        this.fullDate = date;
    }
};

Varien.DOB = Class.create();
Varien.DOB.prototype = {
    initialize: function(selector, required, format) {
        var el = $$(selector)[0];
        var container       = {};
        container.day       = Element.select(el, '.dob-day input')[0];
        container.month     = Element.select(el, '.dob-month input')[0];
        container.year      = Element.select(el, '.dob-year input')[0];
        container.full      = Element.select(el, '.dob-full input')[0];
        container.advice    = Element.select(el, '.validation-advice')[0];

        new Varien.DateElement('container', container, required, format);
    }
};

Varien.dateRangeDate = Class.create();
Varien.dateRangeDate.prototype = Object.extend(new Varien.DateElement(), {
    validateData: function() {
        var validate = true;
        if (this.minDate || this.maxValue) {
            if (this.minDate) {
                this.minDate = new Date(this.minDate);
                this.minDate.setHours(0);
                if (isNaN(this.minDate)) {
                    this.minDate = new Date('1/1/1900');
                }
                validate = validate && (this.fullDate >= this.minDate)
            }
            if (this.maxDate) {
                this.maxDate = new Date(this.maxDate)
                this.minDate.setHours(0);
                if (isNaN(this.maxDate)) {
                    this.maxDate = new Date();
                }
                validate = validate && (this.fullDate <= this.maxDate)
            }
            if (this.maxDate && this.minDate) {
                this.validateDataErrorText = 'Please enter a valid date between %s and %s';
            } else if (this.maxDate) {
                this.validateDataErrorText = 'Please enter a valid date less than or equal to %s';
            } else if (this.minDate) {
                this.validateDataErrorText = 'Please enter a valid date equal to or greater than %s';
            } else {
                this.validateDataErrorText = '';
            }
        }
        return validate;
    },
    validateDataErrorText: 'Date should be between %s and %s',
    errorTextModifier: function(text) {
        if (this.minDate) {
            text = text.sub('%s', this.dateFormat(this.minDate));
        }
        if (this.maxDate) {
            text = text.sub('%s', this.dateFormat(this.maxDate));
        }
        return text;
    },
    dateFormat: function(date) {
        return (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();
    }
});

Varien.FileElement = Class.create();
Varien.FileElement.prototype = {
    initialize: function (id) {
        this.fileElement = $(id);
        this.hiddenElement = $(id + '_value');

        this.fileElement.observe('change', this.selectFile.bind(this));
    },
    selectFile: function(event) {
        this.hiddenElement.value = this.fileElement.getValue();
    }
};

Validation.addAllThese([
    ['validate-custom', ' ', function(v,elm) {
        return elm.validate();
    }]
]);

function truncateOptions() {
    $$('.truncated').each(function(element){
        Event.observe(element, 'mouseover', function(){
            if (element.down('div.truncated_full_value')) {
                element.down('div.truncated_full_value').addClassName('show')
            }
        });
        Event.observe(element, 'mouseout', function(){
            if (element.down('div.truncated_full_value')) {
                element.down('div.truncated_full_value').removeClassName('show')
            }
        });

    });
}
Event.observe(window, 'load', function(){
   truncateOptions();
});

Element.addMethods({
    getInnerText: function(element)
    {
        element = $(element);
        if(element.innerText && !Prototype.Browser.Opera) {
            return element.innerText
        }
        return element.innerHTML.stripScripts().unescapeHTML().replace(/[\n\r\s]+/g, ' ').strip();
    }
});

/*
if (!("console" in window) || !("firebug" in console))
{
    var names = ["log", "debug", "info", "warn", "error", "assert", "dir", "dirxml",
    "group", "groupEnd", "time", "timeEnd", "count", "trace", "profile", "profileEnd"];

    window.console = {};
    for (var i = 0; i < names.length; ++i)
        window.console[names[i]] = function() {}
}
*/

/**
 * Executes event handler on the element. Works with event handlers attached by Prototype,
 * in a browser-agnostic fashion.
 * @param element The element object
 * @param event Event name, like 'change'
 *
 * @example fireEvent($('my-input', 'click'));
 */
function fireEvent(element, event) {
    if (document.createEvent) {
        // dispatch for all browsers except IE before version 9
        var evt = document.createEvent("HTMLEvents");
        evt.initEvent(event, true, true ); // event type, bubbling, cancelable
        return element.dispatchEvent(evt);
    } else {
        // dispatch for IE before version 9
        var evt = document.createEventObject();
        return element.fireEvent('on' + event, evt)
    }
}

/**
 * Returns more accurate results of floating-point modulo division
 * E.g.:
 * 0.6 % 0.2 = 0.19999999999999996
 * modulo(0.6, 0.2) = 0
 *
 * @param dividend
 * @param divisor
 */
function modulo(dividend, divisor)
{
    var epsilon = divisor / 10000;
    var remainder = dividend % divisor;

    if (Math.abs(remainder - divisor) < epsilon || Math.abs(remainder) < epsilon) {
        remainder = 0;
    }

    return remainder;
}

/**
 * createContextualFragment is not supported in IE9. Adding its support.
 */
if ((typeof Range != "undefined") && !Range.prototype.createContextualFragment)
{
    Range.prototype.createContextualFragment = function(html)
    {
        var frag = document.createDocumentFragment(),
        div = document.createElement("div");
        frag.appendChild(div);
        div.outerHTML = html;
        return frag;
    };
}

/**
 * Magento Enterprise Edition
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the Magento Enterprise Edition License
 * that is bundled with this package in the file LICENSE_EE.txt.
 * It is also available through the world-wide-web at this URL:
 * http://www.magentocommerce.com/license/enterprise-edition
 * If you did not receive a copy of the license and are unable to
 * obtain it through the world-wide-web, please send an email
 * to license@magentocommerce.com so we can send you a copy immediately.
 *
 * DISCLAIMER
 *
 * Do not edit or add to this file if you wish to upgrade Magento to newer
 * versions in the future. If you wish to customize Magento for your
 * needs please refer to http://www.magentocommerce.com for more information.
 *
 * @category    Varien
 * @package     js
 * @copyright   Copyright (c) 2012 Magento Inc. (http://www.magentocommerce.com)
 * @license     http://www.magentocommerce.com/license/enterprise-edition
 */
VarienForm = Class.create();
VarienForm.prototype = {
    initialize: function(formId, firstFieldFocus){
        this.form       = $(formId);
        if (!this.form) {
            return;
        }
        this.cache      = $A();
        this.currLoader = false;
        this.currDataIndex = false;
        this.validator  = new Validation(this.form);
        this.elementFocus   = this.elementOnFocus.bindAsEventListener(this);
        this.elementBlur    = this.elementOnBlur.bindAsEventListener(this);
        this.childLoader    = this.onChangeChildLoad.bindAsEventListener(this);
        this.highlightClass = 'highlight';
        this.extraChildParams = '';
        this.firstFieldFocus= firstFieldFocus || false;
        this.bindElements();
        if(this.firstFieldFocus){
            try{
                Form.Element.focus(Form.findFirstElement(this.form))
            }
            catch(e){}
        }
    },

    submit : function(url){
        if(this.validator && this.validator.validate()){
             this.form.submit();
        }
        return false;
    },

    bindElements:function (){
        var elements = Form.getElements(this.form);
        for (var row in elements) {
            if (elements[row].id) {
                Event.observe(elements[row],'focus',this.elementFocus);
                Event.observe(elements[row],'blur',this.elementBlur);
            }
        }
    },

    elementOnFocus: function(event){
        var element = Event.findElement(event, 'fieldset');
        if(element){
            Element.addClassName(element, this.highlightClass);
        }
    },

    elementOnBlur: function(event){
        var element = Event.findElement(event, 'fieldset');
        if(element){
            Element.removeClassName(element, this.highlightClass);
        }
    },

    setElementsRelation: function(parent, child, dataUrl, first){
        if (parent=$(parent)) {
            // TODO: array of relation and caching
            if (!this.cache[parent.id]){
                this.cache[parent.id] = $A();
                this.cache[parent.id]['child']     = child;
                this.cache[parent.id]['dataUrl']   = dataUrl;
                this.cache[parent.id]['data']      = $A();
                this.cache[parent.id]['first']      = first || false;
            }
            Event.observe(parent,'change',this.childLoader);
        }
    },

    onChangeChildLoad: function(event){
        element = Event.element(event);
        this.elementChildLoad(element);
    },

    elementChildLoad: function(element, callback){
        this.callback = callback || false;
        if (element.value) {
            this.currLoader = element.id;
            this.currDataIndex = element.value;
            if (this.cache[element.id]['data'][element.value]) {
                this.setDataToChild(this.cache[element.id]['data'][element.value]);
            }
            else{
                new Ajax.Request(this.cache[this.currLoader]['dataUrl'],{
                        method: 'post',
                        parameters: {"parent":element.value},
                        onComplete: this.reloadChildren.bind(this)
                });
            }
        }
    },

    reloadChildren: function(transport){
        var data = eval('(' + transport.responseText + ')');
        this.cache[this.currLoader]['data'][this.currDataIndex] = data;
        this.setDataToChild(data);
    },

    setDataToChild: function(data){
        if (data.length) {
            var child = $(this.cache[this.currLoader]['child']);
            if (child){
                var html = '<select name="'+child.name+'" id="'+child.id+'" class="'+child.className+'" title="'+child.title+'" '+this.extraChildParams+'>';
                if(this.cache[this.currLoader]['first']){
                    html+= '<option value="">'+this.cache[this.currLoader]['first']+'</option>';
                }
                for (var i in data){
                    if(data[i].value) {
                        html+= '<option value="'+data[i].value+'"';
                        if(child.value && (child.value == data[i].value || child.value == data[i].label)){
                            html+= ' selected';
                        }
                        html+='>'+data[i].label+'</option>';
                    }
                }
                html+= '</select>';
                Element.insert(child, {before: html});
                Element.remove(child);
            }
        }
        else{
            var child = $(this.cache[this.currLoader]['child']);
            if (child){
                var html = '<input type="text" name="'+child.name+'" id="'+child.id+'" class="'+child.className+'" title="'+child.title+'" '+this.extraChildParams+'>';
                Element.insert(child, {before: html});
                Element.remove(child);
            }
        }

        this.bindElements();
        if (this.callback) {
            this.callback();
        }
    }
}

RegionUpdater = Class.create();
RegionUpdater.prototype = {
    initialize: function (countryEl, regionTextEl, regionSelectEl, regions, disableAction, zipEl)
    {
        this.countryEl = $(countryEl);
        this.regionTextEl = $(regionTextEl);
        this.regionSelectEl = $(regionSelectEl);
        this.zipEl = $(zipEl);
        this.config = regions['config'];
        delete regions.config;
        this.regions = regions;

        this.disableAction = (typeof disableAction=='undefined') ? 'hide' : disableAction;
        this.zipOptions = (typeof zipOptions=='undefined') ? false : zipOptions;

        if (this.regionSelectEl.options.length<=1) {
            this.update();
        }

        Event.observe(this.countryEl, 'change', this.update.bind(this));
    },

    _checkRegionRequired: function()
    {
        var label, wildCard;
        var elements = [this.regionTextEl, this.regionSelectEl];
        var that = this;
        if (typeof this.config == 'undefined') {
            return;
        }
        var regionRequired = this.config.regions_required.indexOf(this.countryEl.value) >= 0;

        elements.each(function(currentElement) {
            Validation.reset(currentElement);
            label = $$('label[for="' + currentElement.id + '"]')[0];
            if (label) {
                wildCard = label.down('em') || label.down('span.required');
                if (!that.config.show_all_regions) {
                    if (regionRequired) {
                        label.up().show();
                    } else {
                        label.up().hide();
                    }
                }
            }

            if (label && wildCard) {
                if (!regionRequired) {
                    wildCard.hide();
                    if (label.hasClassName('required')) {
                        label.removeClassName('required');
                    }
                } else if (regionRequired) {
                    wildCard.show();
                    if (!label.hasClassName('required')) {
                        label.addClassName('required')
                    }
                }
            }

            if (!regionRequired) {
                if (currentElement.hasClassName('required-entry')) {
                    currentElement.removeClassName('required-entry');
                }
                if ('select' == currentElement.tagName.toLowerCase() &&
                    currentElement.hasClassName('validate-select')) {
                    currentElement.removeClassName('validate-select');
                }
            } else {
                if (!currentElement.hasClassName('required-entry')) {
                    currentElement.addClassName('required-entry');
                }
                if ('select' == currentElement.tagName.toLowerCase() &&
                    !currentElement.hasClassName('validate-select')) {
                    currentElement.addClassName('validate-select');
                }
            }
        });
    },

    update: function()
    {
        if (this.regions[this.countryEl.value]) {
            var i, option, region, def;

            def = this.regionSelectEl.getAttribute('defaultValue');
            if (this.regionTextEl) {
                if (!def) {
                    def = this.regionTextEl.value.toLowerCase();
                }
                this.regionTextEl.value = '';
            }

            this.regionSelectEl.options.length = 1;
            for (regionId in this.regions[this.countryEl.value]) {
                region = this.regions[this.countryEl.value][regionId];

                option = document.createElement('OPTION');
                option.value = regionId;
                option.text = region.name.stripTags();
                option.title = region.name;

                if (this.regionSelectEl.options.add) {
                    this.regionSelectEl.options.add(option);
                } else {
                    this.regionSelectEl.appendChild(option);
                }

                if (regionId==def || (region.name && region.name.toLowerCase()==def) ||
                    (region.name && region.code.toLowerCase()==def)
                ) {
                    this.regionSelectEl.value = regionId;
                }
            }

            if (this.disableAction=='hide') {
                if (this.regionTextEl) {
                    this.regionTextEl.style.display = 'none';
                }

                this.regionSelectEl.style.display = '';
            } else if (this.disableAction=='disable') {
                if (this.regionTextEl) {
                    this.regionTextEl.disabled = true;
                }
                this.regionSelectEl.disabled = false;
            }
            this.setMarkDisplay(this.regionSelectEl, true);
        } else {
            if (this.disableAction=='hide') {
                if (this.regionTextEl) {
                    this.regionTextEl.style.display = '';
                }
                this.regionSelectEl.style.display = 'none';
                Validation.reset(this.regionSelectEl);
            } else if (this.disableAction=='disable') {
                if (this.regionTextEl) {
                    this.regionTextEl.disabled = false;
                }
                this.regionSelectEl.disabled = true;
            } else if (this.disableAction=='nullify') {
                this.regionSelectEl.options.length = 1;
                this.regionSelectEl.value = '';
                this.regionSelectEl.selectedIndex = 0;
                this.lastCountryId = '';
            }
            this.setMarkDisplay(this.regionSelectEl, false);
        }

        this._checkRegionRequired();
        // Make Zip and its label required/optional
        var zipUpdater = new ZipUpdater(this.countryEl.value, this.zipEl);
        zipUpdater.update();
    },

    setMarkDisplay: function(elem, display){
        elem = $(elem);
        var labelElement = elem.up(0).down('label > span.required') ||
                           elem.up(1).down('label > span.required') ||
                           elem.up(0).down('label.required > em') ||
                           elem.up(1).down('label.required > em');
        if(labelElement) {
            inputElement = labelElement.up().next('input');
            if (display) {
                labelElement.show();
                if (inputElement) {
                    inputElement.addClassName('required-entry');
                }
            } else {
                labelElement.hide();
                if (inputElement) {
                    inputElement.removeClassName('required-entry');
                }
            }
        }
    }
}

ZipUpdater = Class.create();
ZipUpdater.prototype = {
    initialize: function(country, zipElement)
    {
        this.country = country;
        this.zipElement = $(zipElement);
    },

    update: function()
    {
        // Country ISO 2-letter codes must be pre-defined
        if (typeof optionalZipCountries == 'undefined') {
            return false;
        }

        // Ajax-request and normal content load compatibility
        if (this.zipElement != undefined) {
            this._setPostcodeOptional();
        } else {
            Event.observe(window, "load", this._setPostcodeOptional.bind(this));
        }
    },

    _setPostcodeOptional: function()
    {
        this.zipElement = $(this.zipElement);
        if (this.zipElement == undefined) {
            return false;
        }

        // find label
        var label = $$('label[for="' + this.zipElement.id + '"]')[0];
        if (label != undefined) {
            var wildCard = label.down('em') || label.down('span.required');
        }

        // Make Zip and its label required/optional
        if (optionalZipCountries.indexOf(this.country) != -1) {
            while (this.zipElement.hasClassName('required-entry')) {
                this.zipElement.removeClassName('required-entry');
            }
            if (wildCard != undefined) {
                wildCard.hide();
            }
        } else {
            this.zipElement.addClassName('required-entry');
            if (wildCard != undefined) {
                wildCard.show();
            }
        }
    }
}

/**
 * Magento Enterprise Edition
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the Magento Enterprise Edition License
 * that is bundled with this package in the file LICENSE_EE.txt.
 * It is also available through the world-wide-web at this URL:
 * http://www.magentocommerce.com/license/enterprise-edition
 * If you did not receive a copy of the license and are unable to
 * obtain it through the world-wide-web, please send an email
 * to license@magentocommerce.com so we can send you a copy immediately.
 *
 * DISCLAIMER
 *
 * Do not edit or add to this file if you wish to upgrade Magento to newer
 * versions in the future. If you wish to customize Magento for your
 * needs please refer to http://www.magentocommerce.com for more information.
 *
 * @category    Mage
 * @package     js
 * @copyright   Copyright (c) 2012 Magento Inc. (http://www.magentocommerce.com)
 * @license     http://www.magentocommerce.com/license/enterprise-edition
 */

var Translate = Class.create();
Translate.prototype = {
    initialize: function(data){
        this.data = $H(data);
    },

    translate : function(){
        var args = arguments;
        var text = arguments[0];

        if(this.data.get(text)){
            return this.data.get(text);
        }
        return text;
    },
    add : function() {
        if (arguments.length > 1) {
            this.data.set(arguments[0], arguments[1]);
        } else if (typeof arguments[0] =='object') {
            $H(arguments[0]).each(function (pair){
                this.data.set(pair.key, pair.value);
            }.bind(this));
        }
    }
}

/**
 * Magento Enterprise Edition
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the Magento Enterprise Edition License
 * that is bundled with this package in the file LICENSE_EE.txt.
 * It is also available through the world-wide-web at this URL:
 * http://www.magentocommerce.com/license/enterprise-edition
 * If you did not receive a copy of the license and are unable to
 * obtain it through the world-wide-web, please send an email
 * to license@magentocommerce.com so we can send you a copy immediately.
 *
 * DISCLAIMER
 *
 * Do not edit or add to this file if you wish to upgrade Magento to newer
 * versions in the future. If you wish to customize Magento for your
 * needs please refer to http://www.magentocommerce.com for more information.
 *
 * @category    Mage
 * @package     js
 * @copyright   Copyright (c) 2012 Magento Inc. (http://www.magentocommerce.com)
 * @license     http://www.magentocommerce.com/license/enterprise-edition
 */
// old school cookie functions grabbed off the web

if (!window.Mage) var Mage = {};

Mage.Cookies = {};
Mage.Cookies.expires  = null;
Mage.Cookies.path     = '/';
Mage.Cookies.domain   = null;
Mage.Cookies.secure   = false;
Mage.Cookies.set = function(name, value){
     var argv = arguments;
     var argc = arguments.length;
     var expires = (argc > 2) ? argv[2] : Mage.Cookies.expires;
     var path = (argc > 3) ? argv[3] : Mage.Cookies.path;
     var domain = (argc > 4) ? argv[4] : Mage.Cookies.domain;
     var secure = (argc > 5) ? argv[5] : Mage.Cookies.secure;
     document.cookie = name + "=" + escape (value) +
       ((expires == null) ? "" : ("; expires=" + expires.toGMTString())) +
       ((path == null) ? "" : ("; path=" + path)) +
       ((domain == null) ? "" : ("; domain=" + domain)) +
       ((secure == true) ? "; secure" : "");
};

Mage.Cookies.get = function(name){
    var arg = name + "=";
    var alen = arg.length;
    var clen = document.cookie.length;
    var i = 0;
    var j = 0;
    while(i < clen){
        j = i + alen;
        if (document.cookie.substring(i, j) == arg)
            return Mage.Cookies.getCookieVal(j);
        i = document.cookie.indexOf(" ", i) + 1;
        if(i == 0)
            break;
    }
    return null;
};

Mage.Cookies.clear = function(name) {
  if(Mage.Cookies.get(name)){
    document.cookie = name + "=" +
    "; expires=Thu, 01-Jan-70 00:00:01 GMT";
  }
};

Mage.Cookies.getCookieVal = function(offset){
   var endstr = document.cookie.indexOf(";", offset);
   if(endstr == -1){
       endstr = document.cookie.length;
   }
   return unescape(document.cookie.substring(offset, endstr));
};

    function getCampaign() 
{
        var urlparams = location.search.substr(1).split('&');
        var params = new Array();
        var mc_cid = null;
        var isMailchimp = false;
        for (var i = 0; i < urlparams.length; i++) {
            var param = urlparams[i].split('=');
            var key = param[0];
            var val = param[1];
            if (key && val) {
                params[key] = val;
            }

            if(key=='utm_source') {
                var reg = /^mailchimp$/;
                if(reg.exec(val)) {
                    isMailchimp = true;
                }
            }
            else {
                if (key=='mc_cid') {
                    mc_cid = val;
                }
            }
        }

        if (mc_cid&&!isMailchimp) {
            Mage.Cookies.set('mailchimp_campaign_id' , mc_cid);
            Mage.Cookies.set('mailchimp_landing_page', location);
        }

        if(isMailchimp) {
            Mage.Cookies.clear('mailchimp_campaign_id');
            Mage.Cookies.set('mailchimp_landing_page', location);
        }
    }
    if (document.loaded) {
        getCampaign;
    } else {
        document.observe('dom:loaded', getCampaign);
    }
/**
 * Magento Enterprise Edition
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the Magento Enterprise Edition License
 * that is bundled with this package in the file LICENSE_EE.txt.
 * It is also available through the world-wide-web at this URL:
 * http://www.magentocommerce.com/license/enterprise-edition
 * If you did not receive a copy of the license and are unable to
 * obtain it through the world-wide-web, please send an email
 * to license@magentocommerce.com so we can send you a copy immediately.
 *
 * DISCLAIMER
 *
 * Do not edit or add to this file if you wish to upgrade Magento to newer
 * versions in the future. If you wish to customize Magento for your
 * needs please refer to http://www.magentocommerce.com for more information.
 *
 * @category    design
 * @package     enterprise_default
 * @copyright   Copyright (c) 2012 Magento Inc. (http://www.magentocommerce.com)
 * @license     http://www.magentocommerce.com/license/enterprise-edition
 */

// Add validation hints
Validation.defaultOptions.immediate = true;
Validation.defaultOptions.addClassNameToContainer = true;

Event.observe(document, 'dom:loaded', function() {
    var inputs = $$('ul.options-list input');
    for (var i = 0, l = inputs.length; i < l; i ++) {
        inputs[i].addClassName('change-container-classname');
    }
})

if (!window.Enterprise) {
    window.Enterprise = {};
}
Enterprise.templatesPattern =  /(^|.|\r|\n)(\{\{(.*?)\}\})/;

Enterprise.TopCart = {
    initialize: function(container) {
        this.container = $(container);
        this.element = this.container.up(0);
        this.elementHeader = this.container.previous(0);
        this.intervalDuration = 4000;
        this.interval = null;
        this.onElementMouseOut = this.handleMouseOut.bindAsEventListener(this);
        this.onElementMouseOver = this.handleMouseOver.bindAsEventListener(this);
        this.onElementMouseClick = this.handleMouseClick.bindAsEventListener(this);

        this.element.observe('mouseout', this.onElementMouseOut);
        this.element.observe('mouseover', this.onElementMouseOver);
        this.elementHeader.observe('click', this.onElementMouseClick);
    },

    handleMouseOut: function (evt) {
        if ($(this.elementHeader).hasClassName('expanded')) {
            this.interval = setTimeout(this.hideCart.bind(this), this.intervalDuration);
        }
    },

    handleMouseOver: function (evt) {
        if (this.interval !== null) {
             clearTimeout(this.interval);
             this.interval = null;
        }
    },

    handleMouseClick: function (evt) {
        if (!$(this.elementHeader).hasClassName('expanded') && !$(this.container.id).hasClassName('process'))  {
            this.showCart();
        }
        else {
            this.hideCart();
        }
    },

    showCart: function (timePeriod) {
        this.container.parentNode.style.zIndex=992;
        new Effect.SlideDown(this.container.id, { duration: 0.5,
            beforeStart: function(effect) {$( effect.element.id ).addClassName('process');},
            afterFinish: function(effect) {$( effect.element.id ).removeClassName('process'); }
            });
        $(this.elementHeader).addClassName('expanded');
        if(timePeriod) {
            this.timePeriod = timePeriod*1000;
            this.interval = setTimeout(this.hideCart.bind(this), this.timePeriod);
        }
    },

    hideCart: function () {

        if (!$(this.container.id).hasClassName('process') && $(this.elementHeader).hasClassName('expanded')) {
            new Effect.SlideUp(this.container.id, { duration: 0.5,
                beforeStart: function(effect) {$( effect.element.id ).addClassName('process');},
                afterFinish: function(effect) {
                    $( effect.element.id ).removeClassName('process');
                    effect.element.parentNode.style.zIndex=1;
                    }
                });
        }
        if (this.interval !== null) {
            clearTimeout(this.interval);
            this.interval = null;
        }
        $(this.elementHeader).removeClassName('expanded');
    }
};


Enterprise.Bundle = {
     oldReloadPrice: false,
     initialize: function () {
        this.slider = $('bundleProduct');
        this.xOffset = $('bundle-product-wrapper').getDimensions().width;
     },
     swapReloadPrice: function () {
         Enterprise.Bundle.oldReloadPrice = Product.Bundle.prototype.reloadPrice;
         Product.Bundle.prototype.reloadPrice = Enterprise.Bundle.reloadPrice;
         Product.Bundle.prototype.selection = Enterprise.Bundle.selection;
     },
     reloadPrice: function () {
         var result = Enterprise.Bundle.oldReloadPrice.bind(this)();
         var priceContainer, duplicateContainer = null
         if (priceContainer = $('bundle-product-wrapper').down('.price-box .price-as-configured')) {
            if (duplicateContainer = $('bundle-product-wrapper').down('.duplicate-price-box .price-as-configured')) {
                duplicateContainer.down('.price').update(
                    priceContainer.down('.price').innerHTML
                );
            }
         }
         if (!this.summaryTemplate && $('bundle-summary-template')) {
             this.summaryTemplate = new Template($('bundle-summary-template').innerHTML, Enterprise.templatesPattern);
             this.optionTemplate = new Template($('bundle-summary-option-template').innerHTML, Enterprise.templatesPattern);
             this.optionMultiTemplate = new Template($('bundle-summary-option-multi-template').innerHTML, Enterprise.templatesPattern);
         }

         if (this.summaryTemplate && $('bundle-summary')) {
             var summaryHTML = '';
             for (var option in this.config.options) {
                if (typeof (this.config.selected[option]) !== 'undefined') {
                    var optionHTML = '';
                    for (var i = 0, l = this.config.selected[option].length; i < l; i ++) {
                        var selection = this.selection(option, this.config.selected[option][i]);
                        if (selection && this.config.options[option].isMulti) {
                            optionHTML += this.optionMultiTemplate.evaluate(selection);
                        } else if (selection) {
                            optionHTML += this.optionTemplate.evaluate(selection);
                        }
                    }

                    if (optionHTML.length > 0) {
                        summaryHTML += this.summaryTemplate.evaluate({label:this.config.options[option].title.escapeHTML(), options: optionHTML});
                    }
                }
             }

             if (typeof($('bundle-summary').update(summaryHTML).childElements().last()) != 'undefined') {
                 $('bundle-summary').update(summaryHTML).childElements().last().addClassName('last');
             }
         }
         return result;
     },
     selection: function(optionId, selectionId) {
        if (selectionId == '' || selectionId == 'none') {
            return false;
        }
        var qty = null;
        if (this.config.options[optionId].selections[selectionId].customQty == 1 && !this.config['options'][optionId].isMulti) {
            if ($('bundle-option-' + optionId + '-qty-input')) {
                qty = $('bundle-option-' + optionId + '-qty-input').value;
            } else {
                qty = 1;
            }
        } else {
            qty = this.config.options[optionId].selections[selectionId].qty;
        }

        return {qty: qty, name: this.config.options[optionId].selections[selectionId].name.escapeHTML()};
     },
     start: function () {
        if (!$('bundle-product-wrapper').hasClassName('moving-now')) {
            new Effect.Move(this.slider, {
                x: -this.xOffset, y: 0, mode: 'relative', duration: 1.5,
                beforeStart: function (effect) {
                    $('bundle-product-wrapper').setStyle({height: $('productView').getHeight() + 'px'});
                    $('options-container').show();
                    Enterprise.BundleSummary.initialize();
                    $('bundle-product-wrapper').addClassName('moving-now');
                },
                afterFinish: function (effect) {
                    $('bundle-product-wrapper').setStyle({height: 'auto'});
                    $('productView').hide();
                    $('bundle-product-wrapper').removeClassName('moving-now');
                }
            });
         }
     },
     end: function () {
        if (!$('bundle-product-wrapper').hasClassName('moving-now')) {
            new Effect.Move(this.slider, {
                    x: this.xOffset, y: 0, mode: 'relative', duration: 1.5,
                    beforeStart: function (effect) {
                        $('bundle-product-wrapper').setStyle({height: $('options-container').getHeight() + 'px'});
                        $('productView').show();
                        $('bundle-product-wrapper').addClassName('moving-now');
                    },
                    afterFinish: function (effect) {
                        $('bundle-product-wrapper').setStyle({height: 'auto'});
                        $('options-container').hide();
                        Enterprise.BundleSummary.exitSummary();
                        $('bundle-product-wrapper').removeClassName('moving-now');
                    }
                });
        }
     }
};

Enterprise.BundleSummary = {
    initialize: function () {
        this.summary = $('bundleSummary');
        this.summaryOffsetTop = $('customizeTitle').getDimensions().height;
        this.summary.setStyle({top:this.summaryOffsetTop + "px"});
        this.summaryContainer = this.summary.up(0);
        this.doNotCheck = false;
        this.summaryStartY = this.summary.positionedOffset().top;
        this.summaryStartY = this.summaryOffsetTop;
        this.summaryStartX = this.summary.positionedOffset().left;
        this.onDocScroll = this.handleDocScroll.bindAsEventListener(this);
        this.GetScroll = setInterval(this.onDocScroll, 50);
        this.onEffectEnds = this.effectEnds.bind(this);
    },

    handleDocScroll: function () {
        if (this.currentOffsetTop == document.viewport.getScrollOffsets().top
            && (this.checkOffset(null) == null)) {
            return;
        } else {
            if (this.currentOffsetTop == document.viewport.getScrollOffsets().top) {
                this.doNotCheck = true;
            }
            this.currentOffsetTop = document.viewport.getScrollOffsets().top;
        }

        if (this.currentEffect) {
            this.currentEffect.cancel();
            var topOffset = 0;
            if (this.summaryContainer.viewportOffset().top < -60) {
               topOffset =  -(this.summaryContainer.viewportOffset().top);
            } else {
               topOffset = this.summaryStartY;
            }

            topOffset = this.checkOffset(topOffset);
            if (topOffset === null) {
                this.currentEffect = false;
                return;
            }

            this.currentEffect.start({
                x: this.summaryStartX,
                y: topOffset,
                mode: 'absolute',
                duration: 0.3,
                afterFinish: this.onEffectEnds
            });



            return;
        }


        this.currentEffect = new Effect.Move(this.summary);
    },

    effectEnds: function () {
        if (this.doNotCheck == true) {
            this.doNotCheck = false;
        }
    },

    checkOffset: function (offset) {
        if (this.doNotCheck && offset === null) {
            return null;
        }
        var dimensions = this.summary.getDimensions();
        var parentDimensions = this.summary.up().getDimensions();
        if ((offset !== null ? offset : this.summary.offsetTop) + dimensions.height >= parentDimensions.height) {
            offset = parentDimensions.height - dimensions.height;
        } else if (offset === null &&
            this.currentOffsetTop > (this.summaryContainer.viewportOffset().top) &&
            (this.currentOffsetTop - this.summaryContainer.viewportOffset().top) > this.summary.offsetTop) {
            offset = this.currentOffsetTop - this.summaryContainer.viewportOffset().top;
        }

        return offset;
    },

    exitSummary: function () {
        clearInterval(this.GetScroll);
    }
};

Enterprise.Tabs = Class.create();
Object.extend(Enterprise.Tabs.prototype, {
    initialize: function (container) {
        this.container = $(container);
        this.container.addClassName('tab-list');
        this.tabs = this.container.select('dt.tab');
        this.activeTab = this.tabs.first();
        this.tabs.first().addClassName('first');
        this.tabs.last().addClassName('last');
        this.onTabClick = this.handleTabClick.bindAsEventListener(this);
        for (var i = 0, l = this.tabs.length; i < l; i ++) {
            this.tabs[i].observe('click', this.onTabClick);
        }
        this.select();
    },
    handleTabClick: function (evt) {
        this.activeTab = Event.findElement(evt, 'dt');
        this.select();
    },
    select: function () {
        for (var i = 0, l = this.tabs.length; i < l; i ++) {
            if (this.tabs[i] == this.activeTab) {
                this.tabs[i].addClassName('active');
                this.tabs[i].style.zIndex = this.tabs.length + 2;
                /*this.tabs[i].next('dd').show();*/
                new Effect.Appear (this.tabs[i].next('dd'), { duration:0.5 });
                this.tabs[i].parentNode.style.height=this.tabs[i].next('dd').getHeight() + 15 + 'px';
            } else {
                this.tabs[i].removeClassName('active');
                this.tabs[i].style.zIndex = this.tabs.length + 1 - i;
                this.tabs[i].next('dd').hide();
            }
        }
    }
});

Enterprise.Slider = Class.create();

Object.extend(Enterprise.Slider.prototype, {
    initialize: function (container, config) {
        this.container = $(container);
        this.config = {
            panelCss: 'slider-panel',
            sliderCss: 'slider',
            itemCss: 'slider-item',
            slideButtonCss: 'slide-button',
            slideButtonInactiveCss: 'inactive',
            forwardButtonCss: 'forward',
            backwardButtonCss: 'backward',
            pageSize: 6,
            scrollSize: 2,
            slideDuration: 1.0,
            slideDirection: 'horizontal',
            fadeEffect: true
        };

        Object.extend(this.config, config || {});

        this.items = this.container.select('.' + this.config.itemCss);
        this.isPlaying = false;
        this.isAbsolutized = false;
        this.offset = 0;
        this.onClick = this.handleClick.bindAsEventListener(this);
        this.sliderPanel = this.container.down('.' + this.config.panelCss);
        this.slider =  this.sliderPanel.down('.' + this.config.sliderCss);
        this.container.select('.' + this.config.slideButtonCss).each(
            this.initializeHandlers.bind(this)
        );
        this.updateButtons();

        Event.observe(window, 'load', this.initializeDimensions.bind(this));
    },
    initializeHandlers: function (element) {
        if (element.hasClassName(this.config.forwardButtonCss) ||
            element.hasClassName(this.config.backwardButtonCss)) {
            element.observe('click', this.onClick);
        }
    },
    handleClick: function (evt) {
        var element = Event.element(evt);
        if (!element.hasClassName(this.config.slideButtonCss)) {
            element = element.up('.' + this.config.slideButtonCss);
        }

        if (!element.hasClassName(this.config.slideButtonInactiveCss)) {
           element.hasClassName(this.config.forwardButtonCss) || this.backward();
           element.hasClassName(this.config.backwardButtonCss) || this.forward();
        }
        Event.stop(evt);
    },
    updateButtons: function () {
        var buttons = this.container.select('.' + this.config.slideButtonCss);
        for (var i = 0, l = buttons.length; i < l; i++) {
            if (buttons[i].hasClassName(this.config.backwardButtonCss)) {
                if (this.offset <= 0) {
                    buttons[i].addClassName(this.config.slideButtonInactiveCss);
                }
                else {
                    buttons[i].removeClassName(this.config.slideButtonInactiveCss);
                }
            } else if (buttons[i].hasClassName(this.config.forwardButtonCss)) {
                if (this.offset >= this.items.length - this.config.pageSize) {
                    buttons[i].addClassName(this.config.slideButtonInactiveCss);
                }
                else {
                    buttons[i].removeClassName(this.config.slideButtonInactiveCss);
                }
            }
        }
    },
    initializeDimensions: function () {
        if ((this.config.slideDirection == 'horizontal' && this.sliderPanel.style.width) ||
            (this.config.slideDirection != 'horizontal' && this.sliderPanel.style.height)) {
            return this;
        }
        var firstItem = this.items.first();
        var offset = 0;
        if (this.config.slideDirection == 'horizontal') {
            offset = (parseInt(firstItem.getStyle('margin-left')) + parseInt(firstItem.getStyle('margin-right'))) * (this.config.pageSize - 1);
            this.sliderPanel.setStyle({width: (firstItem.getDimensions().width * this.config.pageSize + offset) + 'px'});
        } else {
            offset = (parseInt(firstItem.getStyle('margin-bottom')) + parseInt(firstItem.getStyle('margin-top'))) * (this.config.pageSize - 1);
            this.sliderPanel.setStyle({height: (firstItem.getDimensions().height * this.config.pageSize + offset) + 'px'});
        }

        var dimensions = this.sliderPanel.getDimensions();

        var sliderParent = this.sliderPanel.up();
        /*
        dimensions.height += parseInt(sliderParent.getStyle('padding-top'));
        dimensions.height += parseInt(sliderParent.getStyle('padding-bottom'));
        dimensions.width += parseInt(sliderParent.getStyle('padding-left'));
        dimensions.width += parseInt(sliderParent.getStyle('padding-right'));

        if (sliderParent.down('.slide-button')) {
            var buttonDimensions = sliderParent.down('.slide-button').getDimensions();
            if (this.config.slideDirection == 'horizontal') {
                dimensions.width += 2 * buttonDimensions.width;
            } else {
                dimensions.height += 2 * buttonDimensions.height;
            }
        }
        */
        sliderParent.setStyle({
            width: dimensions.width + 'px',
            height: dimensions.height + 'px'
        });
        return this;
    },
    absolutize: function () {
        if (!this.isAbsolutized) {
            this.isAbsolutized = true;
            var dimensions = this.sliderPanel.getDimensions();
            this.sliderPanel.setStyle({
                height: dimensions.height + 'px',
                width: dimensions.width + 'px'
            });

            this.slider.absolutize();
        }
    },

    forward: function () {
        if (this.offset + this.config.pageSize <= this.items.length - 1) {
            this.slide(true);
        }
    },
    backward: function () {
        if (this.offset > 0) {
            this.slide(false);
        }
    },
    slide: function (isForward) {

        if (this.isPlaying) {
            return;
        }
        this.absolutize();
        this.effectConfig = {
            duration: this.config.slideDuration
        };
        if (this.config.slideDirection == 'horizontal') {
            this.effectConfig.x = this.getSlidePosition(isForward).left;
        } else {
            this.effectConfig.y = this.getSlidePosition(isForward).top;
        }
        this.start();

    },
    start: function ()
    {
        if (this.config.fadeEffect) {
            this.fadeIn();
        } else {
            this.move();
        }
    },
    fadeIn: function ()
    {
        new Effect.Fade(this.slider.up('div.slider-panel'), {
            from: 1.0,
            to:0.5,
            afterFinish: this.move.bind(this),
            beforeStart: this.effectStarts.bind(this),
            duration: 0.3
        });
    },
    fadeOut: function ()
    {
        new Effect.Fade(this.slider.up('div.slider-panel'), {
                from: 0.5,
                to:1.0,
                afterFinish: this.effectEnds.bind(this),
                duration: 0.3
        });
    },
    move: function ()
    {
        if (this.config.fadeEffect) {
            this.effectConfig.afterFinish = this.fadeOut.bind(this);
        } else {
            this.effectConfig.afterFinish = this.effectEnds.bind(this);
            this.effectConfig.beforeStart = this.effectStarts.bind(this);
        }

        new Effect.Move(this.slider, this.effectConfig);
    },
    effectStarts: function () {
        this.isPlaying = true;
    },
    effectEnds: function () {
        this.isPlaying = false;
        this.updateButtons();
    },
    getSlidePosition: function (isForward) {
        var targetOffset;
        if (isForward) {
            targetOffset = Math.min(this.items.length - this.config.pageSize, this.offset + this.config.scrollSize)
        }
        else {
            targetOffset = Math.max(this.offset - this.config.scrollSize, 0);
        }
        this.offset = targetOffset;
        var item = this.items[targetOffset];
        var itemOffset = {left:0, top:0};

        itemOffset.left = -(item.cumulativeOffset().left
                       -  this.slider.cumulativeOffset().left + this.slider.offsetLeft);
        itemOffset.top = -(item.cumulativeOffset().top
                       -  this.slider.cumulativeOffset().top + this.slider.offsetTop);
        return itemOffset;
    }
});

Enterprise.PopUpMenu = {
    currentPopUp: null,
    documentHandlerInitialized: false,
    popUpZIndex: 994,
    hideDelay: 2000,
    hideOnClick: true,
    hideInterval: null,
    initializeDocumentHandler: function () {
        if (!this.documentHandlerInitialized) {
            this.documentHandlerInitialized = true;
            Event.observe(
                document.body,
                'click',
                this.handleDocumentClick.bindAsEventListener(this)
            );
        }
    },
    handleDocumentClick: function (evt) {
        if (this.currentPopUp !== null) {
            var element = Event.element(evt);
            if (!this.currentPopUp.onlyShowed && this.hideOnClick) {
                this.hide();
            } else {
                this.currentPopUp.onlyShowed = false;
            }
        }
    },
    handlePopUpOver: function (evt) {
        if (this.currentPopUp !== null) {
            this.currentPopUp.removeClassName('faded');
            this.resetTimeout(0);
        }
    },
    handlePopUpOut: function (evt) {
        if (this.currentPopUp !== null) {
            this.currentPopUp.addClassName('faded');
            this.resetTimeout(1);
        }
    },
    show: function (trigger) {
        this.initializeDocumentHandler();

        var container = $(trigger).up('.switch-wrapper');
        if (!$('popId-' + container.id)) {
            return;
        }

        if (this.currentPopUp !== null && $('popId-' + container.id) !== this.currentPopUp) {
            this.hide(true);
        } else if (this.currentPopUp !== null && this.currentPopUp === $('popId-' + container.id)) {
            this.hide();
            return;
        }

        this.currentPopUp = $('popId-' + container.id);
        this.currentPopUp.container = container;
        this.currentPopUp.container.oldZIndex = this.currentPopUp.container.style.zIndex;
        this.currentPopUp.container.style.zIndex = this.popUpZIndex;
        new Effect.Appear(this.currentPopUp, { duration:0.3 });


        if (!this.currentPopUp.isHandled) {
            this.currentPopUp.observe('mouseover', this.handlePopUpOver.bindAsEventListener(this));
            this.currentPopUp.observe('mouseout', this.handlePopUpOut.bindAsEventListener(this));
            this.currentPopUp.isHandled = true;
        }
        this.currentPopUp.onlyShowed = true;
        this.currentPopUp.container.down('.switcher').addClassName('list-opened');
        this.resetTimeout(2);
    },
    hide: function () {
        if (this.currentPopUp !== null) {
            if (arguments.length == 0) {
                new Effect.Fade(this.currentPopUp, {duration: 0.3});
            } else {
                this.currentPopUp.hide();
            }
            this.currentPopUp.container.style.zIndex = this.currentPopUp.container.oldZIndex;
            this.resetTimeout(0);
            this.currentPopUp.container.down('.switcher').removeClassName('list-opened');
            this.currentPopUp = null;
        }
    },
    resetTimeout: function (delay) {
        if (this.hideTimeout !== null) {
            clearTimeout(this.hideTimeout);
            this.hideTimeout = null;
        }
        if (delay) {
            this.hideTimeout = setTimeout(
                this.hide.bind(this),
                this.hideDelay * delay
            );
        }
    }
};


function popUpMenu(element) {
   Enterprise.PopUpMenu.show(element);
}
/*
function popUpMenu(element,trigger) {
        var iDelay = 2000;
        var new_popup = 0;
        var sTempId = 'popUped';
        if (document.getElementById(sTempId)) {
            var eTemp = document.getElementById(sTempId);
            $(sTempId).previous(0).down('.switcher').removeClassName('list-opened');
            new Effect.Fade (eTemp, { duration:0.3 });
            eTemp.id = sNativeId;
            clearTimeout(tId);
            document.onclick = null;
        }

        sNativeId = 'popId-'+$(element).up(1).id;
        var el = $(sNativeId);
        el.id = sTempId;

        if (eTemp && el == eTemp) {
            hideElement();
        } else {
            $(element).addClassName('list-opened');
            $(sTempId).getOffsetParent().style.zIndex = 994;
            new Effect.Appear (el, { duration:0.3 });
            tId=setTimeout("hideElement()",2*iDelay);
        }
        new_popup = 1;
        document.onclick = function() {
            if (!new_popup) {
                hideElement();
                document.onclick = null;
            }
            new_popup = 0;
        }

        el.onmouseout = function() {
            if ($(sTempId)) {
                $(sTempId).addClassName('faded');
                tId=setTimeout("hideElement()",iDelay);
            }
        }

        el.onmouseover = function() {
            if ($(sTempId)) {
                $(sTempId).removeClassName('faded');
                clearTimeout(tId);
            }
        }

        hideElement = function() {
            //el.hide();
            new Effect.Fade (el, { duration:0.3 });
            $(element).removeClassName('list-opened');
            el.getOffsetParent().style.zIndex = 1;
            el.id = sNativeId;
            if (tId) {clearTimeout(tId);}
        }
} */

Enterprise.Widget = Class.create({
    _node: null,
    _children: [],

    initialize: function (node) {
        this._node = node;
    },

    getNode: function() {
        return this._node;
    },

    /**
     * @param {Enterprise.Widget} widget
     */
    addChild: function(widget) {
        this._children.push(widget);
        var children = $(this._node).immediateDescendants(),
            exists = false;
        $(this._node).immediateDescendants().each(function(child) {
            if (child == widget.getNode()) {
                exists = true;
            }
        });
        if (!exists) {
            widget.placeAt(this._node);
        }
    },

    placeAt: function(node) {
        $(node).insert(this._node);
    }
});

Enterprise.Widget.Dialog = Class.create(Enterprise.Widget, {

    _title: '',

    _titleNode: {},

    _contentNode: {},

    _backNode: {},

    _isPlaced: false,

    initialize: function ($super, title, content, additionalClass) {
        this._title = title;
        //this._node = new Element('div', {'class': 'popup-block block', 'style': {'display': 'none'}});
        this._node = new Element('div', {'class': 'popup-block block'});
        this._node.addClassName(additionalClass);
        //this._windowOverlay = new Element('div', {'class': 'window-overlay', 'style': {'display': 'none'}});
        this._windowOverlay = new Element('div', {'class': 'window-overlay'});
        var headerNode = new Element('div', {'class': 'block-title'});
        this._titleNode = new Element('strong').update(title);
        this._closeButton = new Element('div', {'class': 'btn-close'}).update('Close');
        $(this._closeButton).onclick = (function() {
            this.hide();
        }).bind(this);
        headerNode.insert(this._titleNode);
        headerNode.insert(this._closeButton);
        this._node.insert(headerNode);

        this._contentNode = new Element('div', {'class': 'block-content'});
        this._contentNode.insert(content);

        this._node.insert(this._contentNode);
    },

    place: function() {
        $(document.body).insert(this._windowOverlay);
        $(document.body).insert(this._node);
        this._isPlaced = true;
    },

    setTitle: function(title) {
        $(this._titleNode).update(title);
    },

    setContent: function(content) {
        $(this._contentNode).update(content);
    },

    getContent: function() {
        return this._contentNode;
    },

    show: function() {
        if (!this._isPlaced) {
            this.place();
        }
        //$(this._windowOverlay).setStyle({'display':'block'});
        $(this._windowOverlay).addClassName('active');
        this._windowOverlay.style.height=$$('body')[0].getHeight()+'px';
        //$(this._node).setStyle({'display': 'block'});
        $(this._node).addClassName('active');
    },

    hide: function() {
        //$(this._windowOverlay).setStyle({'display':'none'});
        $(this._windowOverlay).removeClassName('active');
        //$(this._node).setStyle({'display':'none'});
        $(this._node).removeClassName('active');
    },

    setBusy: function(state) {
        if (state) {
            $(this._node).addClassName('loading');
        } else {
            $(this._node).removeClassName('loading');
        }
    },

    destroy: function() {
        $(this._node).remove();
    }
});

Enterprise.Widget.SplitButton = Class.create(Enterprise.Widget, {
    _list: null,
    _templateString: '<strong><span></span></strong>' +
        '<a href="#" class="change"></a>' +
        '<div class="list-container">' +
            '<ul>' +
            '</ul>' +
        '</div>',

    initialize: function($super, title, alt, type) {
        if (typeof title != 'string') {
            $super(title);
        } else {
            $super(new Element('div', {'class': 'split-button split-button-created' + ((type)? ' ' + type: '')}));
            this._node.update(this._templateString);
            this._node.down('strong span').update(title);
            this._node.down('.change').update(alt);
        }
        Event.observe($(this._node).down('strong'), 'click', (function(event){this.onClick(event);}).bind(this));

        this._node.down('.change').setAttribute('tabindex', 20);
        this._list = $(this._node).down('ul');
        Event.observe($(this._node).down('.change'), 'click', this.onToggle.bind(this));
        Event.observe($(this._node).down('.change'), 'blur', this.close.bind(this));
    },

    onClick: function(event) {
    },

    onToggle: function(event) {
        Event.stop(event);
        if (this.isOpened()) {
            this.close();
        } else {
            this.open();
        }
    },

    isOpened: function() {
        return $(this._node).hasClassName('active');
    },

    open: function() {
        $(this._node).addClassName('active');
        this.onOpen();
    },

    onOpen: function() {
    },

    close: function() {
        $(this._node).removeClassName.bind($(this._node), 'active').delay(0.2);
        this.onClose();
    },

    onClose: function() {
    },

    /**
     * @param {Enterprise.Widget.SplitButton.Option} option
     */
    addOption: function(option) {
        option.placeAt(this._list);
        option.onClick = option.onClick.wrap((function(proceed) {
            proceed();
            this.close();
        }).bind(this));
    }
});

Enterprise.Widget.SplitButton.Option = Class.create(Enterprise.Widget, {

    initialize: function($super, title, type) {
        $super(new Element('li', {'class' : type ? type : null}));
        this._node.update('<span title="' + title + '">' + title + '</span>');
        Event.observe(this._node, 'click', (function(){this.onClick()}).bind(this));
    },

    getNode: function() {
        return this._node;
    },

    onClick: function() {

    }
})

Enterprise.loadSplitButtons = function() {
    if (typeof Enterprise.splitButtonsLoaded == 'undefined') {
        Enterprise.splitButtonsLoaded = true;
        $$('.split-button').each(function(node) {
            if (!$(node).hasClassName('split-button-created')) {
                new Enterprise.Widget.SplitButton(node);
            }
        });
    }
};

Enterprise.textOverflow = function(elem) {
    var container = $(elem);
    if (container.getStyle('overflow') == 'hidden') {
        var inner = container.down(0);
        var initialHeight = container.getHeight();
        if (inner.getHeight() > initialHeight) {
            var words = inner.innerHTML.split(' ');
            var test = new Element('span', {'style': 'visibility:hidden;'});
            test.style.width = container.getWidth();
            container.insert(test);
            var tempString = '';
            for (var i = 0; $(test).getHeight() <= initialHeight || i < words.legth; i++) {
                tempString = tempString + words[i] + ' ';
                test.update(tempString)
            };
            var finalstring = (words.slice(-words.length, i - 2)).join(' ');
            test.remove();
            inner.update(finalstring + '&hellip;');
        }
    }
};
Event.observe(document, 'dom:loaded', Enterprise.loadSplitButtons);

Validation.add('validate-zip-international', 'Please enter a valid zip code. For example 90602 or 90602-1234.', function(v, elm) {
    var elmData = jQuery(elm).data('countryId'),
        $countrySelect = jQuery('[id="'+elmData+'"]');
    if ($countrySelect) {
        var countryID = $countrySelect.val(),
            advice = jQuery('#advice-validate-zip-international-zip');
        switch (countryID) {
            case "US":
                if (advice) {
                    advice.text('Please enter a valid zip code. For example 90602 or 90602-1234.');
                    return Validation.get('IsEmpty').test(v) || /(^\d{5}$)|(^\d{5}-\d{4}$)/.test(v);
                }
                break;

            default:
                return true;
        }
    }
});
/**
 * Magento Enterprise Edition
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the Magento Enterprise Edition License
 * that is bundled with this package in the file LICENSE_EE.txt.
 * It is also available through the world-wide-web at this URL:
 * http://www.magentocommerce.com/license/enterprise-edition
 * If you did not receive a copy of the license and are unable to
 * obtain it through the world-wide-web, please send an email
 * to license@magentocommerce.com so we can send you a copy immediately.
 *
 * DISCLAIMER
 *
 * Do not edit or add to this file if you wish to upgrade Magento to newer
 * versions in the future. If you wish to customize Magento for your
 * needs please refer to http://www.magentocommerce.com for more information.
 *
 * @category    design
 * @package     enterprise_default
 * @copyright   Copyright (c) 2012 Magento Inc. (http://www.magentocommerce.com)
 * @license     http://www.magentocommerce.com/license/enterprise-edition
 */

if (!window.Enterprise) {
    window.Enterprise = {};
}

if (!Enterprise.Wishlist) {
    Enterprise.Wishlist = {
        Widget: {
            Form: {}
        }
    };
}

Enterprise.Wishlist.Widget.Form = Class.create(Enterprise.Widget, {
    action: null,
    isValid: false,

    initialize: function($super, action) {
        var _templateString = '<ul class="form-list">' +
                '<li><label for="wishlist-name">' + Translator.translate('Wishlist Name') + '</label><div class="input-box"><input type="text" id="wishlist-name" maxlength="255" class="input-text required-entry validate-length maximum-length-255" name="name"/></div>' +
                '<li class="control"><div class="input-box"><input type="checkbox" id="wishlist-public" name="visibility"></div><label for="wishlist-public">' + Translator.translate('Make This Wishlist Public') + '</label></li>' +
            '</ul>' +
            '<div class="buttons-set form-buttons"><button type="submit" class="button btn-save"><span><span>' + Translator.translate('Save') + '</span></span></button><button type="button" class="button btn-cancel"><span><span>' + Translator.translate('Cancel') + '</span></span></button></div>';

        this.action = action;
        $super(new Element('form', {'method': 'post', 'action': action}));
        this._node.update(_templateString);

        var that = this;
        var deferredList = {
            event: null,
            counter: 0,
            callback: function() {
                this.counter++;
                if (this.counter >= 2) {
                    this.success();
                }
            },
            success: function() {
                that.onSubmit(this.event);
            }
        };

        var validation = new Validation(this._node, {
            onFormValidate: (function(result) {
                this.isValid = result;
                deferredList.callback();
            }).bind(this)
        });
        Event.observe(this._node, 'submit',
            (function(event) {
                deferredList.event = event;
                deferredList.callback();
            }).bind(this)
        );
        Event.observe($(this._node).down('button.btn-cancel'), 'click',
            (function() {
                this.onCancel();
            }).bind(this)
        );
        this.nameNode = $(this._node).down('#wishlist-name');
        this.visibilityNode = $(this._node).down('#wishlist-public');
    },

    onSubmit: function(event) {
    },

    onCancel: function() {

    },

    setName: function(name) {
        this.nameNode.value = name;
    },

    setIsVisible: function(state) {
        this.visibilityNode.checked = !!state;
    }
});


Enterprise.Wishlist.Widget.Form.Create = Class.create(Enterprise.Wishlist.Widget.Form, {
    useAjax: true,

    initialize: function($super, action, useAjax) {
        $super(action);
        this.useAjax = useAjax;
    },

    onSubmit: function(event) {
        Event.stop(event);
        if (!this.isValid) {
            return;
        }
        if (!this.useAjax) {
            this.onWishlistCreated({serializedData: $(this._node).serialize()});
        } else {
            var callback = (function(wishlistId){this.onWishlistCreated(wishlistId)}).bind(this);
            new Ajax.Request(this.action, {
                method: 'post',
                parameters: $(this._node).serialize(),
                onSuccess: function(response) {
                    try {
                        var data = response.responseJSON;
                        if (typeof data.wishlist_id != 'undefined') {
                            callback(data.wishlist_id);
                        } else if (typeof data.redirect != 'undefined') {
                            setLocation(data.redirect);
                        } else {
                            alert(Translator.translate('Error happened while creating wishlist. Please try again later'));
                        }
                    } catch (e) {
                        setLocation(window.location.href);
                    }
                }
            });
        }
    },

    onWishlistCreated: function(wishlist) {

    }
});

Enterprise.Wishlist.createWithCallback = function(createUrl, callback, useAjax) {
    if (typeof useAjax == 'undefined') {
        useAjax = true;
    }
    if (!Enterprise.Wishlist.createWithCallbackDialog) {
        var createWithCallbackForm = new Enterprise.Wishlist.Widget.Form.Create(createUrl, useAjax);
        Enterprise.Wishlist.createWithCallbackDialog = new Enterprise.Widget.Dialog(
            Translator.translate('Create New Wishlist'),
            createWithCallbackForm.getNode()
        );
        Enterprise.Wishlist.createWithCallbackDialog.form = createWithCallbackForm;
        createWithCallbackForm.onCancel = Enterprise.Wishlist.createWithCallbackDialog.hide.bind(Enterprise.Wishlist.createWithCallbackDialog);
        Enterprise.Wishlist.createWithCallbackDialog.form.onSubmit = Enterprise.Wishlist.createWithCallbackDialog.form.onSubmit.wrap(function(proceed, event) {
            proceed(event);
            if (this.isValid) {
                Enterprise.Wishlist.createWithCallbackDialog.setBusy(true);
            }
        })
    }
    Enterprise.Wishlist.createWithCallbackDialog.form.useAjax = useAjax;
    Enterprise.Wishlist.createWithCallbackDialog.form.onWishlistCreated = callback;
    Enterprise.Wishlist.createWithCallbackDialog.show();
}

Enterprise.Wishlist.create = function(createUrl, callback) {
    if (!Enterprise.Wishlist.createDialog) {
        var createForm = new Enterprise.Wishlist.Widget.Form(createUrl);
        Enterprise.Wishlist.createDialog = new Enterprise.Widget.Dialog(
            Translator.translate('Create New Wishlist'),
            createForm.getNode()
        );
        createForm.onCancel = Enterprise.Wishlist.createDialog.hide.bind(Enterprise.Wishlist.createDialog);
    }
    Enterprise.Wishlist.createDialog.show();
}

Enterprise.Wishlist.edit = function(editUrl, wishlistName, visibility) {
    if (!Enterprise.Wishlist.editDialog) {
        var editForm = new Enterprise.Wishlist.Widget.Form(editUrl);
        Enterprise.Wishlist.editDialog = new Enterprise.Widget.Dialog(
            Translator.translate('Edit Wishlist'),
            editForm.getNode()
        );
        Enterprise.Wishlist.editDialog.form = editForm;
        editForm.onCancel = Enterprise.Wishlist.editDialog.hide.bind(Enterprise.Wishlist.editDialog);
    }
    Enterprise.Wishlist.editDialog.form.setName(wishlistName);
    Enterprise.Wishlist.editDialog.form.setIsVisible(visibility);
    Enterprise.Wishlist.editDialog.show();
}

Enterprise.Wishlist.getRowQty = function(rowNode) {
    var qtyNode = $(rowNode).down('input.qty');
    return qtyNode ? qtyNode.value : null;
}

Enterprise.Wishlist.copyItemTo = function(itemId, qty, wishlistId) {
    var form = new Element('form', {method: 'post', action: Enterprise.Wishlist.url.copyItem});
    form.insert(new Element('input', {name: 'item_id', type: 'hidden', value: itemId}));
    if (typeof wishlistId != 'undefined') {
        form.insert(new Element('input', {name: 'wishlist_id', type: 'hidden', value: wishlistId}));
    }
    form.insert(new Element('input', {name: 'qty', type: 'hidden', value: qty}));
    $(document.body).insert(form);
    form.submit();
};

Enterprise.Wishlist.moveItemTo = function(itemId, qty, wishlistId) {
    var form = new Element('form', {method: 'post', action: Enterprise.Wishlist.url.moveItem});
    form.insert(new Element('input', {name: 'item_id', type: 'hidden', value: itemId}));
    if (typeof wishlistId != 'undefined') {
        form.insert(new Element('input', {name: 'wishlist_id', type: 'hidden', value: wishlistId}));
    }
    form.insert(new Element('input', {name: 'qty', type: 'hidden', value: qty}));
    $(document.body).insert(form);
    form.submit();
    return false;
};

Enterprise.Wishlist.copySelectedTo = function(wishlistId) {
    if (!this.itemsSelected()) {
        alert(Translator.translate('You must select items to copy'));
        return;
    }
    var url = Enterprise.Wishlist.url.copySelected;
    this.form.action = url.gsub('%wishlist_id%', wishlistId);
    this.form.submit();
};

Enterprise.Wishlist.moveSelectedTo = function(wishlistId) {
    if (!this.itemsSelected()) {
        alert(Translator.translate('You must select items to move'));
        return;
    }
    var url = Enterprise.Wishlist.url.moveSelected;
    this.form.action = url.gsub('%wishlist_id%', wishlistId);
    this.form.submit();
};

Enterprise.Wishlist.itemsSelected = function() {
    var selected = false;
    $(this.form).select('input.select').each(function(item) {
        if ($(item).checked) {
            selected = true;
        }
    });
    return selected;
};

Enterprise.Wishlist.copyItemToNew = function(itemId, qty) {
    this.createWithCallback(Enterprise.Wishlist.url.create, this.copyItemTo.bind(this, itemId, qty));
};

Enterprise.Wishlist.moveItemToNew = function(itemId, qty) {
    this.createWithCallback(Enterprise.Wishlist.url.create, this.moveItemTo.bind(this, itemId, qty));
};

Enterprise.Wishlist.moveSelectedToNew = function() {
    if (!this.itemsSelected()) {
        alert(Translator.translate('You must select items to move'));
        return;
    }
    this.createWithCallback(Enterprise.Wishlist.url.create, this.moveSelectedTo.bind(this));
};

Enterprise.Wishlist.copySelectedToNew = function() {
    if (!this.itemsSelected()) {
        alert(Translator.translate('You must select items to copy'));
        return;
    }
    this.createWithCallback(Enterprise.Wishlist.url.create, this.copySelectedTo.bind(this));
};

Event.observe(document, 'dom:loaded', function() {
    if (typeof Enterprise.Wishlist.list != 'undefined'
        && (Enterprise.Wishlist.list.length || Enterprise.Wishlist.canCreate)) {

        var buildUrl = function(url, wishlist) {
            var glue = url.indexOf('?') == -1 ? '?' : '&';
            var wishlistInfo = '';
            if (typeof wishlist.serializedData != 'undefined') {
                wishlistInfo = wishlist.serializedData;
            } else {
                wishlistInfo = Hash.toQueryString({'wishlist_id': wishlist});
            }
            return url + glue + wishlistInfo;
        }

        $$('.link-wishlist').each(function(link) {
            var url = link.href;
            var onclick = link.onclick || function() {
                setLocation(this.href);
            }

            var wishlistSplitButton = new Enterprise.Widget.SplitButton(link.innerHTML, Translator.translate('Add to:'), 'light clickable');
            wishlistSplitButton.onClick = onclick.bind({href: url});

            Enterprise.Wishlist.list.each(function(wishlist) {
                var option = new Enterprise.Widget.SplitButton.Option(wishlist.name);
                option.onClick = onclick.bind({href: buildUrl(url, wishlist.id)});
                wishlistSplitButton.addOption(option);
            });

            if (Enterprise.Wishlist.canCreate) {
                var option = new Enterprise.Widget.SplitButton.Option(Translator.translate('Create New Wishlist'), 'new');
                option.onClick = Enterprise.Wishlist.createWithCallback.bind(this, Enterprise.Wishlist.url.create, function(wishlist) {
                    (onclick.bind({
                        href: buildUrl(url, wishlist)
                    }))();
                }, link.hasClassName('use-ajax'));
                wishlistSplitButton.addOption(option);
            }

            wishlistSplitButton.placeAt(link.up());
            link.remove();
        });
    }
});
document.observe("dom:loaded", function() {
  $$('#wishlist-table div.description').each(function(el) { Enterprise.textOverflow(el); });
});

/**
 * Magento Enterprise Edition
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the Magento Enterprise Edition License
 * that is bundled with this package in the file LICENSE_EE.txt.
 * It is also available through the world-wide-web at this URL:
 * http://www.magentocommerce.com/license/enterprise-edition
 * If you did not receive a copy of the license and are unable to
 * obtain it through the world-wide-web, please send an email
 * to license@magentocommerce.com so we can send you a copy immediately.
 *
 * DISCLAIMER
 *
 * Do not edit or add to this file if you wish to upgrade Magento to newer
 * versions in the future. If you wish to customize Magento for your
 * needs please refer to http://www.magentocommerce.com for more information.
 *
 * @category    design
 * @package     enterprise_default
 * @copyright   Copyright (c) 2012 Magento Inc. (http://www.magentocommerce.com)
 * @license     http://www.magentocommerce.com/license/enterprise-edition
 */
 
if (!window.Enterprise) {
    window.Enterprise = {};
}

if (!Enterprise.CatalogEvent) {
    Enterprise.CatalogEvent = {};
}

Enterprise.CatalogEvent.Ticker = Class.create();

Object.extend(Enterprise.CatalogEvent.Ticker.prototype, {
    initialize: function (container, seconds) {
        this.container = $(container);
        this.seconds   = seconds;
        this.start     = new Date();
        this.interval = setInterval(this.applyTimer.bind(this), 1000);
        this.applyTimer();
    },
    getEstimate: function () {
        var now = new Date();
        
        var result = this.seconds - (now.getTime() - this.start.getTime())/1000;
        
        if (result < 0) {
            return 0;
        }
        
        return Math.round(result);
    },
    applyTimer: function () {
        var seconds = this.getEstimate();
        var daySec = Math.floor(seconds / (3600*24)) * (3600*24);
        var hourSec = Math.floor(seconds / 3600) * 3600;
        var minuteSec =  Math.floor(seconds / 60) * 60;
        var secondSec = seconds;
        this.container.down('.days').update(this.formatNumber(Math.floor(daySec/(3600*24))));
        this.container.down('.hour').update(this.formatNumber(Math.floor((hourSec - daySec)/3600)));
        this.container.down('.minute').update(this.formatNumber(Math.floor((minuteSec - hourSec)/60)));
        this.container.down('.second').update(this.formatNumber(seconds - minuteSec));
        if (daySec > 0) {
            this.container.down('.second').previous('.delimiter').hide();
            this.container.down('.second').hide();
            this.container.down('.days').show();
            this.container.down('.days').next('.delimiter').show();
        } else {
            this.container.down('.days').hide();
            this.container.down('.days').next('.delimiter').hide();
            this.container.down('.second').previous('.delimiter').show();
            this.container.down('.second').show();
        }
    },
    formatNumber: function (number) {
        if (number < 10) {
            return '0' + number.toString();
        }

        return number.toString();
    }
});

/**
 * RegionUpdater updates
 * @see /js/varien/form.js
 */
RegionUpdater.prototype.update = function() {
    var $regionEl = jQuery(this.regionSelectEl);

	if (this.regions[this.countryEl.value]) {
		var i, option, region, def;

		def = this.regionSelectEl.getAttribute('defaultValue');
		if (this.regionTextEl) {
			if (!def) {
				def = this.regionTextEl.value.toLowerCase();
			}
			this.regionTextEl.value = '';
		}

		this.regionSelectEl.options.length = 1;
		for (regionId in this.regions[this.countryEl.value]) {
			region = this.regions[this.countryEl.value][regionId];

			option = document.createElement('OPTION');
			option.value = regionId;
			option.text = region.name.stripTags();
			option.title = region.name;

			if (this.regionSelectEl.options.add) {
				this.regionSelectEl.options.add(option);
			} else {
				this.regionSelectEl.appendChild(option);
			}

			if (regionId==def || (region.name && region.name.toLowerCase()==def) ||
				(region.name && region.code.toLowerCase()==def)
			) {
				this.regionSelectEl.value = regionId;
			}
		}

        if ($regionEl.data('CustomSelects')) {
            $regionEl.CustomSelects('updateOptions');
        }

		if (this.disableAction=='hide') {
			if (this.regionTextEl) {
				this.regionTextEl.style.display = 'none';
			}

			// Gorilla: Modified for custom selects
			//this.regionSelectEl.style.display = '';
			$regionEl.show();
			if ($regionEl.data('CustomSelects')) {
				$regionEl.CustomSelects('show');
			}
			// End additions

		} else if (this.disableAction=='disable') {
			if (this.regionTextEl) {
				this.regionTextEl.disabled = true;
			}
			this.regionSelectEl.disabled = false;
		}
		this.setMarkDisplay(this.regionSelectEl, true);
	} else {
		this.regionSelectEl.options.length = 1;
		if (this.disableAction=='hide') {
			if (this.regionTextEl) {
				this.regionTextEl.style.display = '';
			}

			// Gorilla: Modified for custom selects
			if($regionEl.data('CustomSelects')) {
				$regionEl.CustomSelects('hide');
			}
			//this.regionSelectEl.style.display = 'none';
			$regionEl.hide();
			// End additions

			Validation.reset(this.regionSelectEl);
		} else if (this.disableAction=='disable') {
			if (this.regionTextEl) {
				this.regionTextEl.disabled = false;
			}
			this.regionSelectEl.disabled = true;
		} else if (this.disableAction=='nullify') {
			this.regionSelectEl.options.length = 1;
			this.regionSelectEl.value = '';
			this.regionSelectEl.selectedIndex = 0;
			this.lastCountryId = '';
		}
		this.setMarkDisplay(this.regionSelectEl, false);
	}

	// Make Zip and its label required/optional
	var zipUpdater = new ZipUpdater(this.countryEl.value, this.zipEl);
	zipUpdater.update();
};


Enterprise.TopCart.initialize = function(container) {
	this.container = $(container);
	this.element = this.container.up(0);
	this.elementHeader = this.container.previous(0);
	this.intervalDuration = 3000;
	this.interval = null;
	this.onElementMouseOut = this.handleMouseOut.bindAsEventListener(this);
	this.onElementMouseOver = this.handleMouseOver.bindAsEventListener(this);
	this.onElementMouseClick = this.handleMouseClick.bindAsEventListener(this);

	this.element.observe('mouseout', this.onElementMouseOut);
	this.element.observe('mouseover', this.onElementMouseOver);
	//this.elementHeader.observe('click', this.onElementMouseClick);
};

Enterprise.TopCart.handleMouseOver = function (evt) {
	if (!$(this.elementHeader).hasClassName('expanded') && !$(this.container.id).hasClassName('process'))  {
		this.showCart();
	}

	if (this.interval !== null) {
		 clearTimeout(this.interval);
		 this.interval = null;
	}
};

Enterprise.TopCart.showCart = function (timePeriod) {
        this.container.parentNode.style.zIndex=992;
        $(this.container.id).show();
        // new Effect.SlideDown(this.container.id, { duration: 0.1,
        //     beforeStart: function(effect) {$( effect.element.id ).addClassName('process');},
        //     afterFinish: function(effect) {$( effect.element.id ).removeClassName('process'); }
        //     });
        $(this.elementHeader).addClassName('expanded');
        if(timePeriod) {
            this.timePeriod = timePeriod*1000;
            this.interval = setTimeout(this.hideCart.bind(this), this.timePeriod);
        }
};

Enterprise.TopCart.hideCart = function () {
	if (!$(this.container.id).hasClassName('process') && $(this.elementHeader).hasClassName('expanded')) {
		var elemHeader = this.elementHeader;
		$(this.container.id).hide();
		$(this.container.id).parentNode.style.zIndex = 1;
		$(elemHeader).removeClassName('expanded');
		// new Effect.SlideUp(this.container.id, {
		// 	duration: 0.3,
		// 	beforeStart: function(effect) {
		// 		$( effect.element.id ).addClassName('process');
		// 	},
		// 	afterFinish: function(effect) {
		// 		$( effect.element.id ).removeClassName('process');
		// 		effect.element.parentNode.style.zIndex = 1;
		// 		$(elemHeader).removeClassName('expanded');
		// 	}
		// });
	}
	if (this.interval !== null) {
		clearTimeout(this.interval);
		this.interval = null;
	}
};

Enterprise.TopCart.handleMouseOut = function (evt) {
    if ($(this.elementHeader).hasClassName('expanded')) {
        this.hideCart();
    }
};
/*!
 * jQuery JavaScript Library v1.9.1
 * http://jquery.com/
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 *
 * Copyright 2005, 2012 jQuery Foundation, Inc. and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2013-2-4
 */
!function(a,b){function c(a){var b=a.length,c=ia.type(a);return!ia.isWindow(a)&&(!(1!==a.nodeType||!b)||("array"===c||"function"!==c&&(0===b||"number"==typeof b&&b>0&&b-1 in a)))}function d(a){var b=xa[a]={};return ia.each(a.match(ka)||[],function(a,c){b[c]=!0}),b}function e(a,c,d,e){if(ia.acceptData(a)){var f,g,h=ia.expando,i="string"==typeof c,j=a.nodeType,k=j?ia.cache:a,l=j?a[h]:a[h]&&h;if(l&&k[l]&&(e||k[l].data)||!i||d!==b)return l||(j?a[h]=l=_.pop()||ia.guid++:l=h),k[l]||(k[l]={},j||(k[l].toJSON=ia.noop)),"object"!=typeof c&&"function"!=typeof c||(e?k[l]=ia.extend(k[l],c):k[l].data=ia.extend(k[l].data,c)),f=k[l],e||(f.data||(f.data={}),f=f.data),d!==b&&(f[ia.camelCase(c)]=d),i?(g=f[c],null==g&&(g=f[ia.camelCase(c)])):g=f,g}}function f(a,b,c){if(ia.acceptData(a)){var d,e,f,g=a.nodeType,i=g?ia.cache:a,j=g?a[ia.expando]:ia.expando;if(i[j]){if(b&&(f=c?i[j]:i[j].data)){ia.isArray(b)?b=b.concat(ia.map(b,ia.camelCase)):b in f?b=[b]:(b=ia.camelCase(b),b=b in f?[b]:b.split(" "));for(d=0,e=b.length;d<e;d++)delete f[b[d]];if(!(c?h:ia.isEmptyObject)(f))return}(c||(delete i[j].data,h(i[j])))&&(g?ia.cleanData([a],!0):ia.support.deleteExpando||i!=i.window?delete i[j]:i[j]=null)}}}function g(a,c,d){if(d===b&&1===a.nodeType){var e="data-"+c.replace(za,"-$1").toLowerCase();if(d=a.getAttribute(e),"string"==typeof d){try{d="true"===d||"false"!==d&&("null"===d?null:+d+""===d?+d:ya.test(d)?ia.parseJSON(d):d)}catch(f){}ia.data(a,c,d)}else d=b}return d}function h(a){var b;for(b in a)if(("data"!==b||!ia.isEmptyObject(a[b]))&&"toJSON"!==b)return!1;return!0}function i(){return!0}function j(){return!1}function k(a,b){do a=a[b];while(a&&1!==a.nodeType);return a}function l(a,b,c){if(b=b||0,ia.isFunction(b))return ia.grep(a,function(a,d){var e=!!b.call(a,d,a);return e===c});if(b.nodeType)return ia.grep(a,function(a){return a===b===c});if("string"==typeof b){var d=ia.grep(a,function(a){return 1===a.nodeType});if(Ra.test(b))return ia.filter(b,d,!c);b=ia.filter(b,d)}return ia.grep(a,function(a){return ia.inArray(a,b)>=0===c})}function m(a){var b=Ua.split("|"),c=a.createDocumentFragment();if(c.createElement)for(;b.length;)c.createElement(b.pop());return c}function n(a,b){return a.getElementsByTagName(b)[0]||a.appendChild(a.ownerDocument.createElement(b))}function o(a){var b=a.getAttributeNode("type");return a.type=(b&&b.specified)+"/"+a.type,a}function p(a){var b=eb.exec(a.type);return b?a.type=b[1]:a.removeAttribute("type"),a}function q(a,b){for(var c,d=0;null!=(c=a[d]);d++)ia._data(c,"globalEval",!b||ia._data(b[d],"globalEval"))}function r(a,b){if(1===b.nodeType&&ia.hasData(a)){var c,d,e,f=ia._data(a),g=ia._data(b,f),h=f.events;if(h){delete g.handle,g.events={};for(c in h)for(d=0,e=h[c].length;d<e;d++)ia.event.add(b,c,h[c][d])}g.data&&(g.data=ia.extend({},g.data))}}function s(a,b){var c,d,e;if(1===b.nodeType){if(c=b.nodeName.toLowerCase(),!ia.support.noCloneEvent&&b[ia.expando]){e=ia._data(b);for(d in e.events)ia.removeEvent(b,d,e.handle);b.removeAttribute(ia.expando)}"script"===c&&b.text!==a.text?(o(b).text=a.text,p(b)):"object"===c?(b.parentNode&&(b.outerHTML=a.outerHTML),ia.support.html5Clone&&a.innerHTML&&!ia.trim(b.innerHTML)&&(b.innerHTML=a.innerHTML)):"input"===c&&bb.test(a.type)?(b.defaultChecked=b.checked=a.checked,b.value!==a.value&&(b.value=a.value)):"option"===c?b.defaultSelected=b.selected=a.defaultSelected:"input"!==c&&"textarea"!==c||(b.defaultValue=a.defaultValue)}}function t(a,c){var d,e,f=0,g=typeof a.getElementsByTagName!==V?a.getElementsByTagName(c||"*"):typeof a.querySelectorAll!==V?a.querySelectorAll(c||"*"):b;if(!g)for(g=[],d=a.childNodes||a;null!=(e=d[f]);f++)!c||ia.nodeName(e,c)?g.push(e):ia.merge(g,t(e,c));return c===b||c&&ia.nodeName(a,c)?ia.merge([a],g):g}function u(a){bb.test(a.type)&&(a.defaultChecked=a.checked)}function v(a,b){if(b in a)return b;for(var c=b.charAt(0).toUpperCase()+b.slice(1),d=b,e=yb.length;e--;)if(b=yb[e]+c,b in a)return b;return d}function w(a,b){return a=b||a,"none"===ia.css(a,"display")||!ia.contains(a.ownerDocument,a)}function x(a,b){for(var c,d,e,f=[],g=0,h=a.length;g<h;g++)d=a[g],d.style&&(f[g]=ia._data(d,"olddisplay"),c=d.style.display,b?(f[g]||"none"!==c||(d.style.display=""),""===d.style.display&&w(d)&&(f[g]=ia._data(d,"olddisplay",B(d.nodeName)))):f[g]||(e=w(d),(c&&"none"!==c||!e)&&ia._data(d,"olddisplay",e?c:ia.css(d,"display"))));for(g=0;g<h;g++)d=a[g],d.style&&(b&&"none"!==d.style.display&&""!==d.style.display||(d.style.display=b?f[g]||"":"none"));return a}function y(a,b,c){var d=rb.exec(b);return d?Math.max(0,d[1]-(c||0))+(d[2]||"px"):b}function z(a,b,c,d,e){for(var f=c===(d?"border":"content")?4:"width"===b?1:0,g=0;f<4;f+=2)"margin"===c&&(g+=ia.css(a,c+xb[f],!0,e)),d?("content"===c&&(g-=ia.css(a,"padding"+xb[f],!0,e)),"margin"!==c&&(g-=ia.css(a,"border"+xb[f]+"Width",!0,e))):(g+=ia.css(a,"padding"+xb[f],!0,e),"padding"!==c&&(g+=ia.css(a,"border"+xb[f]+"Width",!0,e)));return g}function A(a,b,c){var d=!0,e="width"===b?a.offsetWidth:a.offsetHeight,f=kb(a),g=ia.support.boxSizing&&"border-box"===ia.css(a,"boxSizing",!1,f);if(e<=0||null==e){if(e=lb(a,b,f),(e<0||null==e)&&(e=a.style[b]),sb.test(e))return e;d=g&&(ia.support.boxSizingReliable||e===a.style[b]),e=parseFloat(e)||0}return e+z(a,b,c||(g?"border":"content"),d,f)+"px"}function B(a){var b=W,c=ub[a];return c||(c=C(a,b),"none"!==c&&c||(jb=(jb||ia("<iframe frameborder='0' width='0' height='0'/>").css("cssText","display:block !important")).appendTo(b.documentElement),b=(jb[0].contentWindow||jb[0].contentDocument).document,b.write("<!doctype html><html><body>"),b.close(),c=C(a,b),jb.detach()),ub[a]=c),c}function C(a,b){var c=ia(b.createElement(a)).appendTo(b.body),d=ia.css(c[0],"display");return c.remove(),d}function D(a,b,c,d){var e;if(ia.isArray(b))ia.each(b,function(b,e){c||Ab.test(a)?d(a,e):D(a+"["+("object"==typeof e?b:"")+"]",e,c,d)});else if(c||"object"!==ia.type(b))d(a,b);else for(e in b)D(a+"["+e+"]",b[e],c,d)}function E(a){return function(b,c){"string"!=typeof b&&(c=b,b="*");var d,e=0,f=b.toLowerCase().match(ka)||[];if(ia.isFunction(c))for(;d=f[e++];)"+"===d[0]?(d=d.slice(1)||"*",(a[d]=a[d]||[]).unshift(c)):(a[d]=a[d]||[]).push(c)}}function F(a,b,c,d){function e(h){var i;return f[h]=!0,ia.each(a[h]||[],function(a,h){var j=h(b,c,d);return"string"!=typeof j||g||f[j]?g?!(i=j):void 0:(b.dataTypes.unshift(j),e(j),!1)}),i}var f={},g=a===Rb;return e(b.dataTypes[0])||!f["*"]&&e("*")}function G(a,c){var d,e,f=ia.ajaxSettings.flatOptions||{};for(e in c)c[e]!==b&&((f[e]?a:d||(d={}))[e]=c[e]);return d&&ia.extend(!0,a,d),a}function H(a,c,d){var e,f,g,h,i=a.contents,j=a.dataTypes,k=a.responseFields;for(h in k)h in d&&(c[k[h]]=d[h]);for(;"*"===j[0];)j.shift(),f===b&&(f=a.mimeType||c.getResponseHeader("Content-Type"));if(f)for(h in i)if(i[h]&&i[h].test(f)){j.unshift(h);break}if(j[0]in d)g=j[0];else{for(h in d){if(!j[0]||a.converters[h+" "+j[0]]){g=h;break}e||(e=h)}g=g||e}if(g)return g!==j[0]&&j.unshift(g),d[g]}function I(a,b){var c,d,e,f,g={},h=0,i=a.dataTypes.slice(),j=i[0];if(a.dataFilter&&(b=a.dataFilter(b,a.dataType)),i[1])for(e in a.converters)g[e.toLowerCase()]=a.converters[e];for(;d=i[++h];)if("*"!==d){if("*"!==j&&j!==d){if(e=g[j+" "+d]||g["* "+d],!e)for(c in g)if(f=c.split(" "),f[1]===d&&(e=g[j+" "+f[0]]||g["* "+f[0]])){e===!0?e=g[c]:g[c]!==!0&&(d=f[0],i.splice(h--,0,d));break}if(e!==!0)if(e&&a["throws"])b=e(b);else try{b=e(b)}catch(k){return{state:"parsererror",error:e?k:"No conversion from "+j+" to "+d}}}j=d}return{state:"success",data:b}}function J(){try{return new a.XMLHttpRequest}catch(b){}}function K(){try{return new a.ActiveXObject("Microsoft.XMLHTTP")}catch(b){}}function L(){return setTimeout(function(){$b=b}),$b=ia.now()}function M(a,b){ia.each(b,function(b,c){for(var d=(ec[b]||[]).concat(ec["*"]),e=0,f=d.length;e<f;e++)if(d[e].call(a,b,c))return})}function N(a,b,c){var d,e,f=0,g=dc.length,h=ia.Deferred().always(function(){delete i.elem}),i=function(){if(e)return!1;for(var b=$b||L(),c=Math.max(0,j.startTime+j.duration-b),d=c/j.duration||0,f=1-d,g=0,i=j.tweens.length;g<i;g++)j.tweens[g].run(f);return h.notifyWith(a,[j,f,c]),f<1&&i?c:(h.resolveWith(a,[j]),!1)},j=h.promise({elem:a,props:ia.extend({},b),opts:ia.extend(!0,{specialEasing:{}},c),originalProperties:b,originalOptions:c,startTime:$b||L(),duration:c.duration,tweens:[],createTween:function(b,c){var d=ia.Tween(a,j.opts,b,c,j.opts.specialEasing[b]||j.opts.easing);return j.tweens.push(d),d},stop:function(b){var c=0,d=b?j.tweens.length:0;if(e)return this;for(e=!0;c<d;c++)j.tweens[c].run(1);return b?h.resolveWith(a,[j,b]):h.rejectWith(a,[j,b]),this}}),k=j.props;for(O(k,j.opts.specialEasing);f<g;f++)if(d=dc[f].call(j,a,k,j.opts))return d;return M(j,k),ia.isFunction(j.opts.start)&&j.opts.start.call(a,j),ia.fx.timer(ia.extend(i,{elem:a,anim:j,queue:j.opts.queue})),j.progress(j.opts.progress).done(j.opts.done,j.opts.complete).fail(j.opts.fail).always(j.opts.always)}function O(a,b){var c,d,e,f,g;for(e in a)if(d=ia.camelCase(e),f=b[d],c=a[e],ia.isArray(c)&&(f=c[1],c=a[e]=c[0]),e!==d&&(a[d]=c,delete a[e]),g=ia.cssHooks[d],g&&"expand"in g){c=g.expand(c),delete a[d];for(e in c)e in a||(a[e]=c[e],b[e]=f)}else b[d]=f}function P(a,b,c){var d,e,f,g,h,i,j,k,l,m=this,n=a.style,o={},p=[],q=a.nodeType&&w(a);c.queue||(k=ia._queueHooks(a,"fx"),null==k.unqueued&&(k.unqueued=0,l=k.empty.fire,k.empty.fire=function(){k.unqueued||l()}),k.unqueued++,m.always(function(){m.always(function(){k.unqueued--,ia.queue(a,"fx").length||k.empty.fire()})})),1===a.nodeType&&("height"in b||"width"in b)&&(c.overflow=[n.overflow,n.overflowX,n.overflowY],"inline"===ia.css(a,"display")&&"none"===ia.css(a,"float")&&(ia.support.inlineBlockNeedsLayout&&"inline"!==B(a.nodeName)?n.zoom=1:n.display="inline-block")),c.overflow&&(n.overflow="hidden",ia.support.shrinkWrapBlocks||m.always(function(){n.overflow=c.overflow[0],n.overflowX=c.overflow[1],n.overflowY=c.overflow[2]}));for(e in b)if(g=b[e],ac.exec(g)){if(delete b[e],i=i||"toggle"===g,g===(q?"hide":"show"))continue;p.push(e)}if(f=p.length){h=ia._data(a,"fxshow")||ia._data(a,"fxshow",{}),"hidden"in h&&(q=h.hidden),i&&(h.hidden=!q),q?ia(a).show():m.done(function(){ia(a).hide()}),m.done(function(){var b;ia._removeData(a,"fxshow");for(b in o)ia.style(a,b,o[b])});for(e=0;e<f;e++)d=p[e],j=m.createTween(d,q?h[d]:0),o[d]=h[d]||ia.style(a,d),d in h||(h[d]=j.start,q&&(j.end=j.start,j.start="width"===d||"height"===d?1:0))}}function Q(a,b,c,d,e){return new Q.prototype.init(a,b,c,d,e)}function R(a,b){var c,d={height:a},e=0;for(b=b?1:0;e<4;e+=2-b)c=xb[e],d["margin"+c]=d["padding"+c]=a;return b&&(d.opacity=d.width=a),d}function S(a){return ia.isWindow(a)?a:9===a.nodeType&&(a.defaultView||a.parentWindow)}var T,U,V=typeof b,W=a.document,X=a.location,Y=a.jQuery,Z=a.$,$={},_=[],aa="1.9.1",ba=_.concat,ca=_.push,da=_.slice,ea=_.indexOf,fa=$.toString,ga=$.hasOwnProperty,ha=aa.trim,ia=function(a,b){return new ia.fn.init(a,b,U)},ja=/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,ka=/\S+/g,la=/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,ma=/^(?:(<[\w\W]+>)[^>]*|#([\w-]*))$/,na=/^<(\w+)\s*\/?>(?:<\/\1>|)$/,oa=/^[\],:{}\s]*$/,pa=/(?:^|:|,)(?:\s*\[)+/g,qa=/\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g,ra=/"[^"\\\r\n]*"|true|false|null|-?(?:\d+\.|)\d+(?:[eE][+-]?\d+|)/g,sa=/^-ms-/,ta=/-([\da-z])/gi,ua=function(a,b){return b.toUpperCase()},va=function(a){(W.addEventListener||"load"===a.type||"complete"===W.readyState)&&(wa(),ia.ready())},wa=function(){W.addEventListener?(W.removeEventListener("DOMContentLoaded",va,!1),a.removeEventListener("load",va,!1)):(W.detachEvent("onreadystatechange",va),a.detachEvent("onload",va))};ia.fn=ia.prototype={jquery:aa,constructor:ia,init:function(a,c,d){var e,f;if(!a)return this;if("string"==typeof a){if(e="<"===a.charAt(0)&&">"===a.charAt(a.length-1)&&a.length>=3?[null,a,null]:ma.exec(a),!e||!e[1]&&c)return!c||c.jquery?(c||d).find(a):this.constructor(c).find(a);if(e[1]){if(c=c instanceof ia?c[0]:c,ia.merge(this,ia.parseHTML(e[1],c&&c.nodeType?c.ownerDocument||c:W,!0)),na.test(e[1])&&ia.isPlainObject(c))for(e in c)ia.isFunction(this[e])?this[e](c[e]):this.attr(e,c[e]);return this}if(f=W.getElementById(e[2]),f&&f.parentNode){if(f.id!==e[2])return d.find(a);this.length=1,this[0]=f}return this.context=W,this.selector=a,this}return a.nodeType?(this.context=this[0]=a,this.length=1,this):ia.isFunction(a)?d.ready(a):(a.selector!==b&&(this.selector=a.selector,this.context=a.context),ia.makeArray(a,this))},selector:"",length:0,size:function(){return this.length},toArray:function(){return da.call(this)},get:function(a){return null==a?this.toArray():a<0?this[this.length+a]:this[a]},pushStack:function(a){var b=ia.merge(this.constructor(),a);return b.prevObject=this,b.context=this.context,b},each:function(a,b){return ia.each(this,a,b)},ready:function(a){return ia.ready.promise().done(a),this},slice:function(){return this.pushStack(da.apply(this,arguments))},first:function(){return this.eq(0)},last:function(){return this.eq(-1)},eq:function(a){var b=this.length,c=+a+(a<0?b:0);return this.pushStack(c>=0&&c<b?[this[c]]:[])},map:function(a){return this.pushStack(ia.map(this,function(b,c){return a.call(b,c,b)}))},end:function(){return this.prevObject||this.constructor(null)},push:ca,sort:[].sort,splice:[].splice},ia.fn.init.prototype=ia.fn,ia.extend=ia.fn.extend=function(){var a,c,d,e,f,g,h=arguments[0]||{},i=1,j=arguments.length,k=!1;for("boolean"==typeof h&&(k=h,h=arguments[1]||{},i=2),"object"==typeof h||ia.isFunction(h)||(h={}),j===i&&(h=this,--i);i<j;i++)if(null!=(f=arguments[i]))for(e in f)a=h[e],d=f[e],h!==d&&(k&&d&&(ia.isPlainObject(d)||(c=ia.isArray(d)))?(c?(c=!1,g=a&&ia.isArray(a)?a:[]):g=a&&ia.isPlainObject(a)?a:{},h[e]=ia.extend(k,g,d)):d!==b&&(h[e]=d));return h},ia.extend({noConflict:function(b){return a.$===ia&&(a.$=Z),b&&a.jQuery===ia&&(a.jQuery=Y),ia},isReady:!1,readyWait:1,holdReady:function(a){a?ia.readyWait++:ia.ready(!0)},ready:function(a){if(a===!0?!--ia.readyWait:!ia.isReady){if(!W.body)return setTimeout(ia.ready);ia.isReady=!0,a!==!0&&--ia.readyWait>0||(T.resolveWith(W,[ia]),ia.fn.trigger&&ia(W).trigger("ready").off("ready"))}},isFunction:function(a){return"function"===ia.type(a)},isArray:Array.isArray||function(a){return"array"===ia.type(a)},isWindow:function(a){return null!=a&&a==a.window},isNumeric:function(a){return!isNaN(parseFloat(a))&&isFinite(a)},type:function(a){return null==a?String(a):"object"==typeof a||"function"==typeof a?$[fa.call(a)]||"object":typeof a},isPlainObject:function(a){if(!a||"object"!==ia.type(a)||a.nodeType||ia.isWindow(a))return!1;try{if(a.constructor&&!ga.call(a,"constructor")&&!ga.call(a.constructor.prototype,"isPrototypeOf"))return!1}catch(c){return!1}var d;for(d in a);return d===b||ga.call(a,d)},isEmptyObject:function(a){var b;for(b in a)return!1;return!0},error:function(a){throw new Error(a)},parseHTML:function(a,b,c){if(!a||"string"!=typeof a)return null;"boolean"==typeof b&&(c=b,b=!1),b=b||W;var d=na.exec(a),e=!c&&[];return d?[b.createElement(d[1])]:(d=ia.buildFragment([a],b,e),e&&ia(e).remove(),ia.merge([],d.childNodes))},parseJSON:function(b){return a.JSON&&a.JSON.parse?a.JSON.parse(b):null===b?b:"string"==typeof b&&(b=ia.trim(b),b&&oa.test(b.replace(qa,"@").replace(ra,"]").replace(pa,"")))?new Function("return "+b)():void ia.error("Invalid JSON: "+b)},parseXML:function(c){var d,e;if(!c||"string"!=typeof c)return null;try{a.DOMParser?(e=new DOMParser,d=e.parseFromString(c,"text/xml")):(d=new ActiveXObject("Microsoft.XMLDOM"),d.async="false",d.loadXML(c))}catch(f){d=b}return d&&d.documentElement&&!d.getElementsByTagName("parsererror").length||ia.error("Invalid XML: "+c),d},noop:function(){},globalEval:function(b){b&&ia.trim(b)&&(a.execScript||function(b){a.eval.call(a,b)})(b)},camelCase:function(a){return a.replace(sa,"ms-").replace(ta,ua)},nodeName:function(a,b){return a.nodeName&&a.nodeName.toLowerCase()===b.toLowerCase()},each:function(a,b,d){var e,f=0,g=a.length,h=c(a);if(d){if(h)for(;f<g&&(e=b.apply(a[f],d),e!==!1);f++);else for(f in a)if(e=b.apply(a[f],d),e===!1)break}else if(h)for(;f<g&&(e=b.call(a[f],f,a[f]),e!==!1);f++);else for(f in a)if(e=b.call(a[f],f,a[f]),e===!1)break;return a},trim:ha&&!ha.call("\ufeff ")?function(a){return null==a?"":ha.call(a)}:function(a){return null==a?"":(a+"").replace(la,"")},makeArray:function(a,b){var d=b||[];return null!=a&&(c(Object(a))?ia.merge(d,"string"==typeof a?[a]:a):ca.call(d,a)),d},inArray:function(a,b,c){var d;if(b){if(ea)return ea.call(b,a,c);for(d=b.length,c=c?c<0?Math.max(0,d+c):c:0;c<d;c++)if(c in b&&b[c]===a)return c}return-1},merge:function(a,c){var d=c.length,e=a.length,f=0;if("number"==typeof d)for(;f<d;f++)a[e++]=c[f];else for(;c[f]!==b;)a[e++]=c[f++];return a.length=e,a},grep:function(a,b,c){var d,e=[],f=0,g=a.length;for(c=!!c;f<g;f++)d=!!b(a[f],f),c!==d&&e.push(a[f]);return e},map:function(a,b,d){var e,f=0,g=a.length,h=c(a),i=[];if(h)for(;f<g;f++)e=b(a[f],f,d),null!=e&&(i[i.length]=e);else for(f in a)e=b(a[f],f,d),null!=e&&(i[i.length]=e);return ba.apply([],i)},guid:1,proxy:function(a,c){var d,e,f;return"string"==typeof c&&(f=a[c],c=a,a=f),ia.isFunction(a)?(d=da.call(arguments,2),e=function(){return a.apply(c||this,d.concat(da.call(arguments)))},e.guid=a.guid=a.guid||ia.guid++,e):b},access:function(a,c,d,e,f,g,h){var i=0,j=a.length,k=null==d;if("object"===ia.type(d)){f=!0;for(i in d)ia.access(a,c,i,d[i],!0,g,h)}else if(e!==b&&(f=!0,ia.isFunction(e)||(h=!0),k&&(h?(c.call(a,e),c=null):(k=c,c=function(a,b,c){return k.call(ia(a),c)})),c))for(;i<j;i++)c(a[i],d,h?e:e.call(a[i],i,c(a[i],d)));return f?a:k?c.call(a):j?c(a[0],d):g},now:function(){return(new Date).getTime()}}),ia.ready.promise=function(b){if(!T)if(T=ia.Deferred(),"complete"===W.readyState)setTimeout(ia.ready);else if(W.addEventListener)W.addEventListener("DOMContentLoaded",va,!1),a.addEventListener("load",va,!1);else{W.attachEvent("onreadystatechange",va),a.attachEvent("onload",va);var c=!1;try{c=null==a.frameElement&&W.documentElement}catch(d){}c&&c.doScroll&&!function e(){if(!ia.isReady){try{c.doScroll("left")}catch(a){return setTimeout(e,50)}wa(),ia.ready()}}()}return T.promise(b)},ia.each("Boolean Number String Function Array Date RegExp Object Error".split(" "),function(a,b){$["[object "+b+"]"]=b.toLowerCase()}),U=ia(W);var xa={};ia.Callbacks=function(a){a="string"==typeof a?xa[a]||d(a):ia.extend({},a);var c,e,f,g,h,i,j=[],k=!a.once&&[],l=function(b){for(e=a.memory&&b,f=!0,h=i||0,i=0,g=j.length,c=!0;j&&h<g;h++)if(j[h].apply(b[0],b[1])===!1&&a.stopOnFalse){e=!1;break}c=!1,j&&(k?k.length&&l(k.shift()):e?j=[]:m.disable())},m={add:function(){if(j){var b=j.length;!function d(b){ia.each(b,function(b,c){var e=ia.type(c);"function"===e?a.unique&&m.has(c)||j.push(c):c&&c.length&&"string"!==e&&d(c)})}(arguments),c?g=j.length:e&&(i=b,l(e))}return this},remove:function(){return j&&ia.each(arguments,function(a,b){for(var d;(d=ia.inArray(b,j,d))>-1;)j.splice(d,1),c&&(d<=g&&g--,d<=h&&h--)}),this},has:function(a){return a?ia.inArray(a,j)>-1:!(!j||!j.length)},empty:function(){return j=[],this},disable:function(){return j=k=e=b,this},disabled:function(){return!j},lock:function(){return k=b,e||m.disable(),this},locked:function(){return!k},fireWith:function(a,b){return b=b||[],b=[a,b.slice?b.slice():b],!j||f&&!k||(c?k.push(b):l(b)),this},fire:function(){return m.fireWith(this,arguments),this},fired:function(){return!!f}};return m},ia.extend({Deferred:function(a){var b=[["resolve","done",ia.Callbacks("once memory"),"resolved"],["reject","fail",ia.Callbacks("once memory"),"rejected"],["notify","progress",ia.Callbacks("memory")]],c="pending",d={state:function(){return c},always:function(){return e.done(arguments).fail(arguments),this},then:function(){var a=arguments;return ia.Deferred(function(c){ia.each(b,function(b,f){var g=f[0],h=ia.isFunction(a[b])&&a[b];e[f[1]](function(){var a=h&&h.apply(this,arguments);a&&ia.isFunction(a.promise)?a.promise().done(c.resolve).fail(c.reject).progress(c.notify):c[g+"With"](this===d?c.promise():this,h?[a]:arguments)})}),a=null}).promise()},promise:function(a){return null!=a?ia.extend(a,d):d}},e={};return d.pipe=d.then,ia.each(b,function(a,f){var g=f[2],h=f[3];d[f[1]]=g.add,h&&g.add(function(){c=h},b[1^a][2].disable,b[2][2].lock),e[f[0]]=function(){return e[f[0]+"With"](this===e?d:this,arguments),this},e[f[0]+"With"]=g.fireWith}),d.promise(e),a&&a.call(e,e),e},when:function(a){var b,c,d,e=0,f=da.call(arguments),g=f.length,h=1!==g||a&&ia.isFunction(a.promise)?g:0,i=1===h?a:ia.Deferred(),j=function(a,c,d){return function(e){c[a]=this,d[a]=arguments.length>1?da.call(arguments):e,d===b?i.notifyWith(c,d):--h||i.resolveWith(c,d)}};if(g>1)for(b=new Array(g),c=new Array(g),d=new Array(g);e<g;e++)f[e]&&ia.isFunction(f[e].promise)?f[e].promise().done(j(e,d,f)).fail(i.reject).progress(j(e,c,b)):--h;return h||i.resolveWith(d,f),i.promise()}}),ia.support=function(){var b,c,d,e,f,g,h,i,j,k,l=W.createElement("div");if(l.setAttribute("className","t"),l.innerHTML="  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>",c=l.getElementsByTagName("*"),d=l.getElementsByTagName("a")[0],!c||!d||!c.length)return{};f=W.createElement("select"),h=f.appendChild(W.createElement("option")),e=l.getElementsByTagName("input")[0],d.style.cssText="top:1px;float:left;opacity:.5",b={getSetAttribute:"t"!==l.className,leadingWhitespace:3===l.firstChild.nodeType,tbody:!l.getElementsByTagName("tbody").length,htmlSerialize:!!l.getElementsByTagName("link").length,style:/top/.test(d.getAttribute("style")),hrefNormalized:"/a"===d.getAttribute("href"),opacity:/^0.5/.test(d.style.opacity),cssFloat:!!d.style.cssFloat,checkOn:!!e.value,optSelected:h.selected,enctype:!!W.createElement("form").enctype,html5Clone:"<:nav></:nav>"!==W.createElement("nav").cloneNode(!0).outerHTML,boxModel:"CSS1Compat"===W.compatMode,deleteExpando:!0,noCloneEvent:!0,inlineBlockNeedsLayout:!1,shrinkWrapBlocks:!1,reliableMarginRight:!0,boxSizingReliable:!0,pixelPosition:!1},e.checked=!0,b.noCloneChecked=e.cloneNode(!0).checked,f.disabled=!0,b.optDisabled=!h.disabled;try{delete l.test}catch(m){b.deleteExpando=!1}e=W.createElement("input"),e.setAttribute("value",""),b.input=""===e.getAttribute("value"),e.value="t",e.setAttribute("type","radio"),b.radioValue="t"===e.value,e.setAttribute("checked","t"),e.setAttribute("name","t"),g=W.createDocumentFragment(),g.appendChild(e),b.appendChecked=e.checked,b.checkClone=g.cloneNode(!0).cloneNode(!0).lastChild.checked,l.attachEvent&&(l.attachEvent("onclick",function(){b.noCloneEvent=!1}),l.cloneNode(!0).click());for(k in{submit:!0,change:!0,focusin:!0})l.setAttribute(i="on"+k,"t"),b[k+"Bubbles"]=i in a||l.attributes[i].expando===!1;return l.style.backgroundClip="content-box",l.cloneNode(!0).style.backgroundClip="",b.clearCloneStyle="content-box"===l.style.backgroundClip,ia(function(){var c,d,e,f="padding:0;margin:0;border:0;display:block;box-sizing:content-box;-moz-box-sizing:content-box;-webkit-box-sizing:content-box;",g=W.getElementsByTagName("body")[0];g&&(c=W.createElement("div"),c.style.cssText="border:0;width:0;height:0;position:absolute;top:0;left:-9999px;margin-top:1px",g.appendChild(c).appendChild(l),l.innerHTML="<table><tr><td></td><td>t</td></tr></table>",e=l.getElementsByTagName("td"),e[0].style.cssText="padding:0;margin:0;border:0;display:none",j=0===e[0].offsetHeight,e[0].style.display="",e[1].style.display="none",b.reliableHiddenOffsets=j&&0===e[0].offsetHeight,l.innerHTML="",l.style.cssText="box-sizing:border-box;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;padding:1px;border:1px;display:block;width:4px;margin-top:1%;position:absolute;top:1%;",b.boxSizing=4===l.offsetWidth,b.doesNotIncludeMarginInBodyOffset=1!==g.offsetTop,a.getComputedStyle&&(b.pixelPosition="1%"!==(a.getComputedStyle(l,null)||{}).top,b.boxSizingReliable="4px"===(a.getComputedStyle(l,null)||{width:"4px"}).width,d=l.appendChild(W.createElement("div")),d.style.cssText=l.style.cssText=f,d.style.marginRight=d.style.width="0",l.style.width="1px",b.reliableMarginRight=!parseFloat((a.getComputedStyle(d,null)||{}).marginRight)),typeof l.style.zoom!==V&&(l.innerHTML="",l.style.cssText=f+"width:1px;padding:1px;display:inline;zoom:1",b.inlineBlockNeedsLayout=3===l.offsetWidth,l.style.display="block",l.innerHTML="<div></div>",l.firstChild.style.width="5px",b.shrinkWrapBlocks=3!==l.offsetWidth,b.inlineBlockNeedsLayout&&(g.style.zoom=1)),g.removeChild(c),c=l=e=d=null)}),c=f=g=h=d=e=null,b}();var ya=/(?:\{[\s\S]*\}|\[[\s\S]*\])$/,za=/([A-Z])/g;ia.extend({cache:{},expando:"jQuery"+(aa+Math.random()).replace(/\D/g,""),noData:{embed:!0,object:"clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",applet:!0},hasData:function(a){return a=a.nodeType?ia.cache[a[ia.expando]]:a[ia.expando],!!a&&!h(a)},data:function(a,b,c){return e(a,b,c)},removeData:function(a,b){return f(a,b)},_data:function(a,b,c){return e(a,b,c,!0)},_removeData:function(a,b){return f(a,b,!0)},acceptData:function(a){if(a.nodeType&&1!==a.nodeType&&9!==a.nodeType)return!1;var b=a.nodeName&&ia.noData[a.nodeName.toLowerCase()];return!b||b!==!0&&a.getAttribute("classid")===b}}),ia.fn.extend({data:function(a,c){var d,e,f=this[0],h=0,i=null;if(a===b){if(this.length&&(i=ia.data(f),1===f.nodeType&&!ia._data(f,"parsedAttrs"))){for(d=f.attributes;h<d.length;h++)e=d[h].name,e.indexOf("data-")||(e=ia.camelCase(e.slice(5)),g(f,e,i[e]));ia._data(f,"parsedAttrs",!0)}return i}return"object"==typeof a?this.each(function(){ia.data(this,a)}):ia.access(this,function(c){return c===b?f?g(f,a,ia.data(f,a)):null:void this.each(function(){ia.data(this,a,c)})},null,c,arguments.length>1,null,!0)},removeData:function(a){return this.each(function(){ia.removeData(this,a)})}}),ia.extend({queue:function(a,b,c){var d;if(a)return b=(b||"fx")+"queue",d=ia._data(a,b),c&&(!d||ia.isArray(c)?d=ia._data(a,b,ia.makeArray(c)):d.push(c)),d||[]},dequeue:function(a,b){b=b||"fx";var c=ia.queue(a,b),d=c.length,e=c.shift(),f=ia._queueHooks(a,b),g=function(){ia.dequeue(a,b)};"inprogress"===e&&(e=c.shift(),d--),f.cur=e,e&&("fx"===b&&c.unshift("inprogress"),delete f.stop,e.call(a,g,f)),!d&&f&&f.empty.fire()},_queueHooks:function(a,b){var c=b+"queueHooks";return ia._data(a,c)||ia._data(a,c,{empty:ia.Callbacks("once memory").add(function(){ia._removeData(a,b+"queue"),ia._removeData(a,c)})})}}),ia.fn.extend({queue:function(a,c){var d=2;return"string"!=typeof a&&(c=a,a="fx",d--),arguments.length<d?ia.queue(this[0],a):c===b?this:this.each(function(){var b=ia.queue(this,a,c);ia._queueHooks(this,a),"fx"===a&&"inprogress"!==b[0]&&ia.dequeue(this,a)})},dequeue:function(a){return this.each(function(){ia.dequeue(this,a)})},delay:function(a,b){return a=ia.fx?ia.fx.speeds[a]||a:a,b=b||"fx",this.queue(b,function(b,c){var d=setTimeout(b,a);c.stop=function(){clearTimeout(d)}})},clearQueue:function(a){return this.queue(a||"fx",[])},promise:function(a,c){var d,e=1,f=ia.Deferred(),g=this,h=this.length,i=function(){--e||f.resolveWith(g,[g])};for("string"!=typeof a&&(c=a,a=b),a=a||"fx";h--;)d=ia._data(g[h],a+"queueHooks"),d&&d.empty&&(e++,d.empty.add(i));return i(),f.promise(c)}});var Aa,Ba,Ca=/[\t\r\n]/g,Da=/\r/g,Ea=/^(?:input|select|textarea|button|object)$/i,Fa=/^(?:a|area)$/i,Ga=/^(?:checked|selected|autofocus|autoplay|async|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped)$/i,Ha=/^(?:checked|selected)$/i,Ia=ia.support.getSetAttribute,Ja=ia.support.input;ia.fn.extend({attr:function(a,b){return ia.access(this,ia.attr,a,b,arguments.length>1)},removeAttr:function(a){return this.each(function(){ia.removeAttr(this,a)})},prop:function(a,b){return ia.access(this,ia.prop,a,b,arguments.length>1)},removeProp:function(a){return a=ia.propFix[a]||a,this.each(function(){try{this[a]=b,delete this[a]}catch(c){}})},addClass:function(a){var b,c,d,e,f,g=0,h=this.length,i="string"==typeof a&&a;if(ia.isFunction(a))return this.each(function(b){ia(this).addClass(a.call(this,b,this.className))});if(i)for(b=(a||"").match(ka)||[];g<h;g++)if(c=this[g],d=1===c.nodeType&&(c.className?(" "+c.className+" ").replace(Ca," "):" ")){for(f=0;e=b[f++];)d.indexOf(" "+e+" ")<0&&(d+=e+" ");c.className=ia.trim(d)}return this},removeClass:function(a){var b,c,d,e,f,g=0,h=this.length,i=0===arguments.length||"string"==typeof a&&a;if(ia.isFunction(a))return this.each(function(b){ia(this).removeClass(a.call(this,b,this.className))});if(i)for(b=(a||"").match(ka)||[];g<h;g++)if(c=this[g],d=1===c.nodeType&&(c.className?(" "+c.className+" ").replace(Ca," "):"")){for(f=0;e=b[f++];)for(;d.indexOf(" "+e+" ")>=0;)d=d.replace(" "+e+" "," ");c.className=a?ia.trim(d):""}return this},toggleClass:function(a,b){var c=typeof a,d="boolean"==typeof b;return ia.isFunction(a)?this.each(function(c){ia(this).toggleClass(a.call(this,c,this.className,b),b)}):this.each(function(){if("string"===c)for(var e,f=0,g=ia(this),h=b,i=a.match(ka)||[];e=i[f++];)h=d?h:!g.hasClass(e),g[h?"addClass":"removeClass"](e);else c!==V&&"boolean"!==c||(this.className&&ia._data(this,"__className__",this.className),this.className=this.className||a===!1?"":ia._data(this,"__className__")||"")})},hasClass:function(a){for(var b=" "+a+" ",c=0,d=this.length;c<d;c++)if(1===this[c].nodeType&&(" "+this[c].className+" ").replace(Ca," ").indexOf(b)>=0)return!0;return!1},val:function(a){var c,d,e,f=this[0];{if(arguments.length)return e=ia.isFunction(a),this.each(function(c){var f,g=ia(this);1===this.nodeType&&(f=e?a.call(this,c,g.val()):a,null==f?f="":"number"==typeof f?f+="":ia.isArray(f)&&(f=ia.map(f,function(a){return null==a?"":a+""})),d=ia.valHooks[this.type]||ia.valHooks[this.nodeName.toLowerCase()],d&&"set"in d&&d.set(this,f,"value")!==b||(this.value=f))});if(f)return d=ia.valHooks[f.type]||ia.valHooks[f.nodeName.toLowerCase()],d&&"get"in d&&(c=d.get(f,"value"))!==b?c:(c=f.value,"string"==typeof c?c.replace(Da,""):null==c?"":c)}}}),ia.extend({valHooks:{option:{get:function(a){var b=a.attributes.value;return!b||b.specified?a.value:a.text}},select:{get:function(a){for(var b,c,d=a.options,e=a.selectedIndex,f="select-one"===a.type||e<0,g=f?null:[],h=f?e+1:d.length,i=e<0?h:f?e:0;i<h;i++)if(c=d[i],(c.selected||i===e)&&(ia.support.optDisabled?!c.disabled:null===c.getAttribute("disabled"))&&(!c.parentNode.disabled||!ia.nodeName(c.parentNode,"optgroup"))){if(b=ia(c).val(),f)return b;g.push(b)}return g},set:function(a,b){var c=ia.makeArray(b);return ia(a).find("option").each(function(){this.selected=ia.inArray(ia(this).val(),c)>=0}),c.length||(a.selectedIndex=-1),c}}},attr:function(a,c,d){var e,f,g,h=a.nodeType;if(a&&3!==h&&8!==h&&2!==h)return typeof a.getAttribute===V?ia.prop(a,c,d):(f=1!==h||!ia.isXMLDoc(a),f&&(c=c.toLowerCase(),e=ia.attrHooks[c]||(Ga.test(c)?Ba:Aa)),d===b?e&&f&&"get"in e&&null!==(g=e.get(a,c))?g:(typeof a.getAttribute!==V&&(g=a.getAttribute(c)),null==g?b:g):null!==d?e&&f&&"set"in e&&(g=e.set(a,d,c))!==b?g:(a.setAttribute(c,d+""),d):void ia.removeAttr(a,c))},removeAttr:function(a,b){var c,d,e=0,f=b&&b.match(ka);if(f&&1===a.nodeType)for(;c=f[e++];)d=ia.propFix[c]||c,Ga.test(c)?!Ia&&Ha.test(c)?a[ia.camelCase("default-"+c)]=a[d]=!1:a[d]=!1:ia.attr(a,c,""),a.removeAttribute(Ia?c:d)},attrHooks:{type:{set:function(a,b){if(!ia.support.radioValue&&"radio"===b&&ia.nodeName(a,"input")){var c=a.value;return a.setAttribute("type",b),c&&(a.value=c),b}}}},propFix:{tabindex:"tabIndex",readonly:"readOnly","for":"htmlFor","class":"className",maxlength:"maxLength",cellspacing:"cellSpacing",cellpadding:"cellPadding",rowspan:"rowSpan",colspan:"colSpan",usemap:"useMap",frameborder:"frameBorder",contenteditable:"contentEditable"},prop:function(a,c,d){var e,f,g,h=a.nodeType;if(a&&3!==h&&8!==h&&2!==h)return g=1!==h||!ia.isXMLDoc(a),g&&(c=ia.propFix[c]||c,f=ia.propHooks[c]),d!==b?f&&"set"in f&&(e=f.set(a,d,c))!==b?e:a[c]=d:f&&"get"in f&&null!==(e=f.get(a,c))?e:a[c]},propHooks:{tabIndex:{get:function(a){var c=a.getAttributeNode("tabindex");return c&&c.specified?parseInt(c.value,10):Ea.test(a.nodeName)||Fa.test(a.nodeName)&&a.href?0:b}}}}),Ba={get:function(a,c){var d=ia.prop(a,c),e="boolean"==typeof d&&a.getAttribute(c),f="boolean"==typeof d?Ja&&Ia?null!=e:Ha.test(c)?a[ia.camelCase("default-"+c)]:!!e:a.getAttributeNode(c);return f&&f.value!==!1?c.toLowerCase():b;
},set:function(a,b,c){return b===!1?ia.removeAttr(a,c):Ja&&Ia||!Ha.test(c)?a.setAttribute(!Ia&&ia.propFix[c]||c,c):a[ia.camelCase("default-"+c)]=a[c]=!0,c}},Ja&&Ia||(ia.attrHooks.value={get:function(a,c){var d=a.getAttributeNode(c);return ia.nodeName(a,"input")?a.defaultValue:d&&d.specified?d.value:b},set:function(a,b,c){return ia.nodeName(a,"input")?void(a.defaultValue=b):Aa&&Aa.set(a,b,c)}}),Ia||(Aa=ia.valHooks.button={get:function(a,c){var d=a.getAttributeNode(c);return d&&("id"===c||"name"===c||"coords"===c?""!==d.value:d.specified)?d.value:b},set:function(a,c,d){var e=a.getAttributeNode(d);return e||a.setAttributeNode(e=a.ownerDocument.createAttribute(d)),e.value=c+="","value"===d||c===a.getAttribute(d)?c:b}},ia.attrHooks.contenteditable={get:Aa.get,set:function(a,b,c){Aa.set(a,""!==b&&b,c)}},ia.each(["width","height"],function(a,b){ia.attrHooks[b]=ia.extend(ia.attrHooks[b],{set:function(a,c){if(""===c)return a.setAttribute(b,"auto"),c}})})),ia.support.hrefNormalized||(ia.each(["href","src","width","height"],function(a,c){ia.attrHooks[c]=ia.extend(ia.attrHooks[c],{get:function(a){var d=a.getAttribute(c,2);return null==d?b:d}})}),ia.each(["href","src"],function(a,b){ia.propHooks[b]={get:function(a){return a.getAttribute(b,4)}}})),ia.support.style||(ia.attrHooks.style={get:function(a){return a.style.cssText||b},set:function(a,b){return a.style.cssText=b+""}}),ia.support.optSelected||(ia.propHooks.selected=ia.extend(ia.propHooks.selected,{get:function(a){var b=a.parentNode;return b&&(b.selectedIndex,b.parentNode&&b.parentNode.selectedIndex),null}})),ia.support.enctype||(ia.propFix.enctype="encoding"),ia.support.checkOn||ia.each(["radio","checkbox"],function(){ia.valHooks[this]={get:function(a){return null===a.getAttribute("value")?"on":a.value}}}),ia.each(["radio","checkbox"],function(){ia.valHooks[this]=ia.extend(ia.valHooks[this],{set:function(a,b){if(ia.isArray(b))return a.checked=ia.inArray(ia(a).val(),b)>=0}})});var Ka=/^(?:input|select|textarea)$/i,La=/^key/,Ma=/^(?:mouse|contextmenu)|click/,Na=/^(?:focusinfocus|focusoutblur)$/,Oa=/^([^.]*)(?:\.(.+)|)$/;ia.event={global:{},add:function(a,c,d,e,f){var g,h,i,j,k,l,m,n,o,p,q,r=ia._data(a);if(r){for(d.handler&&(j=d,d=j.handler,f=j.selector),d.guid||(d.guid=ia.guid++),(h=r.events)||(h=r.events={}),(l=r.handle)||(l=r.handle=function(a){return typeof ia===V||a&&ia.event.triggered===a.type?b:ia.event.dispatch.apply(l.elem,arguments)},l.elem=a),c=(c||"").match(ka)||[""],i=c.length;i--;)g=Oa.exec(c[i])||[],o=q=g[1],p=(g[2]||"").split(".").sort(),k=ia.event.special[o]||{},o=(f?k.delegateType:k.bindType)||o,k=ia.event.special[o]||{},m=ia.extend({type:o,origType:q,data:e,handler:d,guid:d.guid,selector:f,needsContext:f&&ia.expr.match.needsContext.test(f),namespace:p.join(".")},j),(n=h[o])||(n=h[o]=[],n.delegateCount=0,k.setup&&k.setup.call(a,e,p,l)!==!1||(a.addEventListener?a.addEventListener(o,l,!1):a.attachEvent&&a.attachEvent("on"+o,l))),k.add&&(k.add.call(a,m),m.handler.guid||(m.handler.guid=d.guid)),f?n.splice(n.delegateCount++,0,m):n.push(m),ia.event.global[o]=!0;a=null}},remove:function(a,b,c,d,e){var f,g,h,i,j,k,l,m,n,o,p,q=ia.hasData(a)&&ia._data(a);if(q&&(k=q.events)){for(b=(b||"").match(ka)||[""],j=b.length;j--;)if(h=Oa.exec(b[j])||[],n=p=h[1],o=(h[2]||"").split(".").sort(),n){for(l=ia.event.special[n]||{},n=(d?l.delegateType:l.bindType)||n,m=k[n]||[],h=h[2]&&new RegExp("(^|\\.)"+o.join("\\.(?:.*\\.|)")+"(\\.|$)"),i=f=m.length;f--;)g=m[f],!e&&p!==g.origType||c&&c.guid!==g.guid||h&&!h.test(g.namespace)||d&&d!==g.selector&&("**"!==d||!g.selector)||(m.splice(f,1),g.selector&&m.delegateCount--,l.remove&&l.remove.call(a,g));i&&!m.length&&(l.teardown&&l.teardown.call(a,o,q.handle)!==!1||ia.removeEvent(a,n,q.handle),delete k[n])}else for(n in k)ia.event.remove(a,n+b[j],c,d,!0);ia.isEmptyObject(k)&&(delete q.handle,ia._removeData(a,"events"))}},trigger:function(c,d,e,f){var g,h,i,j,k,l,m,n=[e||W],o=ga.call(c,"type")?c.type:c,p=ga.call(c,"namespace")?c.namespace.split("."):[];if(i=l=e=e||W,3!==e.nodeType&&8!==e.nodeType&&!Na.test(o+ia.event.triggered)&&(o.indexOf(".")>=0&&(p=o.split("."),o=p.shift(),p.sort()),h=o.indexOf(":")<0&&"on"+o,c=c[ia.expando]?c:new ia.Event(o,"object"==typeof c&&c),c.isTrigger=!0,c.namespace=p.join("."),c.namespace_re=c.namespace?new RegExp("(^|\\.)"+p.join("\\.(?:.*\\.|)")+"(\\.|$)"):null,c.result=b,c.target||(c.target=e),d=null==d?[c]:ia.makeArray(d,[c]),k=ia.event.special[o]||{},f||!k.trigger||k.trigger.apply(e,d)!==!1)){if(!f&&!k.noBubble&&!ia.isWindow(e)){for(j=k.delegateType||o,Na.test(j+o)||(i=i.parentNode);i;i=i.parentNode)n.push(i),l=i;l===(e.ownerDocument||W)&&n.push(l.defaultView||l.parentWindow||a)}for(m=0;(i=n[m++])&&!c.isPropagationStopped();)c.type=m>1?j:k.bindType||o,g=(ia._data(i,"events")||{})[c.type]&&ia._data(i,"handle"),g&&g.apply(i,d),g=h&&i[h],g&&ia.acceptData(i)&&g.apply&&g.apply(i,d)===!1&&c.preventDefault();if(c.type=o,!f&&!c.isDefaultPrevented()&&(!k._default||k._default.apply(e.ownerDocument,d)===!1)&&("click"!==o||!ia.nodeName(e,"a"))&&ia.acceptData(e)&&h&&e[o]&&!ia.isWindow(e)){l=e[h],l&&(e[h]=null),ia.event.triggered=o;try{e[o]()}catch(q){}ia.event.triggered=b,l&&(e[h]=l)}return c.result}},dispatch:function(a){a=ia.event.fix(a);var c,d,e,f,g,h=[],i=da.call(arguments),j=(ia._data(this,"events")||{})[a.type]||[],k=ia.event.special[a.type]||{};if(i[0]=a,a.delegateTarget=this,!k.preDispatch||k.preDispatch.call(this,a)!==!1){for(h=ia.event.handlers.call(this,a,j),c=0;(f=h[c++])&&!a.isPropagationStopped();)for(a.currentTarget=f.elem,g=0;(e=f.handlers[g++])&&!a.isImmediatePropagationStopped();)a.namespace_re&&!a.namespace_re.test(e.namespace)||(a.handleObj=e,a.data=e.data,d=((ia.event.special[e.origType]||{}).handle||e.handler).apply(f.elem,i),d!==b&&(a.result=d)===!1&&(a.preventDefault(),a.stopPropagation()));return k.postDispatch&&k.postDispatch.call(this,a),a.result}},handlers:function(a,c){var d,e,f,g,h=[],i=c.delegateCount,j=a.target;if(i&&j.nodeType&&(!a.button||"click"!==a.type))for(;j!=this;j=j.parentNode||this)if(1===j.nodeType&&(j.disabled!==!0||"click"!==a.type)){for(f=[],g=0;g<i;g++)e=c[g],d=e.selector+" ",f[d]===b&&(f[d]=e.needsContext?ia(d,this).index(j)>=0:ia.find(d,this,null,[j]).length),f[d]&&f.push(e);f.length&&h.push({elem:j,handlers:f})}return i<c.length&&h.push({elem:this,handlers:c.slice(i)}),h},fix:function(a){if(a[ia.expando])return a;var b,c,d,e=a.type,f=a,g=this.fixHooks[e];for(g||(this.fixHooks[e]=g=Ma.test(e)?this.mouseHooks:La.test(e)?this.keyHooks:{}),d=g.props?this.props.concat(g.props):this.props,a=new ia.Event(f),b=d.length;b--;)c=d[b],a[c]=f[c];return a.target||(a.target=f.srcElement||W),3===a.target.nodeType&&(a.target=a.target.parentNode),a.metaKey=!!a.metaKey,g.filter?g.filter(a,f):a},props:"altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),fixHooks:{},keyHooks:{props:"char charCode key keyCode".split(" "),filter:function(a,b){return null==a.which&&(a.which=null!=b.charCode?b.charCode:b.keyCode),a}},mouseHooks:{props:"button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),filter:function(a,c){var d,e,f,g=c.button,h=c.fromElement;return null==a.pageX&&null!=c.clientX&&(e=a.target.ownerDocument||W,f=e.documentElement,d=e.body,a.pageX=c.clientX+(f&&f.scrollLeft||d&&d.scrollLeft||0)-(f&&f.clientLeft||d&&d.clientLeft||0),a.pageY=c.clientY+(f&&f.scrollTop||d&&d.scrollTop||0)-(f&&f.clientTop||d&&d.clientTop||0)),!a.relatedTarget&&h&&(a.relatedTarget=h===a.target?c.toElement:h),a.which||g===b||(a.which=1&g?1:2&g?3:4&g?2:0),a}},special:{load:{noBubble:!0},click:{trigger:function(){if(ia.nodeName(this,"input")&&"checkbox"===this.type&&this.click)return this.click(),!1}},focus:{trigger:function(){if(this!==W.activeElement&&this.focus)try{return this.focus(),!1}catch(a){}},delegateType:"focusin"},blur:{trigger:function(){if(this===W.activeElement&&this.blur)return this.blur(),!1},delegateType:"focusout"},beforeunload:{postDispatch:function(a){a.result!==b&&(a.originalEvent.returnValue=a.result)}}},simulate:function(a,b,c,d){var e=ia.extend(new ia.Event,c,{type:a,isSimulated:!0,originalEvent:{}});d?ia.event.trigger(e,null,b):ia.event.dispatch.call(b,e),e.isDefaultPrevented()&&c.preventDefault()}},ia.removeEvent=W.removeEventListener?function(a,b,c){a.removeEventListener&&a.removeEventListener(b,c,!1)}:function(a,b,c){var d="on"+b;a.detachEvent&&(typeof a[d]===V&&(a[d]=null),a.detachEvent(d,c))},ia.Event=function(a,b){return this instanceof ia.Event?(a&&a.type?(this.originalEvent=a,this.type=a.type,this.isDefaultPrevented=a.defaultPrevented||a.returnValue===!1||a.getPreventDefault&&a.getPreventDefault()?i:j):this.type=a,b&&ia.extend(this,b),this.timeStamp=a&&a.timeStamp||ia.now(),void(this[ia.expando]=!0)):new ia.Event(a,b)},ia.Event.prototype={isDefaultPrevented:j,isPropagationStopped:j,isImmediatePropagationStopped:j,preventDefault:function(){var a=this.originalEvent;this.isDefaultPrevented=i,a&&(a.preventDefault?a.preventDefault():a.returnValue=!1)},stopPropagation:function(){var a=this.originalEvent;this.isPropagationStopped=i,a&&(a.stopPropagation&&a.stopPropagation(),a.cancelBubble=!0)},stopImmediatePropagation:function(){this.isImmediatePropagationStopped=i,this.stopPropagation()}},ia.each({mouseenter:"mouseover",mouseleave:"mouseout"},function(a,b){ia.event.special[a]={delegateType:b,bindType:b,handle:function(a){var c,d=this,e=a.relatedTarget,f=a.handleObj;return e&&(e===d||ia.contains(d,e))||(a.type=f.origType,c=f.handler.apply(this,arguments),a.type=b),c}}}),ia.support.submitBubbles||(ia.event.special.submit={setup:function(){return!ia.nodeName(this,"form")&&void ia.event.add(this,"click._submit keypress._submit",function(a){var c=a.target,d=ia.nodeName(c,"input")||ia.nodeName(c,"button")?c.form:b;d&&!ia._data(d,"submitBubbles")&&(ia.event.add(d,"submit._submit",function(a){a._submit_bubble=!0}),ia._data(d,"submitBubbles",!0))})},postDispatch:function(a){a._submit_bubble&&(delete a._submit_bubble,this.parentNode&&!a.isTrigger&&ia.event.simulate("submit",this.parentNode,a,!0))},teardown:function(){return!ia.nodeName(this,"form")&&void ia.event.remove(this,"._submit")}}),ia.support.changeBubbles||(ia.event.special.change={setup:function(){return Ka.test(this.nodeName)?("checkbox"!==this.type&&"radio"!==this.type||(ia.event.add(this,"propertychange._change",function(a){"checked"===a.originalEvent.propertyName&&(this._just_changed=!0)}),ia.event.add(this,"click._change",function(a){this._just_changed&&!a.isTrigger&&(this._just_changed=!1),ia.event.simulate("change",this,a,!0)})),!1):void ia.event.add(this,"beforeactivate._change",function(a){var b=a.target;Ka.test(b.nodeName)&&!ia._data(b,"changeBubbles")&&(ia.event.add(b,"change._change",function(a){!this.parentNode||a.isSimulated||a.isTrigger||ia.event.simulate("change",this.parentNode,a,!0)}),ia._data(b,"changeBubbles",!0))})},handle:function(a){var b=a.target;if(this!==b||a.isSimulated||a.isTrigger||"radio"!==b.type&&"checkbox"!==b.type)return a.handleObj.handler.apply(this,arguments)},teardown:function(){return ia.event.remove(this,"._change"),!Ka.test(this.nodeName)}}),ia.support.focusinBubbles||ia.each({focus:"focusin",blur:"focusout"},function(a,b){var c=0,d=function(a){ia.event.simulate(b,a.target,ia.event.fix(a),!0)};ia.event.special[b]={setup:function(){0===c++&&W.addEventListener(a,d,!0)},teardown:function(){0===--c&&W.removeEventListener(a,d,!0)}}}),ia.fn.extend({on:function(a,c,d,e,f){var g,h;if("object"==typeof a){"string"!=typeof c&&(d=d||c,c=b);for(g in a)this.on(g,c,d,a[g],f);return this}if(null==d&&null==e?(e=c,d=c=b):null==e&&("string"==typeof c?(e=d,d=b):(e=d,d=c,c=b)),e===!1)e=j;else if(!e)return this;return 1===f&&(h=e,e=function(a){return ia().off(a),h.apply(this,arguments)},e.guid=h.guid||(h.guid=ia.guid++)),this.each(function(){ia.event.add(this,a,e,d,c)})},one:function(a,b,c,d){return this.on(a,b,c,d,1)},off:function(a,c,d){var e,f;if(a&&a.preventDefault&&a.handleObj)return e=a.handleObj,ia(a.delegateTarget).off(e.namespace?e.origType+"."+e.namespace:e.origType,e.selector,e.handler),this;if("object"==typeof a){for(f in a)this.off(f,c,a[f]);return this}return c!==!1&&"function"!=typeof c||(d=c,c=b),d===!1&&(d=j),this.each(function(){ia.event.remove(this,a,d,c)})},bind:function(a,b,c){return this.on(a,null,b,c)},unbind:function(a,b){return this.off(a,null,b)},delegate:function(a,b,c,d){return this.on(b,a,c,d)},undelegate:function(a,b,c){return 1===arguments.length?this.off(a,"**"):this.off(b,a||"**",c)},trigger:function(a,b){return this.each(function(){ia.event.trigger(a,b,this)})},triggerHandler:function(a,b){var c=this[0];if(c)return ia.event.trigger(a,b,c,!0)}}),/*!
     * Sizzle CSS Selector Engine
     * Copyright 2012 jQuery Foundation and other contributors
     * Released under the MIT license
     * http://sizzlejs.com/
     */
function(a,b){function c(a){return oa.test(a+"")}function d(){var a,b=[];return a=function(c,d){return b.push(c+=" ")>y.cacheLength&&delete a[b.shift()],a[c]=d}}function e(a){return a[N]=!0,a}function f(a){var b=F.createElement("div");try{return a(b)}catch(c){return!1}finally{b=null}}function g(a,b,c,d){var e,f,g,h,i,j,k,n,o,p;if((b?b.ownerDocument||b:O)!==F&&E(b),b=b||F,c=c||[],!a||"string"!=typeof a)return c;if(1!==(h=b.nodeType)&&9!==h)return[];if(!H&&!d){if(e=pa.exec(a))if(g=e[1]){if(9===h){if(f=b.getElementById(g),!f||!f.parentNode)return c;if(f.id===g)return c.push(f),c}else if(b.ownerDocument&&(f=b.ownerDocument.getElementById(g))&&L(b,f)&&f.id===g)return c.push(f),c}else{if(e[2])return Z.apply(c,$.call(b.getElementsByTagName(a),0)),c;if((g=e[3])&&P.getByClassName&&b.getElementsByClassName)return Z.apply(c,$.call(b.getElementsByClassName(g),0)),c}if(P.qsa&&!I.test(a)){if(k=!0,n=N,o=b,p=9===h&&a,1===h&&"object"!==b.nodeName.toLowerCase()){for(j=l(a),(k=b.getAttribute("id"))?n=k.replace(sa,"\\$&"):b.setAttribute("id",n),n="[id='"+n+"'] ",i=j.length;i--;)j[i]=n+m(j[i]);o=na.test(a)&&b.parentNode||b,p=j.join(",")}if(p)try{return Z.apply(c,$.call(o.querySelectorAll(p),0)),c}catch(q){}finally{k||b.removeAttribute("id")}}}return u(a.replace(ga,"$1"),b,c,d)}function h(a,b){var c=b&&a,d=c&&(~b.sourceIndex||W)-(~a.sourceIndex||W);if(d)return d;if(c)for(;c=c.nextSibling;)if(c===b)return-1;return a?1:-1}function i(a){return function(b){var c=b.nodeName.toLowerCase();return"input"===c&&b.type===a}}function j(a){return function(b){var c=b.nodeName.toLowerCase();return("input"===c||"button"===c)&&b.type===a}}function k(a){return e(function(b){return b=+b,e(function(c,d){for(var e,f=a([],c.length,b),g=f.length;g--;)c[e=f[g]]&&(c[e]=!(d[e]=c[e]))})})}function l(a,b){var c,d,e,f,h,i,j,k=T[a+" "];if(k)return b?0:k.slice(0);for(h=a,i=[],j=y.preFilter;h;){c&&!(d=ha.exec(h))||(d&&(h=h.slice(d[0].length)||h),i.push(e=[])),c=!1,(d=ja.exec(h))&&(c=d.shift(),e.push({value:c,type:d[0].replace(ga," ")}),h=h.slice(c.length));for(f in y.filter)!(d=ma[f].exec(h))||j[f]&&!(d=j[f](d))||(c=d.shift(),e.push({value:c,type:f,matches:d}),h=h.slice(c.length));if(!c)break}return b?h.length:h?g.error(a):T(a,i).slice(0)}function m(a){for(var b=0,c=a.length,d="";b<c;b++)d+=a[b].value;return d}function n(a,b,c){var d=b.dir,e=c&&"parentNode"===d,f=R++;return b.first?function(b,c,f){for(;b=b[d];)if(1===b.nodeType||e)return a(b,c,f)}:function(b,c,g){var h,i,j,k=Q+" "+f;if(g){for(;b=b[d];)if((1===b.nodeType||e)&&a(b,c,g))return!0}else for(;b=b[d];)if(1===b.nodeType||e)if(j=b[N]||(b[N]={}),(i=j[d])&&i[0]===k){if((h=i[1])===!0||h===x)return h===!0}else if(i=j[d]=[k],i[1]=a(b,c,g)||x,i[1]===!0)return!0}}function o(a){return a.length>1?function(b,c,d){for(var e=a.length;e--;)if(!a[e](b,c,d))return!1;return!0}:a[0]}function p(a,b,c,d,e){for(var f,g=[],h=0,i=a.length,j=null!=b;h<i;h++)(f=a[h])&&(c&&!c(f,d,e)||(g.push(f),j&&b.push(h)));return g}function q(a,b,c,d,f,g){return d&&!d[N]&&(d=q(d)),f&&!f[N]&&(f=q(f,g)),e(function(e,g,h,i){var j,k,l,m=[],n=[],o=g.length,q=e||t(b||"*",h.nodeType?[h]:h,[]),r=!a||!e&&b?q:p(q,m,a,h,i),s=c?f||(e?a:o||d)?[]:g:r;if(c&&c(r,s,h,i),d)for(j=p(s,n),d(j,[],h,i),k=j.length;k--;)(l=j[k])&&(s[n[k]]=!(r[n[k]]=l));if(e){if(f||a){if(f){for(j=[],k=s.length;k--;)(l=s[k])&&j.push(r[k]=l);f(null,s=[],j,i)}for(k=s.length;k--;)(l=s[k])&&(j=f?_.call(e,l):m[k])>-1&&(e[j]=!(g[j]=l))}}else s=p(s===g?s.splice(o,s.length):s),f?f(null,g,s,i):Z.apply(g,s)})}function r(a){for(var b,c,d,e=a.length,f=y.relative[a[0].type],g=f||y.relative[" "],h=f?1:0,i=n(function(a){return a===b},g,!0),j=n(function(a){return _.call(b,a)>-1},g,!0),k=[function(a,c,d){return!f&&(d||c!==D)||((b=c).nodeType?i(a,c,d):j(a,c,d))}];h<e;h++)if(c=y.relative[a[h].type])k=[n(o(k),c)];else{if(c=y.filter[a[h].type].apply(null,a[h].matches),c[N]){for(d=++h;d<e&&!y.relative[a[d].type];d++);return q(h>1&&o(k),h>1&&m(a.slice(0,h-1)).replace(ga,"$1"),c,h<d&&r(a.slice(h,d)),d<e&&r(a=a.slice(d)),d<e&&m(a))}k.push(c)}return o(k)}function s(a,b){var c=0,d=b.length>0,f=a.length>0,h=function(e,h,i,j,k){var l,m,n,o=[],q=0,r="0",s=e&&[],t=null!=k,u=D,v=e||f&&y.find.TAG("*",k&&h.parentNode||h),w=Q+=null==u?1:Math.random()||.1;for(t&&(D=h!==F&&h,x=c);null!=(l=v[r]);r++){if(f&&l){for(m=0;n=a[m++];)if(n(l,h,i)){j.push(l);break}t&&(Q=w,x=++c)}d&&((l=!n&&l)&&q--,e&&s.push(l))}if(q+=r,d&&r!==q){for(m=0;n=b[m++];)n(s,o,h,i);if(e){if(q>0)for(;r--;)s[r]||o[r]||(o[r]=Y.call(j));o=p(o)}Z.apply(j,o),t&&!e&&o.length>0&&q+b.length>1&&g.uniqueSort(j)}return t&&(Q=w,D=u),s};return d?e(h):h}function t(a,b,c){for(var d=0,e=b.length;d<e;d++)g(a,b[d],c);return c}function u(a,b,c,d){var e,f,g,h,i,j=l(a);if(!d&&1===j.length){if(f=j[0]=j[0].slice(0),f.length>2&&"ID"===(g=f[0]).type&&9===b.nodeType&&!H&&y.relative[f[1].type]){if(b=y.find.ID(g.matches[0].replace(ua,va),b)[0],!b)return c;a=a.slice(f.shift().value.length)}for(e=ma.needsContext.test(a)?0:f.length;e--&&(g=f[e],!y.relative[h=g.type]);)if((i=y.find[h])&&(d=i(g.matches[0].replace(ua,va),na.test(f[0].type)&&b.parentNode||b))){if(f.splice(e,1),a=d.length&&m(f),!a)return Z.apply(c,$.call(d,0)),c;break}}return B(a,j)(d,b,H,c,na.test(a)),c}function v(){}var w,x,y,z,A,B,C,D,E,F,G,H,I,J,K,L,M,N="sizzle"+-new Date,O=a.document,P={},Q=0,R=0,S=d(),T=d(),U=d(),V=typeof b,W=1<<31,X=[],Y=X.pop,Z=X.push,$=X.slice,_=X.indexOf||function(a){for(var b=0,c=this.length;b<c;b++)if(this[b]===a)return b;return-1},aa="[\\x20\\t\\r\\n\\f]",ba="(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",ca=ba.replace("w","w#"),da="([*^$|!~]?=)",ea="\\["+aa+"*("+ba+")"+aa+"*(?:"+da+aa+"*(?:(['\"])((?:\\\\.|[^\\\\])*?)\\3|("+ca+")|)|)"+aa+"*\\]",fa=":("+ba+")(?:\\(((['\"])((?:\\\\.|[^\\\\])*?)\\3|((?:\\\\.|[^\\\\()[\\]]|"+ea.replace(3,8)+")*)|.*)\\)|)",ga=new RegExp("^"+aa+"+|((?:^|[^\\\\])(?:\\\\.)*)"+aa+"+$","g"),ha=new RegExp("^"+aa+"*,"+aa+"*"),ja=new RegExp("^"+aa+"*([\\x20\\t\\r\\n\\f>+~])"+aa+"*"),ka=new RegExp(fa),la=new RegExp("^"+ca+"$"),ma={ID:new RegExp("^#("+ba+")"),CLASS:new RegExp("^\\.("+ba+")"),NAME:new RegExp("^\\[name=['\"]?("+ba+")['\"]?\\]"),TAG:new RegExp("^("+ba.replace("w","w*")+")"),ATTR:new RegExp("^"+ea),PSEUDO:new RegExp("^"+fa),CHILD:new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\("+aa+"*(even|odd|(([+-]|)(\\d*)n|)"+aa+"*(?:([+-]|)"+aa+"*(\\d+)|))"+aa+"*\\)|)","i"),needsContext:new RegExp("^"+aa+"*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\("+aa+"*((?:-\\d)?\\d*)"+aa+"*\\)|)(?=[^-]|$)","i")},na=/[\x20\t\r\n\f]*[+~]/,oa=/^[^{]+\{\s*\[native code/,pa=/^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,qa=/^(?:input|select|textarea|button)$/i,ra=/^h\d$/i,sa=/'|\\/g,ta=/\=[\x20\t\r\n\f]*([^'"\]]*)[\x20\t\r\n\f]*\]/g,ua=/\\([\da-fA-F]{1,6}[\x20\t\r\n\f]?|.)/g,va=function(a,b){var c="0x"+b-65536;return c!==c?b:c<0?String.fromCharCode(c+65536):String.fromCharCode(c>>10|55296,1023&c|56320)};try{$.call(O.documentElement.childNodes,0)[0].nodeType}catch(wa){$=function(a){for(var b,c=[];b=this[a++];)c.push(b);return c}}A=g.isXML=function(a){var b=a&&(a.ownerDocument||a).documentElement;return!!b&&"HTML"!==b.nodeName},E=g.setDocument=function(a){var d=a?a.ownerDocument||a:O;return d!==F&&9===d.nodeType&&d.documentElement?(F=d,G=d.documentElement,H=A(d),P.tagNameNoComments=f(function(a){return a.appendChild(d.createComment("")),!a.getElementsByTagName("*").length}),P.attributes=f(function(a){a.innerHTML="<select></select>";var b=typeof a.lastChild.getAttribute("multiple");return"boolean"!==b&&"string"!==b}),P.getByClassName=f(function(a){return a.innerHTML="<div class='hidden e'></div><div class='hidden'></div>",!(!a.getElementsByClassName||!a.getElementsByClassName("e").length)&&(a.lastChild.className="e",2===a.getElementsByClassName("e").length)}),P.getByName=f(function(a){a.id=N+0,a.innerHTML="<a name='"+N+"'></a><div name='"+N+"'></div>",G.insertBefore(a,G.firstChild);var b=d.getElementsByName&&d.getElementsByName(N).length===2+d.getElementsByName(N+0).length;return P.getIdNotName=!d.getElementById(N),G.removeChild(a),b}),y.attrHandle=f(function(a){return a.innerHTML="<a href='#'></a>",a.firstChild&&typeof a.firstChild.getAttribute!==V&&"#"===a.firstChild.getAttribute("href")})?{}:{href:function(a){return a.getAttribute("href",2)},type:function(a){return a.getAttribute("type")}},P.getIdNotName?(y.find.ID=function(a,b){if(typeof b.getElementById!==V&&!H){var c=b.getElementById(a);return c&&c.parentNode?[c]:[]}},y.filter.ID=function(a){var b=a.replace(ua,va);return function(a){return a.getAttribute("id")===b}}):(y.find.ID=function(a,c){if(typeof c.getElementById!==V&&!H){var d=c.getElementById(a);return d?d.id===a||typeof d.getAttributeNode!==V&&d.getAttributeNode("id").value===a?[d]:b:[]}},y.filter.ID=function(a){var b=a.replace(ua,va);return function(a){var c=typeof a.getAttributeNode!==V&&a.getAttributeNode("id");return c&&c.value===b}}),y.find.TAG=P.tagNameNoComments?function(a,b){if(typeof b.getElementsByTagName!==V)return b.getElementsByTagName(a)}:function(a,b){var c,d=[],e=0,f=b.getElementsByTagName(a);if("*"===a){for(;c=f[e++];)1===c.nodeType&&d.push(c);return d}return f},y.find.NAME=P.getByName&&function(a,b){if(typeof b.getElementsByName!==V)return b.getElementsByName(name)},y.find.CLASS=P.getByClassName&&function(a,b){if(typeof b.getElementsByClassName!==V&&!H)return b.getElementsByClassName(a)},J=[],I=[":focus"],(P.qsa=c(d.querySelectorAll))&&(f(function(a){a.innerHTML="<select><option selected=''></option></select>",a.querySelectorAll("[selected]").length||I.push("\\["+aa+"*(?:checked|disabled|ismap|multiple|readonly|selected|value)"),a.querySelectorAll(":checked").length||I.push(":checked")}),f(function(a){a.innerHTML="<input type='hidden' i=''/>",a.querySelectorAll("[i^='']").length&&I.push("[*^$]="+aa+"*(?:\"\"|'')"),a.querySelectorAll(":enabled").length||I.push(":enabled",":disabled"),a.querySelectorAll("*,:x"),I.push(",.*:")})),(P.matchesSelector=c(K=G.matchesSelector||G.mozMatchesSelector||G.webkitMatchesSelector||G.oMatchesSelector||G.msMatchesSelector))&&f(function(a){P.disconnectedMatch=K.call(a,"div"),K.call(a,"[s!='']:x"),J.push("!=",fa)}),I=new RegExp(I.join("|")),J=new RegExp(J.join("|")),L=c(G.contains)||G.compareDocumentPosition?function(a,b){var c=9===a.nodeType?a.documentElement:a,d=b&&b.parentNode;return a===d||!(!d||1!==d.nodeType||!(c.contains?c.contains(d):a.compareDocumentPosition&&16&a.compareDocumentPosition(d)))}:function(a,b){if(b)for(;b=b.parentNode;)if(b===a)return!0;return!1},M=G.compareDocumentPosition?function(a,b){var c;return a===b?(C=!0,0):(c=b.compareDocumentPosition&&a.compareDocumentPosition&&a.compareDocumentPosition(b))?1&c||a.parentNode&&11===a.parentNode.nodeType?a===d||L(O,a)?-1:b===d||L(O,b)?1:0:4&c?-1:1:a.compareDocumentPosition?-1:1}:function(a,b){var c,e=0,f=a.parentNode,g=b.parentNode,i=[a],j=[b];if(a===b)return C=!0,0;if(!f||!g)return a===d?-1:b===d?1:f?-1:g?1:0;if(f===g)return h(a,b);for(c=a;c=c.parentNode;)i.unshift(c);for(c=b;c=c.parentNode;)j.unshift(c);for(;i[e]===j[e];)e++;return e?h(i[e],j[e]):i[e]===O?-1:j[e]===O?1:0},C=!1,[0,0].sort(M),P.detectDuplicates=C,F):F},g.matches=function(a,b){return g(a,null,null,b)},g.matchesSelector=function(a,b){if((a.ownerDocument||a)!==F&&E(a),b=b.replace(ta,"='$1']"),P.matchesSelector&&!H&&(!J||!J.test(b))&&!I.test(b))try{var c=K.call(a,b);if(c||P.disconnectedMatch||a.document&&11!==a.document.nodeType)return c}catch(d){}return g(b,F,null,[a]).length>0},g.contains=function(a,b){return(a.ownerDocument||a)!==F&&E(a),L(a,b)},g.attr=function(a,b){var c;return(a.ownerDocument||a)!==F&&E(a),H||(b=b.toLowerCase()),(c=y.attrHandle[b])?c(a):H||P.attributes?a.getAttribute(b):((c=a.getAttributeNode(b))||a.getAttribute(b))&&a[b]===!0?b:c&&c.specified?c.value:null},g.error=function(a){throw new Error("Syntax error, unrecognized expression: "+a)},g.uniqueSort=function(a){var b,c=[],d=1,e=0;if(C=!P.detectDuplicates,a.sort(M),C){for(;b=a[d];d++)b===a[d-1]&&(e=c.push(d));for(;e--;)a.splice(c[e],1)}return a},z=g.getText=function(a){var b,c="",d=0,e=a.nodeType;if(e){if(1===e||9===e||11===e){if("string"==typeof a.textContent)return a.textContent;for(a=a.firstChild;a;a=a.nextSibling)c+=z(a)}else if(3===e||4===e)return a.nodeValue}else for(;b=a[d];d++)c+=z(b);return c},y=g.selectors={cacheLength:50,createPseudo:e,match:ma,find:{},relative:{">":{dir:"parentNode",first:!0}," ":{dir:"parentNode"},"+":{dir:"previousSibling",first:!0},"~":{dir:"previousSibling"}},preFilter:{ATTR:function(a){return a[1]=a[1].replace(ua,va),a[3]=(a[4]||a[5]||"").replace(ua,va),"~="===a[2]&&(a[3]=" "+a[3]+" "),a.slice(0,4)},CHILD:function(a){return a[1]=a[1].toLowerCase(),"nth"===a[1].slice(0,3)?(a[3]||g.error(a[0]),a[4]=+(a[4]?a[5]+(a[6]||1):2*("even"===a[3]||"odd"===a[3])),a[5]=+(a[7]+a[8]||"odd"===a[3])):a[3]&&g.error(a[0]),a},PSEUDO:function(a){var b,c=!a[5]&&a[2];return ma.CHILD.test(a[0])?null:(a[4]?a[2]=a[4]:c&&ka.test(c)&&(b=l(c,!0))&&(b=c.indexOf(")",c.length-b)-c.length)&&(a[0]=a[0].slice(0,b),a[2]=c.slice(0,b)),a.slice(0,3))}},filter:{TAG:function(a){return"*"===a?function(){return!0}:(a=a.replace(ua,va).toLowerCase(),function(b){return b.nodeName&&b.nodeName.toLowerCase()===a})},CLASS:function(a){var b=S[a+" "];return b||(b=new RegExp("(^|"+aa+")"+a+"("+aa+"|$)"))&&S(a,function(a){return b.test(a.className||typeof a.getAttribute!==V&&a.getAttribute("class")||"")})},ATTR:function(a,b,c){return function(d){var e=g.attr(d,a);return null==e?"!="===b:!b||(e+="","="===b?e===c:"!="===b?e!==c:"^="===b?c&&0===e.indexOf(c):"*="===b?c&&e.indexOf(c)>-1:"$="===b?c&&e.slice(-c.length)===c:"~="===b?(" "+e+" ").indexOf(c)>-1:"|="===b&&(e===c||e.slice(0,c.length+1)===c+"-"))}},CHILD:function(a,b,c,d,e){var f="nth"!==a.slice(0,3),g="last"!==a.slice(-4),h="of-type"===b;return 1===d&&0===e?function(a){return!!a.parentNode}:function(b,c,i){var j,k,l,m,n,o,p=f!==g?"nextSibling":"previousSibling",q=b.parentNode,r=h&&b.nodeName.toLowerCase(),s=!i&&!h;if(q){if(f){for(;p;){for(l=b;l=l[p];)if(h?l.nodeName.toLowerCase()===r:1===l.nodeType)return!1;o=p="only"===a&&!o&&"nextSibling"}return!0}if(o=[g?q.firstChild:q.lastChild],g&&s){for(k=q[N]||(q[N]={}),j=k[a]||[],n=j[0]===Q&&j[1],m=j[0]===Q&&j[2],l=n&&q.childNodes[n];l=++n&&l&&l[p]||(m=n=0)||o.pop();)if(1===l.nodeType&&++m&&l===b){k[a]=[Q,n,m];break}}else if(s&&(j=(b[N]||(b[N]={}))[a])&&j[0]===Q)m=j[1];else for(;(l=++n&&l&&l[p]||(m=n=0)||o.pop())&&((h?l.nodeName.toLowerCase()!==r:1!==l.nodeType)||!++m||(s&&((l[N]||(l[N]={}))[a]=[Q,m]),l!==b)););return m-=e,m===d||m%d===0&&m/d>=0}}},PSEUDO:function(a,b){var c,d=y.pseudos[a]||y.setFilters[a.toLowerCase()]||g.error("unsupported pseudo: "+a);return d[N]?d(b):d.length>1?(c=[a,a,"",b],y.setFilters.hasOwnProperty(a.toLowerCase())?e(function(a,c){for(var e,f=d(a,b),g=f.length;g--;)e=_.call(a,f[g]),a[e]=!(c[e]=f[g])}):function(a){return d(a,0,c)}):d}},pseudos:{not:e(function(a){var b=[],c=[],d=B(a.replace(ga,"$1"));return d[N]?e(function(a,b,c,e){for(var f,g=d(a,null,e,[]),h=a.length;h--;)(f=g[h])&&(a[h]=!(b[h]=f))}):function(a,e,f){return b[0]=a,d(b,null,f,c),!c.pop()}}),has:e(function(a){return function(b){return g(a,b).length>0}}),contains:e(function(a){return function(b){return(b.textContent||b.innerText||z(b)).indexOf(a)>-1}}),lang:e(function(a){return la.test(a||"")||g.error("unsupported lang: "+a),a=a.replace(ua,va).toLowerCase(),function(b){var c;do if(c=H?b.getAttribute("xml:lang")||b.getAttribute("lang"):b.lang)return c=c.toLowerCase(),c===a||0===c.indexOf(a+"-");while((b=b.parentNode)&&1===b.nodeType);return!1}}),target:function(b){var c=a.location&&a.location.hash;return c&&c.slice(1)===b.id},root:function(a){return a===G},focus:function(a){return a===F.activeElement&&(!F.hasFocus||F.hasFocus())&&!!(a.type||a.href||~a.tabIndex)},enabled:function(a){return a.disabled===!1},disabled:function(a){return a.disabled===!0},checked:function(a){var b=a.nodeName.toLowerCase();return"input"===b&&!!a.checked||"option"===b&&!!a.selected},selected:function(a){return a.parentNode&&a.parentNode.selectedIndex,a.selected===!0},empty:function(a){for(a=a.firstChild;a;a=a.nextSibling)if(a.nodeName>"@"||3===a.nodeType||4===a.nodeType)return!1;return!0},parent:function(a){return!y.pseudos.empty(a)},header:function(a){return ra.test(a.nodeName)},input:function(a){return qa.test(a.nodeName)},button:function(a){var b=a.nodeName.toLowerCase();return"input"===b&&"button"===a.type||"button"===b},text:function(a){var b;return"input"===a.nodeName.toLowerCase()&&"text"===a.type&&(null==(b=a.getAttribute("type"))||b.toLowerCase()===a.type)},first:k(function(){return[0]}),last:k(function(a,b){return[b-1]}),eq:k(function(a,b,c){return[c<0?c+b:c]}),even:k(function(a,b){for(var c=0;c<b;c+=2)a.push(c);return a}),odd:k(function(a,b){for(var c=1;c<b;c+=2)a.push(c);return a}),lt:k(function(a,b,c){for(var d=c<0?c+b:c;--d>=0;)a.push(d);return a}),gt:k(function(a,b,c){for(var d=c<0?c+b:c;++d<b;)a.push(d);return a})}};for(w in{radio:!0,checkbox:!0,file:!0,password:!0,image:!0})y.pseudos[w]=i(w);for(w in{submit:!0,reset:!0})y.pseudos[w]=j(w);B=g.compile=function(a,b){var c,d=[],e=[],f=U[a+" "];if(!f){for(b||(b=l(a)),c=b.length;c--;)f=r(b[c]),f[N]?d.push(f):e.push(f);f=U(a,s(e,d))}return f},y.pseudos.nth=y.pseudos.eq,y.filters=v.prototype=y.pseudos,y.setFilters=new v,E(),g.attr=ia.attr,ia.find=g,ia.expr=g.selectors,ia.expr[":"]=ia.expr.pseudos,ia.unique=g.uniqueSort,ia.text=g.getText,ia.isXMLDoc=g.isXML,ia.contains=g.contains}(a);var Pa=/Until$/,Qa=/^(?:parents|prev(?:Until|All))/,Ra=/^.[^:#\[\.,]*$/,Sa=ia.expr.match.needsContext,Ta={children:!0,contents:!0,next:!0,prev:!0};ia.fn.extend({find:function(a){var b,c,d,e=this.length;if("string"!=typeof a)return d=this,this.pushStack(ia(a).filter(function(){for(b=0;b<e;b++)if(ia.contains(d[b],this))return!0}));for(c=[],b=0;b<e;b++)ia.find(a,this[b],c);return c=this.pushStack(e>1?ia.unique(c):c),c.selector=(this.selector?this.selector+" ":"")+a,c},has:function(a){var b,c=ia(a,this),d=c.length;return this.filter(function(){for(b=0;b<d;b++)if(ia.contains(this,c[b]))return!0})},not:function(a){return this.pushStack(l(this,a,!1))},filter:function(a){return this.pushStack(l(this,a,!0))},is:function(a){return!!a&&("string"==typeof a?Sa.test(a)?ia(a,this.context).index(this[0])>=0:ia.filter(a,this).length>0:this.filter(a).length>0)},closest:function(a,b){for(var c,d=0,e=this.length,f=[],g=Sa.test(a)||"string"!=typeof a?ia(a,b||this.context):0;d<e;d++)for(c=this[d];c&&c.ownerDocument&&c!==b&&11!==c.nodeType;){if(g?g.index(c)>-1:ia.find.matchesSelector(c,a)){f.push(c);break}c=c.parentNode}return this.pushStack(f.length>1?ia.unique(f):f)},index:function(a){return a?"string"==typeof a?ia.inArray(this[0],ia(a)):ia.inArray(a.jquery?a[0]:a,this):this[0]&&this[0].parentNode?this.first().prevAll().length:-1},add:function(a,b){var c="string"==typeof a?ia(a,b):ia.makeArray(a&&a.nodeType?[a]:a),d=ia.merge(this.get(),c);return this.pushStack(ia.unique(d))},addBack:function(a){return this.add(null==a?this.prevObject:this.prevObject.filter(a))}}),ia.fn.andSelf=ia.fn.addBack,ia.each({parent:function(a){var b=a.parentNode;return b&&11!==b.nodeType?b:null},parents:function(a){return ia.dir(a,"parentNode")},parentsUntil:function(a,b,c){return ia.dir(a,"parentNode",c)},next:function(a){return k(a,"nextSibling")},prev:function(a){return k(a,"previousSibling")},nextAll:function(a){return ia.dir(a,"nextSibling")},prevAll:function(a){return ia.dir(a,"previousSibling")},nextUntil:function(a,b,c){return ia.dir(a,"nextSibling",c)},prevUntil:function(a,b,c){return ia.dir(a,"previousSibling",c)},siblings:function(a){return ia.sibling((a.parentNode||{}).firstChild,a)},children:function(a){return ia.sibling(a.firstChild)},contents:function(a){return ia.nodeName(a,"iframe")?a.contentDocument||a.contentWindow.document:ia.merge([],a.childNodes)}},function(a,b){ia.fn[a]=function(c,d){var e=ia.map(this,b,c);return Pa.test(a)||(d=c),d&&"string"==typeof d&&(e=ia.filter(d,e)),e=this.length>1&&!Ta[a]?ia.unique(e):e,this.length>1&&Qa.test(a)&&(e=e.reverse()),this.pushStack(e)}}),ia.extend({filter:function(a,b,c){return c&&(a=":not("+a+")"),1===b.length?ia.find.matchesSelector(b[0],a)?[b[0]]:[]:ia.find.matches(a,b)},dir:function(a,c,d){for(var e=[],f=a[c];f&&9!==f.nodeType&&(d===b||1!==f.nodeType||!ia(f).is(d));)1===f.nodeType&&e.push(f),f=f[c];return e},sibling:function(a,b){for(var c=[];a;a=a.nextSibling)1===a.nodeType&&a!==b&&c.push(a);return c}});var Ua="abbr|article|aside|audio|bdi|canvas|data|datalist|details|figcaption|figure|footer|header|hgroup|mark|meter|nav|output|progress|section|summary|time|video",Va=/ jQuery\d+="(?:null|\d+)"/g,Wa=new RegExp("<(?:"+Ua+")[\\s/>]","i"),Xa=/^\s+/,Ya=/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,Za=/<([\w:]+)/,$a=/<tbody/i,_a=/<|&#?\w+;/,ab=/<(?:script|style|link)/i,bb=/^(?:checkbox|radio)$/i,cb=/checked\s*(?:[^=]|=\s*.checked.)/i,db=/^$|\/(?:java|ecma)script/i,eb=/^true\/(.*)/,fb=/^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,gb={option:[1,"<select multiple='multiple'>","</select>"],legend:[1,"<fieldset>","</fieldset>"],area:[1,"<map>","</map>"],param:[1,"<object>","</object>"],thead:[1,"<table>","</table>"],tr:[2,"<table><tbody>","</tbody></table>"],col:[2,"<table><tbody></tbody><colgroup>","</colgroup></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],_default:ia.support.htmlSerialize?[0,"",""]:[1,"X<div>","</div>"]},hb=m(W),ib=hb.appendChild(W.createElement("div"));gb.optgroup=gb.option,gb.tbody=gb.tfoot=gb.colgroup=gb.caption=gb.thead,gb.th=gb.td,ia.fn.extend({text:function(a){return ia.access(this,function(a){return a===b?ia.text(this):this.empty().append((this[0]&&this[0].ownerDocument||W).createTextNode(a))},null,a,arguments.length)},wrapAll:function(a){if(ia.isFunction(a))return this.each(function(b){ia(this).wrapAll(a.call(this,b))});if(this[0]){var b=ia(a,this[0].ownerDocument).eq(0).clone(!0);this[0].parentNode&&b.insertBefore(this[0]),b.map(function(){for(var a=this;a.firstChild&&1===a.firstChild.nodeType;)a=a.firstChild;return a}).append(this)}return this},wrapInner:function(a){return ia.isFunction(a)?this.each(function(b){ia(this).wrapInner(a.call(this,b))}):this.each(function(){var b=ia(this),c=b.contents();c.length?c.wrapAll(a):b.append(a)})},wrap:function(a){var b=ia.isFunction(a);return this.each(function(c){ia(this).wrapAll(b?a.call(this,c):a)})},unwrap:function(){return this.parent().each(function(){ia.nodeName(this,"body")||ia(this).replaceWith(this.childNodes)}).end()},append:function(){return this.domManip(arguments,!0,function(a){1!==this.nodeType&&11!==this.nodeType&&9!==this.nodeType||this.appendChild(a)})},prepend:function(){return this.domManip(arguments,!0,function(a){1!==this.nodeType&&11!==this.nodeType&&9!==this.nodeType||this.insertBefore(a,this.firstChild)})},before:function(){return this.domManip(arguments,!1,function(a){this.parentNode&&this.parentNode.insertBefore(a,this)})},after:function(){return this.domManip(arguments,!1,function(a){this.parentNode&&this.parentNode.insertBefore(a,this.nextSibling)})},remove:function(a,b){for(var c,d=0;null!=(c=this[d]);d++)(!a||ia.filter(a,[c]).length>0)&&(b||1!==c.nodeType||ia.cleanData(t(c)),c.parentNode&&(b&&ia.contains(c.ownerDocument,c)&&q(t(c,"script")),c.parentNode.removeChild(c)));return this},empty:function(){for(var a,b=0;null!=(a=this[b]);b++){for(1===a.nodeType&&ia.cleanData(t(a,!1));a.firstChild;)a.removeChild(a.firstChild);a.options&&ia.nodeName(a,"select")&&(a.options.length=0)}return this},clone:function(a,b){return a=null!=a&&a,b=null==b?a:b,this.map(function(){return ia.clone(this,a,b)})},html:function(a){return ia.access(this,function(a){var c=this[0]||{},d=0,e=this.length;if(a===b)return 1===c.nodeType?c.innerHTML.replace(Va,""):b;if("string"==typeof a&&!ab.test(a)&&(ia.support.htmlSerialize||!Wa.test(a))&&(ia.support.leadingWhitespace||!Xa.test(a))&&!gb[(Za.exec(a)||["",""])[1].toLowerCase()]){a=a.replace(Ya,"<$1></$2>");try{for(;d<e;d++)c=this[d]||{},1===c.nodeType&&(ia.cleanData(t(c,!1)),c.innerHTML=a);c=0}catch(f){}}c&&this.empty().append(a)},null,a,arguments.length)},replaceWith:function(a){var b=ia.isFunction(a);return b||"string"==typeof a||(a=ia(a).not(this).detach()),this.domManip([a],!0,function(a){var b=this.nextSibling,c=this.parentNode;c&&(ia(this).remove(),c.insertBefore(a,b))})},detach:function(a){return this.remove(a,!0)},domManip:function(a,c,d){a=ba.apply([],a);var e,f,g,h,i,j,k=0,l=this.length,m=this,q=l-1,r=a[0],s=ia.isFunction(r);if(s||!(l<=1||"string"!=typeof r||ia.support.checkClone)&&cb.test(r))return this.each(function(e){var f=m.eq(e);s&&(a[0]=r.call(this,e,c?f.html():b)),f.domManip(a,c,d)});if(l&&(j=ia.buildFragment(a,this[0].ownerDocument,!1,this),e=j.firstChild,1===j.childNodes.length&&(j=e),e)){for(c=c&&ia.nodeName(e,"tr"),h=ia.map(t(j,"script"),o),g=h.length;k<l;k++)f=j,k!==q&&(f=ia.clone(f,!0,!0),g&&ia.merge(h,t(f,"script"))),d.call(c&&ia.nodeName(this[k],"table")?n(this[k],"tbody"):this[k],f,k);if(g)for(i=h[h.length-1].ownerDocument,ia.map(h,p),k=0;k<g;k++)f=h[k],db.test(f.type||"")&&!ia._data(f,"globalEval")&&ia.contains(i,f)&&(f.src?ia.ajax({url:f.src,type:"GET",dataType:"script",async:!1,global:!1,"throws":!0}):ia.globalEval((f.text||f.textContent||f.innerHTML||"").replace(fb,"")));j=e=null}return this}}),ia.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(a,b){ia.fn[a]=function(a){for(var c,d=0,e=[],f=ia(a),g=f.length-1;d<=g;d++)c=d===g?this:this.clone(!0),ia(f[d])[b](c),ca.apply(e,c.get());return this.pushStack(e)}}),ia.extend({clone:function(a,b,c){var d,e,f,g,h,i=ia.contains(a.ownerDocument,a);if(ia.support.html5Clone||ia.isXMLDoc(a)||!Wa.test("<"+a.nodeName+">")?f=a.cloneNode(!0):(ib.innerHTML=a.outerHTML,ib.removeChild(f=ib.firstChild)),!(ia.support.noCloneEvent&&ia.support.noCloneChecked||1!==a.nodeType&&11!==a.nodeType||ia.isXMLDoc(a)))for(d=t(f),h=t(a),g=0;null!=(e=h[g]);++g)d[g]&&s(e,d[g]);if(b)if(c)for(h=h||t(a),d=d||t(f),g=0;null!=(e=h[g]);g++)r(e,d[g]);else r(a,f);return d=t(f,"script"),d.length>0&&q(d,!i&&t(a,"script")),d=h=e=null,f},buildFragment:function(a,b,c,d){for(var e,f,g,h,i,j,k,l=a.length,n=m(b),o=[],p=0;p<l;p++)if(f=a[p],f||0===f)if("object"===ia.type(f))ia.merge(o,f.nodeType?[f]:f);else if(_a.test(f)){for(h=h||n.appendChild(b.createElement("div")),i=(Za.exec(f)||["",""])[1].toLowerCase(),k=gb[i]||gb._default,h.innerHTML=k[1]+f.replace(Ya,"<$1></$2>")+k[2],e=k[0];e--;)h=h.lastChild;if(!ia.support.leadingWhitespace&&Xa.test(f)&&o.push(b.createTextNode(Xa.exec(f)[0])),!ia.support.tbody)for(f="table"!==i||$a.test(f)?"<table>"!==k[1]||$a.test(f)?0:h:h.firstChild,e=f&&f.childNodes.length;e--;)ia.nodeName(j=f.childNodes[e],"tbody")&&!j.childNodes.length&&f.removeChild(j);for(ia.merge(o,h.childNodes),h.textContent="";h.firstChild;)h.removeChild(h.firstChild);h=n.lastChild}else o.push(b.createTextNode(f));for(h&&n.removeChild(h),ia.support.appendChecked||ia.grep(t(o,"input"),u),p=0;f=o[p++];)if((!d||ia.inArray(f,d)===-1)&&(g=ia.contains(f.ownerDocument,f),h=t(n.appendChild(f),"script"),g&&q(h),c))for(e=0;f=h[e++];)db.test(f.type||"")&&c.push(f);return h=null,n},cleanData:function(a,b){for(var c,d,e,f,g=0,h=ia.expando,i=ia.cache,j=ia.support.deleteExpando,k=ia.event.special;null!=(c=a[g]);g++)if((b||ia.acceptData(c))&&(e=c[h],f=e&&i[e])){if(f.events)for(d in f.events)k[d]?ia.event.remove(c,d):ia.removeEvent(c,d,f.handle);i[e]&&(delete i[e],j?delete c[h]:typeof c.removeAttribute!==V?c.removeAttribute(h):c[h]=null,_.push(e))}}});var jb,kb,lb,mb=/alpha\([^)]*\)/i,nb=/opacity\s*=\s*([^)]*)/,ob=/^(top|right|bottom|left)$/,pb=/^(none|table(?!-c[ea]).+)/,qb=/^margin/,rb=new RegExp("^("+ja+")(.*)$","i"),sb=new RegExp("^("+ja+")(?!px)[a-z%]+$","i"),tb=new RegExp("^([+-])=("+ja+")","i"),ub={BODY:"block"},vb={position:"absolute",visibility:"hidden",display:"block"},wb={letterSpacing:0,fontWeight:400},xb=["Top","Right","Bottom","Left"],yb=["Webkit","O","Moz","ms"];ia.fn.extend({css:function(a,c){return ia.access(this,function(a,c,d){var e,f,g={},h=0;if(ia.isArray(c)){for(f=kb(a),e=c.length;h<e;h++)g[c[h]]=ia.css(a,c[h],!1,f);return g}return d!==b?ia.style(a,c,d):ia.css(a,c)},a,c,arguments.length>1)},show:function(){return x(this,!0)},hide:function(){return x(this)},toggle:function(a){var b="boolean"==typeof a;return this.each(function(){(b?a:w(this))?ia(this).show():ia(this).hide()})}}),ia.extend({cssHooks:{opacity:{get:function(a,b){if(b){var c=lb(a,"opacity");return""===c?"1":c}}}},cssNumber:{columnCount:!0,fillOpacity:!0,fontWeight:!0,lineHeight:!0,opacity:!0,orphans:!0,widows:!0,zIndex:!0,zoom:!0},cssProps:{"float":ia.support.cssFloat?"cssFloat":"styleFloat"},style:function(a,c,d,e){if(a&&3!==a.nodeType&&8!==a.nodeType&&a.style){var f,g,h,i=ia.camelCase(c),j=a.style;if(c=ia.cssProps[i]||(ia.cssProps[i]=v(j,i)),h=ia.cssHooks[c]||ia.cssHooks[i],d===b)return h&&"get"in h&&(f=h.get(a,!1,e))!==b?f:j[c];if(g=typeof d,"string"===g&&(f=tb.exec(d))&&(d=(f[1]+1)*f[2]+parseFloat(ia.css(a,c)),g="number"),!(null==d||"number"===g&&isNaN(d)||("number"!==g||ia.cssNumber[i]||(d+="px"),ia.support.clearCloneStyle||""!==d||0!==c.indexOf("background")||(j[c]="inherit"),h&&"set"in h&&(d=h.set(a,d,e))===b)))try{j[c]=d}catch(k){}}},css:function(a,c,d,e){var f,g,h,i=ia.camelCase(c);return c=ia.cssProps[i]||(ia.cssProps[i]=v(a.style,i)),h=ia.cssHooks[c]||ia.cssHooks[i],h&&"get"in h&&(g=h.get(a,!0,d)),g===b&&(g=lb(a,c,e)),"normal"===g&&c in wb&&(g=wb[c]),""===d||d?(f=parseFloat(g),d===!0||ia.isNumeric(f)?f||0:g):g},swap:function(a,b,c,d){var e,f,g={};for(f in b)g[f]=a.style[f],a.style[f]=b[f];e=c.apply(a,d||[]);for(f in b)a.style[f]=g[f];return e}}),a.getComputedStyle?(kb=function(b){return a.getComputedStyle(b,null)},lb=function(a,c,d){var e,f,g,h=d||kb(a),i=h?h.getPropertyValue(c)||h[c]:b,j=a.style;return h&&(""!==i||ia.contains(a.ownerDocument,a)||(i=ia.style(a,c)),sb.test(i)&&qb.test(c)&&(e=j.width,f=j.minWidth,g=j.maxWidth,j.minWidth=j.maxWidth=j.width=i,i=h.width,j.width=e,j.minWidth=f,j.maxWidth=g)),i}):W.documentElement.currentStyle&&(kb=function(a){return a.currentStyle},lb=function(a,c,d){var e,f,g,h=d||kb(a),i=h?h[c]:b,j=a.style;return null==i&&j&&j[c]&&(i=j[c]),sb.test(i)&&!ob.test(c)&&(e=j.left,f=a.runtimeStyle,g=f&&f.left,g&&(f.left=a.currentStyle.left),j.left="fontSize"===c?"1em":i,i=j.pixelLeft+"px",j.left=e,g&&(f.left=g)),""===i?"auto":i}),ia.each(["height","width"],function(a,b){ia.cssHooks[b]={get:function(a,c,d){if(c)return 0===a.offsetWidth&&pb.test(ia.css(a,"display"))?ia.swap(a,vb,function(){return A(a,b,d)}):A(a,b,d)},set:function(a,c,d){var e=d&&kb(a);return y(a,c,d?z(a,b,d,ia.support.boxSizing&&"border-box"===ia.css(a,"boxSizing",!1,e),e):0)}}}),ia.support.opacity||(ia.cssHooks.opacity={get:function(a,b){return nb.test((b&&a.currentStyle?a.currentStyle.filter:a.style.filter)||"")?.01*parseFloat(RegExp.$1)+"":b?"1":""},set:function(a,b){var c=a.style,d=a.currentStyle,e=ia.isNumeric(b)?"alpha(opacity="+100*b+")":"",f=d&&d.filter||c.filter||"";c.zoom=1,(b>=1||""===b)&&""===ia.trim(f.replace(mb,""))&&c.removeAttribute&&(c.removeAttribute("filter"),""===b||d&&!d.filter)||(c.filter=mb.test(f)?f.replace(mb,e):f+" "+e)}}),ia(function(){ia.support.reliableMarginRight||(ia.cssHooks.marginRight={get:function(a,b){if(b)return ia.swap(a,{display:"inline-block"},lb,[a,"marginRight"])}}),!ia.support.pixelPosition&&ia.fn.position&&ia.each(["top","left"],function(a,b){ia.cssHooks[b]={get:function(a,c){if(c)return c=lb(a,b),sb.test(c)?ia(a).position()[b]+"px":c}}})}),ia.expr&&ia.expr.filters&&(ia.expr.filters.hidden=function(a){return a.offsetWidth<=0&&a.offsetHeight<=0||!ia.support.reliableHiddenOffsets&&"none"===(a.style&&a.style.display||ia.css(a,"display"))},ia.expr.filters.visible=function(a){return!ia.expr.filters.hidden(a)}),ia.each({margin:"",padding:"",border:"Width"},function(a,b){ia.cssHooks[a+b]={expand:function(c){for(var d=0,e={},f="string"==typeof c?c.split(" "):[c];d<4;d++)e[a+xb[d]+b]=f[d]||f[d-2]||f[0];return e}},qb.test(a)||(ia.cssHooks[a+b].set=y)});var zb=/%20/g,Ab=/\[\]$/,Bb=/\r?\n/g,Cb=/^(?:submit|button|image|reset|file)$/i,Db=/^(?:input|select|textarea|keygen)/i;
ia.fn.extend({serialize:function(){return ia.param(this.serializeArray())},serializeArray:function(){return this.map(function(){var a=ia.prop(this,"elements");return a?ia.makeArray(a):this}).filter(function(){var a=this.type;return this.name&&!ia(this).is(":disabled")&&Db.test(this.nodeName)&&!Cb.test(a)&&(this.checked||!bb.test(a))}).map(function(a,b){var c=ia(this).val();return null==c?null:ia.isArray(c)?ia.map(c,function(a){return{name:b.name,value:a.replace(Bb,"\r\n")}}):{name:b.name,value:c.replace(Bb,"\r\n")}}).get()}}),ia.param=function(a,c){var d,e=[],f=function(a,b){b=ia.isFunction(b)?b():null==b?"":b,e[e.length]=encodeURIComponent(a)+"="+encodeURIComponent(b)};if(c===b&&(c=ia.ajaxSettings&&ia.ajaxSettings.traditional),ia.isArray(a)||a.jquery&&!ia.isPlainObject(a))ia.each(a,function(){f(this.name,this.value)});else for(d in a)D(d,a[d],c,f);return e.join("&").replace(zb,"+")},ia.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu".split(" "),function(a,b){ia.fn[b]=function(a,c){return arguments.length>0?this.on(b,null,a,c):this.trigger(b)}}),ia.fn.hover=function(a,b){return this.mouseenter(a).mouseleave(b||a)};var Eb,Fb,Gb=ia.now(),Hb=/\?/,Ib=/#.*$/,Jb=/([?&])_=[^&]*/,Kb=/^(.*?):[ \t]*([^\r\n]*)\r?$/gm,Lb=/^(?:about|app|app-storage|.+-extension|file|res|widget):$/,Mb=/^(?:GET|HEAD)$/,Nb=/^\/\//,Ob=/^([\w.+-]+:)(?:\/\/([^\/?#:]*)(?::(\d+)|)|)/,Pb=ia.fn.load,Qb={},Rb={},Sb="*/".concat("*");try{Fb=X.href}catch(Tb){Fb=W.createElement("a"),Fb.href="",Fb=Fb.href}Eb=Ob.exec(Fb.toLowerCase())||[],ia.fn.load=function(a,c,d){if("string"!=typeof a&&Pb)return Pb.apply(this,arguments);var e,f,g,h=this,i=a.indexOf(" ");return i>=0&&(e=a.slice(i,a.length),a=a.slice(0,i)),ia.isFunction(c)?(d=c,c=b):c&&"object"==typeof c&&(g="POST"),h.length>0&&ia.ajax({url:a,type:g,dataType:"html",data:c}).done(function(a){f=arguments,h.html(e?ia("<div>").append(ia.parseHTML(a)).find(e):a)}).complete(d&&function(a,b){h.each(d,f||[a.responseText,b,a])}),this},ia.each(["ajaxStart","ajaxStop","ajaxComplete","ajaxError","ajaxSuccess","ajaxSend"],function(a,b){ia.fn[b]=function(a){return this.on(b,a)}}),ia.each(["get","post"],function(a,c){ia[c]=function(a,d,e,f){return ia.isFunction(d)&&(f=f||e,e=d,d=b),ia.ajax({url:a,type:c,dataType:f,data:d,success:e})}}),ia.extend({active:0,lastModified:{},etag:{},ajaxSettings:{url:Fb,type:"GET",isLocal:Lb.test(Eb[1]),global:!0,processData:!0,async:!0,contentType:"application/x-www-form-urlencoded; charset=UTF-8",accepts:{"*":Sb,text:"text/plain",html:"text/html",xml:"application/xml, text/xml",json:"application/json, text/javascript"},contents:{xml:/xml/,html:/html/,json:/json/},responseFields:{xml:"responseXML",text:"responseText"},converters:{"* text":a.String,"text html":!0,"text json":ia.parseJSON,"text xml":ia.parseXML},flatOptions:{url:!0,context:!0}},ajaxSetup:function(a,b){return b?G(G(a,ia.ajaxSettings),b):G(ia.ajaxSettings,a)},ajaxPrefilter:E(Qb),ajaxTransport:E(Rb),ajax:function(a,c){function d(a,c,d,e){var f,l,s,t,v,x=c;2!==u&&(u=2,i&&clearTimeout(i),k=b,h=e||"",w.readyState=a>0?4:0,d&&(t=H(m,w,d)),a>=200&&a<300||304===a?(m.ifModified&&(v=w.getResponseHeader("Last-Modified"),v&&(ia.lastModified[g]=v),v=w.getResponseHeader("etag"),v&&(ia.etag[g]=v)),204===a?(f=!0,x="nocontent"):304===a?(f=!0,x="notmodified"):(f=I(m,t),x=f.state,l=f.data,s=f.error,f=!s)):(s=x,!a&&x||(x="error",a<0&&(a=0))),w.status=a,w.statusText=(c||x)+"",f?p.resolveWith(n,[l,x,w]):p.rejectWith(n,[w,x,s]),w.statusCode(r),r=b,j&&o.trigger(f?"ajaxSuccess":"ajaxError",[w,m,f?l:s]),q.fireWith(n,[w,x]),j&&(o.trigger("ajaxComplete",[w,m]),--ia.active||ia.event.trigger("ajaxStop")))}"object"==typeof a&&(c=a,a=b),c=c||{};var e,f,g,h,i,j,k,l,m=ia.ajaxSetup({},c),n=m.context||m,o=m.context&&(n.nodeType||n.jquery)?ia(n):ia.event,p=ia.Deferred(),q=ia.Callbacks("once memory"),r=m.statusCode||{},s={},t={},u=0,v="canceled",w={readyState:0,getResponseHeader:function(a){var b;if(2===u){if(!l)for(l={};b=Kb.exec(h);)l[b[1].toLowerCase()]=b[2];b=l[a.toLowerCase()]}return null==b?null:b},getAllResponseHeaders:function(){return 2===u?h:null},setRequestHeader:function(a,b){var c=a.toLowerCase();return u||(a=t[c]=t[c]||a,s[a]=b),this},overrideMimeType:function(a){return u||(m.mimeType=a),this},statusCode:function(a){var b;if(a)if(u<2)for(b in a)r[b]=[r[b],a[b]];else w.always(a[w.status]);return this},abort:function(a){var b=a||v;return k&&k.abort(b),d(0,b),this}};if(p.promise(w).complete=q.add,w.success=w.done,w.error=w.fail,m.url=((a||m.url||Fb)+"").replace(Ib,"").replace(Nb,Eb[1]+"//"),m.type=c.method||c.type||m.method||m.type,m.dataTypes=ia.trim(m.dataType||"*").toLowerCase().match(ka)||[""],null==m.crossDomain&&(e=Ob.exec(m.url.toLowerCase()),m.crossDomain=!(!e||e[1]===Eb[1]&&e[2]===Eb[2]&&(e[3]||("http:"===e[1]?80:443))==(Eb[3]||("http:"===Eb[1]?80:443)))),m.data&&m.processData&&"string"!=typeof m.data&&(m.data=ia.param(m.data,m.traditional)),F(Qb,m,c,w),2===u)return w;j=m.global,j&&0===ia.active++&&ia.event.trigger("ajaxStart"),m.type=m.type.toUpperCase(),m.hasContent=!Mb.test(m.type),g=m.url,m.hasContent||(m.data&&(g=m.url+=(Hb.test(g)?"&":"?")+m.data,delete m.data),m.cache===!1&&(m.url=Jb.test(g)?g.replace(Jb,"$1_="+Gb++):g+(Hb.test(g)?"&":"?")+"_="+Gb++)),m.ifModified&&(ia.lastModified[g]&&w.setRequestHeader("If-Modified-Since",ia.lastModified[g]),ia.etag[g]&&w.setRequestHeader("If-None-Match",ia.etag[g])),(m.data&&m.hasContent&&m.contentType!==!1||c.contentType)&&w.setRequestHeader("Content-Type",m.contentType),w.setRequestHeader("Accept",m.dataTypes[0]&&m.accepts[m.dataTypes[0]]?m.accepts[m.dataTypes[0]]+("*"!==m.dataTypes[0]?", "+Sb+"; q=0.01":""):m.accepts["*"]);for(f in m.headers)w.setRequestHeader(f,m.headers[f]);if(m.beforeSend&&(m.beforeSend.call(n,w,m)===!1||2===u))return w.abort();v="abort";for(f in{success:1,error:1,complete:1})w[f](m[f]);if(k=F(Rb,m,c,w)){w.readyState=1,j&&o.trigger("ajaxSend",[w,m]),m.async&&m.timeout>0&&(i=setTimeout(function(){w.abort("timeout")},m.timeout));try{u=1,k.send(s,d)}catch(x){if(!(u<2))throw x;d(-1,x)}}else d(-1,"No Transport");return w},getScript:function(a,c){return ia.get(a,b,c,"script")},getJSON:function(a,b,c){return ia.get(a,b,c,"json")}}),ia.ajaxSetup({accepts:{script:"text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"},contents:{script:/(?:java|ecma)script/},converters:{"text script":function(a){return ia.globalEval(a),a}}}),ia.ajaxPrefilter("script",function(a){a.cache===b&&(a.cache=!1),a.crossDomain&&(a.type="GET",a.global=!1)}),ia.ajaxTransport("script",function(a){if(a.crossDomain){var c,d=W.head||ia("head")[0]||W.documentElement;return{send:function(b,e){c=W.createElement("script"),c.async=!0,a.scriptCharset&&(c.charset=a.scriptCharset),c.src=a.url,c.onload=c.onreadystatechange=function(a,b){(b||!c.readyState||/loaded|complete/.test(c.readyState))&&(c.onload=c.onreadystatechange=null,c.parentNode&&c.parentNode.removeChild(c),c=null,b||e(200,"success"))},d.insertBefore(c,d.firstChild)},abort:function(){c&&c.onload(b,!0)}}}});var Ub=[],Vb=/(=)\?(?=&|$)|\?\?/;ia.ajaxSetup({jsonp:"callback",jsonpCallback:function(){var a=Ub.pop()||ia.expando+"_"+Gb++;return this[a]=!0,a}}),ia.ajaxPrefilter("json jsonp",function(c,d,e){var f,g,h,i=c.jsonp!==!1&&(Vb.test(c.url)?"url":"string"==typeof c.data&&!(c.contentType||"").indexOf("application/x-www-form-urlencoded")&&Vb.test(c.data)&&"data");if(i||"jsonp"===c.dataTypes[0])return f=c.jsonpCallback=ia.isFunction(c.jsonpCallback)?c.jsonpCallback():c.jsonpCallback,i?c[i]=c[i].replace(Vb,"$1"+f):c.jsonp!==!1&&(c.url+=(Hb.test(c.url)?"&":"?")+c.jsonp+"="+f),c.converters["script json"]=function(){return h||ia.error(f+" was not called"),h[0]},c.dataTypes[0]="json",g=a[f],a[f]=function(){h=arguments},e.always(function(){a[f]=g,c[f]&&(c.jsonpCallback=d.jsonpCallback,Ub.push(f)),h&&ia.isFunction(g)&&g(h[0]),h=g=b}),"script"});var Wb,Xb,Yb=0,Zb=a.ActiveXObject&&function(){var a;for(a in Wb)Wb[a](b,!0)};ia.ajaxSettings.xhr=a.ActiveXObject?function(){return!this.isLocal&&J()||K()}:J,Xb=ia.ajaxSettings.xhr(),ia.support.cors=!!Xb&&"withCredentials"in Xb,Xb=ia.support.ajax=!!Xb,Xb&&ia.ajaxTransport(function(c){if(!c.crossDomain||ia.support.cors){var d;return{send:function(e,f){var g,h,i=c.xhr();if(c.username?i.open(c.type,c.url,c.async,c.username,c.password):i.open(c.type,c.url,c.async),c.xhrFields)for(h in c.xhrFields)i[h]=c.xhrFields[h];c.mimeType&&i.overrideMimeType&&i.overrideMimeType(c.mimeType),c.crossDomain||e["X-Requested-With"]||(e["X-Requested-With"]="XMLHttpRequest");try{for(h in e)i.setRequestHeader(h,e[h])}catch(j){}i.send(c.hasContent&&c.data||null),d=function(a,e){var h,j,k,l;try{if(d&&(e||4===i.readyState))if(d=b,g&&(i.onreadystatechange=ia.noop,Zb&&delete Wb[g]),e)4!==i.readyState&&i.abort();else{l={},h=i.status,j=i.getAllResponseHeaders(),"string"==typeof i.responseText&&(l.text=i.responseText);try{k=i.statusText}catch(m){k=""}h||!c.isLocal||c.crossDomain?1223===h&&(h=204):h=l.text?200:404}}catch(n){e||f(-1,n)}l&&f(h,k,l,j)},c.async?4===i.readyState?setTimeout(d):(g=++Yb,Zb&&(Wb||(Wb={},ia(a).unload(Zb)),Wb[g]=d),i.onreadystatechange=d):d()},abort:function(){d&&d(b,!0)}}}});var $b,_b,ac=/^(?:toggle|show|hide)$/,bc=new RegExp("^(?:([+-])=|)("+ja+")([a-z%]*)$","i"),cc=/queueHooks$/,dc=[P],ec={"*":[function(a,b){var c,d,e=this.createTween(a,b),f=bc.exec(b),g=e.cur(),h=+g||0,i=1,j=20;if(f){if(c=+f[2],d=f[3]||(ia.cssNumber[a]?"":"px"),"px"!==d&&h){h=ia.css(e.elem,a,!0)||c||1;do i=i||".5",h/=i,ia.style(e.elem,a,h+d);while(i!==(i=e.cur()/g)&&1!==i&&--j)}e.unit=d,e.start=h,e.end=f[1]?h+(f[1]+1)*c:c}return e}]};ia.Animation=ia.extend(N,{tweener:function(a,b){ia.isFunction(a)?(b=a,a=["*"]):a=a.split(" ");for(var c,d=0,e=a.length;d<e;d++)c=a[d],ec[c]=ec[c]||[],ec[c].unshift(b)},prefilter:function(a,b){b?dc.unshift(a):dc.push(a)}}),ia.Tween=Q,Q.prototype={constructor:Q,init:function(a,b,c,d,e,f){this.elem=a,this.prop=c,this.easing=e||"swing",this.options=b,this.start=this.now=this.cur(),this.end=d,this.unit=f||(ia.cssNumber[c]?"":"px")},cur:function(){var a=Q.propHooks[this.prop];return a&&a.get?a.get(this):Q.propHooks._default.get(this)},run:function(a){var b,c=Q.propHooks[this.prop];return this.options.duration?this.pos=b=ia.easing[this.easing](a,this.options.duration*a,0,1,this.options.duration):this.pos=b=a,this.now=(this.end-this.start)*b+this.start,this.options.step&&this.options.step.call(this.elem,this.now,this),c&&c.set?c.set(this):Q.propHooks._default.set(this),this}},Q.prototype.init.prototype=Q.prototype,Q.propHooks={_default:{get:function(a){var b;return null==a.elem[a.prop]||a.elem.style&&null!=a.elem.style[a.prop]?(b=ia.css(a.elem,a.prop,""),b&&"auto"!==b?b:0):a.elem[a.prop]},set:function(a){ia.fx.step[a.prop]?ia.fx.step[a.prop](a):a.elem.style&&(null!=a.elem.style[ia.cssProps[a.prop]]||ia.cssHooks[a.prop])?ia.style(a.elem,a.prop,a.now+a.unit):a.elem[a.prop]=a.now}}},Q.propHooks.scrollTop=Q.propHooks.scrollLeft={set:function(a){a.elem.nodeType&&a.elem.parentNode&&(a.elem[a.prop]=a.now)}},ia.each(["toggle","show","hide"],function(a,b){var c=ia.fn[b];ia.fn[b]=function(a,d,e){return null==a||"boolean"==typeof a?c.apply(this,arguments):this.animate(R(b,!0),a,d,e)}}),ia.fn.extend({fadeTo:function(a,b,c,d){return this.filter(w).css("opacity",0).show().end().animate({opacity:b},a,c,d)},animate:function(a,b,c,d){var e=ia.isEmptyObject(a),f=ia.speed(b,c,d),g=function(){var b=N(this,ia.extend({},a),f);g.finish=function(){b.stop(!0)},(e||ia._data(this,"finish"))&&b.stop(!0)};return g.finish=g,e||f.queue===!1?this.each(g):this.queue(f.queue,g)},stop:function(a,c,d){var e=function(a){var b=a.stop;delete a.stop,b(d)};return"string"!=typeof a&&(d=c,c=a,a=b),c&&a!==!1&&this.queue(a||"fx",[]),this.each(function(){var b=!0,c=null!=a&&a+"queueHooks",f=ia.timers,g=ia._data(this);if(c)g[c]&&g[c].stop&&e(g[c]);else for(c in g)g[c]&&g[c].stop&&cc.test(c)&&e(g[c]);for(c=f.length;c--;)f[c].elem!==this||null!=a&&f[c].queue!==a||(f[c].anim.stop(d),b=!1,f.splice(c,1));!b&&d||ia.dequeue(this,a)})},finish:function(a){return a!==!1&&(a=a||"fx"),this.each(function(){var b,c=ia._data(this),d=c[a+"queue"],e=c[a+"queueHooks"],f=ia.timers,g=d?d.length:0;for(c.finish=!0,ia.queue(this,a,[]),e&&e.cur&&e.cur.finish&&e.cur.finish.call(this),b=f.length;b--;)f[b].elem===this&&f[b].queue===a&&(f[b].anim.stop(!0),f.splice(b,1));for(b=0;b<g;b++)d[b]&&d[b].finish&&d[b].finish.call(this);delete c.finish})}}),ia.each({slideDown:R("show"),slideUp:R("hide"),slideToggle:R("toggle"),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"},fadeToggle:{opacity:"toggle"}},function(a,b){ia.fn[a]=function(a,c,d){return this.animate(b,a,c,d)}}),ia.speed=function(a,b,c){var d=a&&"object"==typeof a?ia.extend({},a):{complete:c||!c&&b||ia.isFunction(a)&&a,duration:a,easing:c&&b||b&&!ia.isFunction(b)&&b};return d.duration=ia.fx.off?0:"number"==typeof d.duration?d.duration:d.duration in ia.fx.speeds?ia.fx.speeds[d.duration]:ia.fx.speeds._default,null!=d.queue&&d.queue!==!0||(d.queue="fx"),d.old=d.complete,d.complete=function(){ia.isFunction(d.old)&&d.old.call(this),d.queue&&ia.dequeue(this,d.queue)},d},ia.easing={linear:function(a){return a},swing:function(a){return.5-Math.cos(a*Math.PI)/2}},ia.timers=[],ia.fx=Q.prototype.init,ia.fx.tick=function(){var a,c=ia.timers,d=0;for($b=ia.now();d<c.length;d++)a=c[d],a()||c[d]!==a||c.splice(d--,1);c.length||ia.fx.stop(),$b=b},ia.fx.timer=function(a){a()&&ia.timers.push(a)&&ia.fx.start()},ia.fx.interval=13,ia.fx.start=function(){_b||(_b=setInterval(ia.fx.tick,ia.fx.interval))},ia.fx.stop=function(){clearInterval(_b),_b=null},ia.fx.speeds={slow:600,fast:200,_default:400},ia.fx.step={},ia.expr&&ia.expr.filters&&(ia.expr.filters.animated=function(a){return ia.grep(ia.timers,function(b){return a===b.elem}).length}),ia.fn.offset=function(a){if(arguments.length)return a===b?this:this.each(function(b){ia.offset.setOffset(this,a,b)});var c,d,e={top:0,left:0},f=this[0],g=f&&f.ownerDocument;if(g)return c=g.documentElement,ia.contains(c,f)?(typeof f.getBoundingClientRect!==V&&(e=f.getBoundingClientRect()),d=S(g),{top:e.top+(d.pageYOffset||c.scrollTop)-(c.clientTop||0),left:e.left+(d.pageXOffset||c.scrollLeft)-(c.clientLeft||0)}):e},ia.offset={setOffset:function(a,b,c){var d=ia.css(a,"position");"static"===d&&(a.style.position="relative");var e,f,g=ia(a),h=g.offset(),i=ia.css(a,"top"),j=ia.css(a,"left"),k=("absolute"===d||"fixed"===d)&&ia.inArray("auto",[i,j])>-1,l={},m={};k?(m=g.position(),e=m.top,f=m.left):(e=parseFloat(i)||0,f=parseFloat(j)||0),ia.isFunction(b)&&(b=b.call(a,c,h)),null!=b.top&&(l.top=b.top-h.top+e),null!=b.left&&(l.left=b.left-h.left+f),"using"in b?b.using.call(a,l):g.css(l)}},ia.fn.extend({position:function(){if(this[0]){var a,b,c={top:0,left:0},d=this[0];return"fixed"===ia.css(d,"position")?b=d.getBoundingClientRect():(a=this.offsetParent(),b=this.offset(),ia.nodeName(a[0],"html")||(c=a.offset()),c.top+=ia.css(a[0],"borderTopWidth",!0),c.left+=ia.css(a[0],"borderLeftWidth",!0)),{top:b.top-c.top-ia.css(d,"marginTop",!0),left:b.left-c.left-ia.css(d,"marginLeft",!0)}}},offsetParent:function(){return this.map(function(){for(var a=this.offsetParent||W.documentElement;a&&!ia.nodeName(a,"html")&&"static"===ia.css(a,"position");)a=a.offsetParent;return a||W.documentElement})}}),ia.each({scrollLeft:"pageXOffset",scrollTop:"pageYOffset"},function(a,c){var d=/Y/.test(c);ia.fn[a]=function(e){return ia.access(this,function(a,e,f){var g=S(a);return f===b?g?c in g?g[c]:g.document.documentElement[e]:a[e]:void(g?g.scrollTo(d?ia(g).scrollLeft():f,d?f:ia(g).scrollTop()):a[e]=f)},a,e,arguments.length,null)}}),ia.each({Height:"height",Width:"width"},function(a,c){ia.each({padding:"inner"+a,content:c,"":"outer"+a},function(d,e){ia.fn[e]=function(e,f){var g=arguments.length&&(d||"boolean"!=typeof e),h=d||(e===!0||f===!0?"margin":"border");return ia.access(this,function(c,d,e){var f;return ia.isWindow(c)?c.document.documentElement["client"+a]:9===c.nodeType?(f=c.documentElement,Math.max(c.body["scroll"+a],f["scroll"+a],c.body["offset"+a],f["offset"+a],f["client"+a])):e===b?ia.css(c,d,h):ia.style(c,d,e,h)},c,g?e:b,g,null)}})}),a.jQuery=a.$=ia,"function"==typeof define&&define.amd&&define.amd.jQuery&&define("jquery",[],function(){return ia})}(window),jQuery.noConflict(),/*!
 * Respond.to.js
 * Copyright 2014 Collin Bourdage.
 *
 * Lightweight javascript library to help facilitate javascript development
 * for responsive development. Implements simple api to call, retrieve, and
 * add callbacks to a stack of media query objects.
 *
 * Stack object looks like the following:
 * array(
 * 		'960' : array(object, object),
 *      '760' : array(object, object)
 * ));
 */
function(){function a(a){c._respond(a)}var b=this,c=b.Respond={};c._push=function(c,d){var e=this._purify(c);return this._mediaStack||(this._mediaStack={}),this._mediaStack[e]||(this._mediaStack[e]={mql:null,items:[]}),this._mediaStack[e].mql||(b.matchMedia?(this._mediaStack[e].mql=b.matchMedia(c),this._mediaStack[e].mql.addListener(a)):this._mediaStack[e].mql={keyValue:null},this._mediaStack[e].mql.keyValue=e),d.ready=!0,this._mediaStack[e].items.push(d),this},c._purify=function(a,b){return b||(b="_"),a.toLowerCase().replace(/[\s\-:()]/g,b).replace(/__/g,b).replace(/(_)$/,"")},c._respond=function(a,b){var c=a.keyValue||a.target.keyValue;if(navigator.userAgent.match(/MSIE 9.0/)&&(c=this._purify(a.media)),this._mediaStack[c]){if(navigator.userAgent.match(/MSIE 8.0/)){for(var d=0;d<this._mediaStack[c].items.length;d++){var e=this._mediaStack[c].items[d],f=e.fallback||"if";"function"==typeof e[f]&&(b&&e.namespace!=b||e[f]())}return this}for(var g=a.matches?"if":"else",d=0;d<this._mediaStack[c].items.length;d++){var e=this._mediaStack[c].items[d];"function"==typeof e[g]&&(b&&e.namespace!=b||e[g]())}return this}},c._retrieve=function(a,b){if(this._mediaStack){var c=[];if(b){var d=this._purify(b);if(!this._mediaStack[d])return;c=this._mediaStack[d].items}else for(var d in this._mediaStack)for(var e=0;e<this._mediaStack[d].items.length;e++)c.push(this._mediaStack[d].items[e]);for(var e=0;e<c.length;e++)if(c[e].namespace===a)return c[e]}},c.to=function(a){if(a.length)for(var b=0;b<a.length;b++)this.to(a[b]);else{var c=this._retrieve(a.namespace,a.media);"undefined"==typeof c&&(c=this._push(a.media,a)._retrieve(a.namespace,a.media),c.ready&&(this._respond(this._mediaStack[this._purify(a.media)].mql,a.namespace),c.ready=!1))}return this},c.ready=function(){for(var a in this._mediaStack)this._respond(this._mediaStack[a].mql);return this},c.getStack=function(a){return this._mediaStack[a]||this._mediaStack},c.remove=function(b,c){var d=this._purify(b);if(this._mediaStack.length||this._mediaStack[d]){if(!c)return this._mediaStack[d].mql.removeListener(a),delete this._mediaStack[d],this;for(var e=0;e<this._mediaStack[d].items.length;e++)this._mediaStack[d].items[e].namespace===c&&(delete this._mediaStack[d].items[e],this._mediaStack[d].items.splice(e,1));return this}},c.call=function(a,b,c){try{c&&b?this._retrieve(a,c)[b](this):b?this._retrieve(a)[b](this):this._respond(this._mediaStack[this._purify(this._retrieve(a).media)].mql,a)}catch(d){console.error(d)}return this}}.call(this),function(a){a.fn.unveil=function(b,c){function d(){var b=l.filter(function(){var b=a(this);if(!b.is(":hidden")){var c=f.scrollTop(),d=c+f.height(),e=b.offset().top,h=e+b.height();return h>=c-g&&e<=d+g}});e=b.trigger("unveil"),l=l.not(e)}var e,f=a(window),g=b||100,h=window.matchMedia("(max-width: 768px)"),i=h.matches,j=i?"data-src-mobile":"data-src",k=i?"data-bg-mobile":"data-bg",l=this;return this.one("unveil",function(){var b=this,d=this.getAttribute(k)?this.getAttribute(k):this.getAttribute("data-bg"),e=d?d:this.getAttribute(j);if(e=e||this.getAttribute("data-src")||this.getAttribute("data-bg")){var f=new Image;f.setAttribute("src",e),a(f).on("load",function(){d?b.style.backgroundImage="url('"+e+"')":b.setAttribute("src",e),"function"==typeof c&&c.call(b)})}else"function"==typeof c&&c.call(b)}),f.on("scroll.unveil resize.unveil lookup.unveil",d),d(),this}}(window.jQuery||window.Zepto),/*!
 * hoverIntent v1.8.1 // 2014.08.11 // jQuery v1.9.1+
 * http://cherne.net/brian/resources/jquery.hoverIntent.html
 *
 * You may use hoverIntent under the terms of the MIT license. Basically that
 * means you are free to use hoverIntent as long as this header is left intact.
 * Copyright 2007, 2014 Brian Cherne
 */
function(a){a.fn.hoverIntent=function(b,c,d){var e={interval:100,sensitivity:6,timeout:0};e="object"==typeof b?a.extend(e,b):a.isFunction(c)?a.extend(e,{over:b,out:c,selector:d}):a.extend(e,{over:b,out:b,selector:c});var f,g,h,i,j=function(a){f=a.pageX,g=a.pageY},k=function(b,c){return c.hoverIntent_t=clearTimeout(c.hoverIntent_t),Math.sqrt((h-f)*(h-f)+(i-g)*(i-g))<e.sensitivity?(a(c).off("mousemove.hoverIntent",j),c.hoverIntent_s=!0,e.over.apply(c,[b])):(h=f,i=g,c.hoverIntent_t=setTimeout(function(){k(b,c)},e.interval),void 0)},l=function(a,b){return b.hoverIntent_t=clearTimeout(b.hoverIntent_t),b.hoverIntent_s=!1,e.out.apply(b,[a])},m=function(b){var c=a.extend({},b),d=this;d.hoverIntent_t&&(d.hoverIntent_t=clearTimeout(d.hoverIntent_t)),"mouseenter"===b.type?(h=c.pageX,i=c.pageY,a(d).on("mousemove.hoverIntent",j),d.hoverIntent_s||(d.hoverIntent_t=setTimeout(function(){k(c,d)},e.interval))):(a(d).off("mousemove.hoverIntent",j),d.hoverIntent_s&&(d.hoverIntent_t=setTimeout(function(){l(c,d)},e.timeout)))};return this.on({"mouseenter.hoverIntent":m,"mouseleave.hoverIntent":m},e.selector)}}(jQuery);
if("undefined"==typeof Gorilla)var Gorilla={};(function(a){this.utilities={$globalMsgs:a("#global-messages"),activeClass:"gor-active",inactiveClass:"gor-inactive",transitioningClass:"gor-transitioning",plugins:{initializer:function(b){a.fn[b]=function(c){if(!Gorilla.hasOwnProperty(b))throw"The Gorilla "+b+" plugin is not defined in the Gorilla namespace.";var d=Array.prototype.slice.call(arguments,1),e=function(e,f){var g,h=a(f),i=h.data(b),j=!1;return i||(h.is(":visible")||h.data("force")===!0)&&!h.hasClass("ignore")||"Modal"==b||"Tipsy"==b?(i||(j=!0,g=a.extend({},Gorilla[b].defaults,"object"==typeof c?c:{}),i=new Gorilla[b](f,g),h.data(b,i)),"undefined"!=typeof c&&"string"==typeof c&&(i[c]?i[c].apply(i,d):console.error("The "+c+" method is not supported.")),f):f};return this.map(e)}},dataBinder:function(b){var c,d={},e=a(this);if(e.data(b.toSnakeCase()))e.on("click."+b+" touch."+b,function(c){var d=a(e.data("target")||e.attr("href"));d[b].apply(d,[e.data(b.toSnakeCase()),e.data()]),(e.is("a")||e.is("button"))&&c.preventDefault()});else{for(c in Gorilla[b].defaults)Gorilla[b].defaults.hasOwnProperty(c)&&e.data()[c]&&(d[c]=e.data(c));e[b](d)}}},addError:function(a,b){this.addMessage("error",a,b)},addMessage:function(a,b,c,d){var e=d?d:this.$globalMsgs;switch(c||(c=!1),a){case"success":var f='<ul class="success-msg"><li>'+b+"</li></ul>";if(c)var g=e.find(".messages");break;case"error":var f='<ul class="error-msg"><li>'+b+"</li></ul>";if(c)var g=e.find(".messages");break;default:var f='<ul class="note-msg"><li>'+b+"</li></ul>";if(c)var g=e.find(".messages")}c?g.length?g.after(f):e.append('<ul class="messages"><li>'+f+"</li></ul>"):e.html('<ul class="messages"><li>'+f+"</li></ul>")},addMessages:function(a,b){if(b||(b="error"),this.clearMessages(),a instanceof Array)for(var c=0;c<a.length;c++)this.addMessage(b,a[c],!0);else this.addMessage(b,a,!0)},addSuccess:function(a,b){this.addMessage("success",a,b)},checkTransition:function(b,c,d,e){a.support.transition?b.one(a.support.transition.end,function(a){"function"==typeof e&&e(),b.trigger({type:c,extra:d})}):("function"==typeof e&&e(),b.trigger({type:c,extra:d}))},clearMessages:function(){this.$globalMsgs.html("")},customizeSelects:function(b){var c;c="undefined"==typeof b?a("body").find("select"):b.is("select")?b:b.find("select"),c.length&&c.CustomSelects({customOptions:!1})},debounce:function(a,b){var c=null;return function(){var d=this,e=arguments;clearTimeout(c),c=setTimeout(function(){a.apply(d,e)},b)}},equalHeightCalculation:function(b,c){b.not(".ignore").each(function(b,d){var e=0;a(d).find(c).each(function(b,c){a(c).outerHeight()>e&&(e=a(c).outerHeight())}),a(d).find(c).css("min-height",e+"px")})},equalHeightByRowCalculation:function(b,c,d){b.not(".ignore").each(function(b,e){var f=a(e).children();f.removeClass("height-fixed");var g=0,h=-1,i=[],j=[];a(e).find(c).each(function(b,c){var e=a(c);h<0?h=e.position().top:h!=e.position().top&&(h=e.position().top,j.push({height:g,children:i}),g=0,i=[]);var f=parseInt(e.find(d).css("height"));f>g&&(g=f+1),i.push(c)}),a(j).each(function(b,c){a(c.children).css("height",c.height)}),a(i).css("height",g+"px"),f.addClass("height-fixed")})},getPrefix:function(a){for(var b=["-webkit-","-moz-","-o-","-ms-",""],c=document.createElement("div").style,d=0;d<b.length;++d)if(void 0!==c[b[d]+a])return b[d]+a},heightCalculation:function(a,b,c,d){c||(c=500),window.setTimeout(function(){Gorilla.utilities.equalHeightCalculation(a,b),"function"==typeof d&&d()},c)},prepareURL:function(a){return a.replace(/http:|https:/,"")},resetInputs:function(a){"use strict";a.find("select").CustomSelects("reset")},scrollTo:function(b,c,d){var e=!1,f=0;"object"==typeof c?(e=c.check||e,f=c.threshold||f):e=c,d||(d=300),(!e||e&&b.offset().top-f<window.scrollY)&&a("html, body").animate({scrollTop:b.offset().top-f},d)},rowHeightCalculation:function(a,b,c,d,e){d||(d=500),window.setTimeout(function(){Gorilla.utilities.equalHeightByRowCalculation(a,b,c),"function"==typeof e&&e()},d)},throttle:function(a,b,c){var d,e;return b||(b=250),function(){var f=c||this,g=+new Date,h=arguments;d&&g<d+b?(clearTimeout(e),e=setTimeout(function(){d=g,a.apply(f,h)},b)):(d=g,a.apply(f,h))}},initCarousel:function(a){function b(){h=setInterval(function(){a.scooch("move",a.find(".active").index()+1+1)},5e3)}var c=a.find(".slide");if(!a[0]._scooch)if(c.length>1){if(a.scooch({classPrefix:"",classNames:{outer:"carousel",inner:"slides",item:"slide",center:"center",touch:"has-touch",dragging:"dragging",active:"active"}}),!a.hasClass("no-nav")){for(var d='<ul class="carousel-indicators">',e=0;e<c.length;e++){var f=e+1,g=0==e?"active":"";d+='<li class="'+g+'" data-m-slide="'+f+'"><span class="sr-only">'+f+"</span></li>"}d+="</ul>",a.append(d),a.append('<button type="button" class="left carousel-control" data-m-slide="prev"><i class="icon-arrow-left"></i></button><button type="button" class="right carousel-control" data-m-slide="next"><i class="icon-arrow-right"></i></button>')}if(a.hasClass("no-carousel")||a.on("afterSlide",function(a,b,c){var d=jQuery(this),e=d.find(".slide").length;1===c&&1===b&&d.scooch("move",e),c===e&&b===e&&d.scooch("move",1)}),a.hasClass("auto")){var h;b(),a.on({mouseover:function(){clearInterval(h)},mouseout:function(){b()}})}}else 1==c.length&&c.addClass("active")},destroyCarousel:function(a){a[0]._scooch&&a.scooch("destroy")}}}).call(Gorilla,window.jQuery),+function(a){"use strict";function b(){var a=document.createElement("bootstrap"),b={WebkitTransition:"webkitTransitionEnd",MozTransition:"transitionend",OTransition:"oTransitionEnd otransitionend",transition:"transitionend"};for(var c in b)if(void 0!==a.style[c])return{end:b[c]}}a.fn.emulateTransitionEnd=function(b){var c=!1,d=this,e=function(){c||a(d).trigger(a.support.transition.end)};return a(this).one(a.support.transition.end,function(){c=!0}),setTimeout(e,b),this},a(function(){a.support.transition=b()})}(window.jQuery),String.prototype.toSnakeCase=function(){var a=this.replace(/([A-Z])/g,function(a){return"-"+a.toLowerCase()});return"-"===a.charAt(0)?a.substring(1):a},function(a){"use strict";function b(){var b=this;this.$el.on("click."+d,this.options.headers,function(c){b.activate(a(this)),c.preventDefault()})}function c(a){return"string"==typeof a&&(a=parseInt(a)),"number"!=typeof a||isNaN(a)||(a=this.$headers.eq(a)),"object"==typeof a&&!a.jquery&&a.hasOwnProperty("index")&&(a=this.$headers.eq(a.index)),a}var d="Accordion",e=this,f=e.Accordion=function(c,e){return this.$el=a(c),this.options=a.extend({},f.defaults,e),this.version="1.1.0",this.$headers=this.$el.find(this.options.headers).attr("role","tab"),this.$containers=this.$el.find(this.options.containers).attr("role","tabpanel"),this.busy=!1,b.call(this),this.$el.trigger("ready."+d),this};f.defaults={headers:".accordion-header",containers:".accordion-content",toggle:!1,transitionSpeed:500,activeClass:e.hasOwnProperty("utilities")?e.utilities.activeClass:"gor-active",inactiveClass:e.hasOwnProperty("utilities")?e.utilities.inactiveClass:"gor-inactive",transitioningClass:e.hasOwnProperty("utilities")?e.utilities.transitioningClass:"gor-transitioning"},f.prototype={activate:function(b){var d=this;return b=c.call(d,b),this.busy?d.$el:(this.busy=!0,this.options.toggle&&!b.hasClass(d.options.activeClass)&&this.$headers.not(b).each(function(){d.collapse(a(this))}),this[b.hasClass(d.options.activeClass)?"collapse":"expand"](b),d.$el)},collapseAll:function(){var b=this;return this.$headers.each(function(){b.collapse(a(this))}),this.$el},expand:function(a){var b,f=this,g=0;if(a=c.call(f,a),b=a.next(f.$containers),!b.length||b.hasClass(f.options.activeClass))return f.$el;var h={header:a,container:b};return f.$el.trigger({type:"expanding."+d,extra:h}),b.children().each(function(a,b){g+=b.offsetHeight}),b.data("controlledBy",a).css("height",g+"px"),a.addClass(f.options.activeClass).attr("aria-expanded",!0),b.removeClass(f.options.inactiveClass).addClass([f.options.activeClass,f.options.transitioningClass].join(" ")),e.utilities.checkTransition(b,"expanded."+d,h,function(){f.busy=!1,b.removeClass(f.options.transitioningClass),b.css("height","auto"),f.$el.trigger("opened."+d,h)}),f.$el},collapse:function(b){var f,g=this,h=0;if(b=c.call(g,b),f=b.next(g.$containers),!f.length||!f.hasClass(g.options.activeClass))return g.$el;var i={header:b,container:f};return g.$el.trigger("collapsing."+d,i),f.children().each(function(a,b){h+=b.offsetHeight}),f.data("controlledBy",b).css("height",h+"px"),a.support.transition&&f[0]&&f[0].offsetWidth,b.removeClass(g.options.activeClass).attr("aria-expanded",!1),f.removeClass(g.options.activeClass).addClass([g.options.inactiveClass,g.options.transitioningClass].join(" ")),e.utilities.checkTransition(f,"collapsed."+d,i,function(){g.busy=!1,f.removeClass(g.options.transitioningClass),f.css("height",""),g.$el.trigger("closed."+d,i)}),g.$el},reset:function(){return this.unset(),b.call(this),this.$el},unset:function(){return this.$headers.removeClass(this.options.activeClass).removeAttr("role"),this.$containers.css("height","").removeAttr("role").removeClass([this.options.activeClass,this.options.inactiveClass,this.options.transitioningClass].join(" ")),this.$el.off("click."+d),a.support.transition&&this.$el.off(a.support.transition.end+"."+d),this.$el.removeData(d),this.$el}},e.utilities.plugins.initializer.call(f,d),a(function(){a("[data-accordion]").each(function(){e.utilities.plugins.dataBinder.call(this,d)})})}.call(window.Gorilla,window.jQuery),function(a){"use strict";var b="CustomFileInputs",c=this,d=c.CustomFileInputs=function(b,c){this.$el=a(b),this.options=a.extend({},d.defaults,c),this.version="1.0.0",this._bindEvents()};d.defaults={},d.prototype={_bindEvents:function(){var c=this,d=a('<div class="custom-styled-input" />'),e='<span class="label">'+this.$el.data("placeholder")+'</span><span class="file-name">No File Chosen</span> ';this.$el.wrap(d),this.$el.before(e),this.$housing=this.$el.parent(),this.$label=this.$housing.find(".label"),this.$fileName=this.$housing.find(".file-name"),this.$el.on("change."+b,function(b){var d=a(this),e=d.val().replace(/^.*[\\\/]/,"");e?c.$fileName.text(e):c.$fileName.text("No File Chosen")})},reset:function(){this.unset(),this._bindEvents()},unset:function(){this.$el.off("."+b)},respond:function(){return this}},c.utilities.plugins.initializer.call(d,b)}.call(window.Gorilla,window.jQuery),function(a){"use strict";function b(){if(this.$housing&&this.$housing.length)return!1;var b=a('<div class="custom-styled-select" />'),d='<span class="outer"><span class="inner">'+this.$el.find(":selected").text()+"</span></span>";return b.css({display:"inline-block",position:"relative"}),this.$el.wrap(b),this.$el.before(d),this.$el.css({position:"absolute",opacity:0,left:0,top:0}).addClass("styled-select"),this.$housing=this.$el.parent(),this.$spanOuter=this.$housing.find("> span"),this.$spanInner=this.$spanOuter.find("> span"),this.$spanOuter.css({display:"inline-block"}),this.$spanInner.css({display:"inline-block"}),this.options.customOptions&&(this.$optionList=a('<ul class="custom-options" />').appendTo(this.$housing.addClass("with-custom-options"))),c.call(this),this.$el.trigger("ready."+e),!0}function c(){this.$housing.removeClass("disabled readonly"),this.$el.prop("disabled")&&this.$housing.addClass("disabled"),this.$el.prop("readonly")&&this.$housing.addClass("readonly")}function d(){var a=this;a.$el.on("change."+e,function(b){if(a.updateText(),a.options.customOptions){var c=a.$optionList.find("li").eq(a.$el.find(":selected").index());a.$el.data("customKey")&&(c.length&&a.scrollToItem(c),a.$el.data("customKey",!1)),a.$optionList.find(".activated").removeClass("activated"),a.$optionList.find(".selected").removeClass("selected"),c.addClass("selected")}return!0}).on("keyup."+e,function(b){a.updateText()}).on("focus."+e,function(b){a.$housing.addClass("focus")}).on("blur."+e,function(b){if(a.$housing.removeClass("focus"),a.options.customOptions&&a.$spanOuter.hasClass("open")){var c=function(){a.$optionList.data("keep-open")?a.$optionList.data("scrolling")||f.utilities.debounce(c,100)():a.$spanOuter.trigger("close."+e)};f.utilities.debounce(c,100)()}}),this.options.customOptions&&a._bindOptionsEvents.call(a)}var e="CustomSelects",f=this,g=f.CustomSelects=function(c,e){this.$el=a(c),this.options=a.extend({},g.defaults,e),this.version="1.1.0",b.call(this)&&d.call(this)};g.defaults={customOptions:!1},g.prototype={updateSelectionByKeyEvent:function(a){var b=this,c=a.which,d=b.$optionList.find(".activated");if(d.removeClass("activated"),b.$optionList.hasClass("open"))38===c?(a.preventDefault(),d.length&&d.index()>0?d.prev().addClass("activated"):b.$optionList.find("li:last-child").addClass("activated")):40===c?(a.preventDefault(),d.length&&d.index()<b.$optionList.find("li").length-1?d.next().addClass("activated"):b.$optionList.find("li:first-child").addClass("activated")):27===c?(a.preventDefault(),b.$spanOuter.trigger("click")):13===c||32===c?(a.preventDefault(),d.trigger("click")):9===c?b.$spanOuter.hasClass("open")&&b.$spanOuter.trigger("close."+e):b.$el.data("customKey",c),b.scrollToItem(b.$optionList.find(".activated"));else if(13===c||32===c)return a.preventDefault(),b.$spanOuter.trigger("click")},scrollToItem:function(a){var b=this;if(a.length){var c=a.position().top,d=a.outerHeight(),e=b.$optionList.scrollTop();c<0?b.$optionList.scrollTop(e+c):c+d>b.$optionList.innerHeight()&&b.$optionList.scrollTop(e+c+d-b.$optionList.innerHeight())}},update:function(){var b=this,c=[];b.options.customOptions?("undefined"==typeof b.$optionList&&(b.$optionList=a('<ul class="custom-options" />').appendTo(b.$housing),b._bindOptionsEvents.call(b)),b.$housing.addClass("with-custom-options"),b.$el.find("option").each(function(){var b,d,e=this,f=a("<li />");if("undefined"!=typeof e.attributes)for(b=e.attributes,e.selected&&f.addClass("selected activated"),e.value&&f.attr("data-raw-value",e.value),d=0;d<b.length;d++){var g=b[d].name;"selected"!==g&&"value"!==g&&(0==g.indexOf("data")?f.attr(g,e.getAttribute(g)):f.addClass(g+"-"+e.getAttribute(g)))}c.push(f.text(e.innerText).get(0).outerHTML)}),b.$optionList.html(c.join(""))):("undefined"!=typeof b.$optionList&&b.$optionList.empty(),b.$housing.removeClass("with-custom-options")),b.updateText()},updateText:function(){this.$spanInner.text(this.$el.find(":selected").text()),c.call(this)},select:function(a){"object"==typeof a&&(a=a.value),this.$el.val(a),this.options.customOptions?this.update():this.updateText()},insert:function(a){var b=a,c=a;if("object"==typeof a){if(!a.hasOwnProperty("label")&&!a.hasOwnProperty("value"))throw"You cannot insert an option without label nor value";b=a.value||a.label,c=a.label||a.value}this.$el.append('<option value="{value}">{label}</option>'.replace("{label}",c).replace("{value}",b)),this.options.customOptions?this.update():this.updateText()},show:function(){"undefined"!=typeof this.$housing&&this.$housing.css({display:"inline-block"})},hide:function(){"undefined"!=typeof this.$housing&&this.$housing.hide()},reset:function(a){this.unset(),"undefined"!=typeof a&&(this.options=a),b.call(this)&&d.call(this)},unset:function(){if(this.$el.hasClass("styled-select")){this.options.customOptions&&(this.$housing.off("."+e),this.$spanOuter.off("."+e));var a=this.$el.removeClass("styled-select").attr("style","").off("."+e);this.$housing.before(a).remove(),this.$housing=null,this.$spanOuter=null,this.$spanInner=null}},respond:function(){return this}},f.utilities.plugins.initializer.call(g,e),a(function(){a("[data-custom-selects]").each(function(){f.utilities.plugins.dataBinder.call(this,e)})})}.call(window.Gorilla,window.jQuery),function(a){"use strict";function b(){var b=this;a(window).on("scroll."+c,d.utilities.throttle(function(c){b.fix(a(this).scrollTop()),b.contentHeight=b.$content.outerHeight(!0),b.containerHeight=b.$el.outerHeight(!0)},60)),a(window).on("resize."+c,d.utilities.throttle(function(a){b.options.threshold=b.options.threshold||b.$content.offset().top-parseFloat(b.$content.css("marginTop").replace(/auto/,0)),b.containerHeight=parseInt(b.$el.css("height")),b.contentHeight=b.$content.outerHeight(!0)},100))}var c="Fixed",d=this,e=d.Fixed=function(c,d){return this.$el=a(c).addClass("fixed-wrapper"),this.options=a.extend({},e.defaults,d),this.version="1.1.0",this.$content=this.$el.find(this.options.content),this.options.threshold=this.options.threshold||this.$content.offset().top-parseFloat(this.$content.css("marginTop").replace(/auto/,0)),this.containerHeight=this.$el.outerHeight(!0),this.contentHeight=this.$content.outerHeight(!0),"function"==typeof this.options.fix&&(this.fix=this.options.fix),this.fix(a(window).scrollTop()),b.call(this),this};e.defaults={content:".fixed-content",threshold:null,fix:null},e.prototype={fix:function(a){return a>=this.options.threshold+this.containerHeight-this.contentHeight?this.$content.addClass("floored"):a>=this.options.threshold?this.$content.addClass("fixed"):this.$content.removeClass("fixed floored"),this.$el},reset:function(){return this.unset(),b.call(this),this.fix(a(window).scrollTop()),this.$el},unset:function(){return this.$content.removeClass("fixed floored"),this.$el.removeClass("fixed-wrapper"),a(window).off("."+c),this.$el.removeData(c),this.$el},respond:function(a){return this.unset()}},d.utilities.plugins.initializer.call(e,c),a(function(){a("[data-fixed]").each(function(){d.utilities.plugins.dataBinder.call(this,c)})})}.call(window.Gorilla,window.jQuery),function(a){"use strict";function b(){var b=this;a(window).on("scroll."+d,e.utilities.throttle(function(a){return"undefined"==typeof a.originalEvent&&a.preventDefault(),b.observeScroll(),!0},50))}function c(){a(window).off("."+d)}var d="Inview",e=this,f=e.Inview=function(c,e){this.$el=a(c),this.options=a.extend({},f.defaults,e),this.version="1.1.0",this.offsetTop=this.$el.offset().top-this.options.extraOffset,this.scrollTop=window.scrollY,this.outerHeight=c.offsetHeight,this.inview=!1,b.call(this),this.observeScroll().trigger("ready."+d)};f.defaults={extraOffset:0,onReady:a.noop},f.prototype={observeScroll:function(){var b,c=this,e=a(window),f=e.scrollTop();if(!c.$el.is(":hidden")){b=c.scrollTop<f?1:-1,c.scrollTop=f;var g=f+e.height(),h=c.offsetTop-c.options.extraOffset,i=c.offsetTop+c.outerHeight-c.options.extraOffset;return g>h&&i>f?c.inview||(c.inview=!0,c.$el.addClass("viewable-in-view"),c.$el.trigger({type:"in."+d,direction:b})):c.inview&&c.inview&&c.$el.trigger({type:"out."+d,direction:b}),this.$el}},unset:function(){return c.call(this),this.$el.removeData(d),this.$el},reset:function(){return b.call(this),this.$el},respond:function(){return this.$el}},e.utilities.plugins.initializer.call(f,d),a(function(){a("[data-inview]").each(function(){e.utilities.plugins.dataBinder.call(this,d)})})}.call(window.Gorilla,window.jQuery),function(a){"use strict";function b(){var b=this;b.options.useHI?null!=navigator.userAgent.match(/iPad/i)?this.$triggers.on("touchstart",function(c){var d=a(this);if(!d.hasClass(b.options.activeClassName)){c.preventDefault();var e=d.siblings().filter("."+b.options.activeClassName);e.length&&e!=d&&b.closeMenu(e),b.showMenu(d),a(document).on("touchstart.menuBlur",function(c){a(c.target).closest(d,d.find(".drop-down"),d.find("a")).length||(a(document).off("touchstart.menuBlur"),b.closeMenu(d))})}}):this.$triggers.hoverIntent({over:function(c){b.showMenu(a(this))},out:function(c){a(this).hasClass(b.options.activeClassName)&&b.closeMenu(a(this))},timeout:b.options.delay}):this.$triggers.on("mouseenter."+d,function(){return a(this).hasClass(b.options.activeClassName)?clearTimeout(b.hoverTimeout):void b.showMenu(a(this))}).on("mouseleave."+d,function(){if(clearTimeout(b.hoverTimeout),a(this).hasClass(b.options.activeClassName)){var c=a(this);b.hoverTimeout=window.setTimeout(function(){b.closeMenu(c)},b.options.delay)}})}function c(a){return"string"==typeof a&&(a=parseInt(a)),"number"!=typeof a||isNaN(a)||(a=this.$triggers.eq(a)),"object"==typeof a&&!a.jquery&&a.hasOwnProperty("index")&&(a=this.$triggers.eq(a.index)),a}var d="Menu",e=this,f=e.Menu=function(c,e){this.el=c,this.$el=a(c),this.options=a.extend({},f.defaults,e),this.version="1.0.0",this.hoverTimeout=null,this.$triggers=this.$el.find(this.options.triggerSelector),this.busy=!1,b.call(this),this.$el.trigger("ready."+d)};f.defaults={triggerSelector:"li.level0",menuSelector:"> .drop-down",transitionSpeed:300,delay:0,useHI:!0,activeClassName:e.hasOwnProperty("utilities")?e.utilities.activeClass:"gor-active"},f.prototype={showMenu:function(a){var b,f=this,g=arguments.length>1?arguments[1]:null;if(a=c.call(f,a),!a.hasClass(this.options.activeClassName)&&!this.busy&&(b=a.find(f.options.menuSelector),b.length)){this.busy=!0;var h={trigger:a,menu:b};return f.$el.trigger({type:"shown."+d,extra:h}),a.addClass(this.options.activeClassName),b.addClass(this.options.activeClassName),e.utilities.checkTransition(b,"shown."+d,h,function(){f.busy=!1}),"number"==typeof g&&window.setTimeout(function(a){f.closeMenu(a)},g,a),this.$el}},closeMenu:function(a){var b,f=this;a=c.call(f,a),b=a.find(f.options.menuSelector);var g={trigger:a,menu:b};f.$el.trigger({type:"hidden."+d,extra:g}),a.removeClass(this.options.activeClassName),b.removeClass(this.options.activeClassName),e.utilities.checkTransition(b,"hidden."+d,g,function(){f.busy=!1})},clearHITimeout:function(a){return a=c.call(this,a),clearTimeout(a.attr("hoverIntent_t")),a.attr("hoverIntent_s",0),this.$el},unset:function(){var b=this,c=this.$triggers.removeClass(this.options.activeClassName);return this.options.useHI?(c.off("mouseenter mouseleave touchstart").each(function(){b.clearHITimeout(a(this))}),a(document).off("touchstart.menuBlur")):c.off("."+d),this.$el.removeData(d),this.$el},reset:function(){return this.unset(),b.call(this),this.$el},respond:function(){return this.$el}},e.utilities.plugins.initializer.call(f,d),a(function(){a("[data-menu]").each(function(){e.utilities.plugins.dataBinder.call(this,d)})})}.call(window.Gorilla,window.jQuery),function(a){function b(){var a=this;this.$el.on("click."+c+" touch."+c,function(b){b.target===b.currentTarget&&a.$el.Modal("hide")})}var c="Modal",d=this,e=d.Modal=function(c,d){return this.$el=a(c),this.options=d,this.version="2.2.0",this.active=!1,b.call(this),this};e.defaults={transitionSpeed:400,activeClassName:d.hasOwnProperty("utilities")?d.utilities.activeClass:"gor-active"},e.prototype={toggle:function(){return this.active?this.hide():this.show()},show:function(){var b=this;return this.$el.get(0).style.display="block",a.support.transition&&this.$el.get(0).offsetWidth?(this.$el.addClass(this.options.activeClassName),this.$el.one(a.support.transition.end,function(){b.active=!0,b.$el.trigger("shown."+c)}).emulateTransitionEnd(this.options.transitionSpeed)):(this.$el.addClass(this.options.activeClassName),this.active=!0,this.$el.trigger("shown."+c)),b.$el},hide:function(){var b=this;return this.$el.removeClass(this.options.activeClassName),a.support.transition?this.$el.one(a.support.transition.end,function(){b.$el.hide(),b.active=!1,b.$el.trigger("hidden."+c)}).emulateTransitionEnd(this.options.transitionSpeed):(this.$el.hide(),this.active=!1,this.$el.trigger("hidden."+c)),b.$el}},d.utilities.plugins.initializer.call(e,c),a(function(){a("[data-modal]").each(function(){d.utilities.plugins.dataBinder.call(this,c)})})}.call(Gorilla,window.jQuery),function(a){"use strict";function b(){var b=this;"windowScroll"==b.options.mode&&(a(window).on("scroll."+d,e.utilities.throttle(function(){b.scroll({x:document.body.scrollLeft+window.innerWidth/2,y:document.documentElement&&document.documentElement.scrollTop||document.body.scrollTop+window.innerHeight/2})},50)),b.scroll({x:document.body.scrollLeft+window.innerWidth/2,y:document.documentElement&&document.documentElement.scrollTop||document.body.scrollTop+window.innerHeight/2}))}function c(a){var b,c=window.getComputedStyle(a,null),d=c.getPropertyValue("-webkit-transform")||c.getPropertyValue("-moz-transform")||c.getPropertyValue("-ms-transform")||c.getPropertyValue("-o-transform")||c.getPropertyValue("transform");return"none"==d?{x:0,y:0}:(b=d.split("(")[1],b=b.split(")")[0],b=b.split(","),{x:b[4],y:b[5]})}var d="Parallax",e=this,f=e.Parallax=function(c,d){return this.$el=a(c),this.el=c,this.options=a.extend({},f.defaults,d),this.version="1.0.0",b.call(this),this};f.defaults={property:"top",tipDistance:.5,viewDistance:1,mode:"windowScroll"},f.prototype={scroll:function(a){var b=this.$el.offset().top,d=this.el.offsetHeight,e=c(this.el),f=b+d/2-e.y,g=(f-a.y)*this.options.tipDistance/this.options.viewDistance;Math.abs(a.y-f)>window.innerHeight/2+d||("backgroundPosition"==this.options.property?this.$el.css("backgroundPosition","50% "+g+"px"):this.$el.css("transform","translateY("+g+"px)").css("-ms-transform","translateY("+g+"px)"))},reset:function(){return this.unset(),this.$el=this.$el.offset().top,b.call(this),this.$el},unset:function(){return a(window).off("."+d),this.$el}},e.utilities.plugins.initializer.call(f,d),a(function(){a("[data-parallax]").each(function(){e.utilities.plugins.dataBinder.call(this,d)})})}.call(window.Gorilla,window.jQuery),function(a){"use strict";function b(){var b=this;this.$el.on("click."+e,this.options.tabs,function(c){b.reveal(a(this)),c.preventDefault()}),a.support.transition&&this.$el.on(a.support.transition.end+"."+e,this.options.containers,function(a){c(b,a.target)})}function c(b,c){b.busy&&(b.busy=!1,b.$el.trigger("active."+e,{tabpanel:c})),a(c).removeClass(b.options.transitioningClass).attr("aria-expanded",!0)}function d(a){return"string"==typeof a&&(a=parseInt(a)),"number"!=typeof a||isNaN(a)||(a=this.$tabs.eq(a)),"object"==typeof a&&!a.jquery&&a.hasOwnProperty("index")&&(a=this.$tabs.eq(a.index)),a}var e="Tabs",f=this,g=f.Tabs=function(c,d){return this.$el=a(c),this.options=a.extend({},g.defaults,d),this.version="1.1.0",this.$tabs=this.$el.find(this.options.tabs).attr("role","tab").attr("aria-expanded",!1),this.$containers=this.$el.find(this.options.containers).attr("role","tabpanel").attr("aria-expanded",!1),this.busy=!1,b.call(this),this.reveal(this.$tabs.eq(this.options.defaultTab)),this.$el.trigger("ready."+e),this};g.defaults={tabs:".tabs-tab",containers:".tabs-content",defaultTab:0,transitionSpeed:500,activeClass:f.hasOwnProperty("utilities")?f.utilities.activeClass:"gor-active",inactiveClass:f.hasOwnProperty("utilities")?f.utilities.inactiveClass:"gor-inactive",transitioningClass:f.hasOwnProperty("utilities")?f.utilities.transitioningClass:"gor-transitioning"},g.prototype={reveal:function(b){var f,g,h=this;return b=d.call(h,b),b.hasClass("active")||this.busy||!b.attr("aria-controls")?h.$el:(h.busy=!0,h.$tabs.removeClass(h.options.activeClass).filter("[aria-expanded=true]").attr("aria-expanded",!1),g=h.$containers.filter("[aria-expanded=true]"),g.length&&(g.removeClass(h.options.activeClass).attr("aria-expanded",!1).css("display",""),h.$el.trigger("inactive."+e,{tabpanel:g.get(0),tab:b.get(0)})),f=h.$el.find("#"+b.attr("aria-controls")).css("display","block"),a.support.transition&&f.get(0).offsetWidth,b.addClass(h.options.activeClass).attr("aria-expanded",!0),f.addClass([h.options.activeClass,h.options.transitioningClass].join(" ")),a.support.transition||c(h,f.get(0)),h.$el)},reset:function(){return this.unset(),b.call(this),this.reveal(this.$tabs.eq(this.options.defaultTab)),this.$el},unset:function(){return this.$tabs.css("display","").removeClass(this.options.activeClass).removeAttr("role").removeAttr("aria-expanded"),this.$containers.css("display","").removeClass([this.options.activeClass,this.options.transitioningClass].join(" ")).removeAttr("role").removeAttr("aria-expanded"),this.$el.off("click."+e),a.support.transition&&this.$el.off(a.support.transition+"."+e),this.$el.removeData(e),this.$el}},f.utilities.plugins.initializer.call(g,e),a(function(){a("[data-tabs]").each(function(){f.utilities.plugins.dataBinder.call(this,e)})})}.call(window.Gorilla,window.jQuery),function(a){"use strict";function b(){var b=this;b.$shadeSelector.on("click."+e+" touch."+e,function(c){var d=a("."+e.toLowerCase()+"."+b.options.activeClassName);d.length>0&&b.close(d)})}function c(){this.$shadeSelector.length&&this.$shadeSelector.addClass(this.options.activeClassName)}function d(){this.$shadeSelector.length&&this.$shadeSelector.removeClass(this.options.activeClassName)}var e="Tray",f=this,g=f.Tray=function(c,d){this.el=c,this.$el=a(c),this.options=a.extend({},g.defaults,d),this.version="1.0.0",this.$shadeSelector=a(this.options.shadeSelector),this.$el.addClass(e.toLowerCase()),b.call(this),this.$el.trigger("ready."+e)};g.defaults={shadeSelector:"#shade",addBodyClass:!0,activeClassName:f.utilities.activeClass},g.prototype={toggle:function(){var a=this;return a.busy?a.$el:void(a.$el.hasClass(a.options.activeClassName)?a.close():a.open())},open:function(){var b=this;return this.busy?b.$el:(this.busy=!0,this.$el.addClass(b.options.activeClassName),this.$el.trigger({type:"open."+e,extra:{}}),c.apply(this),this.options.addBodyClass&&a("html").addClass(e.toLowerCase()).addClass(this.options.activeClassName),f.utilities.checkTransition(this.$el,"opened."+e,{},function(){b.busy=!1}),this.$el)},close:function(){var b=this;return this.busy?this.$el:(this.busy=!0,this.$el.removeClass(b.options.activeClassName),this.$el.trigger({type:"close."+e,extra:{}}),d.apply(this),this.options.addBodyClass&&a("html").removeClass(e.toLowerCase()).removeClass(this.options.activeClassName),f.utilities.checkTransition(b.$el,"closed."+e,{},function(){b.busy=!1}),this.$el)},unset:function(){var b=this.$el.data(e);return b?(this.busy=!1,this.el.style.display="",d.apply(this),this.options.addBodyClass&&a("html").removeClass(e.toLowerCase()).removeClass(this.options.activeClassName),this.$el.removeData(e).removeClass("gor-"+e.toLowerCase()),this.$el):this.$el},reset:function(){if(!this.$el.data(e))return this.unset(),b.call(this),this.$el}},f.utilities.plugins.initializer.call(g,e),a(function(){a("[data-tray]").each(function(){f.utilities.plugins.dataBinder.call(this,e)})})}.call(window.Gorilla,window.jQuery),"function"!=typeof Object.create&&(Object.create=function(a){function b(){}return b.prototype=a,new b}),function(a,b,c){var d={init:function(b,c){var d=this;d.$elem=a(c),d.options=a.extend({},a.fn.owlCarousel.options,d.$elem.data(),b),d.userOptions=b,d.loadContent()},loadContent:function(){function b(a){var b,c="";if("function"==typeof d.options.jsonSuccess)d.options.jsonSuccess.apply(this,[a]);else{for(b in a.owl)a.owl.hasOwnProperty(b)&&(c+=a.owl[b].item);d.$elem.html(c)}d.logIn()}var c,d=this;"function"==typeof d.options.beforeInit&&d.options.beforeInit.apply(this,[d.$elem]),"string"==typeof d.options.jsonPath?(c=d.options.jsonPath,a.getJSON(c,b)):d.logIn()},logIn:function(){var a=this;a.$elem.data("owl-originalStyles",a.$elem.attr("style")),a.$elem.data("owl-originalClasses",a.$elem.attr("class")),a.$elem.css({opacity:0}),a.orignalItems=a.options.items,a.checkBrowser(),a.wrapperWidth=0,a.checkVisible=null,a.setVars()},setVars:function(){var a=this;return 0!==a.$elem.children().length&&(a.baseClass(),a.eventTypes(),a.$userItems=a.$elem.children(),a.itemsAmount=a.$userItems.length,a.wrapItems(),a.$owlItems=a.$elem.find(".owl-item"),a.$owlWrapper=a.$elem.find(".owl-wrapper"),a.playDirection="next",a.prevItem=0,a.prevArr=[0],a.currentItem=0,a.customEvents(),void a.onStartup())},onStartup:function(){var a=this;a.updateItems(),a.calculateAll(),a.buildControls(),a.updateControls(),a.response(),a.moveEvents(),a.stopOnHover(),a.owlStatus(),a.options.transitionStyle!==!1&&a.transitionTypes(a.options.transitionStyle),a.options.autoPlay===!0&&(a.options.autoPlay=5e3),a.play(),a.$elem.find(".owl-wrapper").css("display","block"),a.$elem.is(":visible")?a.$elem.css("opacity",1):a.watchVisibility(),a.onstartup=!1,a.eachMoveUpdate(),"function"==typeof a.options.afterInit&&a.options.afterInit.apply(this,[a.$elem])},eachMoveUpdate:function(){var a=this;
a.options.lazyLoad===!0&&a.lazyLoad(),a.options.autoHeight===!0&&a.autoHeight(),a.onVisibleItems(),"function"==typeof a.options.afterAction&&a.options.afterAction.apply(this,[a.$elem])},updateVars:function(){var a=this;"function"==typeof a.options.beforeUpdate&&a.options.beforeUpdate.apply(this,[a.$elem]),a.watchVisibility(),a.updateItems(),a.calculateAll(),a.updatePosition(),a.updateControls(),a.eachMoveUpdate(),"function"==typeof a.options.afterUpdate&&a.options.afterUpdate.apply(this,[a.$elem])},reload:function(){var a=this;b.setTimeout(function(){a.updateVars()},0)},watchVisibility:function(){var a=this;return a.$elem.is(":visible")===!1&&(a.$elem.css({opacity:0}),b.clearInterval(a.autoPlayInterval),b.clearInterval(a.checkVisible),void(a.checkVisible=b.setInterval(function(){a.$elem.is(":visible")&&(a.reload(),a.$elem.animate({opacity:1},200),b.clearInterval(a.checkVisible))},500)))},wrapItems:function(){var a=this;a.$userItems.wrapAll('<div class="owl-wrapper">').wrap('<div class="owl-item"></div>'),a.$elem.find(".owl-wrapper").wrap('<div class="owl-wrapper-outer">'),a.wrapperOuter=a.$elem.find(".owl-wrapper-outer"),a.$elem.css("display","block")},baseClass:function(){var a=this,b=a.$elem.hasClass(a.options.baseClass),c=a.$elem.hasClass(a.options.theme);b||a.$elem.addClass(a.options.baseClass),c||a.$elem.addClass(a.options.theme)},updateItems:function(){var b,c,d=this;if(d.options.responsive===!1)return!1;if(d.options.singleItem===!0)return d.options.items=d.orignalItems=1,d.options.itemsCustom=!1,d.options.itemsDesktop=!1,d.options.itemsDesktopSmall=!1,d.options.itemsTablet=!1,d.options.itemsTabletSmall=!1,d.options.itemsMobile=!1,!1;if(b=a(d.options.responsiveBaseWidth).width(),b>(d.options.itemsDesktop[0]||d.orignalItems)&&(d.options.items=d.orignalItems),d.options.itemsCustom!==!1)for(d.options.itemsCustom.sort(function(a,b){return a[0]-b[0]}),c=0;c<d.options.itemsCustom.length;c+=1)d.options.itemsCustom[c][0]<=b&&(d.options.items=d.options.itemsCustom[c][1]);else b<=d.options.itemsDesktop[0]&&d.options.itemsDesktop!==!1&&(d.options.items=d.options.itemsDesktop[1]),b<=d.options.itemsDesktopSmall[0]&&d.options.itemsDesktopSmall!==!1&&(d.options.items=d.options.itemsDesktopSmall[1]),b<=d.options.itemsTablet[0]&&d.options.itemsTablet!==!1&&(d.options.items=d.options.itemsTablet[1]),b<=d.options.itemsTabletSmall[0]&&d.options.itemsTabletSmall!==!1&&(d.options.items=d.options.itemsTabletSmall[1]),b<=d.options.itemsMobile[0]&&d.options.itemsMobile!==!1&&(d.options.items=d.options.itemsMobile[1]);d.options.items>d.itemsAmount&&d.options.itemsScaleUp===!0&&(d.options.items=d.itemsAmount)},response:function(){var c,d,e=this;return e.options.responsive===!0&&(d=a(b).width(),e.resizer=function(){a(b).width()!==d&&(e.options.autoPlay!==!1&&b.clearInterval(e.autoPlayInterval),b.clearTimeout(c),c=b.setTimeout(function(){d=a(b).width(),e.updateVars()},e.options.responsiveRefreshRate))},void a(b).resize(e.resizer))},updatePosition:function(){var a=this;a.jumpTo(a.currentItem),a.options.autoPlay!==!1&&a.checkAp()},appendItemsSizes:function(){var b=this,c=0,d=b.itemsAmount-b.options.items;b.$owlItems.each(function(e){var f=a(this);f.css({width:b.itemWidth}).data("owl-item",Number(e)),e%b.options.items!==0&&e!==d||e>d||(c+=1),f.data("owl-roundPages",c)})},appendWrapperSizes:function(){var a=this,b=a.$owlItems.length*a.itemWidth;a.$owlWrapper.css({width:2*b,left:0}),a.appendItemsSizes()},calculateAll:function(){var a=this;a.calculateWidth(),a.appendWrapperSizes(),a.loops(),a.max()},calculateWidth:function(){var a=this;a.itemWidth=Math.round(a.$elem.width()/a.options.items)},max:function(){var a=this,b=(a.itemsAmount*a.itemWidth-a.options.items*a.itemWidth)*-1;return a.options.items>a.itemsAmount?(a.maximumItem=0,b=0,a.maximumPixels=0):(a.maximumItem=a.itemsAmount-a.options.items,a.maximumPixels=b),b},min:function(){return 0},loops:function(){var b,c,d,e=this,f=0,g=0;for(e.positionsInArray=[0],e.pagesInArray=[],b=0;b<e.itemsAmount;b+=1)g+=e.itemWidth,e.positionsInArray.push(-g),e.options.scrollPerPage===!0&&(c=a(e.$owlItems[b]),d=c.data("owl-roundPages"),d!==f&&(e.pagesInArray[f]=e.positionsInArray[b],f=d))},buildControls:function(){var b=this;b.options.navigation!==!0&&b.options.pagination!==!0||(b.owlControls=a('<div class="owl-controls"/>').toggleClass("clickable",!b.browser.isTouch).appendTo(b.$elem)),b.options.pagination===!0&&b.buildPagination(),b.options.navigation===!0&&b.buildButtons()},buildButtons:function(){var b=this,c=a('<div class="owl-buttons"/>');b.owlControls.append(c),b.buttonPrev=a("<div/>",{"class":"owl-prev",html:b.options.navigationText[0]||""}),b.buttonNext=a("<div/>",{"class":"owl-next",html:b.options.navigationText[1]||""}),c.append(b.buttonPrev).append(b.buttonNext),c.on("touchstart.owlControls mousedown.owlControls",'div[class^="owl"]',function(a){a.preventDefault()}),c.on("touchend.owlControls mouseup.owlControls",'div[class^="owl"]',function(c){c.preventDefault(),a(this).hasClass("owl-next")?b.next():b.prev()})},buildPagination:function(){var b=this;b.paginationWrapper=a('<div class="owl-pagination"/>'),b.owlControls.append(b.paginationWrapper),b.paginationWrapper.on("touchend.owlControls mouseup.owlControls",".owl-page",function(c){c.preventDefault(),Number(a(this).data("owl-page"))!==b.currentItem&&b.goTo(Number(a(this).data("owl-page")),!0)})},updatePagination:function(){var b,c,d,e,f,g,h=this;if(h.options.pagination===!1)return!1;for(h.paginationWrapper.html(""),b=0,c=h.itemsAmount-h.itemsAmount%h.options.items,e=0;e<h.itemsAmount;e+=1)e%h.options.items===0&&(b+=1,c===e&&(d=h.itemsAmount-h.options.items),f=a("<div/>",{"class":"owl-page"}),g=a("<span></span>",{text:h.options.paginationNumbers===!0?b:"","class":h.options.paginationNumbers===!0?"owl-numbers":""}),f.append(g),f.data("owl-page",c===e?d:e),f.data("owl-roundPages",b),h.paginationWrapper.append(f));h.checkPagination()},checkPagination:function(){var b=this;return b.options.pagination!==!1&&void b.paginationWrapper.find(".owl-page").each(function(){a(this).data("owl-roundPages")===a(b.$owlItems[b.currentItem]).data("owl-roundPages")&&(b.paginationWrapper.find(".owl-page").removeClass("active"),a(this).addClass("active"))})},checkNavigation:function(){var a=this;return a.options.navigation!==!1&&void(a.options.rewindNav===!1&&(0===a.currentItem&&0===a.maximumItem?(a.buttonPrev.addClass("disabled"),a.buttonNext.addClass("disabled")):0===a.currentItem&&0!==a.maximumItem?(a.buttonPrev.addClass("disabled"),a.buttonNext.removeClass("disabled")):a.currentItem===a.maximumItem?(a.buttonPrev.removeClass("disabled"),a.buttonNext.addClass("disabled")):0!==a.currentItem&&a.currentItem!==a.maximumItem&&(a.buttonPrev.removeClass("disabled"),a.buttonNext.removeClass("disabled"))))},updateControls:function(){var a=this;a.updatePagination(),a.checkNavigation(),a.owlControls&&(a.options.items>=a.itemsAmount?a.owlControls.hide():a.owlControls.show())},destroyControls:function(){var a=this;a.owlControls&&a.owlControls.remove()},next:function(a){var b=this;if(b.isTransition)return!1;if(b.currentItem+=b.options.scrollPerPage===!0?b.options.items:1,b.currentItem>b.maximumItem+(b.options.scrollPerPage===!0?b.options.items-1:0)){if(b.options.rewindNav!==!0)return b.currentItem=b.maximumItem,!1;b.currentItem=0,a="rewind"}b.goTo(b.currentItem,a)},prev:function(a){var b=this;if(b.isTransition)return!1;if(b.options.scrollPerPage===!0&&b.currentItem>0&&b.currentItem<b.options.items?b.currentItem=0:b.currentItem-=b.options.scrollPerPage===!0?b.options.items:1,b.currentItem<0){if(b.options.rewindNav!==!0)return b.currentItem=0,!1;b.currentItem=b.maximumItem,a="rewind"}b.goTo(b.currentItem,a)},goTo:function(a,c,d){var e,f=this;return!f.isTransition&&("function"==typeof f.options.beforeMove&&f.options.beforeMove.apply(this,[f.$elem]),a>=f.maximumItem?a=f.maximumItem:a<=0&&(a=0),f.currentItem=f.owl.currentItem=a,f.options.transitionStyle!==!1&&"drag"!==d&&1===f.options.items&&f.browser.support3d===!0?(f.swapSpeed(0),f.browser.support3d===!0?f.transition3d(f.positionsInArray[a]):f.css2slide(f.positionsInArray[a],1),f.afterGo(),f.singleItemTransition(),!1):(e=f.positionsInArray[a],f.browser.support3d===!0?(f.isCss3Finish=!1,c===!0?(f.swapSpeed("paginationSpeed"),b.setTimeout(function(){f.isCss3Finish=!0},f.options.paginationSpeed)):"rewind"===c?(f.swapSpeed(f.options.rewindSpeed),b.setTimeout(function(){f.isCss3Finish=!0},f.options.rewindSpeed)):(f.swapSpeed("slideSpeed"),b.setTimeout(function(){f.isCss3Finish=!0},f.options.slideSpeed)),f.transition3d(e)):c===!0?f.css2slide(e,f.options.paginationSpeed):"rewind"===c?f.css2slide(e,f.options.rewindSpeed):f.css2slide(e,f.options.slideSpeed),void f.afterGo()))},jumpTo:function(a){var b=this;"function"==typeof b.options.beforeMove&&b.options.beforeMove.apply(this,[b.$elem]),a>=b.maximumItem||a===-1?a=b.maximumItem:a<=0&&(a=0),b.swapSpeed(0),b.browser.support3d===!0?b.transition3d(b.positionsInArray[a]):b.css2slide(b.positionsInArray[a],1),b.currentItem=b.owl.currentItem=a,b.afterGo()},afterGo:function(){var a=this;a.prevArr.push(a.currentItem),a.prevItem=a.owl.prevItem=a.prevArr[a.prevArr.length-2],a.prevArr.shift(0),a.prevItem!==a.currentItem&&(a.checkPagination(),a.checkNavigation(),a.eachMoveUpdate(),a.options.autoPlay!==!1&&a.checkAp()),"function"==typeof a.options.afterMove&&a.prevItem!==a.currentItem&&a.options.afterMove.apply(this,[a.$elem])},stop:function(){var a=this;a.apStatus="stop",b.clearInterval(a.autoPlayInterval)},checkAp:function(){var a=this;"stop"!==a.apStatus&&a.play()},play:function(){var a=this;return a.apStatus="play",a.options.autoPlay!==!1&&(b.clearInterval(a.autoPlayInterval),void(a.autoPlayInterval=b.setInterval(function(){a.next(!0)},a.options.autoPlay)))},swapSpeed:function(a){var b=this;"slideSpeed"===a?b.$owlWrapper.css(b.addCssSpeed(b.options.slideSpeed)):"paginationSpeed"===a?b.$owlWrapper.css(b.addCssSpeed(b.options.paginationSpeed)):"string"!=typeof a&&b.$owlWrapper.css(b.addCssSpeed(a))},addCssSpeed:function(a){return{"-webkit-transition":"all "+a+"ms ease","-moz-transition":"all "+a+"ms ease","-o-transition":"all "+a+"ms ease",transition:"all "+a+"ms ease"}},removeTransition:function(){return{"-webkit-transition":"","-moz-transition":"","-o-transition":"",transition:""}},doTranslate:function(a){return{"-webkit-transform":"translate3d("+a+"px, 0px, 0px)","-moz-transform":"translate3d("+a+"px, 0px, 0px)","-o-transform":"translate3d("+a+"px, 0px, 0px)","-ms-transform":"translate3d("+a+"px, 0px, 0px)",transform:"translate3d("+a+"px, 0px,0px)"}},transition3d:function(a){var b=this;b.$owlWrapper.css(b.doTranslate(a))},css2move:function(a){var b=this;b.$owlWrapper.css({left:a})},css2slide:function(a,b){var c=this;c.isCssFinish=!1,c.$owlWrapper.stop(!0,!0).animate({left:a},{duration:b||c.options.slideSpeed,complete:function(){c.isCssFinish=!0}})},checkBrowser:function(){var a,d,e,f,g=this,h="translate3d(0px, 0px, 0px)",i=c.createElement("div");i.style.cssText="  -moz-transform:"+h+"; -ms-transform:"+h+"; -o-transform:"+h+"; -webkit-transform:"+h+"; transform:"+h,a=/translate3d\(0px, 0px, 0px\)/g,d=i.style.cssText.match(a),e=null!==d&&1===d.length,f="ontouchstart"in b||b.navigator.msMaxTouchPoints,g.browser={support3d:e,isTouch:f}},moveEvents:function(){var a=this;a.options.mouseDrag===!1&&a.options.touchDrag===!1||(a.gestures(),a.disabledEvents())},eventTypes:function(){var a=this,b=["s","e","x"];a.ev_types={},a.options.mouseDrag===!0&&a.options.touchDrag===!0?b=["touchstart.owl mousedown.owl","touchmove.owl mousemove.owl","touchend.owl touchcancel.owl mouseup.owl"]:a.options.mouseDrag===!1&&a.options.touchDrag===!0?b=["touchstart.owl","touchmove.owl","touchend.owl touchcancel.owl"]:a.options.mouseDrag===!0&&a.options.touchDrag===!1&&(b=["mousedown.owl","mousemove.owl","mouseup.owl"]),a.ev_types.start=b[0],a.ev_types.move=b[1],a.ev_types.end=b[2]},disabledEvents:function(){var b=this;b.$elem.on("dragstart.owl",function(a){a.preventDefault()}),b.$elem.on("mousedown.disableTextSelect",function(b){return a(b.target).is("input, textarea, select, option")})},gestures:function(){function d(a){if(void 0!==a.touches)return{x:a.touches[0].pageX,y:a.touches[0].pageY};if(void 0===a.touches){if(void 0!==a.pageX)return{x:a.pageX,y:a.pageY};if(void 0===a.pageX)return{x:a.clientX,y:a.clientY}}}function e(b){"on"===b?(a(c).on(i.ev_types.move,g),a(c).on(i.ev_types.end,h)):"off"===b&&(a(c).off(i.ev_types.move),a(c).off(i.ev_types.end))}function f(c){var f,g=c.originalEvent||c||b.event;if(3===g.which)return!1;if(!(i.itemsAmount<=i.options.items)){if(i.isCssFinish===!1&&!i.options.dragBeforeAnimFinish)return!1;if(i.isCss3Finish===!1&&!i.options.dragBeforeAnimFinish)return!1;i.options.autoPlay!==!1&&b.clearInterval(i.autoPlayInterval),i.browser.isTouch===!0||i.$owlWrapper.hasClass("grabbing")||i.$owlWrapper.addClass("grabbing"),i.newPosX=0,i.newRelativeX=0,a(this).css(i.removeTransition()),f=a(this).position(),j.relativePos=f.left,j.offsetX=d(g).x-f.left,j.offsetY=d(g).y-f.top,e("on"),j.sliding=!1,j.targetElement=g.target||g.srcElement}}function g(e){var f,g,h=e.originalEvent||e||b.event;i.newPosX=d(h).x-j.offsetX,i.newPosY=d(h).y-j.offsetY,i.newRelativeX=i.newPosX-j.relativePos,"function"==typeof i.options.startDragging&&j.dragging!==!0&&0!==i.newRelativeX&&(j.dragging=!0,i.options.startDragging.apply(i,[i.$elem])),(i.newRelativeX>8||i.newRelativeX<-8)&&i.browser.isTouch===!0&&(void 0!==h.preventDefault?h.preventDefault():h.returnValue=!1,j.sliding=!0),(i.newPosY>10||i.newPosY<-10)&&j.sliding===!1&&a(c).off("touchmove.owl"),f=function(){return i.newRelativeX/5},g=function(){return i.maximumPixels+i.newRelativeX/5},i.newPosX=Math.max(Math.min(i.newPosX,f()),g()),i.browser.support3d===!0?i.transition3d(i.newPosX):i.css2move(i.newPosX)}function h(c){var d,f,g,h=c.originalEvent||c||b.event;h.target=h.target||h.srcElement,j.dragging=!1,i.browser.isTouch!==!0&&i.$owlWrapper.removeClass("grabbing"),i.newRelativeX<0?i.dragDirection=i.owl.dragDirection="left":i.dragDirection=i.owl.dragDirection="right",0!==i.newRelativeX&&(d=i.getNewPosition(),i.goTo(d,!1,"drag"),j.targetElement===h.target&&i.browser.isTouch!==!0&&(a(h.target).on("click.disable",function(b){b.stopImmediatePropagation(),b.stopPropagation(),b.preventDefault(),a(b.target).off("click.disable")}),f=a._data(h.target,"events").click,g=f.pop(),f.splice(0,0,g))),e("off")}var i=this,j={offsetX:0,offsetY:0,baseElWidth:0,relativePos:0,position:null,minSwipe:null,maxSwipe:null,sliding:null,dargging:null,targetElement:null};i.isCssFinish=!0,i.$elem.on(i.ev_types.start,".owl-wrapper",f)},getNewPosition:function(){var a=this,b=a.closestItem();return b>a.maximumItem?(a.currentItem=a.maximumItem,b=a.maximumItem):a.newPosX>=0&&(b=0,a.currentItem=0),b},closestItem:function(){var b=this,c=b.options.scrollPerPage===!0?b.pagesInArray:b.positionsInArray,d=b.newPosX,e=null;return a.each(c,function(f,g){d-b.itemWidth/20>c[f+1]&&d-b.itemWidth/20<g&&"left"===b.moveDirection()?(e=g,b.options.scrollPerPage===!0?b.currentItem=a.inArray(e,b.positionsInArray):b.currentItem=f):d+b.itemWidth/20<g&&d+b.itemWidth/20>(c[f+1]||c[f]-b.itemWidth)&&"right"===b.moveDirection()&&(b.options.scrollPerPage===!0?(e=c[f+1]||c[c.length-1],b.currentItem=a.inArray(e,b.positionsInArray)):(e=c[f+1],b.currentItem=f+1))}),b.currentItem},moveDirection:function(){var a,b=this;return b.newRelativeX<0?(a="right",b.playDirection="next"):(a="left",b.playDirection="prev"),a},customEvents:function(){var a=this;a.$elem.on("owl.next",function(){a.next()}),a.$elem.on("owl.prev",function(){a.prev()}),a.$elem.on("owl.play",function(b,c){a.options.autoPlay=c,a.play(),a.hoverStatus="play"}),a.$elem.on("owl.stop",function(){a.stop(),a.hoverStatus="stop"}),a.$elem.on("owl.goTo",function(b,c){a.goTo(c)}),a.$elem.on("owl.jumpTo",function(b,c){a.jumpTo(c)})},stopOnHover:function(){var a=this;a.options.stopOnHover===!0&&a.browser.isTouch!==!0&&a.options.autoPlay!==!1&&(a.$elem.on("mouseover",function(){a.stop()}),a.$elem.on("mouseout",function(){"stop"!==a.hoverStatus&&a.play()}))},lazyLoad:function(){var b,c,d,e,f,g=this;if(g.options.lazyLoad===!1)return!1;for(b=0;b<g.itemsAmount;b+=1)c=a(g.$owlItems[b]),"loaded"!==c.data("owl-loaded")&&(d=c.data("owl-item"),e=c.find(".lazyOwl"),"string"==typeof e.data("src")?(void 0===c.data("owl-loaded")&&(e.hide(),c.addClass("loading").data("owl-loaded","checked")),f=g.options.lazyFollow!==!0||d>=g.currentItem,f&&d<g.currentItem+g.options.items&&e.length&&g.lazyPreload(c,e)):c.data("owl-loaded","loaded"))},lazyPreload:function(a,c){function d(){a.data("owl-loaded","loaded").removeClass("loading"),c.removeAttr("data-src"),"fade"===g.options.lazyEffect?c.fadeIn(400):c.show(),"function"==typeof g.options.afterLazyLoad&&g.options.afterLazyLoad.apply(this,[g.$elem])}function e(){h+=1,g.completeImg(c.get(0))||f===!0?d():h<=100?b.setTimeout(e,100):d()}var f,g=this,h=0;"DIV"===c.prop("tagName")?(c.css("background-image","url("+c.data("src")+")"),f=!0):c[0].src=c.data("src"),e()},autoHeight:function(){function c(){var c=a(f.$owlItems[f.currentItem]).height();f.wrapperOuter.css("height",c+"px"),f.wrapperOuter.hasClass("autoHeight")||b.setTimeout(function(){f.wrapperOuter.addClass("autoHeight")},0)}function d(){e+=1,f.completeImg(g.get(0))?c():e<=100?b.setTimeout(d,100):f.wrapperOuter.css("height","")}var e,f=this,g=a(f.$owlItems[f.currentItem]).find("img");void 0!==g.get(0)?(e=0,d()):c()},completeImg:function(a){var b;return!!a.complete&&(b=typeof a.naturalWidth,"undefined"===b||0!==a.naturalWidth)},onVisibleItems:function(){var b,c=this;for(c.options.addClassActive===!0&&c.$owlItems.removeClass("active"),c.visibleItems=[],b=c.currentItem;b<c.currentItem+c.options.items;b+=1)c.visibleItems.push(b),c.options.addClassActive===!0&&a(c.$owlItems[b]).addClass("active");c.owl.visibleItems=c.visibleItems},transitionTypes:function(a){var b=this;b.outClass="owl-"+a+"-out",b.inClass="owl-"+a+"-in"},singleItemTransition:function(){function a(a){return{position:"relative",left:a+"px"}}var b=this,c=b.outClass,d=b.inClass,e=b.$owlItems.eq(b.currentItem),f=b.$owlItems.eq(b.prevItem),g=Math.abs(b.positionsInArray[b.currentItem])+b.positionsInArray[b.prevItem],h=Math.abs(b.positionsInArray[b.currentItem])+b.itemWidth/2,i="webkitAnimationEnd oAnimationEnd MSAnimationEnd animationend";b.isTransition=!0,b.$owlWrapper.addClass("owl-origin").css({"-webkit-transform-origin":h+"px","-moz-perspective-origin":h+"px","perspective-origin":h+"px"}),f.css(a(g,10)).addClass(c).on(i,function(){b.endPrev=!0,f.off(i),b.clearTransStyle(f,c)}),e.addClass(d).on(i,function(){b.endCurrent=!0,e.off(i),b.clearTransStyle(e,d)})},clearTransStyle:function(a,b){var c=this;a.css({position:"",left:""}).removeClass(b),c.endPrev&&c.endCurrent&&(c.$owlWrapper.removeClass("owl-origin"),c.endPrev=!1,c.endCurrent=!1,c.isTransition=!1)},owlStatus:function(){var a=this;a.owl={userOptions:a.userOptions,baseElement:a.$elem,userItems:a.$userItems,owlItems:a.$owlItems,currentItem:a.currentItem,prevItem:a.prevItem,visibleItems:a.visibleItems,isTouch:a.browser.isTouch,browser:a.browser,dragDirection:a.dragDirection}},clearEvents:function(){var d=this;d.$elem.off(".owl owl mousedown.disableTextSelect"),a(c).off(".owl owl"),a(b).off("resize",d.resizer)},unWrap:function(){var a=this;0!==a.$elem.children().length&&(a.$owlWrapper.unwrap(),a.$userItems.unwrap().unwrap(),a.owlControls&&a.owlControls.remove()),a.clearEvents(),a.$elem.attr("style",a.$elem.data("owl-originalStyles")||"").attr("class",a.$elem.data("owl-originalClasses"))},destroy:function(){var a=this;a.stop(),b.clearInterval(a.checkVisible),a.unWrap(),a.$elem.removeData()},reinit:function(b){var c=this,d=a.extend({},c.userOptions,b);c.unWrap(),c.init(d,c.$elem)},addItem:function(a,b){var c,d=this;return!!a&&(0===d.$elem.children().length?(d.$elem.append(a),d.setVars(),!1):(d.unWrap(),c=void 0===b||b===-1?-1:b,c>=d.$userItems.length||c===-1?d.$userItems.eq(-1).after(a):d.$userItems.eq(c).before(a),void d.setVars()))},removeItem:function(a){var b,c=this;return 0!==c.$elem.children().length&&(b=void 0===a||a===-1?-1:a,c.unWrap(),c.$userItems.eq(b).remove(),void c.setVars())}};a.fn.owlCarousel=function(b){return this.each(function(){if(a(this).data("owl-init")===!0)return!1;a(this).data("owl-init",!0);var c=Object.create(d);c.init(b,this),a.data(this,"owlCarousel",c)})},a.fn.owlCarousel.options={items:5,itemsCustom:!1,itemsDesktop:[1199,4],itemsDesktopSmall:[979,3],itemsTablet:[768,2],itemsTabletSmall:!1,itemsMobile:[479,1],singleItem:!1,itemsScaleUp:!1,slideSpeed:200,paginationSpeed:800,rewindSpeed:1e3,autoPlay:!1,stopOnHover:!1,navigation:!1,navigationText:["prev","next"],rewindNav:!0,scrollPerPage:!1,pagination:!0,paginationNumbers:!1,responsive:!0,responsiveRefreshRate:200,responsiveBaseWidth:b,baseClass:"owl-carousel",theme:"owl-theme",lazyLoad:!1,lazyFollow:!0,lazyEffect:"fade",autoHeight:!1,jsonPath:!1,jsonSuccess:!1,dragBeforeAnimFinish:!0,mouseDrag:!0,touchDrag:!0,addClassActive:!1,transitionStyle:!1,beforeUpdate:!1,afterUpdate:!1,beforeInit:!1,afterInit:!1,beforeMove:!1,afterMove:!1,afterAction:!1,startDragging:!1,afterLazyLoad:!1}}(jQuery,window,document);
(function($) {

    // Readied
    $(function() {

        //Accordion
        if(($accordion = $('.gor-accordion')).length){
            $accordion.Accordion();
        }

        // Tabs
        if(($tabs = $('.gor-tabs')).length){
            $tabs.Tabs();
        }

        // Custom Selects
        if(($select = $('select')).length){
            $select.CustomSelects();
        }

        //Custom File Input
        if(($customInput = $('.custom-input')).length){
            $customInput.CustomFileInputs();
        }

        // Lazy Load
        if(($lazy = $('.gor-lazy, .banner')).length){
            $lazy.unveil();
        }

        if(($viewable = $('.gor-viewable')).length){
            $viewable.Inview();
        }

        //Modal
        if(($modal = $('.modal')).length) {
            //Close Modal on Click of Backdrop
            $modal.on('click touch', function(e){
                if(e.target != e.currentTarget) return;

                $(this).Modal('hide');
            });
            //load image on modal load
            $modal.on('shown.Moby', function(e){
                var $this = $(this);

                if(($modalImg = $this.find('.lazy-load')).length){
                    $modalImg.unveil();
                }
            });
        }

        //search
//        if(($searchAccordion = $('#search-accordion')).length) {
//            //Close search
//            $searchAccordion.on('opened.Accordion', function(e,data) {
//                $('body').one('click touch', function(e){
//                    if($(e.target).closest("#search-accordion").length === 0) {
//                        $searchAccordion.Accordion("collapse", $searchAccordion.find('.accordion-header'));
//                    }
//                });
//            });
//
//        }

        // Carousel
        if(($carousel = $('.gor-carousel')).length){
            $carousel.owlCarousel({
                items: 1,
                singleItem: true,
                pagination : true,
                navigation : false,
                navigationText : [
                    '<button type="button" class="button"><i class="icon-left-carrot"></i></button>',
                    '<button type="button" class="button"><i class="icon-right-carrot"></i></button>'
                ],
                baseClass : "gor-carousel",
                theme : "",
                addClassActive : true,
                mouseDrag : false,
                transitionStyle : "fade",
                lazyLoad : true,
                afterInit : function($elm){
                    if($elm.prop('id') == 'product-carousel'){
                        var html = '',
                            $items = $elm.find('.owl-item'),
                            length = $items.length,
                            activeIndex = $items.filter('.active').index();

                        html += '<ul class="thumbnails">';
                        for(var i=0; i < length; i++){
                            var isActive = i === activeIndex ? ' active' : '';
                            html += '<li class="thumbnail gor-lazy' + isActive + '"><img src="' + $items.eq(i).find('img').data('thumb') + '" alt="" /></li>';
                        }
                        html += '</ul>';

                        //Update this line to change where the thumbnails are added (e.g. prepend, append, before, after)
                        //$elm.before(html);
                        $('.thumbnails-container').html(html);

                        $('.thumbnail').on('click', function(e){
                            var index = $(this).index();

                            $elm.data('owlCarousel').goTo(index);
                        });
                    }
                },
                afterMove : function($elm){
                    if($elm.prop('id') == 'product-carousel') {
                        var $thumbnails = $('.thumbnails').find('.thumbnail'),
                            activeIndex = $elm.find('.owl-item').filter('.active').index();

                        $thumbnails.removeClass('active').eq(activeIndex).addClass('active');
                    }
                }
            });
        }


        // Modal Video Close stop youtube from playing
        if (($modalVideo = $('.pure-modal-video')).length){
            var $frame = $modalVideo.find('iframe'),
                $closeBtn = $modalVideo.find('.modal-close');

            $closeBtn.on('click', function(){
                $frame.remove();
                $modalVideo.find('.responsive-embed').append($frame);
            });
        }

        //Quantity input minus
        $(document).on('click', '.cart-qty__minus', function() {
            var $btn = $(this),
                $qty = $btn.next('[type=text]');

            $qty.val(+$qty.val() - 1);
            if(+$qty.val() < 1) {
                $qty.val(1);
            }

            return false;
        });

        //Quantity input increase
        $(document).on('click', '.cart-qty__plus', function() {
            var $btn = $(this),
                $qty = $btn.prev('[type=text]');

            $qty.val(+$qty.val() + 1);
            return false;
        });

        //Mobile Breakpoints
        Respond.to([
            {
                'media': '(max-width: 768px)',
                'namespace': '768_Tablet',
                'if': function () {
                    $('body').addClass('mobile');
                    //mobile navigation
                    if (($masthead = $('#masthead')).length) {
                        $masthead.Tray();
                    }

                    //mobile filters popup
                    if (($layeredNav = $('#layered-navigation')).length){
                        $layeredNav.Tray();
                    }

                    //unset desktop navigation
                    if (($navigation = $('#navigation')).length) {
                        $navigation.Menu('unset');

                        $navigation.Accordion({
                            'headers': 'li.parent > a, li.parent > span',
                            'containers': '.drop-down'
                        });

                        $navigation.find('li.level0').data('offset', '');
                        $navigation.find('ul.level0').css('padding-left', '');
                    }

                    //product detail tabs to accordion
                    if(($mytabs = $('.product-tabs')).length){
                        $mytabs.Tabs('unset');

                        $mytabs.removeClass('gor-tabs').addClass('gor-accordion');
                        $mytabs.Accordion({
                            'headers': '.accordion-header',
                            'containers': '.accordion-content'
                        });

                    }

                    //mobile accordion
                    if(($mobileAccordion = $('.m-accordion')).length){
                        $mobileAccordion.Accordion({
                            'headers': '.m-header',
                            'containers': '.m-content'
                        });
                    }
                },
                'else': function(){
                    $('body').removeClass('mobile');

                    //unset mobile menu
                    if(($masthead = $('#masthead')).length){
                        $masthead.Tray('unset');
                    }

                    //unset mobile filters popup
                    if(($layeredNav = $('#layered-navigation')).length){
                        $layeredNav.Tray('unset');
                    }

                    //desktop navigation
                    if (($navigation = $('#navigation')).length) {
                        $navigation.Accordion('unset');
                        $navigation.Menu();

                        $navigation.on('shown.Menu', function(e){
                            var $trigger = $(e.extra.trigger);

                            if($trigger.data('offset')) return;

                            var trigger = $trigger.position(),
                                parent = $trigger.parents('.container-fluid').offset().left,
                                offset = trigger.left - parent,
                                percentage = (offset/$trigger.find('.drop-down').width()) * 100;

                            $trigger.data('offset', percentage);
                            // KIJO alert(percentage);
                            $trigger.find('ul.level0').css('padding-left', percentage + '%');
                        });
                    }

                    //unset mobile accordion
                    if(($mobileAccordion = $('.m-accordion')).length){
                        $mobileAccordion.Accordion('unset');
                    }

                    //product detail accordion to tabs
                    if(($mytabs = $('.product-tabs')).length){
                        $mytabs.removeClass('gor-accordion').addClass('gor-tabs');
                        $mytabs.Tabs();
                    }
                }
            }
        ]);
    });

})(window.jQuery);

var AtrAffiliate = new Object();

AtrAffiliate.findDoctorForm = Class.create();
AtrAffiliate.findDoctorForm.prototype = {
    initialize : function(form, field, emptyText){
        this.form   = $(form);
        this.field  = $(field);
        this.emptyText = emptyText;

        Event.observe(this.form,  'submit', this.submit.bind(this));
        Event.observe(this.field, 'focus', this.focus.bind(this));
        Event.observe(this.field, 'blur', this.blur.bind(this));
        this.blur();
    },

    submit : function(event){
        if (this.field.value == this.emptyText || this.field.value == ''){
            Event.stop(event);
            return false;
        }
        return true;
    },

    focus : function(event){
        if(this.field.value==this.emptyText){
            this.field.value='';
        }

    },

    blur : function(event){
        if(this.field.value==''){
            this.field.value=this.emptyText;
        }
    }
};

AtrAffiliate.doctorBanner = Class.create();
AtrAffiliate.doctorBanner.prototype = {
    initialize : function(banner, form, preview, cancel, template, showText, hideText) {
        this.showText = showText;
        this.hideText = hideText;
        this.banner = $(banner);
        this.bannerContent = this.banner.select('.banner-content');
        this.form = $(form);
        this.validator = new Validation(form);
        this.preview = $(preview);
        this.cancel = $(cancel);
        this.origData = {};

        var _self = this;

        if($(template)){
            this.template = new Template($(template).innerHTML, Enterprise.templatesPattern);
        }

        if(this.form) {
            this.form.actualSubmit = this.form.submit;

            this.form.submit = function() {
                if(this.validator && this.validator.validate()){
                    this.form.actualSubmit();
                }
                return false;
            }

            this.origData = this.form.serialize(true);
            this.origData['banner-display-image'] = $$('[name="banner-display-image"]')[0].value;

            if (this.preview) {
                Event.observe(this.preview, 'click', this.previewBanner.bind(this));
            }

        }
    },

    /**
     * Toggles the banner display and sets the necessary cookies
     *
     * @param event
     */
    toggleBanner : function(event) {
        event.preventDefault();

        if (this.banner.hasClassName('closed')) {
            Mage.Cookies.clear('doctor_banner_closed');
            this.showBanner();
        } else {
            Mage.Cookies.set('doctor_banner_closed', 1, new Date(new Date().getTime() + ((3600 * 24) * 1000) * 30));	// 30 days (60 * 60 * 24 hours) * 1000 (for milliseconds)
            this.closeBanner();
        }
    },

    /**
     * Shows the banner
     *
     * @param text
     */
    showBanner : function() {
        var _self = this;
        _self.banner.removeClassName('closed');
    },

    /**
     * Hides the banner
     *
     * @param text
     */
    closeBanner : function() {
        var _self = this;
        _self.banner.addClassName('closed');

    },

    /**
     * Previews the banner
     */
    previewBanner : function() {
        if(!(this.validator && this.validator.validate())){
            return false;
        }

        var _self = this,
            data = this.form.serialize(true),
            fileInput = $('banner-form-image'),
            savedImageSrc = $('banner-saved-image');

        if (/MSIE 8|MSIE 9/.test(navigator.userAgent)) {
            data.image = fileInput.value;
            _self.updateBannerContent(data);
        } else {
            var file = fileInput.files[0],
                reader = new FileReader();

            reader.onload = (function(file) {
                return function(e) {
                    data.image = e.target.result;
                    _self.updateBannerContent(data);
                };
            })(file);

            if (file) {
                reader.readAsDataURL(file);
            } else {
                if (savedImageSrc.value) {
                    data.image = savedImageSrc.value;
                }
                _self.updateBannerContent(data);
            }
        }

        // show message and reset view
        var success = $('success-message').show();
        success.offsetWidth;	 // for css transition
        success.addClassName('active');
        jQuery('html, body').animate({scrollTop : jQuery(_self.banner).offset().top}, 500, function() { });

    },

    /**
     * Updates the banner contents based on data passed in json object
     *
     * @param data Object
     */
    updateBannerContent : function(data) {
        // prepare the data for update
        data.banner_text_field_one = data.banner_text_field_one ? data.banner_text_field_one : '';
        data.banner_text_field_two = data.banner_text_field_two ? data.banner_text_field_two : '';

        // update and insert or update, show then insert;
        var _temp = this.template.evaluate(data);

        this.banner.innerHTML = _temp;
        this.bannerContent = this.banner.select('.banner-content');

        jQuery(this.banner.select('.gor-accordion')).Accordion('activate',0);
        if (this.banner.hasClassName('closed')) {
            this.showBanner();
        }
    },

    respond : function() {
        jQuery(this.bannerContent).height(jQuery(this.banner).find('.container-content').outerHeight());
    },

    resetForm : function(e) {
        e.preventDefault();
        var oldFile = $$('[name="banner_image"]')[0];
        var newFile = document.createElement('input');

        newFile.type = 'file';
        newFile.id = oldFile.id;
        newFile.name = oldFile.name;
        newFile.className = oldFile.className;
        newFile.style.cssText = oldFile.style.cssText;

        oldFile.parentNode.replaceChild(newFile, oldFile);

        if(this.banner){
            this.banner.innerHTML = '';
        }

        if($('success-message')){
            $('success-message').remove();
        }

        var _self = this;

        jQuery.each(jQuery(this.form).find('input[type="text"], textarea'), function(i, item) {
            var value = _self.origData[jQuery(item).prop('name')];

            if(value){
                jQuery(item).val(value);
            }
        });
    }
};
/**
 * Homepage Vertical Carousel
 * @param options
 * @returns {AtrHome}
 * @constructor
 */
var AtrHome = function(options){
    this.namespace = options.namespace;
    this.$elm = options.elm;
    this.$slide = options.slide;
    this.$pagination = options.pagination;
    this.$window = jQuery(window);

    this.init();

    return this;
};

AtrHome.prototype.init = function(){
    var _self = this;

    //Set Initial State
    _self.checkPos(_self.$window.scrollTop());

    //Listen to Scroll Event (throttled)
    _self.$window.on('scroll.' + _self.namespace + ', resize.' + _self.namespace,  Gorilla.utilities.throttle(function(e) {
        _self.checkPos(jQuery(this).scrollTop());
    }, 50));

    //store offset
    _self.$slide.data('offset', this.$slide.offset().left);

    //store slide middle position
    for (var i=0; i < _self.$slide.length; i++){
        var elmTop = _self.$slide.eq(i).offset().top + (_self.$slide.eq(i).height() / 2);

        _self.$slide.eq(i).data('middle', elmTop);
    }

    this.$pagination.find('a').on('click', function(e){
        e.preventDefault();

        var where = jQuery(this).attr('href');

        Gorilla.utilities.scrollTo(jQuery(where));
    });
};

AtrHome.prototype.checkPos = function(top) {
    var _self = this;

    //Check if we're above or below the carousel
    if(top >= this.$elm.offset().top && top <= this.$slide.last().offset().top){
        this.$elm.addClass('bg-fixed');

        if(($lazy = this.$elm.find('.banner')).length){
            $lazy.unveil();
        }
    }else{
        this.$elm.removeClass('bg-fixed');
    }

    if(top >= (this.$elm.offset().top + this.$elm.height()) - this.$window.height()){
        this.$elm.addClass('below');
    }else{
        this.$elm.removeClass('below');
    }

    //Set Pagination State
    if(this.$elm.hasClass('bg-fixed')){
        var index = 0;

        for (var i=0; i < _self.$slide.length; i++){
            var elmTop = _self.$slide.eq(i).offset().top + (_self.$slide.eq(i).height() / 2);

            if(elmTop >= top){
                index = i;
                break;
            }
        }

        if(!_self.$slide.eq(index).hasClass('active')){

            if(index - 1 >= 0){
                _self.$slide.removeClass('previous').eq(index).prevAll().addClass('previous');
            }else{
                _self.$slide.removeClass('previous');
            }

            _self.$slide.removeClass('active').eq(index).addClass('active');
            _self.$slide.removeClass('next').eq(index).nextAll().addClass('next');
        }


        //update pagination state
        if(!this.$pagination.find('li').eq(index).hasClass('active')){
            var nextSlide = parseInt(index + 2);

            if(index >= 1){
                this.$pagination.find('.previous').removeClass('disabled').attr('href', '#slide-0' + index);
            }else{
                this.$pagination.find('.previous').addClass('disabled');
            }

            this.$pagination.find('li').removeClass('active').eq(index).addClass('active');

            if(nextSlide <= _self.$slide.length){
                this.$pagination.find('.next').removeClass('disabled').attr('href', '#slide-0' + nextSlide);
            }else{
                this.$pagination.find('.next').addClass('disabled');
            }
        }

        var scrollPercent = (top - this.$elm.offset().top) / (this.$elm.height() - this.$window.height()),
            scrollPercentRound = Math.round(scrollPercent*100);

        this.$elm.find('.scroll-bar').css('width', scrollPercentRound + '%');


        //update background position left
        var offset = this.$slide.offset().left;
        if(offset != this.$slide.data('offset')){
            this.$pagination.css('left', offset);
            this.$slide.data('offset', offset).css('background-position', offset + 'px 50%');
            this.$slide.find('.vertical-align').data('offset', offset).css('right', offset + 'px');
        }
    }else{
        this.$pagination.css('left', '');
        this.$slide.data('offset', 0).css('background-position', '');
        this.$slide.find('.vertical-align').data('offset', 0).css('right', '');
    }
};

AtrHome.prototype.unset = function(){
    var _self = this;

    _self.$window.off('scroll.' + _self.namespace + ', resize.' + _self.namespace);

    this.$elm.removeClass('bg-fixed');
    this.$pagination.css('left', '').find('li').removeClass('active');
    this.$slide.data('offset', 0).css('background-position', '').removeClass('next').removeClass('previous').removeClass('active');
    this.$slide.find('.vertical-align').data('offset', 0).css('right', '');
};

(function($) {

    // Readied
    $(function() {
        var atrHome,
            $elm = $('#pure-features');

        Respond.to([
            {
                'media': '(max-width: 1024px)',
                'namespace': 'homepage',
                'if': function () {
                   if(typeof atrHome === 'object'){
                       atrHome.unset();
                   }

                    $elm.find('.mobile-carousel').owlCarousel({
                        items: 1,
                        singleItem: true,
                        pagination : true,
                        navigation : true,
                        navigationText : [
                            '<button type="button" class="button"><i class="icon-left-carrot"></i></button>',
                            '<button type="button" class="button"><i class="icon-right-carrot"></i></button>'
                        ],
                        baseClass : "gor-carousel",
                        theme : "",
                        addClassActive : true,
                        mouseDrag : false,
                        transitionStyle : "fade",
                        lazyLoad : false,
                        afterInit : function($elm){
                            var $lazy;

                            if(($lazy = $elm.find('.banner')).length){
                                $lazy.unveil();
                            }
                        }
                    });

                },
                'else': function(){

                    if($elm.find('.mobile-carousel').data('owlCarousel')){
                        $elm.find('.mobile-carousel').data('owlCarousel').destroy();
                    }

                    atrHome = new AtrHome({
                        namespace: 'atrHome',
                        elm: $elm,
                        slide:  $elm.find('.slide'),
                        pagination: $elm.find('.pure-features__pagination')
                    });
                }
            }
        ]);

    });

})(window.jQuery);
/**
 * Customer/Practitioner Guided Registration
 * @param options
 * @returns {AtrAffiliate}
 * @constructor
 */
var AtrAffiliateReg = function(options) {
    this.modal = options.modal;
    this.steps = options.steps;
    this.nextBtn = options.buttons;
    this.progress = options.progress;
    this.active = options.active ? options.active : 1;
    this.licenseFormId = options.licenseForm;
    this.profileFormId = options.profileForm;
    this.messages = options.messages;
    this.curStep = 0;

    this.init();

    return this;
};

/**
 * Bind Events
 */
AtrAffiliateReg.prototype.init = function(){
    var _self = this;

    //Bind click event to transition between steps
    $(this.steps).select(this.nextBtn).each(function(elm){
        elm.observe('click', function (e) {
            var step = $(Event.element(e)).readAttribute('data-step');
            var progress = $(Event.element(e)).readAttribute('data-progress');
            var current = $(Event.element(e)).readAttribute('data-current');

            _self.goToStep(step-1,progress-1,current);
        });
    });

    $(this.progress).select('.progress-step').each(function(elm){
        elm.observe('click', function (e) {
            var clicked = $(Event.element(e));

            if(clicked.nodeName == 'SPAN'){
                clicked = clicked.up('.progress-step');
            }

            var goTo = clicked.previousSiblings().size();
            if(goTo >= _self.curStep || (_self.curStep >= 3 && goTo >= _self.curStep - 2)){
                return;
            }

            //var step = (goTo != 0 && _self.curStep >= 3) ? goTo + 2 : goTo;
            var step = $(clicked).readAttribute('data-step');

            _self.goToStep(parseInt(step));
        });
    });


    //Bind Validation & Listen to Form Submission
    var createForm =  new VarienForm(this.profileFormId, false);
    $(this.profileFormId).observe('submit', function(e) {
        _self.submit(createForm);
        Event.stop(e);
    });

    //jQuery is needed here due to the modal plugin
    jQuery('#' + this.modal).on({
        'hidden.Modal' : function(e){
            //clear mesages
            jQuery('#' + _self.messages).html('');

            //go back to the first step
            _self.goToStep(0);
        }
    });
    //End jQuery Usage
};

/**
 * Handle Step Traditions
 * @param index
 */
AtrAffiliateReg.prototype.goToStep = function(index,progress,previous){
    var _self = this,
        steps = $(this.steps).select('.step'),
        progressBar = $(this.progress).select('.progress-step');
    _self.curStep = index;


    //update step display
    for(var step=0; step < steps.length; step++){
        steps[step].removeClassName('active');

        if(step === index){
            steps[step].addClassName('active')
        }
    }
    if (typeof previous != "undefined") {
        progressBar[progress - 1].writeAttribute('data-step', previous-1);
    }
    //update progress bar display

    var progressIndex = index >= 3 ? index - 2 : index;
    if (typeof progress != 'undefined') {
        progressIndex = progress;
    }
    for(var progressItem=0; progressItem < progressBar.length; progressItem++){
        //progressBar[progressItem].removeClassName('active');

        if(progressItem === progressIndex){
            progressBar[progressItem].nextSiblings().each(function(elm){
                elm.removeClassName('active');
            });
            progressBar[progressItem].addClassName('active')
        }
    }
};

/**
 * Handle Profile Ajax Submission
 * @param form
 */
AtrAffiliateReg.prototype.submit = function(form){
    var _self = this;

    if (form.validator && form.validator.validate()) {
        var button = form.form.select('.button')[0];

        // disable and then request
        if (button && button != 'undefined') {
            button.disabled = true;
        }

        var request = new Ajax.Request(form.form.getAttribute('action'), {
            method: 'post',
            parameters: Form.serialize(form.form),
            onComplete: function (xhr) {
                button.disabled = false;
            },
            onSuccess: function (xhr) {
                try {
                    response = eval('(' + xhr.responseText + ')');
                } catch (e) {
                    response = {};
                }

                if(response.success){
                    window.location.href = response.redirectUrl;
                }else{
                    Gorilla.utilities.addMessage('error', response.message, false, jQuery('#' + _self.messages));
                }


            },
            onFailure: function (xhr) {}
        });
    }
};

//initialize
document.observe("dom:loaded", function() {
    var atrSteps = new AtrAffiliateReg({
        modal : 'registration-modal',
        steps : 'registration-steps',
        buttons : '[data-step]',
        progress : 'progress-bar',
        licenseForm : 'license_profile_modal',
        profileForm : 'create_profile_modal',
        messages : 'messages-modal'
    });
});

