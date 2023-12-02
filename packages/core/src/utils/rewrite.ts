export function rewrite(
  source: { [key: string]: any },
  name: string,
  rewriteFactory: (...args: any[]) => any,
): any {
  if (!(name in source)) return;

  const original = source[name] as () => unknown;

  try {
    const wrap = rewriteFactory(original);
    source[name] = wrap;
  } catch (e) {
    console.error('rewrite error', e);
  }
}
