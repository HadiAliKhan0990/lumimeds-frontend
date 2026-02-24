import { useState, useEffect, useMemo, useRef } from 'react';
import { useAttachments } from '@/hooks/useAttachments';
import { FaRegFileAlt, FaTimes } from 'react-icons/fa';
import { HiOutlinePhotograph } from 'react-icons/hi';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useDropzone, type FileRejection } from 'react-dropzone';
import { Button } from 'react-bootstrap';
import ConfirmationModal from '@/components/ConfirmationModal';
import toast from 'react-hot-toast';
import { PatientSurvey } from '@/lib/types';
import { useSignedFileUrl } from '@/hooks/useSignedFileUrl';
import { AsyncImage } from 'loadable-image';
import { Blur } from 'transitions-kit';
import AsyncImgLoader from '@/components/AsyncImgLoader';
import { client } from '@/lib/baseQuery';
import { isS3Url, extractS3Key } from '@/lib/helper';

const PDFPreviewModal = dynamic(
  () => import('@/components/Dashboard/PDFPreviewModal').then((mod) => mod.PDFPreviewModal),
  {
    ssr: false,
  }
);

interface Attachment {
  id: string;
  patientId: string;
  orderId?: string;
  messageId?: string;
  providerId?: string;
  attachmentURL: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
  updatedAt: string;
}

interface DisplayAttachment extends Attachment {
  isPending?: boolean;
  isSurveyAttachment?: boolean; // Flag to identify survey attachments that need signed URLs
  needsSignedUrl?: boolean; // Flag for regular attachments that are S3 URLs
}

interface PendingChange {
  type: 'add' | 'remove';
  attachmentId?: string;
  file?: File;
  attachmentURL?: string;
}

interface PatientAttachmentsProps {
  patientId: string;
  isManageMode?: boolean;
  onManageModeChange?: (mode: boolean) => void;
  surveys?: PatientSurvey[];
}

// Component to render regular attachment images with fallback to signed URLs
const RegularAttachmentImage = ({
  attachment,
  onClick,
  onMouseOver,
  onMouseOut,
}: {
  attachment: DisplayAttachment;
  onClick: () => void;
  onMouseOver: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseOut: (e: React.MouseEvent<HTMLDivElement>) => void;
}) => {
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
        className={`border-2 border-secondary rounded-3 d-flex align-items-center justify-content-center bg-light ${
          attachment.isPending ? 'opacity-75' : ''
        }`}
        style={{
          width: '80px',
          height: '80px',
        }}
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
      <div
        className={`border-2 border-secondary rounded-3 overflow-hidden cursor-pointer ${
          attachment.isPending ? 'opacity-75' : ''
        }`}
        style={{
          width: '80px',
          height: '80px',
          transition: 'all 0.3s ease',
        }}
        title={
          attachment.isPending
            ? `Pending (Click to preview): ${attachment.fileName}`
            : `Click to preview: ${attachment.fileName}`
        }
        onClick={onClick}
        onMouseOver={onMouseOver}
        onMouseOut={onMouseOut}
      >
        <AsyncImage
          src={signedUrl}
          alt={attachment.fileName}
          Transition={Blur}
          loader={<AsyncImgLoader />}
          className='w-100 h-100 object-fit-cover'
          style={{
            width: '80px',
            height: '80px',
          }}
        />
      </div>
    );
  }

  return (
    <Image
      src={attachment.attachmentURL}
      alt={attachment.fileName}
      width={80}
      height={80}
      unoptimized
      className={`border-2 border-secondary rounded-3 object-fit-cover cursor-pointer ${
        attachment.isPending ? 'opacity-75' : ''
      }`}
      style={{
        width: '80px',
        height: '80px',
        transition: 'all 0.3s ease',
      }}
      title={
        attachment.isPending
          ? `Pending (Click to preview): ${attachment.fileName}`
          : `Click to preview: ${attachment.fileName}`
      }
      onClick={onClick}
      onError={() => setImageError(true)}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
    />
  );
};

// Component to render attachment images with signed URLs (for S3 URLs)
const AttachmentImageWithSignedUrl = ({
  attachment,
  onClick,
  onMouseOver,
  onMouseOut,
  endpoint = '/surveys/file-url',
}: {
  attachment: DisplayAttachment;
  onClick: () => void;
  onMouseOver: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseOut: (e: React.MouseEvent<HTMLDivElement>) => void;
  endpoint?: string;
}) => {
  const { signedUrl, isLoading } = useSignedFileUrl(attachment.attachmentURL, endpoint);

  if (isLoading) {
    return (
      <div
        className={`border-2 border-secondary rounded-3 d-flex align-items-center justify-content-center bg-light ${
          attachment.isPending ? 'opacity-75' : ''
        }`}
        style={{
          width: '80px',
          height: '80px',
        }}
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
        className={`border-2 border-secondary rounded-3 d-flex flex-column align-items-center justify-content-center bg-light cursor-pointer ${
          attachment.isPending ? 'opacity-75' : ''
        }`}
        style={{
          width: '80px',
          height: '80px',
        }}
        title={`Unable to load: ${attachment.fileName}`}
      >
        <div className='text-muted fw-bold' style={{ fontSize: '10px' }}>
          ERROR
        </div>
        <FaRegFileAlt className='text-muted' size={24} />
      </div>
    );
  }

  return (
    <div
      className={`border-2 border-secondary rounded-3 overflow-hidden cursor-pointer ${
        attachment.isPending ? 'opacity-75' : ''
      }`}
      style={{
        width: '80px',
        height: '80px',
        transition: 'all 0.3s ease',
      }}
      title={
        attachment.isPending
          ? `Pending (Click to preview): ${attachment.fileName}`
          : `Click to preview: ${attachment.fileName}`
      }
      onClick={onClick}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
    >
      <AsyncImage
        src={signedUrl}
        alt={attachment.fileName}
        Transition={Blur}
        loader={<AsyncImgLoader />}
        className='w-100 h-100 object-fit-cover'
        style={{
          width: '80px',
          height: '80px',
        }}
      />
    </div>
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

          const createdAtDate = survey.createdAt ? new Date(survey.createdAt).toISOString() : new Date().toISOString();
          const updatedAtDate = survey.updatedAt ? new Date(survey.updatedAt).toISOString() : new Date().toISOString();

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

export default function PatientAttachments({
  patientId,
  isManageMode: externalManageMode,
  onManageModeChange,
  surveys,
}: Readonly<PatientAttachmentsProps>) {
  const { isLoading, attachments, fetchAttachments, uploadAttachment, removeAttachment } = useAttachments();

  // Extract file uploads from survey responses
  const surveyFileUploads = useMemo(() => {
    return extractFileUploadsFromSurveys(surveys, patientId);
  }, [surveys, patientId]);

  const [imageOpen, setImageOpen] = useState(false);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState<Attachment | null>(null);
  const [internalManageMode, setInternalManageMode] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const objectUrlsRef = useRef<Map<string, string>>(new Map());

  const isManageMode = externalManageMode ?? internalManageMode;
  const setIsManageMode = onManageModeChange ?? setInternalManageMode;

  useEffect(() => {
    if (patientId) {
      fetchAttachments(patientId);
    }
  }, [patientId, fetchAttachments]);

  // Clear pending changes when manage mode is turned off
  useEffect(() => {
    if (!isManageMode) {
      setPendingChanges([]);
      setSelectedAttachment(null);
      setImageOpen(false);
      setPdfOpen(false);
      setShowConfirmDialog(false);
    }
  }, [isManageMode]);

  // Cleanup all object URLs on component unmount
  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      objectUrlsRef.current.clear();
    };
  }, []);

  const onDrop = (acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/heic',
        'image/heif',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];

      if (!allowedTypes.includes(file.type)) {
        toast.error('File type not supported. Please upload images, PDFs, or Word documents.');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size exceeds 10MB limit.');
        return;
      }

      const newChange: PendingChange = {
        type: 'add',
        file,
      };

      setPendingChanges((prev) => [...prev, newChange]);
    });
  };

  const onDropRejected = (fileRejections: FileRejection[]) => {
    fileRejections.forEach(({ file, errors }) => {
      errors.forEach((error) => {
        if (error.code === 'file-invalid-type') {
          toast.error('File type not supported. Please upload images, PDFs, or Word documents.');
        } else if (error.code === 'file-too-large') {
          toast.error('File size exceeds 10MB limit.');
        } else {
          toast.error(`Error uploading ${file.name}: ${error.message}`);
        }
      });
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.heic', '.heif'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxSize: 10 * 1024 * 1024,
    disabled: !isManageMode || isSaving,
  });

  const handleRemoveAttachment = (attachmentId: string) => {
    if (attachmentId.startsWith('pending-')) {
      // Extract the file name from the pending ID (format: pending-{index}-{fileName})
      const parts = attachmentId.split('-');
      const fileName = parts.slice(2).join('-'); // Get filename without 'pending-' and index
      setPendingChanges((prev) => {
        const filtered = prev.filter((change) => !(change.type === 'add' && change.file?.name === fileName));
        return filtered;
      });
    } else {
      setPendingChanges((prev) => {
        const newChanges = [
          ...prev,
          {
            type: 'remove' as const,
            attachmentId,
          },
        ];
        return newChanges;
      });
    }
  };

  const handleConfirmChanges = async () => {
    try {
      setIsSaving(true);

      for (const change of pendingChanges) {
        if (change.type === 'remove' && change.attachmentId) {
          await removeAttachment(change.attachmentId);
        } else if (change.type === 'add' && change.file) {
          await uploadAttachment(change.file, {
            patientId,
            fileName: change.file.name,
            fileType: change.file.type,
            fileSize: change.file.size,
          });
        }
      }

      await fetchAttachments(patientId);

      setPendingChanges([]);
      setIsManageMode(false);
      setShowConfirmDialog(false);

      toast.success('Attachments updated successfully!');
    } catch (error) {
      console.error('Error updating attachments:', error);
      // toast.error('Error updating attachments: ' + error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelChanges = () => {
    setShowConfirmDialog(false);
    setIsManageMode(false);
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

          if (attachment.fileType.startsWith('image/')) {
            setImageOpen(true);
          } else if (attachment.fileType === 'application/pdf') {
            setPdfOpen(true);
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
    if (attachment.fileType.startsWith('image/')) {
      setImageOpen(true);
    } else if (attachment.fileType === 'application/pdf') {
      setPdfOpen(true);
    } else {
      window.open(attachment.attachmentURL, '_blank');
    }
  };

  const getFileTypeDisplay = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return 'IMG';
    } else if (fileType === 'application/pdf') {
      return 'PDF';
    } else if (
      fileType.includes('word') ||
      fileType.includes('document') ||
      fileType.includes('msword') ||
      fileType.includes('wordprocessingml')
    ) {
      return 'DOC';
    }
    return 'FILE';
  };

  const displayAttachments: DisplayAttachment[] = useMemo(() => {
    const filteredAttachments = attachments.filter((att) => {
      return !pendingChanges.some((change) => change.type === 'remove' && change.attachmentId === att.id);
    });

    const currentFileNames = new Set(pendingChanges.filter((c) => c.type === 'add' && c.file).map((c) => c.file!.name));
    objectUrlsRef.current.forEach((url, fileName) => {
      if (!currentFileNames.has(fileName)) {
        URL.revokeObjectURL(url);
        objectUrlsRef.current.delete(fileName);
      }
    });

    const pendingAttachments = pendingChanges
      .filter((change) => change.type === 'add' && change.file)
      .map((change, index) => {
        const fileName = change.file!.name;
        let objectUrl = objectUrlsRef.current.get(fileName);
        if (!objectUrl) {
          objectUrl = URL.createObjectURL(change.file!);
          objectUrlsRef.current.set(fileName, objectUrl);
        }

        return {
          id: `pending-${index}-${fileName}`,
          patientId,
          attachmentURL: objectUrl,
          fileName: fileName,
          fileType: change.file!.type,
          fileSize: change.file!.size,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isPending: true,
        };
      });

    // Mark regular attachments that are S3 URLs as needing signed URLs
    const regularAttachmentsWithFlags: DisplayAttachment[] = filteredAttachments.map((att) => ({
      ...att,
      needsSignedUrl: isS3Url(att.attachmentURL),
    }));

    // Combine regular attachments, survey file uploads, and pending attachments
    // Filter out survey uploads that might already exist in regular attachments (by URL)
    const regularAttachmentUrls = new Set(regularAttachmentsWithFlags.map((att) => att.attachmentURL));
    const uniqueSurveyUploads = surveyFileUploads.filter((upload) => !regularAttachmentUrls.has(upload.attachmentURL));

    const combined = [...regularAttachmentsWithFlags, ...uniqueSurveyUploads, ...pendingAttachments];
    return combined;
  }, [attachments, pendingChanges, patientId, surveyFileUploads]);

  if (isLoading && attachments.length === 0) {
    return (
      <div className='d-flex align-items-center justify-content-center py-4'>
        <div className='spinner-border text-primary' role='status'>
          <span className='visually-hidden'>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {isManageMode && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded p-4 mb-4 text-center ${
            isDragActive ? 'border-primary bg-light' : 'border-secondary'
          }`}
          style={{ cursor: isSaving ? 'not-allowed' : 'pointer', marginTop: '12px' }}
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p className='mb-0 text-primary'>Drop files here...</p>
          ) : (
            <p className='mb-0 text-muted'>
              Drag & drop files here, or click to select files
              <br />
              <small>(Max 5MB - Images, PDF, or Word documents)</small>
            </p>
          )}
        </div>
      )}

      {displayAttachments.length === 0 ? (
        <div className='text-center py-4'>
          <HiOutlinePhotograph className='text-muted mb-2 tw-mx-auto' style={{ fontSize: '48px' }} />
          <p className='text-muted mb-0'>No attachments available</p>
        </div>
      ) : (
        <div className='d-flex flex-wrap gap-3'>
          {displayAttachments.map((attachment, index) => (
            <div key={`${attachment.id}-${index}`} className='position-relative'>
              {attachment.fileType.startsWith('image/') &&
              attachment.attachmentURL &&
              attachment.attachmentURL.trim() !== '' ? (
                attachment.isSurveyAttachment || attachment.needsSignedUrl ? (
                  <AttachmentImageWithSignedUrl
                    attachment={attachment}
                    onClick={() => handleAttachmentClick(attachment)}
                    endpoint={attachment.isSurveyAttachment ? '/surveys/file-url' : '/chat/file-url'}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                      e.currentTarget.style.borderColor = '#6c757d';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.borderColor = '';
                    }}
                  />
                ) : (
                  <RegularAttachmentImage
                    attachment={attachment}
                    onClick={() => handleAttachmentClick(attachment)}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                      e.currentTarget.style.borderColor = '#6c757d';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.borderColor = '';
                    }}
                  />
                )
              ) : (
                <div
                  className={`border-2 border-secondary rounded-3 d-flex flex-column align-items-center justify-content-center bg-light cursor-pointer ${
                    attachment.isPending ? 'opacity-75' : ''
                  }`}
                  style={{
                    width: '80px',
                    height: '80px',
                    transition: 'all 0.3s ease',
                  }}
                  title={
                    attachment.isPending
                      ? `Pending (Click to preview): ${attachment.fileName}`
                      : `Click to preview: ${attachment.fileName}`
                  }
                  onClick={() => handleAttachmentClick(attachment)}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.borderColor = '#6c757d';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.borderColor = '';
                  }}
                >
                  <div className='text-muted fw-bold' style={{ fontSize: '10px' }}>
                    {getFileTypeDisplay(attachment.fileType).toUpperCase()}
                  </div>
                  <FaRegFileAlt className='text-muted' size={24} />
                </div>
              )}

              {isManageMode && !attachment.isSurveyAttachment && !attachment.messageId && (
                <button
                  type='button'
                  className='btn btn-sm btn-danger position-absolute rounded-circle d-flex align-items-center justify-content-center'
                  style={{
                    width: '24px',
                    height: '24px',
                    padding: '0',
                    top: '-8px',
                    right: '-2px',
                    fontSize: '12px',
                    border: '2px solid #dc3545',
                    transition: 'all 0.3s ease',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveAttachment(attachment.id);
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  title='Remove attachment'
                  disabled={isSaving}
                >
                  <FaTimes />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {isManageMode && pendingChanges.length > 0 && (
        <div className='mt-3'>
          <Button variant='primary' size='sm' onClick={() => setShowConfirmDialog(true)} disabled={isSaving}>
            {isSaving ? 'Saving...' : `Save Changes (${pendingChanges.length})`}
          </Button>
        </div>
      )}

      <Lightbox
        plugins={[Zoom]}
        render={{ iconPrev: () => null, iconNext: () => null }}
        open={imageOpen}
        {...({
          zoom: {
            maxZoomPixelRatio: 3,
            zoomInMultiplier: 2,
            doubleTapDelay: 300,
            doubleClickDelay: 300,
            doubleClickMaxStops: 2,
            keyboardMoveDistance: 50,
            wheelZoomDistanceFactor: 100,
            pinchZoomDistanceFactor: 100,
            scrollToZoom: true,
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any)}
        close={() => setImageOpen(false)}
        slides={selectedAttachment ? [{ src: selectedAttachment.attachmentURL }] : []}
        controller={{ closeOnPullDown: false, closeOnBackdropClick: true }}
      />

      <PDFPreviewModal open={pdfOpen} setOpen={setPdfOpen} url={selectedAttachment?.attachmentURL || ''} />

      {/* Confirm Changes Modal */}
      <ConfirmationModal
        show={showConfirmDialog}
        onHide={handleCancelChanges}
        onConfirm={handleConfirmChanges}
        title='Confirm Changes'
        message='Are you sure you want to apply these changes?'
        confirmLabel={isSaving ? 'Updating...' : 'Yes, Apply'}
        cancelLabel='Cancel'
        loading={isSaving}
        confirmButtonDisabled={isSaving}
        cancelButtonDisabled={isSaving}
      />
    </>
  );
}