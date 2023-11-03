import type { ApmBrowserConfigure } from '../client/browser';
import { isSupportFetch, isSupportSendBeacon } from '../shared/utils';
import type { ApmClient } from '@apm/core';

interface ApmBaseSender {
  url: string;
  data: unknown;
}

export interface ApmImageSender extends ApmBaseSender {
  // mode: 'image';
}

export interface ApmXhrSender extends ApmBaseSender {
  // mode: 'xhr';
}
export interface ApmFetchSender extends ApmBaseSender {
  // mode: 'fetch';
}
export interface ApmBeaconSender extends ApmBaseSender {
  // mode: 'beacon';
}

export interface ApmSenderType {
  image: ApmImageSender;
  xhr: ApmXhrSender;
  fetch: ApmFetchSender;
  beacon: ApmBeaconSender;
}

export type ApmSender = ApmImageSender | ApmXhrSender | ApmFetchSender | ApmBeaconSender;

/**
 * 降级处理如果window.navigator.sendBeacon 不支持
 * 则采用 fetch|xhr 降级处理
 * 为何不用image 是防止经过延迟上报后的聚合数据在 url 被浏览器截断
 * 但是就要 fetch |xhr 的地址支持跨域
 */
function useBeacon() {
  if (isSupportSendBeacon()) {
    return beaconSender;
  }
  return isSupportFetch() ? fetchSender : xhrSender;
}

export function createSender(config: ApmBrowserConfigure) {
  const { senderConfigure = { mode: 'beacon' } } = config;

  return (client: ApmClient) => {
    let sender: unknown;
    switch (senderConfigure.mode) {
      case 'image':
        sender = imageSender;
        break;
      case 'xhr':
        sender = xhrSender;
        break;
      case 'fetch':
        sender = fetchSender;
        break;
      case 'beacon':
      default:
        sender = useBeacon();
        break;
    }

    return async (data: unknown) => {
      const sendConfig = {
        ...senderConfigure,
        data,
      };

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore todo
      sender(sendConfig);
    };
  };
}

function imageSender(opts: ApmImageSender) {
  const { url, data } = opts;
  const img = new Image();
  img.src = `${url}?reportData=${JSON.stringify(data)}`;
}

function xhrSender(opts: ApmXhrSender) {
  const { url, data } = opts;
  const xhr = new XMLHttpRequest();
  xhr.open('POST', url);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify(data));
}

function fetchSender(opts: ApmFetchSender) {
  const fetch = window.fetch;

  fetch(opts.url, {
    body: JSON.stringify(opts.data),
    referrerPolicy: 'origin',
    method: 'POST',
    keepalive: true,
  }).catch(() => {
    // need catch error
  });
}

function beaconSender(opts: ApmBeaconSender) {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const beacon = window.navigator.sendBeacon;
  const status = beacon(opts.url, JSON.stringify(opts.data));
  if (!status) {
    // 有可能是数据过大降级使用 fetch|xhr

    isSupportFetch()
      ? fetchSender({ url: opts.url, data: opts.data })
      : xhrSender({ url: opts.url, data: opts.data });
  }
}
