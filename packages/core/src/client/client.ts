import { PluginManger, type APMPlugin } from '../plugin/pluginManger';
import { createSender } from '../sender/sender';

type PluginType = Array<(...args: unknown[]) => APMPlugin>;

export interface APMConfig {
  /**是否开启*/
  enable?: boolean;
  /**插件列表*/
  plugins?: PluginType;
  /** 开启debug信息*/
  debug?: boolean;
}

export async function createClient(config: APMConfig) {
  const defaultPlugin = [] as PluginType;

  const plugins = [...defaultPlugin, ...(config?.plugins || [])].map((plugin) =>
    plugin.call(null, config),
  );

  const pluginManger = new PluginManger(plugins);

  const sender = createSender();

  await pluginManger.callHook('init', config);
  console.log(sender, 'sender123');
}
