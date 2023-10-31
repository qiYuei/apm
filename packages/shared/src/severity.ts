/** 等级程度枚举 */
export enum Severity {
  Other = 'other',
  Error = 'error',
  Warning = 'warning',
  Info = 'info',
  Debug = 'debug',
  /** 上报的错误等级 */
  Low = 'low',
  Normal = 'normal',
  High = 'high',
  Critical = 'critical',
}

export type ApmSeverity = 'low' | 'normal' | 'high' | 'critical';

/** 上报类型 */
export enum ReportType {
  ERROR = 'Error',
  VUE = 'Vue',
  REACT = 'React',
  ROUTE = 'Route',
  XHR = 'Xhr',
  FETCH = 'Fetch',
  RESOURCE = 'Resource',
  CUSTOMER = 'Customer',
  APM = 'Apm',
}

export type ApmReportType =
  | 'Error'
  | 'Vue'
  | 'React'
  | 'Route'
  | 'Xhr'
  | 'Fetch'
  | 'Resource'
  | 'Customer'
  | 'Apm';
