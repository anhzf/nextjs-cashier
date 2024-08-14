import { createCustomer } from '@/calls/customers';
import { useForm, type FormState, type SubmitHandler } from 'react-hook-form';

interface FieldValues {
  name: string;
  phone?: string;
}

interface CustomerFormProps {
  values?: FieldValues;
  append?: (state: FormState<FieldValues>) => React.ReactNode;
}

export function CustomerForm({
  values,
  append = (state: FormState<FieldValues>) => (
    <button disabled={!state.isValid || state.isSubmitting} type="submit">
      <span>Simpan</span>
    </button>
  )
}: CustomerFormProps) {
  const { register, formState, handleSubmit, setError } = useForm<FieldValues>({ values });

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    try {
      await createCustomer(data);
    } catch (err) {
      setError('root', { message: String(err) });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <fieldset>
        <label>
          Nama
          <input
            type="text"
            id="customer/name"
            required
            {...register('name', { required: true })}
            className="px-3 py-2 border rounded"
          />
        </label>
      </fieldset>

      <fieldset>
        <label>
          No. Kontak
          <input
            type="tel"
            id="customer/phone"
            required
            {...register('phone')}
            className="px-3 py-2 border rounded"
          />
        </label>
      </fieldset>

      <div className="flex">
        {append(formState)}
      </div>
    </form>
  )
}