'use client';

import { Product } from '@/store/slices/medicationsProductsSlice';
import { Modal, ModalProps, Button, Form, Spinner } from 'react-bootstrap';
import { Formik, Form as FormikForm, Field, ErrorMessage, FormikHelpers } from 'formik';
import { FormValues, validationSchema } from '@/lib/schema/productPrice';
import {
  useLazyGetMedicationsProductsListQuery,
  useUpdateProductPriceMutation,
} from '@/store/slices/medicationsApiSlice';
import { Error } from '@/lib/types';
import toast from 'react-hot-toast';
import { isAxiosError } from 'axios';
import { RootState } from '@/store';
import { useSelector } from 'react-redux';

interface Props extends ModalProps {
  selectedProduct?: Product;
  onRefetch?: () => void;
}

export const PriceModal = ({ selectedProduct, onRefetch, ...props }: Readonly<Props>) => {
  const initialValues: FormValues = {
    amount: selectedProduct?.price.amount ?? 0,
    billingIntervalCount: selectedProduct?.price.billingInterval ?? 0,
    priceType: selectedProduct?.priceType,
    productId: selectedProduct?.id ?? '',
  };

  const search = useSelector((state: RootState) => state.sort.search);
  const sortField = useSelector((state: RootState) => state.sort.sortField);
  const sortOrder = useSelector((state: RootState) => state.sort.sortOrder);
  const sortStatus = useSelector((state: RootState) => state.sort.sortStatus);

  const [updateProductPrice] = useUpdateProductPriceMutation();
  const [triggerMedicationsProductsList] = useLazyGetMedicationsProductsListQuery();

  async function handleSubmit(values: FormValues, { resetForm, setSubmitting }: FormikHelpers<FormValues>) {
    try {
      setSubmitting(true);
      const { amount, productId, billingIntervalCount, priceType } = values;
      if (amount !== selectedProduct?.price.amount) {
        const payload = {
          amount,
          productId,
          ...(priceType === 'subscription' && billingIntervalCount && { billingIntervalCount }),
        };
        const { error } = await updateProductPrice(payload);
        if (error) {
          toast.error((error as Error).data.message);
        } else {
          await triggerMedicationsProductsList({
            meta: { page: 1, limit: 30 },
            search,
            sortField,
            sortOrder,
            sortStatus,
          });
          onRefetch?.();
          toast.success('Product Price Updated Successfully!');
          resetForm();
          props.onHide?.();
        }
      } else {
        toast.error('No changes detected. Please update the amount before submitting.');
      }
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data.message || 'Error while updating product price!');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal {...props} scrollable centered>
      <Modal.Header className='border-0 justify-content-center text-center'>
        <Modal.Title>Update Price</Modal.Title>
      </Modal.Header>

      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, isValid }) => (
          <FormikForm>
            <Modal.Body>
              {/* Amount */}
              <Form.Group className='mb-3'>
                <Form.Label>Amount</Form.Label>
                <Field name='amount' type='number' className='form-control' placeholder='Enter amount' />
                <ErrorMessage name='amount' component='div' className='text-danger small' />
              </Form.Group>
            </Modal.Body>

            <Modal.Footer className='border-0'>
              <div className='row w-100 gx-3'>
                <div className='col-6'>
                  <Button variant='outline-primary' className='w-100' onClick={props.onHide} disabled={isSubmitting}>
                    Cancel
                  </Button>
                </div>
                <div className='col-6'>
                  <Button
                    className='d-flex align-items-center justify-content-center w-100 gap-2'
                    type='submit'
                    variant='primary'
                    disabled={isSubmitting || !isValid}
                  >
                    {isSubmitting && <Spinner className='border-2' size='sm' />}
                    Update
                  </Button>
                </div>
              </div>
            </Modal.Footer>
          </FormikForm>
        )}
      </Formik>
    </Modal>
  );
};
