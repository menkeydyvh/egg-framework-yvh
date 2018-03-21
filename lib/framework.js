'use strict';

const path = require('path');
const egg = require('egg');
const EGG_PATH = Symbol.for('egg#eggPath');
const EGG_LOADER = Symbol.for('egg#loader');
const loadOpt = require('./loader/moduleLoaderOpt');

class FrameAppWorkerLoader extends egg.AppWorkerLoader {
  load() {
    // super.load();
    // app > plugin > core
    this.loadApplicationExtend();
    this.loadRequestExtend();
    this.loadResponseExtend();
    this.loadContextExtend();
    this.loadHelperExtend();

    // app > plugin
    this.loadCustomApp();
    // app > plugin
    this.loadService();
    // app > plugin > core
    this.loadMiddleware();
    // app
    this.loadController();

    // 模块加入
    let self = this,
      config = self.config,
      modules = config.modules;
    if (modules) {
      modules.forEach((value, key) => {
        //模块controller加载
        let directory = path.join(config.baseDir, 'node_modules', value, 'app/controller');
        self.loadToApp(directory, value, loadOpt);
      });
    }

    this.loadRouter(); // 依赖 controller

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
