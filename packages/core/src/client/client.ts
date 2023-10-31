import { PluginManger, type APMPlugin } from '../plugin/pluginManger';
import { type ApmSenderType, createSender } from '../sender/sender';
import { createTracker, type ApmTracker } from '../tracker/tracker';
import { ApmError } from '../utils';
import { Breadcrumb, type ApmBreadcrumbConfigure, type BreadcrumbPushData } from './breadcrumb';

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
    url: string;
    mode?: keyof ApmSenderType;
    xhrHeaders?: Record<string, string>;
    interval?: number;
  } & Record<string, unknown>;

  breadcrumbConfigure?: ApmBreadcrumbConfigure;
}

export interface ApmClient {
  config: APMConfig;
  tracker: ApmTracker;
  plugins: PluginManger;
  transport(data: BreadcrumbPushData, immediate?: boolean): void;
}

export class Client implements ApmClient {
  config: APMConfig;
  plugins: PluginManger;
  tracker: ApmTracker;

  private initd: boolean = false;
  private sender: (data: unknown) => Promise<void>;
  private breadcrumb: Breadcrumb;

  private timer: NodeJS.Timeout | null = null;
  constructor(config: APMConfig, pluginController: PluginManger) {
    this.config = config;
    this.plugins = pluginController;
    this.tracker = createTracker(this);
    this.sender = createSender(config, this);
    this.breadcrumb = new Breadcrumb(config.breadcrumbConfigure);
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
      .catch((e) => {
        // 需要提取出具体的堆栈，但是也有可能只是 string
        this.transport(ApmError({ message: 'apm init failed', e }));
      });
  }
  //  init 实现队列
  transport(data: BreadcrumbPushData, immediate = false) {
    if (immediate) {
      this.transportIdle(data);
      return;
    }

    this.breadcrumb.push(data);
    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.timer = setTimeout(
      () => {
        this.breadcrumb.debugger(`will sender`, this.breadcrumb.getStack());
        this.transportIdle(this.breadcrumb.getStack(), () => this.breadcrumb.flush());
      },
      this.config.senderConfigure?.interval,
    );
  }

  transportIdle(data: BreadcrumbPushData[] | BreadcrumbPushData, cb?: () => void) {
    const transportData = Array.isArray(data) ? data : [data];
    window.requestIdleCallback(() => {
      this.sender(transportData)
        .then(() => {
          cb && cb();
        })
        .catch((e) => {
          ApmError({ message: 'error' + e });
        });
    });
  }
}

export function createClient(config: APMConfig) {
  const defaultConfig: APMConfig = {
    debug: false,
    senderConfigure: {
      mode: 'beacon',
      interval: 3000,
      url: 'xxxx',
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
