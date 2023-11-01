export function rewrite(
  source: { [key: string]: unknown },
  name: string,
  rewriteFactory: (...args: unknown[]) => unknown,
): void {
  if (!(name in source)) return;

  const original = source[name] as () => unknown;

  try {
    const wrap = rewriteFactory(original);
    source[name] = wrap;
  } catch (e) {
    console.error('rewrite error', e);
  }
}
