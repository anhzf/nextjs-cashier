import { listTag } from '@/calls/tags';
import { defineApi } from '@/utils/api';
import { NextResponse } from 'next/server';

export const GET = defineApi(async () => {
  const tags = await listTag();
  return NextResponse.json({ data: tags });
});