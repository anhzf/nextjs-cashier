import { listTag } from '@/calls/tags';
import { defineApi } from '@/utils/api';
import { unstable_noStore } from 'next/cache';
import { NextResponse } from 'next/server';

export const GET = defineApi(async () => {
  unstable_noStore();
  const tags = await listTag();
  return NextResponse.json({ data: tags });
});