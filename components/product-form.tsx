'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { FormProvider, useFieldArray, useForm, type SubmitHandler } from 'react-hook-form';

export interface ProductFieldValues {
  name: string;
  price?: number;
  variants?: {
    name: string;
    attrs: {
      price: number;
    };
  }[];
}

export type ProductFormAction = (payload: ProductFieldValues) => Promise<void>;

interface ProductFormProps {
  action: ProductFormAction;
}

export function ProductForm({ action }: ProductFormProps) {
  const router = useRouter();

  const [isSaving, startSaving] = useTransition();

  const formMethods = useForm<ProductFieldValues>();
  const { control, register, handleSubmit } = formMethods;
  const { fields } = useFieldArray({ control, name: 'variants' });

  const onSubmit: SubmitHandler<ProductFieldValues> = (values) => {
    startSaving(() => action(values));
    router.push('/product');
  };

  return (
    <FormProvider {...formMethods}>
      <form
        className="flex flex-col"
        onSubmit={handleSubmit(onSubmit)}
      >
        <fieldset>
          <label>
            Nama
            <input
              type="text"
              id="product/name"
              required
              {...register('name', { required: true })}
              className="px-3 py-2 border rounded"
            />
          </label>
        </fieldset>

        {!fields.length && (
          <fieldset>
            <label>
              Harga
              <input
                type="number"
                id="product/price"
                {...register('price', { required: !fields.length, valueAsNumber: true, min: 0 })}
                className="px-3 py-2 border rounded"
              />
            </label>
          </fieldset>
        )}

        <div className="flex">
          <button type="submit" disabled={isSaving}>
            {isSaving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </form>
    </FormProvider>
  );
}