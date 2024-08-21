export const debounce = <T extends ((...arg: any[]) => any)>(fn: T, delay: number) => {
  let timeout: NodeJS.Timeout;
  return ((...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  }) as T;
};

export const throttle = <T extends ((...arg: any[]) => any)>(fn: T, delay: number) => {
  let last = 0;
  return ((...args: Parameters<T>) => {
    const now = Date.now();
    if (now - last < delay) return;
    last = now;
    fn(...args);
  }) as T;
};