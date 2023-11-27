import { type NextRequest } from 'next/server';
import { createHash } from 'node:crypto';
import initModels from '@/models/index';
import { APMResponse } from '@/shared/server/response';
export async function POST(request: NextRequest) {
  const res = await request.json();
  const { devices } = res;
  console.log(request.ip, '==================================');
  const hash = createHash('md5').update(JSON.stringify(devices)).digest('hex');

  const { models } = await initModels();

  const [user, isCreate] = await models.users.findOrCreate({
    where: {
      token: hash,
    },
    defaults: {
      token: hash,
      user_agent: devices.userAgent,
      ip_address: request.ip || 'unknown ip address',
      device: JSON.stringify(devices),
    },
  });

  await user.update({
    last_record: Date.now(),
  });

  const result = user.toJSON();

  return APMResponse({
    data: {
      token: result.token,
    },
  });
}
