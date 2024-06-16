type ClientError = Error & { code?: number };

export const isClientError = (error: unknown): error is ClientError => {
  return error instanceof Error
    && typeof (error as ClientError).code === 'number';
};

// Force to specify error message
export const clientError = (msg: string, code = 400): never => {
  const error = new Error(msg);
  (error as ClientError).code = code;
  throw error;
};

export const notAuthorized = (msg = 'Not Authorized') => clientError(msg, 401);

// Force to specify error message
export const badRequest = (msg: string) => clientError(msg);