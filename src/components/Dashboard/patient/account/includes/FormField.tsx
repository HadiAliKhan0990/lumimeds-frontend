'use client';

import { AccountSchema } from '@/lib/schema/account';
import { useFormContext } from 'react-hook-form';

interface FormFieldProps<K extends keyof AccountSchema> {
  name: K;
  label: string;
  loading?: boolean;
}

export function FormField<K extends keyof AccountSchema>({ name, label, loading }: FormFieldProps<K>) {
  const { watch } = useFormContext<AccountSchema>();
  const value = watch(name);
  return (
    <div>
      <div className='d-flex align-items-center justify-content-between mb-2'>
        <p className='text-grey m-0'>{label}</p>
      </div>
      {loading ? (
        <div className='form-value-underline placeholder-glow'>
          <span className='placeholder py-12 col-7' />
        </div>
      ) : (
        <span className='form-value-underline text-lg'>{value}</span>
      )}
    </div>
  );
}
