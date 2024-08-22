'use client';

import { useLoading } from '@/hooks/use-loading';
import { memo, useEffect, useMemo, useState } from 'react';

interface AsyncProps<T extends PromiseLike<any>> {
  value: T | (() => T);
  init?: Awaited<T>;
  children?: (data: Awaited<T>, isLoading: boolean) => JSX.Element;
}

function _Async<T extends Promise<any>>({ value, init, children: _children }: AsyncProps<T>) {
  const [isLoading, loading] = useLoading();
  const [data, setData] = useState(init);
  const children = useMemo(() => _children, [_children]);

  useEffect(() => {
    loading(typeof value === 'function'
      ? value()
      : value
    ).then((v) => setData(v));
  }, [loading, value]);

  return children?.((data ?? init) as Awaited<T>, isLoading);
}

export const Async = memo(_Async) as typeof _Async;