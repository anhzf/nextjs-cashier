'use client';

import { createCustomer } from '@/calls/customers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm, type FormState, type SubmitHandler } from 'react-hook-form';

interface FieldValues {
  name: string;
  phone?: string;
}

interface CustomerFormProps {
  values?: FieldValues;
  append?: (state: FormState<FieldValues>) => React.ReactNode;
  onSuccess?: (id: number) => void;
}

export function CustomerForm({
  values,
  append = (state: FormState<FieldValues>) => (
    <Button type="submit" disabled={!state.isValid || state.isSubmitting} className="w-full">
      <span>Simpan</span>
    </Button>
  ),
  onSuccess,
}: CustomerFormProps) {
  const { register, formState, handleSubmit, setError } = useForm<FieldValues>({ values });

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    try {
      const id = await createCustomer(data);
      onSuccess?.(id);
    } catch (err) {
      setError('root', { message: String(err) });
    }
  };

  return (
    <form className="grid gap-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-y-2">
        <Label htmlFor="customer/name">Name</Label>
        <Input
          id="customer/name"
          {...register('name', { required: true })}
        />
      </div>

      <div className="grid gap-y-2">
        <Label htmlFor="customer/phone">Phone</Label>
        <Input
          id="customer/phone"
          type="tel"
          {...register('phone')}
        />
      </div>

      {Object.entries(formState.errors).map(([key, value]) => (
        <div key={key} className="text-red-500">{value.message}</div>
      ))}

      <div className="flex gap-2">
        {append(formState)}
      </div>
    </form>
  )
}