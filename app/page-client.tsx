'use client';

import type { transactions } from '@/db/schema';
import { useState, useTransition } from 'react';
import { createTransactionAction } from './actions';

type Transaction = typeof transactions.$inferSelect;

interface PageProps {
  transactions: Transaction[];
}

// With this convention, it enables to use client states even using async server components.
export function HomePageClient(props: PageProps) {
  const [errors, setErrors] = useState<string[]>([]);

  const [isCreating, startCreating] = useTransition();
  const onCreateTransactionClick = () => {
    startCreating(async () => {
      const res = await createTransactionAction();
      if (res && 'errors' in res) setErrors(res.errors);
    });
  };

  return (
    <>
      <ul className="text-red-500">
        {errors.map((error) => (
          <li key={error}>{error}</li>
        ))}
      </ul>

      <div className="flex gap-4">
        <TransactionListView data={props.transactions} />

        <div className="flex flex-col">
          <button type="button" disabled={isCreating} onClick={onCreateTransactionClick}>
            <span className="iconify mdi--plus" />
            <span>{isCreating ? 'Memproses...' : 'Transaksi Baru'}</span>
          </button>
        </div>
      </div>
    </>
  );
}

function TransactionListView({ data }: { data: Transaction[] }) {
  return data.length ? (
    <table>
      <tbody>
        {data.map((transaction) => (
          <tr key={transaction.id}>
            <td className="text-gray-500">
              {transaction.createdAt.toLocaleString('id')}
            </td>
            <td className="p-2">
              <span className="inline-flex bg-purple-200 px-2 py-0.5 justify-center items-center text-purple-400 font-medium rounded-2xl">
                {transaction.status}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
    : <div>No data</div>
}