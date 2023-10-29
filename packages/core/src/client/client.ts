import { PluginManger, type APMPlugin } from '../plugin/pluginManger';
import { createSender } from '../sender/sender';
import { createTracker, type ApmTracker } from '../tracker/tracker';

type PluginType = Array<(...args: unknown[]) => APMPlugin>;

export interface APMConfig {
  /**是否开启*/
  enable?: boolean;
  /**插件列表*/
  plugins?: PluginType;
  /** 开启debug信息*/
  debug?: boolean;
  /** */
  ready?: (Client: Client) => void;
}

class Client {
  config: APMConfig;
  plugins: PluginManger;
  tracker: ApmTracker;

  constructor(config: APMConfig, pluginController: PluginManger) {
    this.config = config;
    this.plugins = pluginController;
    this.tracker = createTracker();
    this.init();
  }

  init() {
    this.plugins
      .callHook('init', this.config)
      .then(() => {
        if (typeof this.config.ready === 'function') {
          this.config.ready(this);
        }
      })
      .catch(() => {});
  }
}

export function createClient(config: APMConfig) {
  const defaultPlugin = [] as PluginType;

  const plugins = [...defaultPlugin, ...(config?.plugins || [])].map((plugin) =>
    plugin.call(null, config),
  );

  const pluginManger = new PluginManger(plugins);

  const client = new Client(config, pluginManger);

  const sender = createSender();

  console.log(sender, 'sender123');
  return client;
}
