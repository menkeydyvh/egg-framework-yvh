'use strict';

const path = require('path');
const is = require('is-type-of');
const utils = require('egg-core/lib/utils');
const FULLPATH = require('egg-core/lib/loader/file_loader').FULLPATH;


module.exports = {
  caseStyle: 'lower',
  initializer: (obj, opt) => {
    if (is.class(obj)) {
      obj.prototype.pathName = opt.pathName;
      obj.prototype.fullPath = opt.path;
      return wrapClass(obj);
    }
    return obj;
  },
}

// wrap the class, yield a object with middlewares
function wrapClass(Controller) {
  let proto = Controller.prototype;
  const ret = {};
  // tracing the prototype chain
  while (proto !== Object.prototype) {
    const keys = Object.getOwnPropertyNames(proto);
    for (const key of keys) {
      // getOwnPropertyNames will return constructor
      // that should be ignored
      if (key === 'constructor') {
        continue;
      }
      // skip getter, setter & non-function properties
      const d = Object.getOwnPropertyDescriptor(proto, key);
      // prevent to override sub method
      if (is.function(d.value) && !ret.hasOwnProperty(key)) {
        ret[key] = methodToMiddleware(Controller, key);
        ret[key][FULLPATH] = Controller.prototype.fullPath + '#' + Controller.name + '.' + key + '()';
      }
    }
    proto = Object.getPrototypeOf(proto);
  }

  return ret;

  function methodToMiddleware(Controller, key) {
    return function classControllerMiddleware(...args) {
      const controller = new Controller(this);
      if (!this.app.config.controller || !this.app.config.controller.supportParams) {
        args = [this];
      }
      return utils.callFn(controller[key], args, controller);
    };
  }
}