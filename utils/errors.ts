type ClientError = Error & { code?: number };

export const isClientError = (error: unknown): error is ClientError => {
  return error instanceof Error
    && typeof (error as ClientError).code === 'number';
}

export const notAuthorized = (): never => {
  const error = new Error('Not Authorized');
  (error as ClientError).code = 401;
  throw error;
}