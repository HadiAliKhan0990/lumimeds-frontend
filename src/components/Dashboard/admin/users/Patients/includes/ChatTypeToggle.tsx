'use client';

import { ChatType } from './PatientChatSidebar';

interface ChatTypeToggleProps {
  chatType: ChatType;
  onChatTypeChange?: (type: ChatType) => void;
}

export function ChatTypeToggle({ chatType, onChatTypeChange }: ChatTypeToggleProps) {
  return (
    <div className='tw-flex tw-rounded-lg tw-border tw-border-gray-200 tw-bg-gray-100 tw-p-1 tw-mt-2 sm:tw-mt-0 lg:tw-mt-2 xl:tw-mt-0'>
      <button
        type='button'
        onClick={() => onChatTypeChange?.('admin')}
        className={`tw-py-1.5 tw-px-4 tw-text-sm tw-font-medium tw-rounded-md tw-transition-all tw-border-0 ${
          chatType === 'admin'
            ? 'tw-bg-primary tw-text-white tw-font-medium'
            : 'tw-bg-transparent tw-text-gray-600 hover:tw-text-gray-900'
        }`}
      >
        Admin Chat
      </button>
      <button
        type='button'
        onClick={() => onChatTypeChange?.('patient')}
        className={`tw-py-1.5 tw-px-4 tw-text-sm tw-font-medium tw-rounded-md tw-transition-all tw-border-0 ${
          chatType === 'patient'
            ? 'tw-bg-primary tw-text-white tw-font-medium'
            : 'tw-bg-transparent tw-text-gray-600 hover:tw-text-gray-900'
        }`}
      >
        Patient Chat
      </button>
    </div>
  );
}

