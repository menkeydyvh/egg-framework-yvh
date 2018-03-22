'use strict';

const path = require('path');
const egg = require('egg');
const EGG_PATH = Symbol.for('egg#eggPath');
const EGG_LOADER = Symbol.for('egg#loader');
const loadOpt = require('./loader/moduleLoaderOpt');

class FrameAppWorkerLoader extends egg.AppWorkerLoader {
  load() {
    // super.load();
    let self = this;
    // app > plugin > core
    self.loadApplicationExtend();
    self.loadRequestExtend();
    self.loadResponseExtend();
    self.loadContextExtend();
    self.loadHelperExtend();

    // app > plugin
    self.loadCustomApp();
    // app > plugin
    self.loadService();
    // app > plugin > core
    self.loadMiddleware();
    // app
    self.loadController();

    // 模块加入
    let config = self.config,
      modules = config.modules;
    if (modules) {
      modules.forEach((value, key) => {
        //模块controller加载
        let directory = path.join(config.baseDir, 'node_modules', value, 'app/controller');
        self.loadToApp(directory, value, loadOpt);
      });
    }

    self.loadRouter(); // 依赖 controller

  }

  loadConfig() {
    super.loadConfig();
    // 对 config 进行处理
  }
}

class Application extends egg.Application {
  get [EGG_PATH]() {
    return path.dirname(__dirname);
  }

  get [EGG_LOADER]() {
    return FrameAppWorkerLoader;
  }
}

class Agent extends egg.Agent {
  get [EGG_PATH]() {
    return path.dirname(__dirname);
  }
}

module.exports = Object.assign(egg, {
  Application,
  Agent,
  AppWorkerLoader: FrameAppWorkerLoader,
});
