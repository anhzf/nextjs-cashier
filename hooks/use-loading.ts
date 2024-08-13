import { useState } from 'react';

export const useLoading = () => {
  const [state, setState] = useState(false);
  const loading = async <T>(promise: Promise<T>) => {
    setState(true);
    return promise.finally(() => setState(false));
  }

  return [state, loading] as const;
};