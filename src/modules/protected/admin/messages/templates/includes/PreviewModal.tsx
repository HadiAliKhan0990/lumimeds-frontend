'use client';

import parse from 'html-react-parser';
import { MessageTemplateType } from '@/store/slices/messageTemplatesApiSlice';
import { Modal } from '@/components/elements';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: MessageTemplateType | null;
  onEdit?: () => void;
}

export function PreviewModal({ isOpen, onClose, template, onEdit }: Readonly<PreviewModalProps>) {
  // Example values for preview
  const exampleValues: Record<string, string> = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    trustPilotReviewLink: 'https://www.trustpilot.com/evaluate-link/UNIQUE_ID',
  };

  // Replace variables with example values
  const renderContent = (content: string) => {
    let renderedContent = content;

    // Replace all {{variableName}} with example values
    for (const [key, value] of Object.entries(exampleValues)) {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      renderedContent = renderedContent.replace(regex, `<strong>${value}</strong>`);
    }

    return renderedContent;
  };

  const footer = (
    <div className='tw-flex tw-gap-2 tw-justify-end tw-w-full'>
      <button
        type='button'
        onClick={onClose}
        className='tw-px-6 tw-py-2 tw-border tw-border-solid tw-border-gray-300 tw-rounded-lg hover:tw-bg-gray-100 tw-transition-all'
      >
        Close
      </button>
      {onEdit && (
        <button
          type='button'
          onClick={onEdit}
          className='tw-px-6 tw-py-2 tw-bg-primary tw-text-white tw-rounded-lg hover:tw-bg-primary/90 tw-transition-all'
        >
          Edit Template
        </button>
      )}
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title='Preview Template'
      size='lg'
      footer={footer}
      bodyClassName='!tw-py-0'
    >
      <div className='mb-3'>
        <h5 className='fw-semibold mb-2'>{template?.name}</h5>
      </div>

      <p className='fw-semibold mb-2'>Preview with Example Values:</p>
      <div className='border rounded p-3 bg-light tw-border-l-4'>
        <div className='tw-leading-relaxed !tw-text-sm [&_ul]:tw-list-disc [&_ol]:tw-list-decimal [&_ul]:tw-pl-4 [&_ol]:tw-pl-4'>
          {parse(renderContent(template?.content || ''))}
        </div>
      </div>
    </Modal>
  );
}
