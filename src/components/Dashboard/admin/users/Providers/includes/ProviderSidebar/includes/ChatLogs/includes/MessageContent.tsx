'use client';

import { CSSProperties, Fragment } from 'react';
import { ChatLogMessage } from '@/types/users';
import { Spinner } from 'react-bootstrap';
import { AiFillFilePdf } from 'react-icons/ai';
import { AsyncImage } from 'loadable-image';
import { Blur } from 'transitions-kit';
import { useDynamicImageSize } from '@/hooks/useDynamicImageSize';
import { useSignedFileUrl } from '@/hooks/useSignedFileUrl';
import { parseLinks } from '@/lib/linkUtils';
import { AutoLink } from '@/components/elements';
import React from 'react';

interface Props {
  message: ChatLogMessage;
  highlightText: (text: string, term: string) => React.ReactNode;
  searchTerm: string;
}

export function MessageContent({ message, highlightText, searchTerm }: Readonly<Props>) {
  const fileUrl = message.metadata?.fileUrl || (message.metadata?.isAttachment ? message.content : null);
  const isImage = fileUrl?.match(/\.(jpeg|jpg|png|gif|webp)$/i);
  const isPdf = fileUrl?.match(/\.pdf$/i);

  // Helper function to apply link detection to highlighted text
  const renderContentWithLinks = (content: string): React.ReactNode => {
    if (!content) return null;
    
    // Apply link detection first, then apply highlighting to the result
    // This ensures links are preserved while still allowing search highlighting
    const linkParts = parseLinks(content);
    
    // Convert link parts to a string representation for highlighting
    // We'll process each part separately
    const processPart = (part: { type: string; content: string; url?: string }): React.ReactNode => {
      if (part.type === 'link' && part.url) {
        // For links, render as link (highlighting will be applied if search term matches)
        const highlighted = highlightText(part.content, searchTerm);
        return (
          <AutoLink href={part.url}>
            {highlighted}
          </AutoLink>
        );
      }
      // For text parts, apply highlighting
      return highlightText(part.content, searchTerm);
    };
    
    return linkParts.map((part, index) => (
      <Fragment key={index}>{processPart(part)}</Fragment>
    ));
  };

  // Use the custom hook for signed file URLs
  const { signedUrl, isLoading } = useSignedFileUrl(fileUrl || undefined, '/chat/file-url');
  const { isLoading: isImageLoading, height } = useDynamicImageSize(signedUrl, 300);

  // Max height for images - used as placeholder until actual height is calculated
  const MAX_IMAGE_HEIGHT = 300;
  // Use max height as placeholder, then actual height (capped at max) when available
  const imageHeight = isImageLoading ? MAX_IMAGE_HEIGHT : Math.min(height, MAX_IMAGE_HEIGHT);

  // If there's a file attachment
  if (fileUrl) {
    // Image handling with max height placeholder
    if (isImage) {
      if (!signedUrl) {
        return (
          <div className='tw-flex tw-flex-col tw-gap-2'>
            <div
              style={{ '--dynamic-height': `${MAX_IMAGE_HEIGHT}px` } as CSSProperties}
              className='placeholder-glow chat_image rounded'
            >
              <span className='placeholder h-100 col-12' />
            </div>
          </div>
        );
      }

      return (
        <div className='tw-flex tw-flex-col tw-gap-2'>
          <div
            className={'chat_image' + (isLoading || isImageLoading ? ' rounded overflow-hidden' : '')}
            style={{ '--dynamic-height': `${imageHeight}px` } as CSSProperties}
          >
            {isLoading || isImageLoading ? (
              <div className='placeholder-glow w-100 h-100'>
                <span className='placeholder h-100 col-12' />
              </div>
            ) : (
              <AsyncImage
                onClick={() => window.open(signedUrl, '_blank')}
                Transition={Blur}
                loader={
                  <div className='placeholder-glow w-100 h-100'>
                    <span className='placeholder h-100 col-12' />
                  </div>
                }
                src={signedUrl}
                alt='Attachment'
                style={{ '--dynamic-height': `${imageHeight}px` } as CSSProperties}
                className='chat_image cursor-pointer rounded'
              />
            )}
          </div>
          {message.content && !message.metadata?.isAttachment && (
            <div className='tw-text-sm'>{renderContentWithLinks(message.content)}</div>
          )}
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className='tw-flex tw-items-center tw-gap-2 tw-text-gray-500'>
          <Spinner size='sm' />
          <span>Loading attachment...</span>
        </div>
      );
    }

    if (isPdf && signedUrl) {
      return (
        <div className='tw-flex tw-flex-col tw-gap-2'>
          <a
            href={signedUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='tw-flex tw-items-center tw-gap-2 tw-text-blue-600 hover:tw-text-blue-800'
          >
            <AiFillFilePdf size={24} className='tw-text-red-500' />
            <span>View PDF</span>
          </a>
          {message.content && !message.metadata?.isAttachment && (
            <div className='tw-text-sm'>{renderContentWithLinks(message.content)}</div>
          )}
        </div>
      );
    }

    // Non-image/pdf file
    if (signedUrl) {
      return (
        <div className='tw-flex tw-flex-col tw-gap-2'>
          <a
            href={signedUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='tw-text-blue-600 hover:tw-text-blue-800 tw-underline'
          >
            View Attachment
          </a>
          {message.content && !message.metadata?.isAttachment && (
            <div className='tw-text-sm'>{renderContentWithLinks(message.content)}</div>
          )}
        </div>
      );
    }
  }

  // Regular text message
  return <div className='tw-text-sm'>{renderContentWithLinks(message.content || '')}</div>;
}
