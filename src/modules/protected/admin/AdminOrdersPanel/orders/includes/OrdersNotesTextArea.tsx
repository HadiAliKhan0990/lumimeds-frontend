'use client';

import { TextArea, TextAreaProps } from '@/components/elements/Inputs/TextArea';
import { Order } from '@/store/slices/orderSlice';
import { useEffect, useRef, useState } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

export interface OrdersNotesTextAreaProps extends TextAreaProps {
  order: Order;
}

export const OrdersNotesTextArea = ({ order, ...props }: OrdersNotesTextAreaProps) => {
  const [state, setState] = useState({
    isViewingNotesTextArea: false,
    value: '',
    isHovering: false,
  });

  const { isViewingNotesTextArea, value, isHovering } = state;

  const setStateHandler = (key: keyof typeof state, value: (typeof state)[keyof typeof state]) => {
    setState((prev) => ({ ...prev, [key]: value }));
  };

  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setStateHandler('value', order?.rejectionReason ?? '');
  }, [order.rejectionReason]);

  useEffect(() => {
    if (isViewingNotesTextArea && textAreaRef.current) {
      textAreaRef.current.focus();
    }
  }, [isViewingNotesTextArea]);

  const isEmpty = value?.trim() === '';

  const shouldShowTooltip = isEmpty ? false : isHovering ? true : false;

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
        overlay={<Tooltip id='notes-tooltip'>{value?.trim() || 'N/A'}</Tooltip>}
      >
        {isViewingNotesTextArea ? (
          <TextArea
            ref={textAreaRef}
            {...props}
            rows={5}
            value={value}
            readOnly
            onBlur={() => {
              setStateHandler('isViewingNotesTextArea', false);
            }}
            autoResize
            className='tw-min-w-[160px] tw-max-w-full'
            onClick={(event) => event.stopPropagation()}
          />
        ) : (
          <input
            readOnly
            type='text'
            className='form-control rounded-1 shadow-none'
            value={value}
            onFocus={() => setStateHandler('isViewingNotesTextArea', true)}
          />
        )}
      </OverlayTrigger>
    </div>
  );
};
