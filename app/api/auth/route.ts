import { auth } from '@/auth';
import { defineApi } from '@/utils/api';
import { notAuthorized } from '@/utils/errors';
import { NextResponse } from 'next/server';

export const GET = defineApi(auth(async (req) => {
  if (!req.auth?.user) return notAuthorized();

  return NextResponse.json({ data: req.auth.user });
}));