import { useDispatch } from 'react-redux';
import { setModal } from '@/store/slices/modalSlice';
import { useCreateAgentMutation } from '@/store/slices/agentsApiSlice';
import { addAgent } from '@/store/slices/agentsSlice';
import { Spinner } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/lib/errors';
import { FaTimes } from 'react-icons/fa';
import { formatUSPhoneWithoutPlusOne } from '@/lib/helper';
import { useEffect, useRef } from 'react';

export function AddAgent() {
  const dispatch = useDispatch();
  const phoneInputRef = useRef<HTMLInputElement>(null);

  const [createAgentMutation, { isLoading }] = useCreateAgentMutation();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    trigger,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
    },
    mode: 'onSubmit',
  });

  // Auto-fill detection and validation trigger
  useEffect(() => {
    const handleAutoFill = () => {
      if (phoneInputRef.current && phoneInputRef.current.value) {
        const formattedPhone = formatUSPhoneWithoutPlusOne(phoneInputRef.current.value);
        setValue('phone', formattedPhone);
        trigger('phone');
      }
    };

    const phoneInput = phoneInputRef.current;
    if (phoneInput) {
      phoneInput.addEventListener('animationstart', handleAutoFill);
      const interval = setInterval(handleAutoFill, 100);

      return () => {
        phoneInput.removeEventListener('animationstart', handleAutoFill);
        clearInterval(interval);
      };
    }
  }, [setValue, trigger]);

  const handleReset = () => {
    reset();
    dispatch(setModal({ modalType: undefined }));
  };

  const handleCreateAgent = async ({ name, email, phone }: { name: string; email: string; phone: string }) => {
    try {
      const formattedPhone = formatUSPhoneWithoutPlusOne(phone);

      const agentData = {
        name: name.trim(),
        email,
        info: {
          phone: formattedPhone,
        },
        isActive: true,
      };

      const result = await createAgentMutation(agentData).unwrap();

      if (result) {
        toast.success('Agent created successfully!');
        // Add the new agent to the top of the Redux store
        dispatch(addAgent(result.data.agent));
        handleReset();
      }
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);

      if (
        errorMessage.toLowerCase().includes('duplicate') ||
        errorMessage.toLowerCase().includes('already exists') ||
        errorMessage.toLowerCase().includes('email already')
      ) {
        toast.error('This email already exists. Please use a different email address.');
      } else {
        toast.error(errorMessage);
      }
    }
  };

  return (
    <>
      <div className='d-flex justify-content-between align-items-center mb-3'>
        <p className='m-0 text-base fw-bold'>Add New Agent</p>
        <button
          onClick={() => dispatch(setModal({ modalType: undefined }))}
          className='p-0 m-0 d-flex align-items-center bg-transparent border-0'
          aria-label='Close'
        >
          <FaTimes size={'16'} />
        </button>
      </div>

      <form onSubmit={handleSubmit(handleCreateAgent)} className='d-flex flex-column gap-3'>
        <div>
          <label className='py-2' htmlFor='name'>
            Name
          </label>
          <input
            type='text'
            {...register('name', {
              required: { value: true, message: 'Name is required' },
              minLength: { value: 2, message: 'Name must be at least 2 characters' },
              validate: (value) => {
                const trimmed = value?.trim();
                if (!trimmed) return 'Name cannot be empty or contain only spaces';
                if (trimmed.length < 2) return 'Name must be at least 2 characters';
                return true;
              },
            })}
            className='form-control'
            placeholder='Name'
          />
          {!!errors.name && <span className='text-danger text-xs'>{errors.name.message}</span>}
        </div>

        <div>
          <label className='py-2' htmlFor='email'>
            Email
          </label>
          <input
            type='email'
            {...register('email', {
              required: { value: true, message: 'Email is required' },
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            })}
            className='form-control'
            placeholder='Email'
          />
          {!!errors.email && <span className='text-danger text-xs'>{errors.email.message}</span>}
        </div>

        <div>
          <label className='py-2' htmlFor='phone'>
            Phone
          </label>
          {/* <Controller
            name='phone'
            control={control}
            rules={{
              required: { value: true, message: 'Phone is required' },
              minLength: {
                value: 14,
                message: 'Please enter a valid phone number',
              },
              validate: (value) => {
                if (!value || value.trim() === '') {
                  return 'Phone is required';
                }
                const digits = value.replace(/\D/g, '');
                if (digits.length < 10) {
                  return 'Please enter a valid phone number';
                }
                return true;
              },
            }}
            render={({ field }) => (
              <input
                type='tel'
                {...field}
                ref={(e) => {
                  phoneInputRef.current = e;
                  field.ref(e);
                }}
                onChange={(e) => {
                  const formatted = formatUSPhoneWithoutPlusOne(e.target.value);
                  e.target.value = formatted;
                  field.onChange(formatted);
                  // Trigger validation
                  trigger('phone');
                }}
                onBlur={(e) => {
                  const formatted = formatUSPhoneWithoutPlusOne(e.target.value);
                  if (formatted !== e.target.value) {
                    e.target.value = formatted;
                    field.onChange(formatted);
                  }
                  field.onBlur();
                  trigger('phone');
                }}
                className='form-control'
                placeholder='Phone number'
                autoComplete='tel'
              />
            )}
          /> */}
          <input  
            type='number'
            {...register('phone')}
            className='form-control'
            placeholder='Phone number'
          />
          {!!errors.phone && <span className='text-danger text-xs'>{errors.phone.message}</span>}
        </div>

        <div className='d-flex gap-2 justify-content-end mt-3'>
          <button type='button' className='btn btn-light border border-secondary' onClick={handleReset}>
            Cancel
          </button>
          <button
            type='submit'
            className='btn btn-primary d-flex align-items-center justify-content-center gap-2'
            disabled={isLoading}
          >
            {isLoading ? <Spinner animation='border' size='sm' /> : null}
            Create Agent
          </button>
        </div>
      </form>
    </>
  );
}
