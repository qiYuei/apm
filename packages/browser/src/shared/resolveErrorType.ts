const ERROR_TYPES_RE =
  /^(?:[Uu]ncaught (?:exception: )?)?(?:((?:Eval|Internal|Range|Reference|Syntax|Type|URI|)Error): )?(.*)$/i;

export function resolveErrorType(msg: string): string {
  const match = msg.match(ERROR_TYPES_RE);
  return match ? match[1] : 'Error';
}
