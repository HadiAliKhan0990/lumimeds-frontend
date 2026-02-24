'use client';

import { useEffect, useState } from 'react';
import { Form, Modal, Button } from 'react-bootstrap';
import { Formik, Field, ErrorMessage, useFormikContext } from 'formik';
import { acceptRejectRxSchema, AcceptRejectRxSchema } from '@/lib/schema/acceptRejectRx';
import { OptionValue } from '@/lib/types';
import { RootState } from '@/store';
import { useSelector } from 'react-redux';
import { OrderCard } from '@/components/Dashboard/admin/pharmacies/PatientForm/includes/OrderCard';
import { useWindowWidth } from '@/hooks/useWindowWidth';
import { OrderNotesContent } from '@/modules/protected/admin/AdminOrdersPanel/orders/includes/OrderNotesContent';
import ReactSelect from 'react-select';

export interface AcceptRejectRXFormProps {
  onAccept?: (values: AcceptRejectRxSchema) => void;
  onReject?: (rejectionReason: string) => void;
  initialValues?: Partial<AcceptRejectRxSchema>;
  showActionButtons?: boolean;
  orderId?: string;
  productImage?: string;
  productName?: string;
}

const defaultInitialValues: AcceptRejectRxSchema = {
  refills: '',
  daysSupply: 30,
  directions: '',
  notes: '',
  rejectionReason: '',
  dosage: '',
  medication: '',
};

export interface FormContentProps extends AcceptRejectRXFormProps {
  onReject?: (rejectionReason: string) => void;
  showActionButtons?: boolean;
  orderId?: string;
  productImage?: string;
  productName?: string;
}

const FormContent = ({ onReject, showActionButtons = true, orderId, productImage, productName }: FormContentProps) => {
  const { handleSubmit, isSubmitting, submitForm, values, setFieldValue } = useFormikContext<AcceptRejectRxSchema>();
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const orders = useSelector((state: RootState) => state.patientOrders?.data) ?? [];

  const foundOrder = orders.find((order) => order?.id === orderId)?.prescriptionInstructions?.[0];

  const { windowWidth } = useWindowWidth();

  const isMobile = windowWidth <= 576;

  const isTablet = windowWidth <= 768;

  const isLargeScreen = windowWidth >= 992;

  const decideWidth = () => {
    if (isMobile) {
      return 'w-100';
    }
    if (isTablet) {
      return 'w-50';
    }
    if (isLargeScreen) {
      return 'w-35';
    }
    return 'w-50';
  };

  useEffect(() => {
    if (foundOrder) {
      setFieldValue('refills', foundOrder.refills);
      setFieldValue('daysSupply', foundOrder.daysSupply);
      setFieldValue('directions', foundOrder.directions);
      setFieldValue('notes', foundOrder.notes);
    }
  }, [foundOrder]);

  const handleReject = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowRejectModal(true);
  };

  const handleConfirmReject = () => {
    onReject?.(rejectionReason);
    setShowRejectModal(false);
    setRejectionReason('');
  };

  const handleAccept = async (e: React.MouseEvent) => {
    e.preventDefault();
    await submitForm();
  };

  return (
    <div className='d-flex flex-column gap-3 border border-c-light p-3 rounded-2'>
      <span className='fw-medium '>Selected Order</span>
      <div className='d-flex  flex-column gap-3'>
        <div className={`${decideWidth()}`}>
          <OrderCard productImage={productImage} productName={productName} />
        </div>
        <div className='border border-c-light p-2 rounded-2'>
          <OrderNotesContent type='patient' />
        </div>
      </div>

      <Form
        id='accept-reject-rx-form'
        className='border border-c-light rounded-2'
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(e);
        }}
      >
        <div className='rounded-12 p-12'>
          {showActionButtons && (
            <div className={'mb-4 d-flex align-items-center justify-content-between flex-wrap gap-2'}>
              <span className='fw-medium'>Accept Reject RX</span>
              <div className='d-flex gap-2'>
                <button
                  type='button'
                  onClick={handleAccept}
                  disabled={isSubmitting}
                  className='btn btn-outline-primary text-sm rounded-1 d-flex align-items-center gap-2'
                >
                  <p className='m-0'>Accept RX</p>
                </button>
                <button
                  type='button'
                  onClick={handleReject}
                  disabled={isSubmitting}
                  className='btn btn-primary text-sm rounded-1 d-flex align-items-center gap-2'
                >
                  <p className='m-0'>Reject RX</p>
                </button>
              </div>
            </div>
          )}
          <div className='row gy-3'>
            <div className='col-12 col-md-6'>
              <Form.Group>
                <Form.Label>Refills</Form.Label>
                <Field
                  type='text'
                  name='refills'
                  className='form-control shadow-none'
                  placeholder='Enter number of refills'
                />
                <ErrorMessage name='refills' component='div' className='invalid-feedback d-block' />
              </Form.Group>
            </div>
            <div className='col-12 col-md-6'>
              <Form.Group>
                <Form.Label>Days Supply</Form.Label>
                <ReactSelect
                  options={[
                    { label: '30', value: 30 },
                    { label: '60', value: 60 },
                    { label: '90', value: 90 },
                  ]}
                  value={values.daysSupply ? { label: `${values.daysSupply}`, value: values.daysSupply } : null}
                  name='daysSupply'
                  onChange={(option) => {
                    const { value } = option as OptionValue;
                    setFieldValue('daysSupply', value);
                  }}
                  isSearchable={false}
                  placeholder='Select Days Supply'
                  classNames={{
                    control: () => 'w-100 rounded',
                    indicatorSeparator: () => 'd-none',
                  }}
                />
                <ErrorMessage name='daysSupply' component='div' className='invalid-feedback d-block' />
              </Form.Group>
            </div>
            <div className='col-12'>
              <Form.Group>
                <Form.Label>Directions</Form.Label>
                <Field
                  as='textarea'
                  name='directions'
                  rows={3}
                  className='form-control shadow-none'
                  placeholder='Enter directions'
                />
                <ErrorMessage name='directions' component='div' className='invalid-feedback d-block' />
              </Form.Group>
            </div>
            <div className='col-12'>
              <Form.Group>
                <Form.Label>Notes</Form.Label>
                <Field
                  as='textarea'
                  name='notes'
                  rows={3}
                  className='form-control shadow-none'
                  placeholder='Enter notes'
                />
                <ErrorMessage name='notes' component='div' className='invalid-feedback d-block' />
              </Form.Group>
            </div>
          </div>
        </div>

        {/* Rejection Modal */}
        <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Reject Prescription</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className='mb-3'>
              <Form.Label>Rejection Reason</Form.Label>
              <Form.Control
                as='textarea'
                rows={4}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder='Please provide a reason for rejecting this prescription...'
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant='secondary' onClick={() => setShowRejectModal(false)}>
              Cancel
            </Button>
            <Button variant='danger' onClick={handleConfirmReject} disabled={!rejectionReason.trim()}>
              Reject Prescription
            </Button>
          </Modal.Footer>
        </Modal>
      </Form>
    </div>
  );
};

export const AcceptRejectRXForm = ({
  onAccept,
  onReject,
  initialValues,
  showActionButtons = true,
  orderId,
  productImage,
  productName,
}: AcceptRejectRXFormProps) => {
  return (
    <Formik
      initialValues={{ ...defaultInitialValues, ...initialValues }}
      validationSchema={acceptRejectRxSchema}
      validateOnChange={false}
      validateOnBlur={false}
      onSubmit={(values, { setSubmitting }) => {
        onAccept?.(values);
        setSubmitting(false);
      }}
    >
      <FormContent
        onReject={onReject}
        showActionButtons={showActionButtons}
        orderId={orderId}
        productImage={productImage}
        productName={productName}
      />
    </Formik>
  );
};
