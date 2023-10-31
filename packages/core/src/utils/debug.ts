import debug from 'debug';
export type ApmDebugScope = `apm:${string}`;

export function createDebugger(namespace: ApmDebugScope): debug.Debugger['log'] {
  const log = debug(namespace);

  return (msg: string, ...args: unknown[]) => {
    log(msg, ...args);
  };
}
