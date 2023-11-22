import connect from '../../../models/index';
export async function GET(request: Request) {
  const { models } = await connect();
  const d = await models.users.findAll();
  return new Response(JSON.stringify(d), {
    status: 200,
  });
}
