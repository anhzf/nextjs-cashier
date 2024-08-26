'use client';
/* TODO: Fix form validity state */
/* TODO: Fix broken select status */
/* TODO: Prevent form saving when customer form is submitting */
import { createCustomerQuery, createCustomersQuery, createProductsQuery } from '@/client/queries';
import { Async } from '@/components/async';
import { CustomerForm } from '@/components/customer-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PRODUCT_VARIANT_NO_VARIANTS, TRANSACTION_STATUSES } from '@/constants';
import { cn } from '@/utils/ui';
import { DialogDescription } from '@radix-ui/react-dialog';
import { useQuery } from '@tanstack/react-query';
import { CalendarIcon, DollarSignIcon, MinusIcon, PlusIcon, SearchIcon, ShoppingCartIcon, UserIcon } from 'lucide-react';
import { useMemo, useState, useTransition } from 'react';
import { Controller, FormProvider, useFieldArray, useForm, useFormContext, type SubmitHandler } from 'react-hook-form';

export interface TransactionFieldValues {
  customerId?: number;
  status: string;
  items: {
    productId: string;
    variant: string;
    qty: number;
  }[];
  dueDate?: Date;
  paid?: number;
}

const INITIAL_VALUES: TransactionFieldValues = {
  status: 'pending',
  items: [],
  paid: 0,
};

const DEFAULT_EDITABLE = {
  status: true,
  customerId: true,
  items: true,
  dueDate: true,
  paid: true,
};

export type TransactionFormAction = (values: TransactionFieldValues, before?: TransactionFieldValues) => Promise<void>;

interface TransactionFormProps extends React.ComponentProps<'div'> {
  formId?: string;
  values?: TransactionFieldValues;
  action?: TransactionFormAction;
  editable?: Partial<typeof DEFAULT_EDITABLE>;
}

const priceFormatter = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 });

// TODO: Add allowed editable fields props
// Found case are in transaction form, where we need to add allowed fields to be edited
// such as status, customerId, and items
// Also, creating completed status for transaction is currently not allowed
export function TransactionForm({
  formId,
  values = INITIAL_VALUES,
  action,
  editable: _editable,
  className,
  ...props
}: TransactionFormProps) {
  const editable = useMemo(() => ({ ...DEFAULT_EDITABLE, ..._editable }), [_editable]);

  const [messages, setMessages] = useState<{ msg: string; type?: 'positive' | 'negative' }[]>([]);
  const [isSaving, startSaving] = useTransition();

  const { data: products } = useQuery(createProductsQuery());
  const { data: customer, isLoading: isCustomerLoading } = useQuery(createCustomerQuery(values.customerId ?? NaN));

  const formMethods = useForm<TransactionFieldValues>({ defaultValues: values });
  const { control, register, watch, handleSubmit } = formMethods;

  const status = watch('status');
  const partialPayment = watch('paid');
  const items = watch('items');

  const subtotal = useMemo(
    async () => {
      const list = products ?? [];
      return items.reduce((acc, item) => {
        const product = list.find((product) => product.id === Number(item.productId))!;
        return acc + product?.variants[item.variant]?.price * item.qty;
      }, 0);
    },
    [items, products],
  );

  const getTotalItems = () => items.reduce((sum, { qty }) => sum + qty, 0);

  const getRemainingBalance = async () => {
    const total = await subtotal;
    const paid = partialPayment || 0;
    return Math.max(total - paid, 0);
  };

  const onSubmit: SubmitHandler<TransactionFieldValues> = (payload) => {
    startSaving(async () => {
      try {
        await action?.(payload, values);
        setMessages([{ msg: 'Berhasil menyimpan data transaksi.', type: 'positive' }]);
      } catch (err) {
        setMessages([{ msg: String(err), type: 'negative' }]);
      }
    });
  };

  return (
    <FormProvider {...formMethods}>
      <>
        {/* <pre className="whitespace-pre">
        {JSON.stringify([formMethods.formState.isValid, formMethods.getFieldState('items')], null, 2)}
      </pre> */}

        <form
          id={formId}
          className="shrink-0 flex flex-col gap-2"
          onSubmit={handleSubmit(onSubmit)}
        >
          {messages.map(({ msg, type }) => (
            <div
              key={msg}
              className={cn({ 'text-green-400': type === 'positive', 'text-red-400': type === 'negative' })}
            >
              {msg}
            </div>
          ))}

          <div className="flex items-center gap-2">
            <UserIcon className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {isCustomerLoading ? 'Loading...' : customer?.name || 'Pilih Kustomer'}
            </span>

            {editable.customerId === true && (
              <CustomerSelector
                trigger={(
                  <Button variant="outline" size="sm">Ubah</Button>
                )}
              />
            )}
          </div>

          <div className="flex items-center gap-2">
            <Label htmlFor="transaction/status" className="w-[12ch]">Status:</Label>
            <Controller
              name="status"
              control={control}
              rules={{ required: true }}
              disabled={editable.status === false}
              render={({ field }) => (
                <Select {...field}>
                  <SelectTrigger id="transaction/status" className="flex-grow">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRANSACTION_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {status === 'pending' && (<>
            <div className="flex items-center gap-2">
              <Label htmlFor="transaction/dueDate" className="w-[12ch]">Tenggat Bayar:</Label>
              <div className="relative flex-grow">
                <CalendarIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="transaction/dueDate"
                  type="date"
                  className="pl-8"
                  {...register('dueDate', {
                    valueAsDate: true,
                    disabled: editable.dueDate === false,
                    min: new Date().toISOString().split('T')[0],
                  })}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="transaction/paid" className="w-[12ch]">Terbayarkan:</Label>
              <div className="relative flex-grow">
                <DollarSignIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="transaction/paid"
                  type="number"
                  placeholder="0.00"
                  className="pl-8"
                  {...register('paid', { valueAsNumber: true, disabled: editable.paid === false })}
                />
              </div>
            </div>
          </>)}

          {/* <button
            type="submit"
            disabled={isSaving || !(Object.values(touchedFields).some(Boolean) && formState.isValid)}
          >
            <span>{isSaving ? 'Menyimpan...' : 'Simpan'}</span>
          </button> */}
        </form>

        <ProductSearchBar />

        <ProductSelector />

        <div className="shrink-0 bg-background border-t p-2">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <ShoppingCartIcon className="mr-2 h-5 w-5" />
              <span className="font-semibold">{getTotalItems()} items</span>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="font-bold">
                <Async value={subtotal}>
                  {(value, isLoading) => isLoading ? 'Loading...' : priceFormatter.format(value)}
                </Async>
              </p>
            </div>
          </div>
          {status === 'pending' && (
            <div className="flex justify-between items-center">
              <p className="text-sm">
                Terbayar: {priceFormatter.format(partialPayment || 0)}
              </p>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Belum dibayar</p>
                <p className="font-bold">
                  <Async value={getRemainingBalance()}>
                    {(value, isLoading) => isLoading ? 'Loading...' : priceFormatter.format(value)}
                  </Async>
                </p>
              </div>
            </div>
          )}
        </div>
      </>
    </FormProvider>
  );
}

interface CustomerSelectorProps {
  trigger?: React.ReactNode;
  onSelect?: (customer: { id: number; }) => void;
}

function CustomerSelector({
  trigger = (<Button type="button">Pilih Kustomer</Button>),
  onSelect,
}: CustomerSelectorProps) {
  const [customerName, setCustomerName] = useState('');
  const { data: customers } = useQuery(createCustomersQuery());

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pilih atau Buat Kustomer</DialogTitle>
          <DialogDescription>
            Pilih kustomer yang sudah ada atau buat kustomer baru.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="select" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="select">Pilih Kustomer</TabsTrigger>
            <TabsTrigger value="add">Buat Kustomer Baru</TabsTrigger>
          </TabsList>

          <TabsContent value="select">
            <div className="space-y-4">
              <Input
                placeholder="Cari Kustomer..."
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {(customers ?? []).filter(c => c.name.toLowerCase().includes(customerName.toLowerCase())).map(customer => (
                  <DialogClose
                    key={customer.id}
                    className="w-full justify-start"
                  >
                    <Button
                      type="submit"
                      variant="outline"
                      className="w-full"
                      onClick={() => onSelect?.({ id: customer.id })}
                    >
                      {customer.name}
                    </Button>
                  </DialogClose>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="add">
            <CustomerForm
              append={(state) => (
                <DialogClose asChild>
                  <Button
                    type="submit"
                    disabled={!state.isValid || state.isSubmitting}
                    className="w-full"
                  >
                    <span>Simpan</span>
                  </Button>
                </DialogClose>
              )}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

function ProductSearchBar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>();

  return (
    <div className="flex items-center gap-x-2">
      <div className="relative flex-grow">
        <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Cari produk..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <Select
        defaultValue="all"
        value={selectedTag}
        onValueChange={(value) => setSelectedTag(value || undefined)}
      >
        <SelectTrigger className="w-[130px]">
          <SelectValue placeholder="Filter by tag" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua tag</SelectItem>
          {['HCL', 'Keren'].map((tag) => (
            <SelectItem key={tag} value={tag}>{tag}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function ProductSelector() {
  const { control, formState: { defaultValues }, watch, setValue } = useFormContext<TransactionFieldValues>();
  const { append, remove } = useFieldArray({ control, name: 'items', rules: { required: true, minLength: 1 } });
  const addedItems = watch('items');

  const { data: items } = useQuery(createProductsQuery());

  return (
    <div className="flex-1 flex flex-col gap-2 overflow-y-auto">
      {(items ?? []).map((product) => {
        const itemIdx = addedItems.findIndex((item) => item.productId === String(product.id));
        const fieldNamePrefix = `items.${itemIdx}` as const;
        const initQty = defaultValues?.items?.[itemIdx]?.qty ?? 0;
        const qty: number | undefined = addedItems[itemIdx]?.qty;

        const isOutOfStock = qty === undefined
          ? (product.stock < 1) : (qty - initQty) >= product.stock;
        const subtotal = product.variants[PRODUCT_VARIANT_NO_VARIANTS.name].price * (qty ?? 0);

        const setQty = (n: number) => {
          if (itemIdx !== -1) {
            if (n >= 0) setValue(`${fieldNamePrefix}.qty`, n, { shouldTouch: true });
            if (n < 1) remove(itemIdx);
          } else if (n > 0) {
            append({ productId: String(product.id), variant: PRODUCT_VARIANT_NO_VARIANTS.name, qty: n });
          }
        };

        return (
          <Card key={product.id} className="p-2">
            <CardContent className="p-0">
              <div className="flex justify-between items-center mb-1 gap-2">
                <h2 className="font-semibold">{product.name}</h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={!addedItems[itemIdx]?.qty}
                    onClick={() => setQty(addedItems[itemIdx]?.qty - 1)}
                  >
                    <MinusIcon className="h-4 w-4" />
                  </Button>
                  <span className="font-medium w-4 text-center">{addedItems[itemIdx]?.qty || 0}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={isOutOfStock}
                    onClick={() => setQty((addedItems[itemIdx]?.qty ?? 0) + 1)}
                  >
                    <PlusIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1">
                  <p className="text-sm text-muted-foreground">
                    {priceFormatter.format(product.variants[PRODUCT_VARIANT_NO_VARIANTS.name].price)} | Stock: {product.stock}
                  </p>
                </div>

                <div className="flex flex-wrap justify-end gap-1">
                  <p className="text-sm">
                    {(subtotal > 0) && (
                      <>
                        <span className="text-gray-400">= </span>
                        {priceFormatter.format(subtotal)}
                      </>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}