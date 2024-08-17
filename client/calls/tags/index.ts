import type { listTag } from '@/calls/tags';

const ENDPOINT = '/api/tag/{tag}';

export const list = async (): Promise<ReturnType<typeof listTag>> => {
  const res = await fetch(ENDPOINT.replace('{tag}', ''));
  const { data } = await res.json();
  return data;
};