'use client';

import MessageCard from './MessageCard';
import { Card, Button } from 'react-bootstrap';
import { MessageSectionType } from '@/types/messages';

interface MessageSectionProps {
  section: MessageSectionType;
  onReply: (id: string) => void;
  onViewAll: (sectionTitle: string) => void;
}

export default function MessageSection ({ section, onReply, onViewAll }:Readonly<MessageSectionProps>)  {
  return (
    <Card className='border border-primary-light rounded-12 h-100 overflow-y-auto'>
      <Card.Body className='p-3 pb-1 d-flex flex-column gap-3 ' style={{ minHeight: '12rem' }}>
        {/* Header */}
        <div className='d-flex justify-content-between align-items-center'>
          <div className='d-flex flex-wrap align-items-center gap-2'>
            <h6 className='fw-medium text-dark mb-0 fs-5 DM-Sans '>{section.title}</h6>
            <div className='d-flex align-items-center gap-2'>
              <div
                className='rounded-circle bg-notification-orange'
                style={{
                  width: '8px',
                  height: '8px',
                  boxShadow: '0 0 0 0.125rem rgba(255, 107, 53, 0.3)',
                }}
              />
              <span className='fw-bold small text-notification-orange'>{section.messageCount} New</span>
            </div>
          </div>
        </div>

        {/* Messages List */}
        <div className='mb-2 flex-grow-1 overflow-y-auto'>
          {section.messages.map((message, index) => (
            <MessageCard
              key={message.id}
              message={message}
              onReply={onReply}
              isLast={index === section.messages.length - 1}
            />
          ))}
        </div>

        {/* Footer */}
        <div className='d-flex justify-content-end mt-auto'>
          <Button
            variant='link'
            className='text-primary border-0 text-decoration-underline fw-bold'
            style={{ fontSize: '13px' }}
            onClick={() => onViewAll(section.title)}
          >
            View All Messages
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};