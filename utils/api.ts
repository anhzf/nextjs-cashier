import { isClientError } from '@/utils/errors';
import { NextResponse, type NextRequest } from 'next/server';
import { flatten, isValiError } from 'valibot';

type HandlerContext = Record<string, Record<string, string | string[]>>;

type Handler<Ctx = HandlerContext> = (req: NextRequest, ctx: Ctx) => void | Response | Promise<void | Response>;

export const defineApi = <Ctx = HandlerContext>(handler: Handler<Ctx>): Handler<Ctx> => (
  async (req, ctx) => {
    try {
      return await handler(req, ctx);
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') console.error(error);

      if (isClientError(error)) return NextResponse
        .json({ error: error.message }, { status: error.code });

      if (isValiError(error)) return NextResponse
        .json({ error: error.message, details: flatten(error.issues) }, { status: 400 });

      // Keep NextJs internal Error
      if ('digest' in error
        || String(error).startsWith('NEXT_')) throw error;

      console.error(error);

      return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
  }
);