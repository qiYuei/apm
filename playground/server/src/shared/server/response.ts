export type ResponseCode = 1 | 0;

export type CustomResponse = {
  code: ResponseCode;
  data: unknown;
  message: string;
};

export function APMResponse(opt: Partial<CustomResponse>, responseOpts?: ResponseInit) {
  let responseData: CustomResponse = {
    code: 1,
    message: 'OK!',
    data: opt.data,
    ...opt,
  };

  return new Response(JSON.stringify(responseData), responseOpts);
}
