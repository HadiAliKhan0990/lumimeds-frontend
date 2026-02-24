'use client';

import { Attachment, useGetPatientAttachmentsQuery } from '@/store/slices/attachmentsApiSlice';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useState, useMemo } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import 'yet-another-react-lightbox/styles.css';
import { PatientSurvey } from '@/lib/types';
import { useSignedFileUrl } from '@/hooks/useSignedFileUrl';
import { AsyncImage } from 'loadable-image';
import { Blur } from 'transitions-kit';
import AsyncImgLoader from '@/components/AsyncImgLoader';
import { client } from '@/lib/baseQuery';
import toast from 'react-hot-toast';
import { isS3Url, extractS3Key } from '@/lib/helper';

const PDFPreviewModal = dynamic(
  () => import('@/components/Dashboard/PDFPreviewModal').then((mod) => mod.PDFPreviewModal),
  {
    ssr: false,
  }
);

interface AttachmentsListProps {
  patientId: string;
  surveys?: PatientSurvey[];
}

interface DisplayAttachment extends Attachment {
  isSurveyAttachment?: boolean;
  needsSignedUrl?: boolean; // Flag for regular attachments that are S3 URLs
}

// Component to render regular attachment images with fallback to signed URLs
const RegularAttachmentImage = ({ attachment, onClick }: { attachment: DisplayAttachment; onClick: () => void }) => {
  const [imageError, setImageError] = useState(false);
  // Only fetch signed URL if image failed to load (fallback mechanism)
  const { signedUrl, isLoading } = useSignedFileUrl(
    imageError ? attachment.attachmentURL : undefined,
    '/chat/file-url'
  );

  // Show loading state while fetching signed URL after error
  if (imageError && isLoading) {
    return (
      <div
        className='tw-rounded tw-flex tw-items-center tw-justify-center tw-w-12 tw-h-12 tw-bg-gray-500'
        style={{ minWidth: '48px', minHeight: '48px' }}
      >
        <div className='spinner-border spinner-border-sm text-primary' role='status'>
          <span className='visually-hidden'>Loading...</span>
        </div>
      </div>
    );
  }

  // If image failed to load, use signed URL
  if (imageError && signedUrl) {
    return (
      <AsyncImage
        src={signedUrl}
        alt={attachment.fileName || 'Attachment'}
        className='tw-rounded tw-w-12 tw-h-12 tw-object-cover'
        Transition={Blur}
        loader={<AsyncImgLoader />}
        onClick={onClick}
        style={{ width: '48px', height: '48px', cursor: 'pointer' }}
      />
    );
  }

  return (
    <Image
      src={attachment.attachmentURL}
      alt={attachment.fileName || 'Attachment'}
      className='tw-rounded tw-w-12 tw-h-12 tw-object-cover'
      width={48}
      height={48}
      unoptimized
      onClick={onClick}
      onError={() => setImageError(true)}
    />
  );
};

// Component to render attachment images with signed URLs (for S3 URLs)
const AttachmentImageWithSignedUrl = ({
  attachment,
  onClick,
  endpoint = '/surveys/file-url',
}: {
  attachment: DisplayAttachment;
  onClick: () => void;
  endpoint?: string;
}) => {
  const { signedUrl, isLoading } = useSignedFileUrl(attachment.attachmentURL, endpoint);

  if (isLoading) {
    return (
      <div
        className='tw-rounded tw-flex tw-items-center tw-justify-center tw-w-12 tw-h-12 tw-bg-gray-500'
        style={{ minWidth: '48px', minHeight: '48px' }}
      >
        <div className='spinner-border spinner-border-sm text-primary' role='status'>
          <span className='visually-hidden'>Loading...</span>
        </div>
      </div>
    );
  }

  if (!signedUrl) {
    return (
      <div
        className='tw-rounded tw-flex tw-items-center tw-justify-center tw-w-12 tw-h-12 tw-bg-gray-500'
        style={{ minWidth: '48px', minHeight: '48px' }}
        title={`Unable to load: ${attachment.fileName || 'Attachment'}`}
      >
        <span className='tw-text-white tw-text-xs'>ERROR</span>
      </div>
    );
  }

  return (
    <AsyncImage
      src={signedUrl}
      alt={attachment.fileName || 'Attachment'}
      className='tw-rounded tw-w-12 tw-h-12 tw-object-cover'
      Transition={Blur}
      loader={<AsyncImgLoader />}
      onClick={onClick}
      style={{ width: '48px', height: '48px', cursor: 'pointer' }}
    />
  );
};

// Helper function to extract file uploads from survey responses
const extractFileUploadsFromSurveys = (
  surveys: PatientSurvey[] | undefined,
  patientId: string
): DisplayAttachment[] => {
  if (!surveys || surveys.length === 0) {
    return [];
  }

  const fileUploads: DisplayAttachment[] = [];

  surveys.forEach((survey) => {
    if (survey.responses && Array.isArray(survey.responses)) {
      survey.responses.forEach((response) => {
        // Check if this is a file upload response
        if (response.questionType === 'file_upload' && response.answer && typeof response.answer === 'string') {
          // Extract file name from URL or use question text
          const url = response.answer;
          const urlParts = url.split('/');
          const fileName = urlParts[urlParts.length - 1] || response.questionText || 'uploaded-file';

          // Determine file type from URL extension
          const extension = fileName.split('.').pop()?.toLowerCase() || '';
          let fileType = 'application/octet-stream';
          if (['jpg', 'jpeg', 'png', 'gif', 'heic', 'heif'].includes(extension)) {
            fileType = `image/${extension === 'jpg' ? 'jpeg' : extension}`;
          } else if (extension === 'pdf') {
            fileType = 'application/pdf';
          }

          const createdAtDate = survey.createdAt ? new Date(survey.createdAt) : new Date();
          const updatedAtDate = survey.updatedAt ? new Date(survey.updatedAt) : new Date();

          fileUploads.push({
            id: `survey-${survey.id}-${response.questionId}`,
            patientId,
            attachmentURL: url,
            fileName,
            fileType,
            fileSize: 0, // File size not available from survey response
            createdAt: createdAtDate,
            updatedAt: updatedAtDate,
            isSurveyAttachment: true, // Mark as survey attachment
          } as DisplayAttachment);
        }
      });
    }
  });

  return fileUploads;
};

export function AttachmentsList({ patientId, surveys }: AttachmentsListProps) {
  const { data: attachments = [], isError } = useGetPatientAttachmentsQuery(patientId);

  // Extract file uploads from survey responses
  const surveyFileUploads = useMemo(() => {
    return extractFileUploadsFromSurveys(surveys, patientId);
  }, [surveys, patientId]);

  // Combine regular attachments with survey file uploads
  // Filter out survey uploads that might already exist in regular attachments (by URL)
  const regularAttachmentUrls = new Set(attachments.map((att) => att.attachmentURL));
  const uniqueSurveyUploads = surveyFileUploads.filter((upload) => !regularAttachmentUrls.has(upload.attachmentURL));

  // Mark regular attachments that are S3 URLs as needing signed URLs
  const regularAttachmentsWithFlags: DisplayAttachment[] = attachments.map((att) => ({
    ...att,
    needsSignedUrl: isS3Url(att.attachmentURL),
  }));

  // Use combined attachments
  const displayAttachments: DisplayAttachment[] = [...regularAttachmentsWithFlags, ...uniqueSurveyUploads];

  // Preview state management
  const [imageOpen, setImageOpen] = useState(false);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState<Attachment | null>(null);

  const getFileIcon = (fileType?: string) => {
    if (!fileType) return '📄';

    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    return '📎';
  };

  // const formatFileSize = (bytes?: number) => {
  //   if (!bytes) return '';
  //   const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  //   const i = Math.floor(Math.log(bytes) / Math.log(1024));
  //   return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  // };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleAttachmentClick = async (attachment: DisplayAttachment) => {
    // Validate attachment URL
    if (!attachment.attachmentURL || attachment.attachmentURL.trim() === '') {
      toast.error('Invalid attachment URL');
      return;
    }

    // For S3 URLs (survey attachments or regular attachments), we need to get the signed URL first
    if (attachment.isSurveyAttachment || attachment.needsSignedUrl) {
      try {
        // Extract key from URL using utility function
        const key = extractS3Key(attachment.attachmentURL);

        // Use different endpoint based on attachment type
        const endpoint = attachment.isSurveyAttachment ? '/surveys/file-url' : '/chat/file-url';
        const { data } = await client.get(`${endpoint}?key=${encodeURIComponent(key)}`);
        const signedUrl = data.data?.url;

        if (signedUrl) {
          const attachmentWithSignedUrl = { ...attachment, attachmentURL: signedUrl };
          setSelectedAttachment(attachmentWithSignedUrl);

          if (attachment.fileType?.startsWith('image/')) {
            setImageOpen(true);
          } else if (attachment.fileType === 'application/pdf') {
            window.open(signedUrl, '_blank');
          } else {
            window.open(signedUrl, '_blank');
          }
          return;
        } else {
          toast.error('Unable to fetch file URL');
          return;
        }
      } catch (error) {
        console.error('Error fetching signed URL:', error);
        toast.error('Unable to load file');
        return;
      }
    }

    // For non-S3 attachments, use the URL directly
    setSelectedAttachment(attachment);
    if (attachment.fileType?.startsWith('image/')) {
      setImageOpen(true);
    } else if (attachment.fileType === 'application/pdf') {
      window.open(attachment.attachmentURL, '_blank');
    } else {
      window.open(attachment.attachmentURL, '_blank');
    }
  };

  return (
    <>
      <div className='tw-grid tw-grid-cols-2 md:tw-grid-cols-3 tw-gap-2'>
        {isError ? (
          <div className='tw-col-span-full tw-text-center tw-py-4'>
            <span className='tw-text-gray-500'>Error loading attachments</span>
          </div>
        ) : !displayAttachments || displayAttachments.length === 0 ? (
          <div className='tw-col-span-full tw-text-center tw-py-4'>
            <span className='tw-text-gray-500'>No attachments available</span>
          </div>
        ) : (
          displayAttachments.map((attachment: DisplayAttachment) => (
            <div key={attachment.id} className='tw-col-span-1'>
              <div
                className='tw-h-full tw-cursor-pointer'
                onClick={() => handleAttachmentClick(attachment)}
                title={`Click to preview: ${attachment.fileName || 'Attachment'}`}
              >
                <div className='tw-flex tw-flex-col tw-items-center tw-text-center'>
                  {/* File Icon/Preview */}
                  <div className='tw-mb-2'>
                    {attachment.fileType?.includes('image') ? (
                      attachment.isSurveyAttachment || attachment.needsSignedUrl ? (
                        <AttachmentImageWithSignedUrl
                          attachment={attachment}
                          onClick={() => handleAttachmentClick(attachment)}
                          endpoint={attachment.isSurveyAttachment ? '/surveys/file-url' : '/chat/file-url'}
                        />
                      ) : (
                        <RegularAttachmentImage
                          attachment={attachment}
                          onClick={() => handleAttachmentClick(attachment)}
                        />
                      )
                    ) : (
                      <div
                        className={`tw-rounded tw-flex tw-items-center tw-justify-center tw-w-12 tw-h-12 ${
                          attachment.fileType?.includes('pdf') ? 'tw-bg-[#FFE6E2]' : 'tw-bg-gray-500'
                        }`}
                      >
                        <span className='tw-text-white tw-font-bold tw-text-xs tw-bg-[#FC573B] tw-h-7 tw-w-6 tw-flex tw-items-end tw-justify-end tw-rounded-sm'>
                          {attachment.fileType?.includes('pdf') ? 'PDF' : getFileIcon(attachment.fileType)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* File Name */}
                  <div className='tw-mb-1'>
                    <small
                      className='tw-text-gray-900 tw-text-xs tw-font-medium tw-truncate tw-block'
                      style={{ maxWidth: '100px' }}
                    >
                      {attachment.fileName || 'Unknown File'}
                    </small>
                  </div>

                  {/* Upload Date */}
                  <div className='tw-mb-1'>
                    <p className='tw-text-gray-500 tw-text-xs tw-w-32'>Updated {formatDate(attachment.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Lightbox for images */}
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
        slides={selectedAttachment ? [{ src: selectedAttachment.attachmentURL }] : []}
        controller={{ closeOnPullDown: false, closeOnBackdropClick: true }}
      />

      {/* PDF Preview Modal */}
      <PDFPreviewModal open={pdfOpen} setOpen={setPdfOpen} url={selectedAttachment?.attachmentURL || ''} />
    </>
  );
}
