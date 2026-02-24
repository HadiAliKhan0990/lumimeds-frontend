'use client';

import { OrderNotesContent } from '@/modules/protected/admin/AdminOrdersPanel/orders/includes/OrderNotesContent';

type Props = {
  defaultActiveTab?: 'notes';
  onTabChange?: (tab: 'notes') => void;
};

export default function OrderChatSidebar({}: Readonly<Props>) {
  return (
    <div className='patient_sidebar position-relative flex-column h-100 d-flex'>
      <div className='tab_container position-relative border p-1 rounded-2 border-c-light d-flex align-items-center mb-3'>
        <button className='tab_button fw-medium position-relative text-capitalize p-0 bg-transparent flex-grow-1'>
          notes
        </button>
      </div>

      <OrderNotesContent />
    </div>
  );
}
