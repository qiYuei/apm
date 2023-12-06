import { PluginManger, type APMPlugin } from '../plugin/pluginManger';
import { createTracker, type ApmTracker, type ApmErrorTracker } from '../tracker';
import { ApmError } from '../utils';
import { createErrorEventId } from '../utils/error';
import { Breadcrumb, type ApmBreadcrumbConfigure, type BreadcrumbPushData } from './breadcrumb';

export interface APMConfig {
  /**是否开启*/
  enable?: boolean;
  /**插件列表*/
  plugins?: APMPlugin[];
  /** 开启debug信息*/
  debug?: boolean;
  breadcrumbConfigure?: ApmBreadcrumbConfigure;
  /** 防抖 */
  interval: number;
}

export interface ApmClient {
  config: APMConfig;
  tracker: ApmTracker;
  plugins: PluginManger;
  transport(data: BreadcrumbPushData, immediate?: boolean): void;
}

export type ApmSenderFactory = (client: ApmClient) => (data: BreadcrumbPushData[]) => Promise<void>;

export class Client implements ApmClient {
  config: APMConfig;
  plugins: PluginManger;
  tracker: ApmTracker;

  private initd: boolean = false;
  private sender: (data: BreadcrumbPushData[]) => Promise<void>;
  private breadcrumb: Breadcrumb;

  private timer: NodeJS.Timeout | null = null;

  private trackErrorIdMap: Map<string, boolean> = new Map();
  constructor(config: APMConfig, pluginController: PluginManger, senderFactory: ApmSenderFactory) {
    this.config = config;
    this.plugins = pluginController;
    this.breadcrumb = new Breadcrumb(config.breadcrumbConfigure);

    this.tracker = createTracker(this);
    // this.sender = createSender(config, this);
    this.sender = senderFactory(this);
  }

  init(onComplete?: () => void, onFailed?: (e: unknown) => void) {
    if (this.initd) return;
    this.plugins
      .callParallelHook('setup', this)
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

  destroy() {
    this.plugins.callParallelHook('destroy', this);
  }

  transport(data: BreadcrumbPushData, immediate = false) {
    if (data.type === 'Error') {
      const errorId = createErrorEventId(data.data as ApmErrorTracker);
      if (this.trackErrorIdMap.has(errorId)) return;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      data.data.ErrorId = errorId;
      this.trackErrorIdMap.set(errorId, true);
    }

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
      this.config?.interval || 5000,
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

export interface ApmCreateClientOpts {
  senderFactory: ApmSenderFactory;
}

export function createClient(config: APMConfig, opts: ApmCreateClientOpts) {
  const defaultConfig: APMConfig = {
    debug: false,
    interval: 5000,
  };

  const userConfig = Object.assign({}, defaultConfig, config);

  const defaultPlugin = [] as APMPlugin[];

  const plugins = [...defaultPlugin, ...(userConfig?.plugins || [])];

  const pluginManger = new PluginManger(plugins);

  const client = new Client(userConfig, pluginManger, opts.senderFactory);

  return client;
}
