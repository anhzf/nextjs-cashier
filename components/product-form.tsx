'use client';

import { listTag } from '@/calls/tags';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { createCache } from '@/utils/cache';
import { valibotResolver } from '@hookform/resolvers/valibot';
import { XIcon } from 'lucide-react';
import { useState, useTransition } from 'react';
import { FormProvider, useForm, type SubmitHandler } from 'react-hook-form';
import * as v from 'valibot';

const FieldValuesSchema = v.object({
  name: v.pipe(v.string(), v.trim(), v.minLength(1), v.maxLength(255)),
  price: v.pipe(v.number(), v.minValue(0)),
  unit: v.optional(v.string(), 'pcs'),
  tags: v.array(v.object({
    value: v.string(),
  })),
  isHidden: v.optional(v.boolean(), false),
});

export type ProductFieldValues = v.InferInput<typeof FieldValuesSchema>;

const INITIAL_VALUES: Partial<ProductFieldValues> = {
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
  const [isSaving, startSaving] = useTransition();

  const formMethods = useForm({ values, resolver: valibotResolver(FieldValuesSchema) });
  const { control, formState: { isValid, isDirty }, handleSubmit } = formMethods;

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
    <FormProvider {...formMethods}>
      {/* <pre className="whitespace">{JSON.stringify({ isDirty }, null, 2)}</pre> */}

      <form
        className="flex w-full max-w-md mx-auto flex-col gap-4"
        onSubmit={handleSubmit(onSubmit)}
      >
        {error && (
          <div className="text-red-500">
            {error}
          </div>
        )}

        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Produk</FormLabel>
              <FormControl>
                <Input placeholder="Masukkan nama produk" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="price"
          defaultValue={0}
          rules={{}}
          render={({ field: { onChange, ...field } }) => (
            <FormItem>
              <FormLabel>Harga</FormLabel>
              <FormControl>
                <Input
                  placeholder="Masukkan harga"
                  onChange={(e) => onChange(Number(e.target.value))}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="unit"
          defaultValue={INITIAL_VALUES.unit}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Satuan</FormLabel>
              <FormControl>
                <Input placeholder="pcs" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="tags"
          defaultValue={[]}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <TagInput value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="isHidden"
          defaultValue={false}
          render={({ field }) => (
            <FormItem className="flex items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Sembunyikan produk
                </FormLabel>
                <FormDescription>
                  Produk yang disembunyikan tidak akan muncul di daftar produk.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <div className="flex py-2">
          <Button
            type="submit"
            disabled={!(isDirty && isValid) || isSaving}
            className="w-full"
          >
            {isSaving ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}

type TagInputValue = v.InferInput<typeof FieldValuesSchema.entries.tags>;

interface TagInputProps {
  value: TagInputValue;
  onChange?: (tags: TagInputValue) => void;
}

function TagInput({ value, onChange }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue) {
      e.preventDefault();
      if (!value.some(({ value: tag }) => tag === inputValue.trim())) {
        onChange?.([...value, { value: inputValue.trim() }]);
      }
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange?.(value.filter(({ value }) => value !== tagToRemove));
  };

  return (
    <div className="flex flex-col gap-2">
      <Input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
        placeholder="Tekan enter untuk menambahkan tag" />
      <div className="flex flex-wrap gap-2">
        {value.map((tag, index) => (
          <Badge key={index} variant="secondary">
            {tag.value}
            <Button
              type="button"
              variant="ghost"
              className="h-auto p-0 ml-2"
              onClick={() => removeTag(tag.value)}
            >
              <XIcon className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
      </div>
    </div>
  );
}