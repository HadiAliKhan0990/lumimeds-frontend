'use client';

import React, { Fragment } from 'react';
// import { Button } from 'react-bootstrap';
import { MessageType } from '../../../types/messages';
import { parseMentions } from '@/lib/mentionUtils';
import { parseLinks, renderLinks, parseAndRenderLinks } from '@/lib/linkUtils';

interface MessageCardProps {
  message: MessageType;
  onReply: (id: string) => void;
  isLast?: boolean;
}

const MessageCard: React.FC<MessageCardProps> = ({ message }) => {
  // Get first character of first name for avatar fallback
  const getFirstInitial = (name: string) => {
    return name.split(' ')[0].charAt(0).toUpperCase();
  };

  return (
    <div className='d-flex justify-content-between align-items-start py-12 border-bottom border-gray-light'>
      <div className='d-flex gap-2 gap-lg-3 flex-grow-1'>
        <div className='flex-shrink-0'>
          <div
            className='d-flex align-items-center justify-content-center rounded-circle text-white fw-bold bg-secondary text-medium'
            style={{
              width: '35px',
              height: '35px',
            }}
          >
            {getFirstInitial(message.senderName)}
          </div>
        </div>

        {/* Message Content */}
        <div className='flex-grow-1 min-w-0'>
          <div className='fw-medium text-dark-black small mb-1'>{message.senderName}</div>
          <div
            className='text-xs text-neutral-medium'
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: '1.4',
              maxHeight: '2.8em', // 2 lines * 1.4 line-height
            }}
          >
            {message.content?.includes('{') ? (
              // Content with mentions - apply link detection to text segments
              parseMentions(message.content).map((part, index) => {
                if (part.type === 'mention' && part.patientId) {
                  return (
                    <span
                      key={index}
                      className='text-primary text-decoration-none fw-medium tw-cursor-pointer text-xs text-neutral-medium'
                    >
                      @{part.patientName}
                    </span>
                  );
                }
                // Apply link detection to text segments
                const linkParts = parseLinks(part.content);
                return <Fragment key={index}>{renderLinks(linkParts)}</Fragment>;
              })
            ) : (
              // Plain text - apply link detection directly
              parseAndRenderLinks(message.content || '')
            )}
          </div>
        </div>
      </div>

      {/* Timestamp and Reply */}
      <div className='flex-shrink-0 text-end ms-2'>
        <div className='small fw-medium text-light-gray'>{message.timestamp}</div>
        {/* <Button
          variant='link'
          className='text-primary p-0 text-decoration-none border-0 fw-medium'
          style={{ fontSize: '13px' }}
          onClick={() => onReply(message.id)}
        >
          Reply
        </Button> */}
      </div>
    </div>
  );
};

export default MessageCard;
