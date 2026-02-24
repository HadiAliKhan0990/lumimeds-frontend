'use client';

import { TextArea, TextAreaProps } from '@/components/elements/Inputs/TextArea';
import { useDebounceHandler } from '@/hooks/useDebounceHandler';
import { useUpdateOrderRemarksMutation } from '@/store/slices/ordersApiSlice';
import { Order } from '@/store/slices/orderSlice';
import React, { useEffect, useRef, useState } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { toast } from 'react-hot-toast';

export interface OrdersRemarksTextAreaProps extends TextAreaProps {
  order: Order;
  onUpdateRemarks: (remarks: string) => void;
}

export const OrdersRemarksTextArea = ({ order, onUpdateRemarks, ...props }: OrdersRemarksTextAreaProps) => {
  const [state, setState] = useState({
    isViewingRemarksTextArea: false,
    value: '',
    isTyping: false,
    isHovering: false,
  });

  const { isViewingRemarksTextArea, value, isTyping, isHovering } = state;

  const setStateHandler = (key: keyof typeof state, value: (typeof state)[keyof typeof state]) => {
    setState((prev) => ({ ...prev, [key]: value }));
  };

  // Create ref for TextArea
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const { debouncedHandler } = useDebounceHandler();

  const [updateOrderRemarks, { isLoading }] = useUpdateOrderRemarksMutation();

  const handleUpdateOrderRemarks = (remarks: string) => {
    updateOrderRemarks({ orderId: order.id ?? '', remarks: remarks.trim() })
      .unwrap()
      .catch((error) => {
        if (error?.data?.message) toast.error(error?.data?.message);
        setStateHandler('value', order?.reason ?? '');
      });
  };

  useEffect(() => {
    setStateHandler('value', order?.reason ?? '');
  }, [order.reason]);

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setStateHandler('isTyping', true);
    setStateHandler('value', e.target.value);

    const callBack = () => {
      handleUpdateOrderRemarks(e.target.value);

      setStateHandler('isTyping', false);
    };

    debouncedHandler(1000, callBack);
  };

  useEffect(() => {
    setStateHandler('value', order?.reason ?? '');
  }, [order.reason]);

  // Example: Auto-focus when textarea becomes visible
  useEffect(() => {
    if (isViewingRemarksTextArea && textAreaRef.current) {
      textAreaRef.current.focus();
    }
  }, [isViewingRemarksTextArea]);

  const isEmpty = value?.trim() === '';

  const shouldShowTooltip = isTyping || isEmpty ? false : isHovering ? true : false;

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
        overlay={<Tooltip id='remarks-tooltip'>{value?.trim() || 'N/A'}</Tooltip>}
      >
        {isViewingRemarksTextArea ? (
          <TextArea
            ref={textAreaRef}
            {...props}
            rows={5}
            value={value}
            onChange={onChange}
            onBlur={({ target: { value } }) => {
              setStateHandler('isViewingRemarksTextArea', false);

              onUpdateRemarks(value);

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
            className='form-control rounded-1 shadow-none'
            value={value}
            onFocus={() => setStateHandler('isViewingRemarksTextArea', true)}
          />
        )}
      </OverlayTrigger>
    </div>
  );
};
