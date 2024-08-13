'use server';

import { auth } from '@/auth';
import { createTransaction } from '@/calls/transactions';
import { ROUTE_SESSION_FAILED } from '@/constants';
import { sleep } from '@/utils/promise';
import { redirect } from 'next/navigation';

export type CreateTransactionState = {} | {
  errors: string[];
};

export const createTransactionAction = async (): Promise<CreateTransactionState> => {
  const session = await auth();

  if (!session?.user?.id) return redirect(ROUTE_SESSION_FAILED);

  const createdId = await createTransaction({
    userId: Number(session.user.id),
    items: [],
  });

  // return redirect(`/transaction/${Math.ceil(Math.random() * 8)}`);
  return redirect(`/transaction/${createdId}`);
};