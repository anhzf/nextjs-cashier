'use client';

import { redirect, useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { FormProvider, useFieldArray, useForm, useFormContext, type SubmitHandler } from 'react-hook-form';

interface FieldValues {
  name: string;
  price?: number;
  variants?: {
    name: string;
    attrs: {
      price: number;
    };
  }[];
}

export type ProductFormAction = (payload: FieldValues) => Promise<void>;

interface ProductFormProps {
  action: ProductFormAction;
}

export function ProductForm({ action }: ProductFormProps) {
  const router = useRouter();

  const [isSaving, startSaving] = useTransition();

  const formMethods = useForm<FieldValues>();
  const { control, register, watch, handleSubmit } = formMethods;
  const { fields, append, remove } = useFieldArray({ control, name: 'variants' });
  const variants = watch('variants');

  const onSubmit: SubmitHandler<FieldValues> = (values) => {
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

        {fields.map((field, index) => (
          <VariantField
            key={field.id}
            index={index}
            onRemoveClick={() => remove(index)}
          />
        ))}

        {/* {states.errors.length > 0 && (
          <ul className="text-red-500">
            {states.errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        )} */}

        <div className="flex">
          <button
            type="button"
            disabled={variants?.at(-1)?.name === ''}
            onClick={() => append({ name: '', attrs: { price: 0 } })}
          >
            Tambah Varian
          </button>
        </div>

        <div className="flex">
          <button type="submit" disabled={isSaving}>
            {isSaving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </form>
    </FormProvider>
  );
}

interface VariantFieldProps {
  index: number;
  onRemoveClick?: () => void;
}

function VariantField({ index, onRemoveClick }: VariantFieldProps) {
  const { register } = useFormContext<FieldValues>();

  return (
    <div className="flex">
      <fieldset>
        <label>
          Nama Varian
          <input
            type="text"
            id={`product/variants/${index}/name`}
            required
            {...register(`variants.${index}.name`, { required: true })}
            className="px-3 py-2 border rounded"
          />
        </label>
      </fieldset>

      <fieldset>
        <label>
          Harga
          <input
            type="number"
            id={`product/variants/${index}/attrs/price`}
            required
            {...register(`variants.${index}.attrs.price`, { required: true, valueAsNumber: true, min: 0 })}
            className="px-3 py-2 border rounded"
          />
        </label>
      </fieldset>

      <div className="flex">
        <button
          type="button"
          aria-label="Hapus"
          onClick={() => onRemoveClick?.()}
        >
          <span className="iconify mdi--delete" />
        </button>
      </div>
    </div>
  );
}