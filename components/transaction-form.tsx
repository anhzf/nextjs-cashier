'use client';
/* TODO: Fix form validity state */
import { customerApi, productApi } from '@/client/calls';
import { Async } from '@/components/async';
import { CustomerForm } from '@/components/customer-form';
import { PRODUCT_VARIANT_NO_VARIANTS, TRANSACTION_STATUSES } from '@/constants';
import { createCache } from '@/utils/cache';
import { getPriceDisplay } from '@/utils/models';
import { cn } from '@/utils/ui';
import { useMemo, useState, useTransition } from 'react';
import { FormProvider, useFieldArray, useForm, useFormContext, type SubmitHandler } from 'react-hook-form';

interface FieldValues {
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

const INITIAL_VALUES: FieldValues = {
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

export type TransactionFormAction = (values: FieldValues, before?: FieldValues) => Promise<void>;

interface TransactionFormProps {
  values?: FieldValues;
  action?: TransactionFormAction;
  editable?: Partial<typeof DEFAULT_EDITABLE>;
}

const priceFormatter = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 });

const customers = createCache('customers', () => customerApi.list());
const products = createCache('products', () => productApi.list({ showHidden: 'true' }));

// TODO: Add allowed editable fields props
// Found case are in transaction form, where we need to add allowed fields to be edited
// such as status, customerId, and items
// Also, creating completed status for transaction is currently not allowed
export function TransactionForm({ values = INITIAL_VALUES, action, editable: _editable }: TransactionFormProps) {
  const editable = useMemo(() => ({ ...DEFAULT_EDITABLE, ..._editable }), [_editable]);

  const [messages, setMessages] = useState<{ msg: string; type?: 'positive' | 'negative' }[]>([]);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [isSaving, startSaving] = useTransition();

  const formMethods = useForm<FieldValues>({ defaultValues: values });
  const { register, watch, formState: { touchedFields }, setValue, handleSubmit } = formMethods;

  const selectedCustomer = watch('customerId');
  const status = watch('status');
  const items = watch('items');

  const subtotal = useMemo(
    async () => {
      const list = await products.get();
      return items.reduce((acc, item) => {
        const product = list.find((product) => product.id === Number(item.productId))!;
        return acc + product?.variants[item.variant]?.price * item.qty;
      }, 0);
    },
    [items],
  );

  const onSubmit: SubmitHandler<FieldValues> = (payload) => {
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
    <div className="flex gap-4">
      {/* <pre className="whitespace-pre">
        {JSON.stringify([formMethods.formState.isValid, formMethods.getFieldState('items')], null, 2)}
      </pre> */}

      <form onSubmit={handleSubmit(onSubmit)}>
        {messages.map(({ msg, type }) => (
          <div
            key={msg}
            className={cn({ 'text-green-400': type === 'positive', 'text-red-400': type === 'negative' })}
          >
            {msg}
          </div>
        ))}

        {editable.customerId
          ? (
            <fieldset>
              <label>
                Customer
                <select
                  {...register('customerId', { valueAsNumber: true })}
                  className="p-2 border rounded"
                >
                  <Async value={customers.get} init={[]}>
                    {(data, isLoading) => isLoading
                      ? <option value="">Loading...</option>
                      : (<>
                        <option value="">Pilih Customer</option>
                        {data.length ? data.map((customer) => (
                          <option key={customer.id} value={customer.id}>
                            {customer.name}
                          </option>
                        )) : <option value="" disabled>Tidak ada customer</option>}
                      </>
                      )}
                  </Async>
                </select>
              </label>

              {selectedCustomer ? (
                <button type="button" onClick={() => setValue('customerId', undefined)}>
                  <span className="iconify mdi--close" />
                </button>
              ) : (
                <button type="button" onClick={() => setShowCustomerForm(true)}>
                  <span className="iconify mdi--plus" />
                  <span>Customer Baru</span>
                </button>
              )}
            </fieldset>
          ) : (
            <Async<Promise<Awaited<ReturnType<typeof customerApi.get>> | null>>
              value={typeof values.customerId === 'number' ? customerApi.get(values.customerId) : Promise.resolve(null)}
              init={null}
            >
              {(customer) => (
                <div className="flex items-center gap-2">
                  <span>Customer:</span>
                  <span>{customer?.name ?? 'Not set'}</span>
                </div>
              )}
            </Async>
          )
        }

        <fieldset>
          <label>
            Status
            <select
              id="transaction/status"
              required
              {...register('status', { required: true, disabled: !editable.status })}
              className="px-3 py-2 border rounded"
            >
              {TRANSACTION_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
        </fieldset>

        {status === 'pending' && (<>
          <fieldset>
            <label>
              Tanggal Jatuh Tempo
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                {...register('dueDate', {
                  valueAsDate: true,
                  disabled: !editable.dueDate,
                  min: new Date().toISOString().split('T')[0],
                })}
                className="p-2 border rounded"
              />
            </label>
          </fieldset>

          <fieldset>
            <label>
              Jumlah Bayar
              <input
                type="number"
                min={0}
                {...register('paid', { valueAsNumber: true, disabled: !editable.paid })}
                className="p-2 border rounded"
              />
            </label>
          </fieldset>
        </>)}

        <hr />

        <Async value={products.get} init={[]}>
          {/* TODO: Resolve product per item independently from products.get() */}
          {(data) => (
            <ul>
              {items.map((item, i) => {
                const product = data.find((el) => el.id === Number(item.productId))!;
                const total = product?.variants[item.variant]?.price * item.qty;

                return (
                  <li key={i}>
                    {product?.name} <span className="text-gray-500">x{item.qty} {product?.unit}</span> - {priceFormatter.format(total)}
                  </li>
                );
              })}
            </ul>
          )}
        </Async>

        <hr />

        <div className="text-lg">
          Total: <span className="text-gray-900 font-bold">
            <Async value={subtotal} init={0}>
              {(data, isLoading) => (<>
                {isLoading ? 'Loading...' : priceFormatter.format(data)}
              </>)}
            </Async>
          </span>
        </div>

        <div className="flex">
          <button
            type="submit"
            disabled={isSaving || !(Object.values(touchedFields).some(Boolean)/*  && formState.isValid */)}
          >
            <span>{isSaving ? 'Menyimpan...' : 'Simpan'}</span>
          </button>
        </div>
      </form>

      {editable.items && (
        <FormProvider {...formMethods}>
          <ProductList />
        </FormProvider>
      )}

      {showCustomerForm && (
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl">
            Buat Customer Baru
          </h2>
          <CustomerForm
            append={(state) => (
              <>
                {Object.entries(state.errors).map(([key, value]) => (
                  <div key={key} className="text-red-500">{value.message}</div>
                ))}
                <button
                  type="button"
                  onClick={() => setShowCustomerForm(false)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!state.isValid || state.isSubmitting}
                >
                  <span>Simpan</span>
                </button>
              </>
            )}
          />
        </div>
      )}
    </div>
  );
}

function ProductList() {
  const { register, control, watch, setValue } = useFormContext<FieldValues>();
  const { append, remove } = useFieldArray({ control, name: 'items', rules: { required: true, minLength: 1 } });
  const addedItems = watch('items');

  return (
    <div>
      <h2 className="text-2xl">
        Pilih Produk
      </h2>
      <table>
        <tbody>
          <Async value={products.get} init={[]}>
            {(data, isLoading) => isLoading
              ? <tr><td colSpan={3}>Loading...</td></tr>
              : (<>
                {data.map((product) => {
                  const hasVariants = Object.keys(product.variants).length > 1
                    && !(PRODUCT_VARIANT_NO_VARIANTS.name in product.variants);
                  const itemIdx = addedItems.findIndex((item) => item.productId === String(product.id));
                  const namePrefix = `items.${itemIdx}` as const;
                  const qty: number | undefined = addedItems[itemIdx]?.qty;
                  const isOutOfStock = qty === undefined ? product.stock < 1 : qty >= product.stock;
                  const setQty = (n: number) => {
                    if (itemIdx !== -1) {
                      if (n >= 0) setValue(`${namePrefix}.qty`, n, { shouldTouch: true });
                      if (n < 1) remove(itemIdx);
                    } else if (n > 0) {
                      append({ productId: String(product.id), variant: PRODUCT_VARIANT_NO_VARIANTS.name, qty: n });
                    }
                  };

                  return (
                    <tr
                      key={product.id}
                      className="[&:not(:last-child)]:border-b"
                    >
                      <td className="p-2 min-w-[20ch]">
                        <div>{product.name}</div>
                        <div>
                          <span className="text-gray-500">Stok: </span>
                          <b>{product.stock}</b> {product.unit}
                        </div>
                      </td>
                      <td className="p-2 text-gray-500">
                        {getPriceDisplay(product.variants)}
                      </td>
                      <td className="p-2 flex items-center">
                        {hasVariants
                          ? (
                            <div className="text-sm text-gray-500">Variants is not supported currently.</div>
                          ) : (<>
                            <button
                              type="button"
                              disabled={qty < 1 || qty === undefined}
                              onClick={() => setQty(qty !== undefined ? qty - 1 : 0)}
                            >
                              <span className="iconify mdi--minus" />
                            </button>

                            <input
                              type="number"
                              defaultValue={0}
                              min={1}
                              max={product.stock}
                              readOnly={isOutOfStock}
                              {...(itemIdx !== -1 && register(`${namePrefix}.qty`, {
                                required: true, valueAsNumber: true, min: 1, max: product.stock,
                              }))}
                              className="p-2 border rounded w-[7ch] font-semibold text-center"
                            />

                            <button
                              type="button"
                              disabled={isOutOfStock}
                              onClick={() => setQty(qty !== undefined ? qty + 1 : 1)}
                            >
                              <span className="iconify mdi--plus" />
                            </button>

                            <span>
                              {product.unit}
                            </span>
                          </>)}
                      </td>
                    </tr>
                  );
                })}
              </>)}
          </Async>
        </tbody>
      </table>
    </div>
  );
}