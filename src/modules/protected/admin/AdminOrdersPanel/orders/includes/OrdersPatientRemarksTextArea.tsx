'use client';

import { TextArea, TextAreaProps } from '@/components/elements/Inputs/TextArea';
import { useDebounceHandler } from '@/hooks/useDebounceHandler';
import { useUpdateOrderPatientRemarksMutation } from '@/store/slices/ordersApiSlice';
import { Order } from '@/store/slices/orderSlice';
import { useEffect, useRef, useState } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { toast } from 'react-hot-toast';

export interface Props extends TextAreaProps {
  order: Order;
  onUpdatePatientRemarks: (patientRemarks: string) => void;
}

export const OrdersPatientRemarksTextArea = ({ order, onUpdatePatientRemarks, ...props }: Props) => {
  const [state, setState] = useState({
    isViewingPatientRemarksTextArea: false,
    value: '',
    isTyping: false,
    isHovering: false,
  });

  const { isViewingPatientRemarksTextArea, value, isTyping, isHovering } = state;

  const setStateHandler = (key: keyof typeof state, value: (typeof state)[keyof typeof state]) => {
    setState((prev) => ({ ...prev, [key]: value }));
  };

  // Create ref for TextArea
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const { debouncedHandler } = useDebounceHandler();

  const [updateOrderPatientRemarks, { isLoading }] = useUpdateOrderPatientRemarksMutation();

  const handleUpdateOrderPatientRemarks = (patientRemarks: string) => {
    updateOrderPatientRemarks({ orderId: order.id ?? '', patientRemarks: patientRemarks.trim() })
      .unwrap()
      .catch((error) => {
        if (error?.data?.message) toast.error(error?.data?.message);
        setStateHandler('value', order?.patientRemarks ?? '');
      });
  };

  useEffect(() => {
    setStateHandler('value', order?.patientRemarks ?? '');
  }, [order.patientRemarks]);

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setStateHandler('isTyping', true);
    setStateHandler('value', e.target.value);

    const callBack = () => {
      handleUpdateOrderPatientRemarks(e.target.value);

      setStateHandler('isTyping', false);
    };

    debouncedHandler(1000, callBack);
  };

  // Auto-focus when textarea becomes visible
  useEffect(() => {
    if (isViewingPatientRemarksTextArea && textAreaRef.current) {
      textAreaRef.current.focus();
    }
  }, [isViewingPatientRemarksTextArea]);

  const isEmpty = value?.trim() === '';

  const shouldShowTooltip = !isTyping && !isEmpty && isHovering;

  return (
    <div
      onMouseEnter={() => setStateHandler('isHovering', true)}
      onMouseLeave={() => setStateHandler('isHovering', false)}
      className='md:tw-min-w-72 tw-max-w-full'
      onClick={(event) => event.stopPropagation()}
    >
      <OverlayTrigger
        show={shouldShowTooltip}
        placement='top'
        overlay={<Tooltip id='patient-remarks-tooltip'>{value?.trim() || 'N/A'}</Tooltip>}
      >
        {isViewingPatientRemarksTextArea ? (
          <TextArea
            ref={textAreaRef}
            {...props}
            rows={5}
            value={value}
            onChange={onChange}
            onBlur={({ target: { value } }) => {
              setStateHandler('isViewingPatientRemarksTextArea', false);

              onUpdatePatientRemarks(value);

              setStateHandler('value', value);
            }}
            autoResize
            className='tw-min-w-[160px] tw-max-w-full'
            onClick={(event) => event.stopPropagation()}
            isLoading={isLoading}
          />
        ) : (
          <input
            readOnly
            type='text'
            className='tw-w-full tw-px-3 tw-py-2 tw-text-sm tw-border tw-border-gray-300 tw-rounded tw-bg-white tw-cursor-pointer tw-shadow-none focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-border-blue-500'
            value={value}
            onFocus={() => setStateHandler('isViewingPatientRemarksTextArea', true)}
          />
        )}
      </OverlayTrigger>
    </div>
  );
};
