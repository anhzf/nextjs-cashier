'use client';

import { AppDrawerContext } from '@/components/app-drawer';
import { Button } from '@/components/ui/button';
import type { transactions } from '@/db/schema';
import Link from 'next/link';
import { useContext } from 'react';

type Transaction = typeof transactions.$inferSelect;

interface PageProps {
  transactions: Transaction[];
}

// With this convention, it enables to use client states even using async server components.
export function HomePageClient(props: PageProps) {
  const appDrawer = useContext(AppDrawerContext);

  return (
    <>
      <div className="flex gap-4">
        <Button>
          <span className="iconify mdi--menu" onClick={() => appDrawer?.setIsOpen(true)} />
        </Button>

        <TransactionListView data={props.transactions} />

        <div className="flex flex-col">
          <Link href="/transaction/new" className="btn">
            <span className="iconify mdi--plus" />
            <span>Transaksi Baru</span>
          </Link>
          <Link href="/stock/new" className="btn">
            <span className="iconify mdi--plus" />
            <span>Tambah Stok</span>
          </Link>
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
            <td className="p-2 text-gray-500">
              <code className="bg-gray-200 text-sm">{transaction.id}</code>
            </td>
            <td className="p-2 text-gray-500">
              {transaction.createdAt.toLocaleString('id')}
            </td>
            <td className="p-2">
              <span className="inline-flex bg-purple-200 px-2 py-0.5 justify-center items-center text-purple-400 font-medium rounded-2xl">
                {transaction.status}
              </span>
            </td>
            <td className="p-2">
              <Link href={`/transaction/${transaction.id}`} className="btn aspect-square">
                <span className="iconify mdi--pencil" />
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
    : <div>No data</div>
}