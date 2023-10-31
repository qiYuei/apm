import { PluginManger, type APMPlugin } from '../plugin/pluginManger';
import { type ApmSenderType, createSender } from '../sender/sender';
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
  /** SenderConfigure */
  senderConfigure: {
    mode: keyof ApmSenderType;
  } & Record<string, unknown>;
}

export interface ApmClient {
  config: APMConfig;
  tracker: ApmTracker;
  plugins: PluginManger;
}

export class Client implements ApmClient {
  config: APMConfig;
  plugins: PluginManger;
  tracker: ApmTracker;

  private initd: boolean = false;
  private sender: (data: unknown) => Promise<void>;
  constructor(config: APMConfig, pluginController: PluginManger) {
    this.config = config;
    this.plugins = pluginController;
    this.tracker = createTracker(this);
    this.sender = createSender(config, this);

    this.init();
  }

  init() {
    if (this.initd) return;
    this.plugins
      .callParallelHook('init', this.config, this)
      .then(() => {
        if (typeof this.config.ready === 'function') {
          this.config.ready(this);
        }
        this.initd = true;
      })
      .catch(() => {});
  }
  //  init 实现队列

  flush() {
    
  }
}

export function createClient(config: APMConfig) {
  const defaultConfig: APMConfig = {
    debug: false,
    senderConfigure: {
      mode: 'beacon',
    },
  };

  const userConfig = Object.assign({}, defaultConfig, config);

  const defaultPlugin = [] as PluginType;

  const plugins = [...defaultPlugin, ...(userConfig?.plugins || [])].map((plugin) =>
    plugin.call(null, userConfig),
  );

  const pluginManger = new PluginManger(plugins);

  const client = new Client(userConfig, pluginManger);

  return client;
}
