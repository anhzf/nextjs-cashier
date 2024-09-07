import { entriesToObject } from '@/utils/object';

export const searchParamsToObject = (searchParams: URLSearchParams) => entriesToObject(
  Array.from(searchParams.entries())
);