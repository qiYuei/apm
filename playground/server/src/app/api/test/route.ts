import { APMResponse } from '@/shared/server/response';
import { type NextRequest } from 'next/server';

export function GET(request: NextRequest) {
  return APMResponse({ data: 'hello world' });
}

export function POST(request: NextRequest) {
  return APMResponse({
    code: -1,
    message: 'error',
    details: '111111111111111111111111111333333333333333332242',
  });
}
