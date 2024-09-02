import { AppBar } from '@/components/app-bar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { priceFormatter } from '@/utils/format';
import { AlertTriangleIcon, ArrowUpRight, DollarSign, PlusIcon } from 'lucide-react';
import Link from 'next/link';

export default async function HomePage() {
  return (
    <div className="relative h-screen flex flex-col">
      <AppBar className="lg:hidden" />

      <main className="container relative flex flex-col gap-4 p-4 px-2 md:px-4">
        <div className="grow flex flex-col md:flex-row justify-between gap-2 flex-wrap py-4 md:pb-2">
          <h1 className="text-2xl font-semibold">
            Dasbor
          </h1>

          <div className="flex gap-2">
            <Button asChild className="grow">
              <Link href="/transaction/new">
                <PlusIcon className="size-5 mr-1" />
                Buat Transaksi
              </Link>
            </Button>
            <Button asChild variant="secondary" className="grow">
              <Link href="/stock/new">
                <PlusIcon className="size-5 mr-1" />
                Tambah Stok
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Pendapatan
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {priceFormatter.format(1000000)}
              </div>
              {/* <p className="text-xs text-muted-foreground">+20.1% from last month</p> */}
              <p className="text-xs text-muted-foreground">
                dari 312 transaksi
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Hutang
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {priceFormatter.format(1230000)}
              </div>
              {/* <p className="text-xs text-muted-foreground">+20.1% from last month</p> */}
              <p className="text-xs text-muted-foreground">
                dari 312 transaksi
              </p>
            </CardContent>
          </Card>

          <Card className="hidden md:flex opacity-40 min-h-24 flex-col justify-center">
            <div className="text-3xl font-bold text-center">
              COMING SOON
            </div>
          </Card>

          <Card className="hidden md:flex opacity-40 min-h-24 flex-col justify-center">
            <div className="text-3xl font-bold text-center">
              COMING SOON
            </div>
          </Card>
        </div>

        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2">
                <CardTitle className="flex items-center gap-2">
                  Hutang <Badge>43</Badge>
                </CardTitle>
                <CardDescription>
                  Transaksi yang belum dibayar
                </CardDescription>
              </div>
              <Button asChild variant="outline" size="sm" className="ml-auto gap-1">
                <Link href={{ pathname: '/transaction', query: { status: 'pending' } }}>
                  Lihat semua
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kustomer</TableHead>
                    <TableHead className="">
                      Tenggat Pembayaran
                    </TableHead>
                    <TableHead className="text-right">Belum dibayar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { id: 1, name: 'Budi', dueDate: '2023-06-23', amount: 100000 },
                    { id: 2, name: 'Ani', dueDate: '2023-06-24', amount: 200000 },
                    { id: 3, name: 'Citra', dueDate: '2023-06-25', amount: 300000 },
                    { id: 4, name: 'Dewi', dueDate: '2023-06-26', amount: 400000 },
                    { id: 5, name: 'Eko', dueDate: '2023-06-27', amount: 500000 },
                  ].map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="p-3">
                        <div className="font-medium">{item.name}</div>
                      </TableCell>
                      <TableCell className="p-3 text-sm">
                        {item.dueDate}
                      </TableCell>
                      <TableCell className="p-3 text-right">
                        {priceFormatter.format(item.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="h-min">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangleIcon className="inline-block text-amber-500" />
                Peringatan Stok
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-8">
              <Table>
                <TableBody>
                  {[
                    { id: 1, name: 'Beras', stock: 10 },
                    { id: 2, name: 'Gula', stock: 5 },
                    { id: 3, name: 'Minyak Goreng', stock: 3 },
                    { id: 4, name: 'Telur', stock: 2 },
                    { id: 5, name: 'Daging Ayam', stock: 1 },
                  ].map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="p-2 text-sm font-medium leading-none">
                        {item.name}
                      </TableCell>
                      <TableCell className="p-2 text-right">
                        <Badge variant="outline">
                          {item.stock} tersisa
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Button asChild variant="link" size="sm">
                <Link href={{ pathname: 'product', query: { orderBy: 'stock' } }} className="text-sm text-muted-foreground">
                  Lihat 7 barang lainnya
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}