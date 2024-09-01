'use client';
/* TODO: Fix form validity state */
/* TODO: Fix broken select status */
/* TODO: Prevent form saving when customer form is submitting */
import { createCustomerQuery, createCustomersQuery, createProductsQuery, createTagsQuery } from '@/client/queries';
import { CustomerForm } from '@/components/customer-form';
import { LoadingOverlay } from '@/components/loading-overlay';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PRODUCT_VARIANT_NO_VARIANTS, TRANSACTION_STATUSES } from '@/constants';
import { cn } from '@/utils/ui';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { DialogDescription } from '@radix-ui/react-dialog';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '@uidotdev/usehooks';
import { CalendarIcon, DollarSignIcon, MinusIcon, PlusIcon, SearchIcon, ShoppingCartIcon, UserIcon } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
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

type FieldOption = 'readonly' | boolean;

interface FieldOptions {
  status?: FieldOption;
  customer?: FieldOption;
  items?: FieldOption;
  dueDate?: FieldOption;
  paid?: FieldOption;
  summary?: FieldOption;
}

const DEFAULT_FIELDS: Required<FieldOptions> = {
  status: true,
  customer: true,
  items: true,
  dueDate: true,
  paid: true,
  summary: true,
};

export type TransactionFormAction = (values: TransactionFieldValues) => Promise<void>;

interface TransactionFormProps extends React.ComponentProps<'div'> {
  formId?: string;
  values?: TransactionFieldValues;
  action?: TransactionFormAction;
  stocking?: boolean;
  fields?: FieldOptions;
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
  fields: _fields,
  stocking,
  className,
  ...props
}: TransactionFormProps) {
  const fields = useMemo(() => ({ ...DEFAULT_FIELDS, ..._fields }), [_fields]);

  const [messages, setMessages] = useState<{ msg: string; type?: 'positive' | 'negative' }[]>([]);
  const [isSaving, startSaving] = useTransition();

  const [productFilterTerm, setProductFilterTerm] = useState<string>();
  const [productFilterTag, setProductFilterTag] = useState<string>();

  const formMethods = useForm<TransactionFieldValues>({ defaultValues: values });
  const { control, register, setValue, watch, handleSubmit } = formMethods;

  const customerId = watch('customerId');
  const status = watch('status');
  const partialPayment = watch('paid');
  const items = watch('items');

  const { data: products } = useQuery(createProductsQuery());
  const { data: customer, isLoading: isCustomerLoading } = useQuery(createCustomerQuery(customerId));

  const subtotal = useMemo(
    () => {
      const list = products ?? [];
      return items.reduce((acc, item) => {
        const product = list.find((product) => product.id === Number(item.productId))!;
        return acc + product?.variants[item.variant]?.price * item.qty;
      }, 0);
    },
    [items, products],
  );

  const getTotalItems = () => items.reduce((sum, { qty }) => sum + qty, 0);

  const getRemainingBalance = () => {
    const paid = partialPayment || 0;
    return Math.max(subtotal - paid, 0);
  };

  const onSearch = useCallback((searchTerm = '', tag = '') => {
    setProductFilterTerm(searchTerm);
    if (tag) setProductFilterTag(tag === '$default' ? undefined : tag);
  }, []);

  const onSubmit: SubmitHandler<TransactionFieldValues> = (payload) => {
    startSaving(async () => {
      try {
        await action?.(payload);
        setMessages([{ msg: 'Berhasil menyimpan data transaksi.', type: 'positive' }]);
      } catch (err) {
        setMessages([{ msg: String(err), type: 'negative' }]);
      }
    });
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <FormProvider {...formMethods}>
        {/* <pre className="whitespace-pre">
        {JSON.stringify(watch(), null, 2)}
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

          {fields.customer === 'readonly' && (
            <Button type="button" variant="outline">
              <UserIcon className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm font-medium">
                {isCustomerLoading ? 'Loading...' : customer?.name || 'Pilih Kustomer'}
              </span>
            </Button>
          )}

          {fields.customer === true && (
            <CustomerSelector
              trigger={(
                <Button type="button" variant="outline">
                  <UserIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {isCustomerLoading ? 'Loading...' : customer?.name || 'Pilih Kustomer'}
                  </span>
                </Button>
              )}
              onSelect={({ id }) => setValue('customerId', id)}
            />
          )}

          {fields.status !== false && (
            <div className="flex items-center gap-2">
              <Label htmlFor="transaction/status" className="shrink-0 w-[12ch]">Status:</Label>
              <Controller
                name="status"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select onValueChange={fields.status !== 'readonly' ? field.onChange : undefined} {...field}>
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
          )}

          {status === 'pending' && (<>
            {fields.dueDate !== false && (
              <div className="flex items-center gap-2">
                <Label htmlFor="transaction/dueDate" className="shrink-0 w-[12ch]">Tenggat Bayar:</Label>
                <div className="relative flex-grow">
                  <CalendarIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="transaction/dueDate"
                    type="date"
                    className="pl-8"
                    {...register('dueDate', {
                      valueAsDate: true,
                      disabled: fields.dueDate === 'readonly',
                      min: new Date().toISOString().split('T')[0],
                    })}
                  />
                </div>
              </div>
            )}
            {fields.paid !== false && (
              <div className="flex items-center gap-2">
                <Label htmlFor="transaction/paid" className="shrink-0 w-[12ch]">Terbayarkan:</Label>
                <div className="relative flex-grow">
                  <DollarSignIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="transaction/paid"
                    type="number"
                    placeholder="0.00"
                    className="pl-8"
                    {...register('paid', { valueAsNumber: true, disabled: fields.paid === 'readonly' })}
                  />
                </div>
              </div>
            )}
          </>)}
        </form>

        <ProductSearchBar onSearch={onSearch} />

        <ProductSelector
          tag={productFilterTag}
          term={productFilterTerm}
          stocking={stocking}
        />

        {fields.summary === true && (
          <div className="shrink-0 bg-background border-t p-2">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <ShoppingCartIcon className="mr-2 h-5 w-5" />
                <span className="font-semibold">{getTotalItems()} items</span>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="font-bold">
                  {priceFormatter.format(subtotal)}
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
                    {priceFormatter.format(getRemainingBalance())}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {isSaving && <LoadingOverlay title="Menyimpan..." message="Mohon tunggu sebentar" fixed />}
      </FormProvider>
    </div>
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

interface ProductSearchBarProps {
  onSearch?: (searchTerm: string, tag?: string) => void;
}

function ProductSearchBar({ onSearch }: ProductSearchBarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>();

  const { data: tags, isFetching: isLoading } = useQuery(createTagsQuery());

  const debouncedTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    onSearch?.(debouncedTerm, selectedTag);
  }, [debouncedTerm, selectedTag, onSearch]);

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
        defaultValue="$default"
        value={selectedTag}
        onValueChange={(value) => setSelectedTag(value || undefined)}
      >
        <SelectTrigger className="w-[130px]">
          <SelectValue placeholder="Filter by tag" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="$default">
            {isLoading ? 'Loading...' : 'Semua Tag'}
          </SelectItem>

          {(tags ?? []).map((tag) => (
            <SelectItem
              key={tag.id}
              value={String(tag.id)}
            >
              {tag.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

interface ProductSelectorProps {
  tag?: string;
  term?: string;
  stocking?: boolean;
}

function ProductSelector({ tag, term, stocking }: ProductSelectorProps) {
  const { control, formState: { defaultValues }, watch, setValue } = useFormContext<TransactionFieldValues>();
  const { append } = useFieldArray({ control, name: 'items', rules: { required: true, minLength: 1 } });

  const [root] = useAutoAnimate<HTMLDivElement>();

  const addedItems = watch('items');

  const { data: items, isFetching: isLoading } = useQuery(createProductsQuery(tag ? { tag } : {}));
  const _filterAndSorted = useMemo(() => (items ?? [])
    .filter((product) => term ? product.name.toLowerCase().includes(term.toLowerCase() ?? '') : true)
    // Any items that already added and have qty > 0 should be on top
    .sort((a, b) => {
      const aIdx = addedItems.findIndex((item) => item.productId === String(a.id));
      const bIdx = addedItems.findIndex((item) => item.productId === String(b.id));
      const aQty = addedItems[aIdx]?.qty ?? 0;
      const bQty = addedItems[bIdx]?.qty ?? 0;
      return bQty - aQty;
    }), [items, term, addedItems]);
  const filterAndSorted = useDebounce(_filterAndSorted, 1000);

  return (
    <div ref={root} className="flex-1 relative flex max-h-[70vh] flex-col gap-2 overflow-y-auto">
      {isLoading
        ? <div>Loading...</div>
        : filterAndSorted.map((product) => {
          const itemIdx = addedItems.findIndex((item) => item.productId === String(product.id));
          const fieldNamePrefix = `items.${itemIdx}` as const;
          const initQty = defaultValues?.items?.[itemIdx]?.qty ?? 0;
          const qty: number | undefined = addedItems[itemIdx]?.qty;

          const finalStock = product.stock - ((stocking === true ? -(qty ?? 0) : (qty ?? 0)) - initQty);
          const isOutOfStock = finalStock < 1;
          const subtotal = product.variants[PRODUCT_VARIANT_NO_VARIANTS.name].price * (qty ?? 0);

          const setQty = (n: number) => {
            if (itemIdx !== -1) {
              setValue(`${fieldNamePrefix}.qty`, n, { shouldTouch: true });
            } else if (n > 0) {
              append({ productId: String(product.id), variant: PRODUCT_VARIANT_NO_VARIANTS.name, qty: n });
            }
          };

          return (
            <Card
              key={product.id}
              className={cn('p-2', {
                'shadow-none': stocking !== true && isOutOfStock,
                'bg-blue-50': qty > 0,
              })}
            >
              <CardContent className="p-0">
                <div className="flex justify-between items-center mb-1 gap-2">
                  <h2 className={cn(
                    'font-semibold',
                    qty > 0
                      ? 'text-blue-500'
                      : stocking !== true && isOutOfStock ? 'text-gray-500' : 'text-gray-900',
                  )}>
                    {product.name}
                  </h2>
                  <div className="flex justify-end items-center gap-2">
                    {(qty > 0 || stocking === true) && (
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setQty(qty - 1)}
                      >
                        <MinusIcon className="h-4 w-4" />
                      </Button>
                    )}

                    <span className="font-medium w-4 text-center">
                      {qty ?? 0}
                    </span>

                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      disabled={stocking !== true && isOutOfStock}
                      onClick={() => setQty((qty ?? 0) + 1)}
                    >
                      <PlusIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <p className="text-sm text-muted-foreground">
                      {priceFormatter.format(product.variants[PRODUCT_VARIANT_NO_VARIANTS.name].price)} | Stock: <span className={cn({ 'text-red-500': isOutOfStock })}>{finalStock}</span>
                    </p>
                  </div>

                  <div className="flex flex-wrap justify-end gap-1">
                    <p className="text-sm">
                      {(subtotal > 0) && (
                        <>
                          <span className="text-gray-400">= </span>
                          <span className="text-gray-600">{priceFormatter.format(subtotal)}</span>
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