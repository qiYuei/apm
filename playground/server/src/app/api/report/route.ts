import { APMResponse } from '@/shared/server/response';
import initModels from '@/models/index';
import { type NextRequest } from 'next/server';
import type { BreadcrumbPushData } from '@apm/core';

export async function POST(request: NextRequest) {
  // console.log('POST', request.json())
  const res = await request.json();
  const { models } = await initModels();

  const {
    hint: { reports, time: reportTime },
    ticket,
  } = res as { hint: { reports: BreadcrumbPushData[]; time: number }; ticket: string };

  const ip = request.ip;

  const errorReports = reports.filter((report) => report.type === 'Error');

  await models.errorBreadcrumb.bulkCreate(
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
  );

  return APMResponse({ message: 'OK!' });
}
