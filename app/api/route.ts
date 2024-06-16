import { defineApi } from '@/utils/api';
import { NextResponse } from 'next/server';

export const GET = defineApi(() => NextResponse.json({ message: 'ready!' }));
