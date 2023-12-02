export type EventHandler<T extends keyof WindowEventMap> = (
  this: Window,
  event: WindowEventMap[T],
) => void;

type EventMap<T> = T extends Window
  ? WindowEventMap
  : T extends XMLHttpRequest
  ? XMLHttpRequestEventTargetEventMap
  : T extends HTMLElement
  ? GlobalEventHandlersEventMap
  : never;

export function on<T extends EventTarget, K extends keyof EventMap<T>>(
  target: T,
  eventName: K,
  cb: (event: EventMap<T>[K]) => void,
) {
  target.addEventListener(eventName.toString(), cb as EventListener);
}

export function off<T extends EventTarget, K extends keyof EventMap<T>>(
  target: T,
  eventName: K,
  cb: (event: EventMap<T>[K]) => void,
) {
  target.removeEventListener(eventName.toString(), cb as EventListener);
}
