export async function GET(request: Request) {
  console.log('进来了这里');
  return new Response('hello ', {
    status: 200,
  });
}
