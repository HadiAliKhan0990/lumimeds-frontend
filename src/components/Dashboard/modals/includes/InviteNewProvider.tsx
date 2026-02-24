import { useDispatch } from 'react-redux';
import { setModal } from '@/store/slices/modalSlice';
import { useInviteProvidersMutation } from '@/store/slices/providersApiSlice';
import { Spinner } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/lib/errors';
import { FaTimes } from 'react-icons/fa';

export function InviteNewProvider() {
  const dispatch = useDispatch();

  const [inviteProviderMutation, { isLoading }] = useInviteProvidersMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
    },
    mode: 'onSubmit',
  });

  const handleReset = () => {
    reset();
    dispatch(setModal({ modalType: undefined }));
  };

  const handleInviteProvider = async ({ email }: { email: string }) => {
    try {
      const { success, message } = await inviteProviderMutation(email).unwrap();

      // Only show success toast if the API call was actually successful
      if (success) {
        toast.success('Provider Invited!');
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('providers:refresh'));
        }
        handleReset();
      } else {
        toast.error(message);
      }
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);

      // Check for duplicate email scenarios
      if (
        errorMessage.toLowerCase().includes('duplicate') ||
        errorMessage.toLowerCase().includes('already exists') ||
        errorMessage.toLowerCase().includes('email already') ||
        errorMessage.toLowerCase().includes('already invited')
      ) {
        toast.error('This email has already been invited. Please use a different email address.');
      } else {
        toast.error(errorMessage);
      }
    }
  };

  return (
    <>
      <div className='d-flex justify-content-between align-items-center mb-3'>
        <p className='m-0 text-base fw-bold'>New Provider Invite Link</p>
        <button
          onClick={() => dispatch(setModal({ modalType: undefined }))}
          className='p-0 m-0 d-flex align-items-center bg-transparent border-0'
          aria-label='Close'
        >
          <FaTimes size={'16'} />
        </button>
      </div>

      <form onSubmit={handleSubmit(handleInviteProvider)}>
        <label className='py-2' htmlFor='email'>
          Share To
        </label>
        <div className='d-flex gap-3'>
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
          />
          <button
            type='submit'
            className='btn btn-primary d-flex align-items-center justify-content-center gap-2 text-nowrap'
            disabled={isLoading}
          >
            {isLoading ? <Spinner animation='border' size='sm' /> : null}
            Send
          </button>
        </div>

        {!!errors.email && <span className='text-danger text-xs'>{errors.email.message}</span>}
      </form>
    </>
  );
}
