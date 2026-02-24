import toast from 'react-hot-toast';
import Switch from 'react-switch';
import { useDispatch, useSelector } from 'react-redux';
import { setModal } from '@/store/slices/modalSlice';
import { useUpdateAgentMutation } from '@/store/slices/agentsApiSlice';
import { updateAgent } from '@/store/slices/agentsSlice';
import { Spinner } from 'react-bootstrap';
import { useFormik } from 'formik';
import { getErrorMessage } from '@/lib/errors';
import { FaTimes } from 'react-icons/fa';
import { RootState } from '@/store';
import { editAgentValidationSchema, EditAgentFormValues } from '@/schemas/editAgents';

export function EditAgent() {
  const dispatch = useDispatch();

  const selectedAgent = useSelector((state: RootState) => state.agent.agent);

  const [updateAgentMutation, { isLoading }] = useUpdateAgentMutation();

  // Compute initial values based on selected agent
  const getInitialValues = (): EditAgentFormValues => {
    if (!selectedAgent) {
      return {
        name: '',
        phone: '',
        isActive: true,
      };
    }

    // Clean phone number by removing all non-digits and format it
    const cleanPhone = selectedAgent.info?.phone?.replace(/\D/g, '') || '';

    return {
      name: selectedAgent.name || '',
      phone: cleanPhone,
      isActive: selectedAgent.isActive ?? true,
    };
  };

  const formik = useFormik<EditAgentFormValues>({
    initialValues: getInitialValues(),
    validationSchema: editAgentValidationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {
      if (!selectedAgent?.id) {
        toast.error('No agent selected for update');
        return;
      }

      try {
        const agentData = {
          name: values.name.trim(),
          info: {
            phone: values.phone || '',
          },
          isActive: values.isActive,
        };

        const { success, message, data } = await updateAgentMutation({
          id: selectedAgent.id,
          data: agentData,
        }).unwrap();

        if (success) {
          toast.success(message || 'Agent updated successfully!');
          // Update the Redux store directly
          dispatch(updateAgent(data?.agent));
          resetForm();
          dispatch(setModal({ modalType: undefined }));
        } else {
          toast.error(message || 'Error while updating agent!');
        }
      } catch (error: unknown) {
        const errorMessage = getErrorMessage(error);
        toast.error(errorMessage);
      }
    },
  });

  const handleReset = () => {
    formik.resetForm();
    dispatch(setModal({ modalType: undefined }));
  };

  if (!selectedAgent) {
    return (
      <div className='d-flex justify-content-center align-items-center py-4'>
        <p className='text-muted'>No agent selected for editing</p>
      </div>
    );
  }

  return (
    <>
      <div className='d-flex justify-content-between align-items-center mb-3'>
        <p className='m-0 text-base fw-bold'>Edit Agent</p>
        <button
          onClick={() => dispatch(setModal({ modalType: undefined }))}
          className='p-0 m-0 d-flex align-items-center bg-transparent border-0'
          aria-label='Close'
        >
          <FaTimes size={'16'} />
        </button>
      </div>

      <form onSubmit={formik.handleSubmit} className='d-flex flex-column gap-3'>
        <div>
          <label className='py-2' htmlFor='name'>
            Name
          </label>
          <input
            type='text'
            id='name'
            name='name'
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`form-control${formik.touched.name && formik.errors.name ? ' is-invalid' : ''}`}
            placeholder='Name'
          />
          {formik.touched.name && formik.errors.name && (
            <span className='text-danger text-xs'>{formik.errors.name}</span>
          )}
        </div>

        <div>
          <label className='py-2' htmlFor='email'>
            Email
          </label>
          <div className='form-control disabled'>{selectedAgent.email}</div>
          <small className='text-muted'>Email cannot be changed</small>
        </div>

        <div>
          <label className='py-2' htmlFor='phone'>
            Phone
          </label>
          <input
            value={formik.values.phone}
            onChange={(e) => {
              formik.setFieldValue('phone', e.target.value);
            }}
            onBlur={formik.handleBlur}
            name='phone'
            type='tel'
            className={`form-control${formik.touched.phone && formik.errors.phone ? ' is-invalid' : ''}`}
            placeholder='Phone number'
          />
          {formik.touched.phone && formik.errors.phone && (
            <span className='text-danger text-xs'>{formik.errors.phone}</span>
          )}
        </div>

        <div className='d-flex align-items-center gap-2'>
          <Switch
            checked={formik.values.isActive ?? false}
            onChange={(checked) => formik.setFieldValue('isActive', checked)}
            onColor='#3060fe'
            offColor='#dc3545'
            checkedIcon={false}
            uncheckedIcon={false}
            height={24}
            width={48}
          />
          <div>
            <p className='m-0 fw-medium'>Agent Status</p>
            <p className='m-0 text-muted small'>Active/Inactive status</p>
          </div>
        </div>

        <div className='d-flex gap-2 justify-content-end mt-3'>
          <button type='button' className='btn btn-outline-primary' onClick={handleReset}>
            Cancel
          </button>
          <button
            type='submit'
            className='btn btn-primary d-flex align-items-center justify-content-center gap-2'
            disabled={isLoading || formik.isSubmitting}
          >
            {(isLoading || formik.isSubmitting) && <Spinner animation='border' size='sm' />}
            Update Agent
          </button>
        </div>
      </form>
    </>
  );
}
