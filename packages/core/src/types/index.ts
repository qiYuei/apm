export type MaybePromise<T> = T | Promise<T>;

export type ApmErrorSubType = 'JS' | 'PROMISE' | 'XHR' | 'FETCH';

export type ApmResourceSubType = 'JS' | 'CSS' | 'IMAGE' | 'OTHERS' | 'LINK';

export type ApmPerformanceSubType = 'FP' | 'FCP' | 'LCP';
