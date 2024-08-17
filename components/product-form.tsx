'use client';

import { tagApi } from '@/client/calls';
import { Async } from '@/components/async';
import { TagForm } from '@/components/tag-form';
import { createCache } from '@/utils/cache';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
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
  tags?: {
    tagId: number;
  }[];
}

const INITIAL_VALUES: ProductFieldValues = {
  name: '',
  variants: [],
  tags: [],
};

export type ProductFormAction = (payload: ProductFieldValues) => Promise<void>;

interface ProductFormProps {
  action: ProductFormAction;
}

const tags = createCache('tags', () => tagApi.list());

export function ProductForm({ action }: ProductFormProps) {
  const router = useRouter();

  const [showTagForm, setShowTagForm] = useState(false);
  const [isSaving, startSaving] = useTransition();

  const formMethods = useForm<ProductFieldValues>({ defaultValues: INITIAL_VALUES });
  const { control, register, formState, handleSubmit } = formMethods;
  const { fields: tagFields, append, remove } = useFieldArray({ control, name: 'tags' });

  const onSubmit: SubmitHandler<ProductFieldValues> = (values) => {
    console.log(values);

    startSaving(() => action(values));
    router.push('/product');
  };

  return (
    <>
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

          <fieldset>
            <label>
              Harga
              <input
                type="number"
                id="product/price"
                {...register('price', { required: true, valueAsNumber: true, min: 0 })}
                className="px-3 py-2 border rounded"
              />
            </label>
          </fieldset>

          <div className="flex">
            <button
              type="button"
              disabled={Number.isNaN(tagFields.at(-1)?.tagId)}
              onClick={() => append({ tagId: NaN })}
            >
              Tambah Tag
            </button>
          </div>

          {tagFields.map((field, i) => (
            <fieldset key={field.id}>
              <label>
                Tag
                <select
                  {...register(`tags.${i}.tagId`, { required: true, valueAsNumber: true })}
                  className="px-3 py-2 border rounded"
                >
                  <Async value={tags.get} init={[]}>
                    {(tags, isLoading) => isLoading
                      ? (
                        <option value="" disabled selected>Loading...</option>
                      ) : (
                        <>
                          <option value="" disabled selected>
                            {tags.length ? 'Pilih Tag' : 'Tag tidak tersedia'}
                          </option>

                          {tags.map((tag) => (
                            <option key={tag.id} value={tag.id}>
                              {tag.name}
                            </option>
                          ))}
                        </>
                      )}
                  </Async>
                </select>
              </label>

              <button
                type="button"
                aria-label="Hapus Tag"
                onClick={() => remove(i)}
              >
                <span className="iconify mdi--delete" />
              </button>

              {i === tagFields.length - 1 && (
                <button
                  type="button"
                  aria-label="Buat tag baru"
                  onClick={() => setShowTagForm(true)}
                >
                  <span className="iconify mdi--plus" />
                  Tag baru
                </button>
              )}
            </fieldset>
          ))}

          <div className="flex">
            <button type="submit" disabled={!formState.isValid || isSaving}>
              {isSaving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </FormProvider>

      {showTagForm && (
        <TagForm
          actions={(state) => (
            <>
              <button
                type="submit"
                disabled={!state.isValid || state.isSubmitting}
              >
                Simpan
              </button>
              <button
                type="button"
                onClick={() => setShowTagForm(false)}
              >
                Batal
              </button>
            </>
          )}
          onAfterSubmit={() => {
            tags.clear();
          }}
        />
      )}
    </>
  );
}
