import { hash } from '@/calls/security';
import { NextResponse } from 'next/server';

export const GET = () => {
  // return NextResponse.json({ message: 'ready!' });
  return NextResponse.json([
    hash('password'),
    hash('password'),
  ]);
}