import { APMResponse } from '@/shared/server/response';
import initModels from '@/models/index';
import { type NextRequest } from 'next/server';
import type { BreadcrumbPushData, ApmTrackerType } from '@apm/core';

interface ApmReport<T extends keyof ApmTrackerType> extends BreadcrumbPushData {
  data: { ErrorId?: string } & ApmTrackerType[T];
}

function filter(reports: BreadcrumbPushData[]) {
  return reports.reduce(
    (pre, report) => {
      pre[report.type].push(report);
      return pre;
    },
    { Custom: [], Error: [], Performance: [], Resource: [], Http: [] } as Record<
      keyof ApmTrackerType,
      BreadcrumbPushData[]
    >,
  );
}

export async function POST(request: NextRequest) {
  // console.log('POST', request.json())
  const res = await request.json();
  const { models } = await initModels();

  const {
    hint: { reports, time: reportTime },
    ticket,
  } = res as { hint: { reports: BreadcrumbPushData[]; time: number }; ticket: string };

  const ip = request.ip;

  // const filterReports = filter(reports)

  const errorReports = reports.filter((report) => report.type === 'Error') as Array<
    ApmReport<'Error'>
  >;

  const performanceReports = reports.filter((report) => report.type === 'Performance') as Array<
    ApmReport<'Performance'>
  >;

  const resourceReports = reports.filter((report) => report.type === 'Resource') as Array<
    ApmReport<'Resource'>
  >;

  const requestReports = reports.filter((report) => report.type === 'Http') as Array<
    ApmReport<'Http'>
  >;

  const insertQueue = [];

  if (errorReports.length) {
    insertQueue.push(
      models.errorBreadcrumb.bulkCreate(
        errorReports.map((r) => {
          const { data, time, type, level } = r;
          return {
            sub_type: data.subType,
            error_id: data.ErrorId,
            brief_message: data.msg,
            user_point: ticket,
            page_href: data.pageURL,
            notify_level: level,
            line: data.line,
            column: data.column,
            stack: JSON.stringify(data.stack),
            trigger_time: data.startTime,
            report_time: reportTime,
          };
        }),
      ),
    );
  }

  if (performanceReports.length) {
    insertQueue.push(
      models.performanceBreadcrumb.bulkCreate(
        performanceReports.map((r) => {
          const { data } = r;
          //  const {subType} = data
          const subType = data.subType;
          if (subType === 'timing') {
            const { type, subType, ...others } = data;
            return {
              sub_type: subType,
              user_point: ticket,
              timing: JSON.stringify(others),
            };
          }
          return {
            sub_type: subType,
            indicator: data.indicator,
            user_point: ticket,
          };
        }),
      ),
    );
  }

  if (resourceReports.length) {
    insertQueue.push(
      models.resourceBreadcrumb.bulkCreate(
        resourceReports.map((r) => {
          const { data } = r;
          return {
            sub_type: data.subType,
            tag_name: data.tagName,
            src: data.src,
            page_url: data.pageURL,
            out_html: data.outHtml,
            user_point: ticket,
            start_time: data.startTime,
          };
        }),
      ),
    );
  }

  if (requestReports.length) {
    insertQueue.push(
      models.requestBreadcrumb.bulkCreate(
        requestReports.map((r) => {
          const { data } = r;
          return {
            sub_type: data.subType,
            input: data.input,
            method: data.method,
            request_status: data.httpStatus,
            body: data.body,
            elapsed_time: data.elapsedTime,
            network: data.netWork,
            state: data.state,
            message: data.message,
            timing: data.timing,
            user_point: ticket,
            trigger_time: data.startTime,
            report_time: reportTime,
            notify_level: r.level,
          };
        }),
      ),
    );
  }

  try {
    await Promise.all(insertQueue);
    return APMResponse({ message: 'OK!' });
  } catch (e) {
    return APMResponse({ message: 'Error!', code: -1, details: JSON.stringify(e) });
  }
}
