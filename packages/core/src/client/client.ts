import { PluginManger, type APMPlugin } from '../plugin/pluginManger';
import { type ApmSenderType, createSender } from '../sender/sender';
import { createTracker, type ApmTracker } from '../tracker/tracker';
import { ApmError } from '../utils';
import { Breadcrumb, type ApmBreadcrumbConfigure, type BreadcrumbPushData } from './breadcrumb';

export interface APMConfig {
  /**是否开启*/
  enable?: boolean;
  /**插件列表*/
  plugins?: APMPlugin[];
  /** 开启debug信息*/
  debug?: boolean;
  /** SenderConfigure */
  senderConfigure: {
    url: string;
    mode?: keyof ApmSenderType;
    /** xhr|fetch 传递的header */
    header?: Record<string, string>;
    /** 默认防抖3秒 */
    interval?: number;
    fetchOptions?: RequestInit;
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
  }

  init(onComplete?: () => void, onFailed?: (e: unknown) => void) {
    if (this.initd) return;
    this.plugins
      .callParallelHook('init', this)
      .then(() => {
        onComplete?.();
        this.initd = true;
      })
      .catch((e) => {
        // 需要提取出具体的堆栈，但是也有可能只是 string
        // this.transport(ApmError({ message: 'apm init failed', e }));
        onFailed?.(e);
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
      this.config.senderConfigure?.interval || 5000,
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

  const defaultPlugin = [] as APMPlugin[];

  const plugins = [...defaultPlugin, ...(userConfig?.plugins || [])];

  const pluginManger = new PluginManger(plugins);

  const client = new Client(userConfig, pluginManger);

  return client;
}
