'use client';

import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import dynamic from 'next/dynamic';
import AsyncImgLoader from '@/components/AsyncImgLoader';
import parse, { DOMNode } from 'html-react-parser';
import { useCallback, useEffect, useState, useRef, useMemo, CSSProperties, Fragment } from 'react';
import { Blur } from 'transitions-kit';
import { AsyncImage } from 'loadable-image';
import { client } from '@/lib/baseQuery';
import { AiFillFilePdf } from 'react-icons/ai';
import { extractFileNameFromUrl } from '@/lib/helper';
import { ChatMessages } from '@/store/slices/chatSlice';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { formatProviderName } from '@/lib/utils/providerName';
import { useDynamicImageSize } from '@/hooks/useDynamicImageSize';
import { usePathname } from 'next/navigation';
import { parseMentions, renderMentions } from '@/lib/mentionUtils';
import { parseLinks, renderLinks, parseAndRenderLinks } from '@/lib/linkUtils';
import { formatUSDateTime, formatRelativeDateWithTime } from '@/helpers/dateFormatter';

const PDFPreviewModal = dynamic(
  () => import('@/components/Dashboard/PDFPreviewModal').then((mod) => mod.PDFPreviewModal),
  {
    ssr: false,
  }
);

interface Props {
  message: ChatMessages;
  isPopup?: boolean;
  onPatientClick?: (patientId: string, patientName?: string, patientEmail?: string) => void;
  otherUserName?: string; // Override for the other user's display name (used in admin chat)
}

const urlCache = new Map<string, { url: string; expiresAt: number }>();

export function MessageItem({ message, isPopup, onPatientClick, otherUserName }: Readonly<Props>) {
  const mountedRef = useRef(true);
  const timeoutRef = useRef<NodeJS.Timeout>(null);
  const fetchPromiseRef = useRef<Promise<void> | null>(null);
  const pathname = usePathname();

  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);
  const [pdfOpen, setPdfOpen] = useState(false);

  const { isLoading: isImageLoading, height } = useDynamicImageSize(url, 200);

  const user = useSelector((state: RootState) => state.user);
  const patient = useSelector((state: RootState) => state.patient);
  const selectedConversation = useSelector((state: RootState) => state.chat.selectedConversation);
  const selectedRole = useSelector((state: RootState) => state.chat.selectedRole);

  const isReceiver = useMemo(() => {
    // Admin messages always go on the right side
    if (pathname.includes('/admin') && (message?.metadata?.adminName || message?.metadata?.actualAdminId)) {
      return true;
    }

    // For non-admin messages, check if the current logged-in user sent this message
    return user.user?.id === message.sender?.id || user.user?.id === message.senderId;
  }, [message, user, pathname]);

  const senderName = useMemo(() => {
    if (isReceiver) {
      // If it's an admin message, show admin name from metadata
      if (message.metadata?.adminName) {
        return message.metadata.adminName;
      }
      // Otherwise show current user's name
      return pathname.includes('/provider')
        ? formatProviderName(user.firstName, user.lastName)
        : `${user.firstName} ${user.lastName}`;
    } else if (message.metadata?.adminName) {
      // Show other person's name
      return message.metadata.adminName;
    }
    // For providers or other users, get name from selectedConversation
    else if (selectedConversation?.otherUser?.firstName || selectedConversation?.otherUser?.lastName) {
      const firstName = selectedConversation.otherUser.firstName || '';
      const lastName = selectedConversation.otherUser.lastName || '';

      return pathname.includes('/admin')
        ? message?.metadata?.adminName || formatProviderName(firstName, lastName)
        : `${firstName} ${lastName}`.trim();
    } else {
      return 'Unknown User';
    }
  }, [pathname, user, message, selectedConversation, isReceiver]);

  const fetchFileUrl = useCallback(
    async (force = false) => {
      const fileKey = message.metadata?.fileUrl;
      if (!fileKey) return;

      if (!force) {
        const cached = urlCache.get(fileKey);
        if (cached && Date.now() < cached.expiresAt) {
          setUrl(cached.url);
          return;
        }
      }

      // If already fetching, return the existing promise so callers can await it
      if (fetchPromiseRef.current) {
        return fetchPromiseRef.current;
      }

      setIsLoading(true);

      const fetchPromise = (async () => {
        try {
          const { data } = await client.get(`/chat/file-url?key=${fileKey}`);
          if (!mountedRef.current) return;

          if (data.data?.url) {
            const newUrl = data.data.url;
            const expiresAt = Date.now() + 5 * 60 * 1000;
            urlCache.set(fileKey, { url: newUrl, expiresAt });
            setUrl(newUrl);

            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => {
              if (mountedRef.current) {
                fetchPromiseRef.current = null;
                fetchFileUrl(true);
              }
            }, 4.5 * 60 * 1000);
          }
        } catch (error) {
          console.error('Error fetching file URL:', error);
        } finally {
          if (mountedRef.current) setIsLoading(false);
          fetchPromiseRef.current = null;
        }
      })();

      fetchPromiseRef.current = fetchPromise;
      return fetchPromise;
    },
    [message.metadata?.fileUrl]
  );

  const handleFileError = useCallback(() => {
    if (url) {
      const fileKey = message.metadata?.fileUrl;
      if (fileKey) {
        urlCache.delete(fileKey);
        fetchFileUrl(true);
      }
    }
  }, [url, message.metadata?.fileUrl, fetchFileUrl]);

  const isImage = message.metadata?.fileUrl?.match(/\.(jpeg|jpg|png|gif|webp)$/i);

  const getPatientDisplayName = useCallback(() => {
    // Use provided otherUserName if available (for admin chat)
    if (otherUserName) {
      return otherUserName;
    }

    if (isPopup) {
      // Try message.patient first (most reliable)
      if (message.patient?.firstName || message.patient?.lastName) {
        return `${message.patient.firstName || ''} ${message.patient.lastName || ''}`.trim();
      }
      // Fallback to Redux patient state
      if (patient?.firstName || patient?.lastName) {
        return `${patient.firstName || ''} ${patient.lastName || ''}`.trim();
      }
      // Fallback to selectedConversation
      if (selectedConversation?.otherUser?.firstName || selectedConversation?.otherUser?.lastName) {
        return `${selectedConversation.otherUser.firstName || ''} ${
          selectedConversation.otherUser.lastName || ''
        }`.trim();
      }
      return 'Patient';
    }

    // For non-popup, try message.patient first, then selectedConversation
    if (message.patient?.firstName || message.patient?.lastName) {
      return `${message.patient.firstName || ''} ${message.patient.lastName || ''}`.trim();
    }

    return (
      `${selectedConversation?.otherUser?.firstName || ''} ${selectedConversation?.otherUser?.lastName || ''}`.trim() ||
      'Patient'
    );
  }, [otherUserName, isPopup, message.patient, patient, selectedConversation?.otherUser]);

  const checkExpirationAndOpen = useCallback(
    async (type: 'pdf' | 'image') => {
      const fileKey = message.metadata?.fileUrl;
      if (!fileKey) return;

      const cached = urlCache.get(fileKey);
      if (!cached || Date.now() >= cached.expiresAt) {
        try {
          await fetchFileUrl(true);
          const updatedCache = urlCache.get(fileKey);
          if (updatedCache?.url)
            if (type === 'image') {
              setImageOpen(true);
            } else {
              setPdfOpen(true);
            }
        } catch (error) {
          console.error('Failed to refresh URL:', error);
        }
      } else {
        if (type === 'image') {
          setImageOpen(true);
        } else {
          setPdfOpen(true);
        }
      }
    },
    [message.metadata?.fileUrl, fetchFileUrl]
  );

  const renderFileContent = () => {
    if (!message.metadata?.fileUrl) {
      if (!message.content || message.content.trim() === '') {
        return <span className='fw-medium'>Sent an attachment 📎</span>;
      }

      // Parse mentions if we have patients data and the message contains @
      // Enable for Provider tab in admin portal OR Admin tab in provider portal (but not Patient tabs)
      const isProviderRole = selectedRole === 'provider';
      const isAdminRole = selectedRole === 'admin';
      const isProviderPortal = pathname.includes('/provider');
      const isAdminPortal = pathname.includes('/admin');

      // Enable for Provider tab in admin portal OR Admin tab in provider portal (but not Patient tabs)
      const shouldShowMentions = (isProviderRole && isAdminPortal) || (isAdminRole && isProviderPortal);

      // Check if content contains HTML tags
      const isHtmlContent = message.content?.includes('<') && message.content?.includes('>');
      const hasMentions = message.content?.includes('{') && message.content?.includes('}');

      if (shouldShowMentions && hasMentions) {
        if (isHtmlContent) {
          // HTML content with mentions - need to preserve HTML formatting while rendering mentions
          // Strategy: Replace mentions with placeholders, parse HTML, then replace placeholders with mention components
          const mentionPlaceholders: Map<string, { patientId: string; patientName: string }> = new Map();
          let placeholderCounter = 0;

          // Extract mentions and replace with placeholders
          let processedContent = message.content;
          const mentionRegex = /\{([^}]+)\}\{([^}]+)\}/g;
          let match;

          while ((match = mentionRegex.exec(message.content)) !== null) {
            const [fullMatch, patientId, patientName] = match;
            const placeholder = `__MENTION_PLACEHOLDER_${placeholderCounter++}__`;
            mentionPlaceholders.set(placeholder, { patientId, patientName });
            processedContent = processedContent.replace(fullMatch, placeholder);
          }

          // Replace placeholders with mention components using html-react-parser's replace option
          // Also apply link detection to text nodes
          const replaceOptions = {
            replace: (domNode: DOMNode) => {
              if (domNode.type === 'text' && domNode.data) {
                const text = domNode.data;
                if (text.includes('__MENTION_PLACEHOLDER_')) {
                  const parts = text.split(/(__MENTION_PLACEHOLDER_\d+__)/g);
                  return (
                    <>
                      {parts.map((part: string, idx: number) => {
                        if (part.startsWith('__MENTION_PLACEHOLDER_') && part.endsWith('__')) {
                          const mentionData = mentionPlaceholders.get(part);
                          if (mentionData) {
                            return (
                              <button
                                type='button'
                                key={`mention-${mentionData.patientId}-${idx}`}
                                className='tw-text-primary tw-font-medium tw-p-0'
                                onClick={() =>
                                  onPatientClick?.(mentionData.patientId, mentionData.patientName, undefined)
                                }
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    onPatientClick?.(mentionData.patientId, mentionData.patientName, undefined);
                                  }
                                }}
                              >
                                @{mentionData.patientName}
                              </button>
                            );
                          }
                        }
                        // Apply link detection to text segments
                        const linkParts = parseLinks(part);
                        return <Fragment key={`text-${idx}`}>{renderLinks(linkParts)}</Fragment>;
                      })}
                    </>
                  );
                } else {
                  // Apply link detection to plain text nodes
                  const linkParts = parseLinks(text);
                  return <Fragment>{renderLinks(linkParts)}</Fragment>;
                }
              }
            },
          };

          return <div>{parse(processedContent, replaceOptions)}</div>;
        } else {
          // Plain text with mentions - render mentions and apply link detection to text segments
          const parsedContent = parseMentions(message.content);
          return (
            <div>
              {parsedContent.map((part, index) => {
                if (part.type === 'mention' && part.patientId) {
                  // Render mention using renderMentions utility (returns array, get first element)
                  const renderedMention = renderMentions([part], undefined, onPatientClick);
                  return <Fragment key={index}>{renderedMention[0]}</Fragment>;
                }
                // Apply link detection to text segments
                const linkParts = parseLinks(part.content);
                return <Fragment key={index}>{renderLinks(linkParts)}</Fragment>;
              })}
            </div>
          );
        }
      }

      // For HTML content without mentions, parse HTML and apply link detection to text nodes
      if (isHtmlContent) {
        const replaceOptions = {
          replace: (domNode: DOMNode) => {
            if (domNode.type === 'text' && domNode.data) {
              const linkParts = parseLinks(domNode.data);
              return <Fragment>{renderLinks(linkParts)}</Fragment>;
            }
          },
        };
        return <div>{parse(message.content, replaceOptions)}</div>;
      }

      // Plain text without HTML or mentions - apply link detection directly
      return <div>{parseAndRenderLinks(message.content)}</div>;
    }

    if (isImage) {
      if (!url)
        return (
          <div className='d-flex flex-column gap-2'>
            <span className='fw-medium'>Sent an attachment 📎</span>
            <div
              style={{ '--dynamic-height': `${height || 200}px` } as CSSProperties}
              className='placeholder-glow chat_image rounded'
            >
              <span className='placeholder h-100 col-12' />
            </div>
          </div>
        );

      return (
        <>
          <Lightbox
            plugins={[Zoom]}
            render={{ iconPrev: () => null, iconNext: () => null }}
            open={imageOpen}
            zoom={{
              maxZoomPixelRatio: 3,
              zoomInMultiplier: 2,
              doubleTapDelay: 300,
              doubleClickDelay: 300,
              doubleClickMaxStops: 2,
              keyboardMoveDistance: 50,
              wheelZoomDistanceFactor: 100,
              pinchZoomDistanceFactor: 100,
              scrollToZoom: true,
            }}
            close={() => setImageOpen(false)}
            slides={[{ src: url }]}
            controller={{ closeOnPullDown: false, closeOnBackdropClick: true }}
          />
          <div
            style={{ '--dynamic-height': `${height || 200}px` } as CSSProperties}
            className={'chat_image' + (isLoading ? ' rounded overflow-hidden' : '')}
          >
            {isLoading || isImageLoading ? (
              <div className='placeholder-glow w-100 h-100'>
                <span className='placeholder h-100 col-12' />
              </div>
            ) : (
              <AsyncImage
                onClick={() => checkExpirationAndOpen('image')}
                onError={handleFileError}
                Transition={Blur}
                loader={<AsyncImgLoader />}
                src={url}
                alt='Uploaded file'
                style={{ '--dynamic-height': `${height || 200}px` } as CSSProperties}
                className='chat_image cursor-pointer rounded'
              />
            )}
          </div>
        </>
      );
    }
    if (!url)
      return (
        <div className='d-flex flex-column gap-2'>
          <span className='fw-medium'>Sent an attachment 📎</span>
          <div className='placeholder-glow w-150px'>
            <span className='placeholder col-12 py-12' />
          </div>
        </div>
      );
    return (
      <>
        <button
          onClick={() => checkExpirationAndOpen('pdf')}
          className={
            'btn btn-link d-flex align-items-center gap-2 text-sm btn-no-style ' +
            (isReceiver ? 'tw-text-primary' : 'text-dark')
          }
        >
          <AiFillFilePdf size={20} color='red' />
          {extractFileNameFromUrl(url) || 'View Uploaded PDF'}
        </button>

        <PDFPreviewModal open={pdfOpen} setOpen={setPdfOpen} url={url} />
      </>
    );
  };

  useEffect(() => {
    mountedRef.current = true;
    if (message.metadata?.fileUrl && !url) fetchFileUrl();
    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [message.metadata?.fileUrl, url, fetchFileUrl]);

  return (
    <div className={'d-flex rich-content ' + (isReceiver ? '' : 'flex-row-reverse')}>
      <div className='flex-grow-1' />
      <div className={'d-flex flex-column ' + (isReceiver ? 'align-items-end' : 'align-items-start')}>
        <div
          className={
            'p-12 mb-1 text-sm d-flex flex-column message-width ' +
            (isReceiver
              ? 'sender_message tw-bg-light-blue tw-text-charcoal-gray'
              : 'receiver_message bg-pale-gray text-dark align-items-start')
          }
        >
          {isReceiver ? (
            <span className='text-capitalize align-self-end fw-semibold mb-1'>{senderName}</span>
          ) : (
            <span className='text-capitalize text-grey mb-1'>{getPatientDisplayName()}</span>
          )}
          {renderFileContent()}
        </div>
        <div title={formatUSDateTime(message.createdAt)} className='text-xs text-muted-gray-blue'>
          {formatRelativeDateWithTime(message.createdAt)}
        </div>
      </div>
    </div>
  );
}
