import { isClientError } from '@/utils/errors';
import { NextResponse, type NextRequest } from 'next/server';
import { flatten, isValiError } from 'valibot';

type HandlerContext = Record<string, Record<string, string | string[]>>;

type Handler<Ctx = HandlerContext> = (req: NextRequest, ctx: Ctx) => void | Response | Promise<void | Response>;

export const defineApi = <Ctx = HandlerContext>(handler: Handler<Ctx>): Handler<Ctx> => (
  async (req, ctx) => {
    try {
      return await handler(req, ctx);
    } catch (error) {
      if (isClientError(error)) return NextResponse
        .json({ error: error.message }, { status: error.code });

      if (isValiError(error)) return NextResponse
        .json({ error: error.message, details: flatten(error.issues).nested });

      // Keep NextJs internal Error
      if (String(error).startsWith('NEXT_')) throw error;

      console.error(error);

      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }
);