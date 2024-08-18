'use client';

import { useLoading } from '@/hooks/use-loading';
import { useEffect, useState } from 'react';

interface AsyncProps<T extends PromiseLike<any>> {
  value: T | (() => T);
  init?: Awaited<T>;
  children?: (data: Awaited<T>, isLoading: boolean) => JSX.Element;
}

export function Async<T extends Promise<any>>({ value, init, children }: AsyncProps<T>) {
  const [isLoading, loading] = useLoading();
  const [data, setData] = useState(init);

  useEffect(() => {
    loading(typeof value === 'function'
      ? value()
      : value
    ).then((v) => setData(v));
  }, [loading, value]);

  return children?.((data ?? init) as Awaited<T>, isLoading);
};