'use client';

import { customerApi, productApi } from '@/client/calls';
import { Async } from '@/components/async';
import { CustomerForm } from '@/components/customer-form';
import { PRODUCT_VARIANT_NO_VARIANTS, TRANSACTION_STATUSES } from '@/constants';
import { createCache } from '@/utils/cache';
import { getPriceDisplay } from '@/utils/models';
import { useMemo, useState, useTransition } from 'react';
import { FormProvider, useFieldArray, useForm, useFormContext, type SubmitHandler } from 'react-hook-form';

interface FieldValues {
  customerId?: string;
  status: string;
  items: {
    productId: string;
    variant: string;
    qty: number;
  }[];
}

const INITIAL_VALUES: FieldValues = {
  status: 'pending',
  items: [],
};

export type TransactionFormAction = (values: FieldValues) => Promise<void>;

interface TransactionFormProps {
  values?: FieldValues;
  action?: TransactionFormAction;
}

const priceFormatter = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 });

const customers = createCache('customers', () => customerApi.list());
const _products = createCache('products', () => productApi.list());
const resolvedProducts = {
  value: [] as Awaited<ReturnType<typeof _products.get>>,
  isReady: false,
};
const getProducts = async () => {
  const products = await _products.get();
  resolvedProducts.value = products;
  resolvedProducts.isReady = true;
  return products;
};

// TODO: Add allowed editable fields props
// Found case are in transaction form, where we need to add allowed fields to be edited
// such as status, customerId, and items
// Also, creating completed status for transaction is currently not allowed
export function TransactionForm({ values, action }: TransactionFormProps) {
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [isSaving, startSaving] = useTransition();

  const formMethods = useForm<FieldValues>({ values, defaultValues: INITIAL_VALUES });
  const { register, watch, formState, setValue, handleSubmit } = formMethods;

  const selectedCustomer = watch('customerId');
  const items = watch('items');

  const subtotal = useMemo(() => items.reduce((acc, item) => {
    if (resolvedProducts.isReady === false) return acc;

    const product = resolvedProducts.value.find((product) => product.id === Number(item.productId))!;
    return acc + product?.variants[item.variant]?.price * item.qty;
  }, 0), [items]);

  const onSubmit: SubmitHandler<FieldValues> = (values) => {
    startSaving(async () => {
      await action?.(values);
    });
  };

  return (
    <div className="flex gap-4">
      <form onSubmit={handleSubmit(onSubmit)}>
        <fieldset>
          <label>
            Customer
            <select
              {...register('customerId', { required: true })}
              className="p-2 border rounded"
            >
              <Async value={() => customers.get()} init={[]}>
                {(data, isLoading) => isLoading
                  ? <option value="" disabled>Loading...</option>
                  : (<>
                    <option value="" disabled>Pilih Customer</option>
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
          ) : (<button type="button" onClick={() => setShowCustomerForm(true)}>
            <span className="iconify mdi--plus" />
            <span>Customer Baru</span>
          </button>)}
        </fieldset>

        <fieldset>
          <label>
            Status
            <select
              id="transaction/status"
              required
              {...register('status', { required: true })}
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

        <hr />

        <ul>
          {/* TODO: Resolve product per item independent from getProducts() */}
          {items.map((item, i) => {
            if (resolvedProducts.isReady === false) return null;

            const product = resolvedProducts.value.find((product) => product.id === Number(item.productId))!;
            const total = product?.variants[item.variant]?.price * item.qty;

            return (
              <li key={i}>
                {product?.name} - <span className="text-gray-500">x{item.qty}</span> - {priceFormatter.format(total)}
              </li>
            );
          })}
        </ul>

        <hr />

        <div className="text-lg">
          Total: <span className="text-gray-900 font-bold">{priceFormatter.format(subtotal)}</span>
        </div>

        <div className="flex">
          <button
            type="submit"
            disabled={!formState.isValid || isSaving}
          >
            <span>{isSaving ? 'Menyimpan...' : 'Simpan'}</span>
          </button>
        </div>
      </form>

      <FormProvider {...formMethods}>
        <ProductList />
      </FormProvider>

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
  const { append, remove } = useFieldArray({ control, name: 'items' });
  const addedItems = watch('items');

  return (
    <div>
      <h2 className="text-2xl">
        Pilih Produk
      </h2>
      <table>
        <tbody>
          <Async value={getProducts} init={[]}>
            {(data, isLoading) => isLoading
              ? <tr><td colSpan={3}>Loading...</td></tr>
              : (<>
                {data.map((product) => {
                  const hasVariants = Object.keys(product.variants).length > 1
                    && !(PRODUCT_VARIANT_NO_VARIANTS.name in product.variants);
                  const itemIdx = addedItems.findIndex((item) => item.productId === String(product.id));
                  const namePrefix = `items.${itemIdx}` as const;
                  const qty = addedItems[itemIdx]?.qty;
                  const setQty = (n: number) => {
                    if (itemIdx !== -1) {
                      if (n <= 0) remove(itemIdx);
                      else setValue(`${namePrefix}.qty`, n);
                    } else {
                      append({ productId: String(product.id), variant: PRODUCT_VARIANT_NO_VARIANTS.name, qty: n });
                    }
                  };

                  return (
                    <tr
                      key={product.id}
                      className="[&:not(:last-child)]:border-b"
                    >
                      <td className="p-2 min-w-[20ch]">
                        {product.name}
                      </td>
                      <td className="p-2 text-gray-500">
                        {getPriceDisplay(product.variants)}
                      </td>
                      <td className="p-2 flex items-center">
                        {hasVariants
                          ? (
                            <div className="text-sm text-gray-500">Variants is not supported currently.</div>
                          ) : (<>
                            <button type="button" onClick={() => setQty(qty !== undefined ? qty - 1 : 0)}>
                              <span className="iconify mdi--minus" />
                            </button>

                            <input
                              type="number"
                              defaultValue={0}
                              {...(itemIdx !== -1
                                && register(`${namePrefix}.qty`, { required: true, valueAsNumber: true, min: 1 }))}
                              className="p-2 border rounded w-[7ch] font-semibold text-center"
                            />

                            <button type="button" onClick={() => setQty(qty !== undefined ? qty + 1 : 1)}>
                              <span className="iconify mdi--plus" />
                            </button>
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