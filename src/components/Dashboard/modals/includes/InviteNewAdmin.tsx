import { useDispatch } from 'react-redux';
import { setModal } from '@/store/slices/modalSlice';
import { useInviteAdminMutation } from '@/store/slices/adminApiSlice';
import { Spinner } from 'react-bootstrap';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { getErrorMessage } from '@/lib/errors';
import { FaTimes } from 'react-icons/fa';
import { inviteAdminSchema, FormValues } from '@/lib/schema/inviteNewAdmin';
import toast from 'react-hot-toast';

export function InviteNewAdmin() {
  const dispatch = useDispatch();

  const [inviteAdminMutation, { isLoading }] = useInviteAdminMutation();

  const handleReset = () => {
    dispatch(setModal({ modalType: undefined }));
  };

  const handleInviteAdmin = async (values: FormValues) => {
    try {
      const { success, message } = await inviteAdminMutation(values.email).unwrap();
      if (success) {
        toast.success(message);
        handleReset();
      } else {
        toast.error(message);
      }
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <>
      <div className='d-flex justify-content-between align-items-start mb-4'>
        <p className='m-0 text-base fw-bold'>New Admin Invite Link</p>
        <button
          onClick={handleReset}
          className='p-0 m-0 d-flex align-items-center bg-transparent border-0'
          aria-label='Close'
        >
          <FaTimes size={16} />
        </button>
      </div>

      <Formik initialValues={{ email: '' }} validationSchema={inviteAdminSchema} onSubmit={handleInviteAdmin}>
        {({ isSubmitting, isValid }) => (
          <Form>
            <label className='py-2' htmlFor='email'>
              Share To
            </label>
            <div className='d-flex align-items-center gap-3'>
              <Field type='email' name='email' className='form-control flex-grow-1' placeholder='Enter email address' />
              <button
                type='submit'
                className='btn btn-primary d-flex align-items-center justify-content-center gap-2 text-nowrap'
                disabled={isLoading || isSubmitting || !isValid}
              >
                {isLoading || isSubmitting ? <Spinner size='sm' className='border-2' /> : null}
                Send
              </button>
            </div>

            <ErrorMessage name='email' component='span' className='text-danger text-sm' />
          </Form>
        )}
      </Formik>
    </>
  );
}
