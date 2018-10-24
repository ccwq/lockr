(function(root, factory) {

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = factory(root, exports);
    }
  } else if (typeof define === 'function' && define.amd) {
    define(['exports'], function(exports) {
      root.Lockrss = factory(root, exports);
    });
  } else {
    root.Lockrss = factory(root, {});
  }

}(this, function(root, Lockrss) {
  'use strict';

  if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(elt /*, from*/)
    {
      var len = this.length >>> 0;

      var from = Number(arguments[1]) || 0;
      from = (from < 0)
      ? Math.ceil(from)
      : Math.floor(from);
      if (from < 0)
        from += len;

      for (; from < len; from++)
      {
        if (from in this &&
            this[from] === elt)
          return from;
      }
      return -1;
    };
  }

  Lockrss.prefix = "";

  Lockrss._getPrefixedKey = function(key, options) {
    options = options || {};

    if (options.noPrefix) {
      return key;
    } else {
      return this.prefix + key;
    }

  };

  Lockrss.set = function (key, value, options) {
    var query_key = this._getPrefixedKey(key, options);

    try {
      sessionStorage.setItem(query_key, JSON.stringify({"data": value}));
    } catch (e) {
      if (console) console.warn("Lockrss didn't successfully save the '{"+ key +": "+ value +"}' pair, because the sessionStorage is full.");
    }
  };

  Lockrss.get = function (key, missing, options) {
    var query_key = this._getPrefixedKey(key, options),
        value;

    try {
      value = JSON.parse(sessionStorage.getItem(query_key));
    } catch (e) {
            if(sessionStorage[query_key]) {
              value = {data: sessionStorage.getItem(query_key)};
            } else{
                value = null;
            }
    }
    
    if(!value) {
      return missing;
    }
    else if (typeof value === 'object' && typeof value.data !== 'undefined') {
      return value.data;
    }
  };

  Lockrss.sadd = function(key, value, options) {
    var query_key = this._getPrefixedKey(key, options),
        json;

    var values = Lockrss.smembers(key);

    if (values.indexOf(value) > -1) {
      return null;
    }

    try {
      values.push(value);
      json = JSON.stringify({"data": values});
      sessionStorage.setItem(query_key, json);
    } catch (e) {
      console.log(e);
      if (console) console.warn("Lockrss didn't successfully add the "+ value +" to "+ key +" set, because the sessionStorage is full.");
    }
  };

  Lockrss.smembers = function(key, options) {
    var query_key = this._getPrefixedKey(key, options),
        value;

    try {
      value = JSON.parse(sessionStorage.getItem(query_key));
    } catch (e) {
      value = null;
    }
    
    return (value && value.data) ? value.data : [];
  };

  Lockrss.sismember = function(key, value, options) {
    return Lockrss.smembers(key).indexOf(value) > -1;
  };

  Lockrss.keys = function() {
    var keys = [];
    var allKeys = Object.keys(sessionStorage);

    if (Lockrss.prefix.length === 0) {
      return allKeys;
    }

    allKeys.forEach(function (key) {
      if (key.indexOf(Lockrss.prefix) !== -1) {
        keys.push(key.replace(Lockrss.prefix, ''));
      }
    });

    return keys;
  };

  Lockrss.getAll = function (includeKeys) {
    var keys = Lockrss.keys();

    if (includeKeys) {
      return keys.reduce(function (accum, key) {
        var tempObj = {};
        tempObj[key] = Lockrss.get(key);
        accum.push(tempObj);
        return accum;
      }, []);
    }

    return keys.map(function (key) {
      return Lockrss.get(key);
    });
  };

  Lockrss.srem = function(key, value, options) {
    var query_key = this._getPrefixedKey(key, options),
        json,
        index;

    var values = Lockrss.smembers(key, value);

    index = values.indexOf(value);

    if (index > -1)
      values.splice(index, 1);

    json = JSON.stringify({"data": values});

    try {
      sessionStorage.setItem(query_key, json);
    } catch (e) {
      if (console) console.warn("Lockrss couldn't remove the "+ value +" from the set "+ key);
    }
  };

  Lockrss.rm =  function (key) {
    var queryKey = this._getPrefixedKey(key);
    
    sessionStorage.removeItem(queryKey);
  };

  Lockrss.flush = function () {
    if (Lockrss.prefix.length) {
      Lockrss.keys().forEach(function(key) {
        sessionStorage.removeItem(Lockrss._getPrefixedKey(key));
      });
    } else {
      sessionStorage.clear();
    }
  };
  return Lockrss;

}));
