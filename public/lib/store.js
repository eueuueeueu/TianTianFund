/**!
 * storejs v2.1.0
 * Local storage localstorage package provides a simple API
 * 
 * Copyright (c) 2024 kenny wang <wowohoo@qq.com>
 * https://jaywcjlove.github.io/store.js/
 * 
 * Licensed under the MIT license.
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.store = factory());
})(this, (function () { 'use strict';

  function isJSON(obj) {
    obj = JSON.stringify(obj);
    if (!/^\{[\s\S]*\}$/.test(obj)) {
      return false;
    }
    return true;
  }
  function stringify(val) {
    return val === undefined || typeof val === "function" ? val + '' : JSON.stringify(val);
  }
  function deserialize(value) {
    if (typeof value !== 'string') {
      return undefined;
    }
    try {
      return JSON.parse(value);
    } catch (e) {
      return value;
    }
  }
  function isFunction(value) {
    return {}.toString.call(value) === "[object Function]";
  }
  function isArray(value) {
    return Object.prototype.toString.call(value) === "[object Array]";
  }
  // https://github.com/jaywcjlove/store.js/pull/8
  // Error: QuotaExceededError
  function dealIncognito(storage) {
    var _KEY = '_Is_Incognit',
      _VALUE = 'yes';
    try {
      // NOTE: set default storage when not passed in
      if (!storage) {
        storage = window.localStorage;
      }
      storage.setItem(_KEY, _VALUE);
      storage.removeItem(_KEY);
    } catch (e) {
      var inMemoryStorage = {};
      inMemoryStorage._data = {};
      inMemoryStorage.setItem = function (id, val) {
        return inMemoryStorage._data[id] = String(val);
      };
      inMemoryStorage.getItem = function (id) {
        return inMemoryStorage._data.hasOwnProperty(id) ? inMemoryStorage._data[id] : undefined;
      };
      inMemoryStorage.removeItem = function (id) {
        return delete inMemoryStorage._data[id];
      };
      inMemoryStorage.clear = function () {
        return inMemoryStorage._data = {};
      };
      storage = inMemoryStorage;
    } finally {
      if (storage.getItem(_KEY) === _VALUE) storage.removeItem(_KEY);
    }
    return storage;
  }

  // deal QuotaExceededError if user use incognito mode in browser
  var storage = dealIncognito();
  function Store() {
    if (!(this instanceof Store)) {
      return new Store();
    }
  }
  Store.prototype = {
    set: function set(key, val) {
      if (key && !isJSON(key)) {
        storage.setItem(key, stringify(val));
      } else if (isJSON(key)) {
        for (var a in key) this.set(a, key[a]);
      }
      return this;
    },
    get: function get(key) {
      // Return all entries if no key
      if (key === undefined) {
        var ret = {};
        this.forEach(function (key, val) {
          return ret[key] = val;
        });
        return ret;
      }
      if (key.charAt(0) === '?') {
        return this.has(key.substr(1));
      }
      var args = arguments;
      if (args.length > 1) {
        var dt = {};
        for (var i = 0, len = args.length; i < len; i++) {
          var value = deserialize(storage.getItem(args[i]));
          if (this.has(args[i])) {
            dt[args[i]] = value;
          }
        }
        return dt;
      }
      return deserialize(storage.getItem(key));
    },
    clear: function clear() {
      storage.clear();
      return this;
    },
    remove: function remove(key) {
      var val = this.get(key);
      storage.removeItem(key);
      return val;
    },
    has: function has(key) {
      return {}.hasOwnProperty.call(this.get(), key);
    },
    keys: function keys() {
      var d = [];
      this.forEach(function (k) {
        d.push(k);
      });
      return d;
    },
    forEach: function forEach(callback) {
      for (var i = 0, len = storage.length; i < len; i++) {
        var key = storage.key(i);
        callback(key, this.get(key));
      }
      return this;
    },
    search: function search(str) {
      var arr = this.keys(),
        dt = {};
      for (var i = 0, len = arr.length; i < len; i++) {
        if (arr[i].indexOf(str) > -1) dt[arr[i]] = this.get(arr[i]);
      }
      return dt;
    },
    len: function len() {
      return storage.length;
    }
  };
  var _Store = null;
  function store(key, data) {
    var argm = arguments;
    var dt = null;
    if (!_Store) _Store = Store();
    if (argm.length === 0) return _Store.get();
    if (argm.length === 1) {
      if (typeof key === "string") return _Store.get(key);
      if (isJSON(key)) return _Store.set(key);
    }
    if (argm.length === 2 && typeof key === "string") {
      if (!data) return _Store.remove(key);
      if (data && typeof data === "string") return _Store.set(key, data);
      if (data && isFunction(data)) {
        dt = null;
        dt = data(key, _Store.get(key));
        store.set(key, dt);
      }
    }
    if (argm.length === 2 && isArray(key) && isFunction(data)) {
      for (var i = 0, len = key.length; i < len; i++) {
        dt = data(key[i], _Store.get(key[i]));
        store.set(key[i], dt);
      }
    }
    return store;
  }
  for (var a in Store.prototype) store[a] = Store.prototype[a];

  return store;

}));
