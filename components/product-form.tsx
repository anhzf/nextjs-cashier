'use client';

import { listTag } from '@/calls/tags';
import { Async } from '@/components/async';
import { TagForm } from '@/components/tag-form';
import { createCache } from '@/utils/cache';
import { useState, useTransition } from 'react';
import { FormProvider, useFieldArray, useForm, type SubmitHandler } from 'react-hook-form';

export interface ProductFieldValues {
  name: string;
  price?: number;
  unit?: string;
  variants?: {
    name: string;
    attrs: {
      price: number;
    };
  }[];
  tags?: {
    tagId: number;
  }[];
  isHidden?: boolean;
}

const INITIAL_VALUES: ProductFieldValues = {
  name: '',
  unit: 'pcs',
};

export type ProductFormAction = (payload: ProductFieldValues) => Promise<void>;

interface ProductFormProps {
  values?: ProductFieldValues;
  action?: ProductFormAction;
}

const tags = createCache('tags', () => listTag());

export function ProductForm({ values, action }: ProductFormProps) {
  const [error, setError] = useState<string>();
  const [showTagForm, setShowTagForm] = useState(false);
  const [isSaving, startSaving] = useTransition();

  const formMethods = useForm<ProductFieldValues>({ values });
  const { control, register, formState, handleSubmit, watch } = formMethods;
  const { fields: tagFields, append, remove } = useFieldArray({ control, name: 'tags' });
  const selectedTags = watch('tags');

  const onSubmit: SubmitHandler<ProductFieldValues> = (payload) => {
    action && startSaving(async () => {
      try {
        await action(payload);
      } catch (err) {
        setError(String(err));
      }
    });
  };

  return (
    <>
      <FormProvider {...formMethods}>
        <form
          className="flex flex-col"
          onSubmit={handleSubmit(onSubmit)}
        >

          {error && (
            <div className="text-red-500">
              {error}
            </div>
          )}

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

          <fieldset>
            <label>
              Satuan
              <input
                type="text"
                id="product/unit"
                defaultValue={INITIAL_VALUES.unit}
                {...register('unit', { required: true })}
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
                    {(tags, isLoading) => {
                      if (isLoading) return (
                        <option value="" disabled>Loading...</option>
                      );

                      const unselected = tags.filter((tag) => !(selectedTags ?? [])
                        .some((selected) => selected.tagId === tag.id));
                      const self = tags.find((tag) => tag.id === field.tagId);

                      return (
                        <>
                          <option value="" disabled>
                            {unselected.length ? 'Pilih Tag' : 'Tag tidak tersedia'}
                          </option>

                          {self && (
                            <option value={self.id}>
                              {self.name}
                            </option>
                          )}

                          {unselected.map((tag) => (
                            <option
                              key={tag.id}
                              value={tag.id}
                            >
                              {tag.name}
                            </option>
                          ))}
                        </>
                      );
                    }}
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

          <fieldset>
            <label>
              <input
                type="checkbox"
                id="product/isHidden"
                {...register('isHidden')}
              />
              <span className="ml-2">
                Tandai produk ini sebagai arsip
              </span>
            </label>

            <p>
              <small>
                Produk yang diarsip tidak akan muncul di daftar produk.
              </small>
            </p>
          </fieldset>

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