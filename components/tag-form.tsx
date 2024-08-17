import { createTag } from '@/calls/tags';
import { useForm, type FormState, type SubmitHandler } from 'react-hook-form';

interface TagFieldValues {
  name: string;
}

interface TagFormProps {
  actions?: (state: FormState<TagFieldValues>) => React.ReactNode;
  onAfterSubmit?: () => void;
}

export function TagForm({
  onAfterSubmit,
  actions = (state) => (
    <button type="submit" disabled={!state.isValid || state.isSubmitting}>
      Simpan
    </button>
  ),
}: TagFormProps) {
  const { register, formState, handleSubmit, setError } = useForm<TagFieldValues>();

  const onSubmit: SubmitHandler<TagFieldValues> = async (data) => {
    try {
      await createTag(data);
      onAfterSubmit?.();
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
            id="tag/name"
            required
            {...register('name', { required: true, valueAsNumber: true })}
            className="px-3 py-2 border rounded"
          />
        </label>
      </fieldset>

      <div className="flex">
        {actions(formState)}
      </div>
    </form>
  );
}