'use client';

import { Modal } from '@/components/elements';
import { useState } from 'react';
import { Order } from '@/store/slices/orderSlice';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onSubmit: (message: string, orderId: string) => Promise<void>;
}

export const ContactAdminModal = ({ isOpen, onClose, order, onSubmit }: Readonly<Props>) => {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    if (!order?.id) {
      toast.error('Order information is missing');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(message.trim(), order.id);
      setMessage('');
      toast.success('Message sent successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
      console.error('Error sending message:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setMessage('');
      onClose();
    }
  };

  const footer = (
    <div className='tw-flex tw-justify-end tw-gap-3'>
      <button
        type='button'
        onClick={handleClose}
        disabled={isSubmitting}
        className='tw-px-4 tw-py-2 tw-text-gray-700 tw-bg-white tw-border tw-border-gray-300 tw-rounded-md hover:tw-bg-gray-50 tw-transition-colors disabled:tw-opacity-50 disabled:tw-cursor-not-allowed'
      >
        Cancel
      </button>
      <button
        type='submit'
        form='contact-admin-form'
        disabled={isSubmitting || !message.trim()}
        className='tw-px-4 tw-py-2 tw-bg-blue-600 tw-text-white tw-rounded-md hover:tw-bg-blue-700 tw-transition-colors disabled:tw-opacity-50 disabled:tw-cursor-not-allowed'
      >
        {isSubmitting ? 'Sending...' : 'Send Message'}
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title='Contact Admin'
      size='md'
      footer={footer}
      isLoading={isSubmitting}
      loadingText='Sending your message...'
    >
      <form id='contact-admin-form' onSubmit={handleSubmit} className='tw-space-y-4'>
        <div>
          <label htmlFor='order-info' className='tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2'>
            Order Information
          </label>
          <div id='order-info' className='tw-p-3 tw-bg-gray-50 tw-rounded-md tw-text-sm tw-text-gray-600'>
            <div className='tw-mb-1'>
              <span className='tw-font-medium'>Order ID:</span> {order?.orderUniqueId || order?.id || 'N/A'}
            </div>
            {order?.requestedProductName && (
              <div>
                <span className='tw-font-medium'>Product:</span> {order.requestedProductName}
              </div>
            )}
          </div>
        </div>

        <div>
          <label htmlFor='message' className='tw-block tw-text-sm tw-font-medium tw-text-gray-700 tw-mb-2'>
            Message <span className='tw-text-red-500'>*</span>
          </label>
          <textarea
            id='message'
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder='Please describe your concern or question...'
            rows={6}
            className='tw-w-full tw-px-3 tw-py-2 tw-border tw-border-gray-300 tw-rounded-md tw-resize-none focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-blue-500 focus:tw-border-transparent'
            disabled={isSubmitting}
            required
          />
          <p className='tw-mt-1 tw-text-xs tw-text-gray-500'>{message.length} characters</p>
        </div>
      </form>
    </Modal>
  );
};
