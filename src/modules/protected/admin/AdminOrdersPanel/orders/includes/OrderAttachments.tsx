import { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useAttachments } from '@/hooks/useAttachments';
import ConfirmationModal from '@/components/ConfirmationModal';
import { IoClose, IoCloudUploadOutline } from 'react-icons/io5';
import { FaRegFileAlt } from 'react-icons/fa';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { isS3Url, extractS3Key } from '@/lib/helper';
import { useSignedFileUrl } from '@/hooks/useSignedFileUrl';
import { client } from '@/lib/baseQuery';
import { toast } from 'react-hot-toast';

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

interface OrderAttachmentsProps {
  orderId: string;
  patientId: string;
}

interface PendingChange {
  type: 'add' | 'remove';
  attachmentId?: string;
  file?: File;
  attachmentURL?: string;
}

function getFileTypeDisplay(fileType: string) {
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
}

// Component to render attachment image thumbnails with signed URL support
function AttachmentThumbnail({ attachment, onClick }: { attachment: Attachment; onClick: () => void }) {
  const needsSignedUrl = isS3Url(attachment.attachmentURL);
  // Determine endpoint based on URL pattern or messageId
  // Chat attachments use /chat/file-url, others might use different endpoints
  const endpoint =
    attachment.messageId || attachment.attachmentURL?.startsWith('chat/') ? '/chat/file-url' : '/chat/file-url'; // Default to chat endpoint for S3 URLs
  const { signedUrl, isLoading } = useSignedFileUrl(needsSignedUrl ? attachment.attachmentURL : undefined, endpoint);

  const imageUrl = needsSignedUrl ? signedUrl : attachment.attachmentURL;

  if (attachment.fileType.startsWith('image/') && attachment.attachmentURL && attachment.attachmentURL.trim() !== '') {
    if (needsSignedUrl && isLoading) {
      return (
        <div className='border rounded-12 d-flex align-items-center justify-content-center tw-w-full tw-h-full bg-light'>
          <div className='spinner-border spinner-border-sm text-primary' role='status'>
            <span className='visually-hidden'>Loading...</span>
          </div>
        </div>
      );
    }

    if (needsSignedUrl && !signedUrl) {
      return (
        <div
          className='border rounded-12 d-flex flex-column align-items-center justify-content-center tw-w-full tw-h-full bg-light'
          title={`Unable to load: ${attachment.fileName}`}
        >
          <div className='text-xs fw-bold mb-1 text-danger'>ERROR</div>
          <FaRegFileAlt size={20} />
        </div>
      );
    }

    return (
      <Image
        src={imageUrl || attachment.attachmentURL}
        alt={attachment.fileName}
        fill
        className='border rounded-12 object-cover cursor-pointer'
        title={`Click to preview: ${attachment.fileName}`}
        onClick={onClick}
        unoptimized={needsSignedUrl}
      />
    );
  }

  return (
    <div
      className='border rounded-12 d-flex flex-column align-items-center justify-content-center cursor-pointer tw-w-full tw-h-full'
      title={`Click to preview: ${attachment.fileName}`}
      onClick={onClick}
    >
      <div className='text-xs fw-bold mb-1'>{getFileTypeDisplay(attachment.fileType)}</div>
      <FaRegFileAlt size={20} />
    </div>
  );
}

export default function OrderAttachments({ orderId, patientId }: Readonly<OrderAttachmentsProps>) {
  const { isLoading, fetchAttachments, getOrderAttachments, uploadAttachment, removeAttachment } = useAttachments();

  const [isManageMode, setIsManageMode] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState<Attachment | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const orderAttachments = getOrderAttachments(patientId, orderId);

  useEffect(() => {
    fetchAttachments(patientId);
  }, [patientId, fetchAttachments]);

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
        alert('File type not supported. Please upload images, PDFs, or Word documents.');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size exceeds 5MB limit.');
        return;
      }

      const newChange: PendingChange = {
        type: 'add',
        file,
      };

      setPendingChanges((prev) => [...prev, newChange]);
    });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected: (fileRejections) => {
      fileRejections.forEach(({ file, errors }) => {
        if (errors.some((e) => e.code === 'file-too-large')) {
          toast.error(`File "${file.name}" exceeds 5MB limit.`);
        }
      });
    },
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.heic', '.heif'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxSize: 5 * 1024 * 1024,
    disabled: !isManageMode || isSaving,
  });

  const handleManageClick = () => {
    if (isSaving) return;

    if (isManageMode) {
      if (pendingChanges.length > 0) {
        setShowConfirmDialog(true);
      } else {
        setIsManageMode(false);
        setPendingChanges([]);
      }
    } else {
      setIsManageMode(true);
      setPendingChanges([]);
    }
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    if (isSaving) return;

    if (attachmentId.startsWith('pending-')) {
      const fileName = attachmentId.replace('pending-', '');
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
            orderId,
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
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelChanges = () => {
    if (isSaving) return;
    setShowConfirmDialog(false);
  };

  const handleAttachmentClick = async (attachment: Attachment) => {
    // Validate attachment URL
    if (!attachment.attachmentURL || attachment.attachmentURL.trim() === '') {
      toast.error('Invalid attachment URL');
      return;
    }

    // For S3 URLs (message attachments), we need to get the signed URL first
    if (isS3Url(attachment.attachmentURL)) {
      try {
        const key = extractS3Key(attachment.attachmentURL);
        // Use chat endpoint for message attachments or URLs starting with chat/
        const endpoint =
          attachment.messageId || attachment.attachmentURL?.startsWith('chat/') ? '/chat/file-url' : '/chat/file-url'; // Default to chat endpoint for S3 URLs
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

  const getDisplayAttachments = () => {
    const displayAttachments = [...orderAttachments];

    pendingChanges
      .filter((change) => change.type === 'add')
      .forEach((change) => {
        const localURL = change.file ? URL.createObjectURL(change.file) : '';

        displayAttachments.push({
          id: `pending-${change.file?.name}`,
          patientId,
          orderId,
          attachmentURL: localURL,
          fileName: change.file?.name || 'Unknown',
          fileType: change.file?.type || 'application/octet-stream',
          fileSize: change.file?.size || 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      });

    const removedIds = pendingChanges.filter((change) => change.type === 'remove').map((change) => change.attachmentId);

    const filtered = displayAttachments.filter((attachment) => !removedIds.includes(attachment.id));

    return filtered;
  };

  return (
    <>
      <div className='rounded-12 p-12 border border-c-light'>
        <div className='mb-4 d-flex align-items-center justify-content-between'>
          <span className='fw-medium'>Attachments</span>
          <button
            onClick={handleManageClick}
            disabled={isLoading || isSaving}
            className='btn-no-style text-primary fw-medium notes-btn'
          >
            {isSaving ? 'Saving...' : isManageMode ? 'Save Changes' : 'Manage'}
          </button>
        </div>

        <div className='row gy-3'>
          <div className='col-12'>
            {isManageMode && (
              <div
                {...getRootProps()}
                className={`mb-3 border border-2 border-dashed rounded-12 p-4 text-center ${
                  isSaving ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                } ${isDragActive ? 'border-primary bg-primary-subtle' : 'tw-border-gray-100 tw-bg-white'}`}
              >
                <input {...getInputProps()} />
                <div className='d-flex flex-column align-items-center justify-content-center gap-2'>
                  <IoCloudUploadOutline className='text-primary' size={40} />
                  {isDragActive ? (
                    <p className='mb-0 text-primary fw-semibold'>Drop files here!</p>
                  ) : (
                    <>
                      <p className='mb-0 fw-medium'>Drag & drop files here, or click to browse</p>
                      <p className='mb-0 text-muted small'>Support: Images, PDFs, Word documents (Max 5MB)</p>
                    </>
                  )}
                </div>
              </div>
            )}

            {isLoading && orderAttachments.length === 0 ? (
              <div className='flex justify-center py-8'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
              </div>
            ) : (
              <div className='tw-flex tw-gap-1 tw-md-gap-4 tw-flex-wrap tw-items-center'>
                {getDisplayAttachments().map((attachment) => (
                  <div key={attachment.id} className='position-relative tw-w-20 tw-h-20'>
                    <AttachmentThumbnail attachment={attachment} onClick={() => handleAttachmentClick(attachment)} />

                    {isManageMode && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleRemoveAttachment(attachment.id);
                        }}
                        type='button'
                        className='position-absolute top-0 end-0 btn btn-sm btn-danger rounded-circle p-0 d-flex align-items-center justify-content-center'
                        title='Remove attachment'
                        disabled={isSaving}
                        style={{
                          width: '24px',
                          height: '24px',
                          transform: 'translate(25%, -25%)',
                          opacity: isSaving ? 0.7 : 1,
                          cursor: isSaving ? 'not-allowed' : 'pointer',
                        }}
                      >
                        <IoClose size={16} />
                      </button>
                    )}
                  </div>
                ))}

                {getDisplayAttachments().length === 0 && (
                  <p className='tw-w-full text-center py-8 text-gray-500'>
                    {isManageMode ? 'Upload files using the dropzone above' : 'No attachments for this order 📎'}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        show={showConfirmDialog}
        onHide={handleCancelChanges}
        onConfirm={handleConfirmChanges}
        title='Confirm Changes'
        message={<>Are you sure you want to apply these changes?</>}
        confirmLabel={isSaving ? 'Updating...' : 'Yes, Apply'}
        cancelLabel='Cancel'
        loading={isSaving}
        confirmButtonDisabled={isSaving}
        cancelButtonDisabled={isSaving}
      />

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
