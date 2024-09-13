import { CustomerDialog } from '@/app/(app)/customer/customer-dialog';
import { listCustomer } from '@/calls/customers';
import { AppBar } from '@/components/app-bar';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EyeIcon } from 'lucide-react';
import { revalidatePath } from 'next/cache';
import { Suspense } from 'react';

export default function CustomerListPage() {
  return (
    <div className="relative h-screen flex flex-col">
      <AppBar>
        <div className="grow flex justify-between items-center gap-4">
          <h1 className="text-xl font-bold">
            Daftar Kustomer
          </h1>
        </div>
      </AppBar>

      <main className="container relative flex flex-col gap-4 px-2 py-4">
        <Suspense>
          <CustomerTable />
        </Suspense>
      </main>
    </div>
  );
}

async function CustomerTable() {
  const customers = await listCustomer();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            #
          </TableHead>
          <TableHead>
            Nama
          </TableHead>
          <TableHead>
            Phone
          </TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>

      <TableBody>
        {customers.map((customer, index) => (
          <TableRow key={customer.id}>
            <TableCell>{index + 1}</TableCell>
            <TableCell>{customer.name}</TableCell>
            <TableCell>{customer.phone || '-'}</TableCell>
            <TableCell className="text-right">
              <CustomerDialog
                data={customer}
                trigger={(
                  <Button variant="outline">
                    Lihat
                  </Button>
                )}
                onUpdate={async function () {
                  'use server';
                  revalidatePath('/customer');
                }}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}