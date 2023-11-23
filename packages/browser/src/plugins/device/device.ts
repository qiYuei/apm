export interface deviceInformation {
  host: string;
  hostname: string;
  href: string;
  protocol: string;
  origin: string;
  port: string;
  pathname: string;
  search: string;
  hash: string;
  language: string;
  // 网页标题
  title: string;
  // 用户 userAgent 信息
  userAgent?: string;
  // 屏幕宽高 (eg:1920x1080)  屏幕宽高意为整个显示屏的宽高
  winScreen: string;
  // 文档宽高 (eg:1388x937)   文档宽高意为当前页面显示的实际宽高（有的同学喜欢半屏显示）
  docScreen: string;
  // 显示屏幕调色板的比特深度
  colorDepth: number;
  // 显示屏幕的颜色分辨率
  pixelDepth: number;
}

export const getDeviceInfo = (): deviceInformation => {
  const { host, hostname, href, protocol, origin, port, pathname, search, hash } = window.location;
  const { width, height, colorDepth, pixelDepth } = window.screen;
  const { language, userAgent } = navigator;

  return {
    host,
    hostname,
    href,
    protocol,
    origin,
    port,
    pathname,
    search,
    hash,
    title: document.title,
    language: language.substr(0, 2),
    userAgent,
    winScreen: `${width}x${height}`,
    docScreen: `${document.documentElement.clientWidth || document.body.clientWidth}x${
      document.documentElement.clientHeight || document.body.clientHeight
    }`,
    colorDepth,
    pixelDepth,
  };
};
