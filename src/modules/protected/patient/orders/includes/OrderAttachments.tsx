import { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useAttachments } from '@/hooks/useAttachments';
import ConfirmationModal from '@/components/ConfirmationModal';
import { IoClose, IoCloudUploadOutline } from 'react-icons/io5';
import { FaRegFileAlt } from 'react-icons/fa';
import { HiOutlinePhotograph } from 'react-icons/hi';
import { MdAttachFile } from 'react-icons/md';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import toast from 'react-hot-toast';

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

export default function OrderAttachments({ orderId, patientId }: Readonly<OrderAttachmentsProps>) {
  const { isLoading, attachments, fetchOrderAttachments, uploadAttachment, removeAttachment } = useAttachments();

  const [isManageMode, setIsManageMode] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState<Attachment | null>(null);
  const [isSaving, setIsSaving] = useState(false); // Added state for tracking save operations

  const orderAttachments = attachments;

  useEffect(() => {
    fetchOrderAttachments(orderId);
  }, [orderId, fetchOrderAttachments]);

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
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.heic', '.heif'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxSize: 5 * 1024 * 1024,
    disabled: !isManageMode || isSaving, // Updated to disable when saving
  });

  const handleManageClick = () => {
    if (isSaving) return; // Prevent action if saving

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
    if (isSaving) return; // Prevent action if saving

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
      setIsSaving(true); // Set saving state at start

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

      await fetchOrderAttachments(orderId);

      setPendingChanges([]);
      setIsManageMode(false);
      setShowConfirmDialog(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false); // Reset saving state when done
    }
  };

  const handleCancelChanges = () => {
    if (isSaving) return; // Prevent action if saving
    setShowConfirmDialog(false);
  };

  const handleAttachmentClick = (attachment: Attachment) => {
    setSelectedAttachment(attachment);

    // Check if it's an image or PDF
    if (attachment.fileType.startsWith('image/')) {
      setImageOpen(true);
    } else if (attachment.fileType === 'application/pdf') {
      setPdfOpen(true);
    } else {
      // For other file types, open in new tab
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

  const getFileTypeDisplay = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return 'Image';
    } else if (fileType === 'application/pdf') {
      return 'PDF';
    } else if (
      fileType.includes('word') ||
      fileType.includes('document') ||
      fileType.includes('msword') ||
      fileType.includes('wordprocessingml')
    ) {
      return 'Document';
    }
    return 'File';
  };

  return (
    <div className='tw-mb-4'>
      {/* Header Section with Neon Gradient Border */}
      <div className='tw-relative tw-rounded-2xl tw-p-[2px] tw-shadow-gray-200'>
        <div className='tw-bg-neutral-100 tw-rounded-2xl tw-p-6'>
          <div className='tw-flex tw-flex-col sm:tw-flex-row tw-items-start sm:tw-items-center tw-justify-between tw-gap-4'>
            <div>
              <h3 className='tw-text-gray-900 tw-font-bold tw-text-2xl tw-tracking-tight tw-flex tw-items-center tw-gap-2 tw-mb-2'>
                <MdAttachFile className='tw-text-gray-900 tw-text-3xl' />
                Attachments
              </h3>
              <div className='tw-bg-gradient-to-r tw-from-blue-400 tw-to-purple-400 tw-bg-clip-text tw-text-transparent tw-font-semibold tw-text-sm'>
                {getDisplayAttachments().length} {getDisplayAttachments().length === 1 ? 'file' : 'files'} attached
              </div>
            </div>
            <button onClick={handleManageClick} disabled={isLoading || isSaving} className='btn btn-primary'>
              {isSaving ? 'Saving...' : isManageMode ? 'Save Changes' : 'Manage'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className='tw-mt-1 tw-bg-gray-50/50 tw-backdrop-blur-sm tw-rounded-2xl tw-p-6 tw-border tw-border-gray-200'>
        {isLoading && orderAttachments.length === 0 ? (
          <div className='tw-flex tw-flex-col tw-items-center tw-justify-center tw-py-16'>
            <div className='tw-relative'>
              <div className='tw-absolute tw-inset-0 tw-animate-spin tw-rounded-full tw-h-16 tw-w-16 tw-border-4 tw-border-transparent tw-border-t-purple-500 tw-border-r-blue-500'></div>
              <div className='tw-h-16 tw-w-16 tw-rounded-full tw-bg-gray-100'></div>
            </div>
            <p className='tw-mt-4 tw-text-gray-700 tw-font-medium'>Loading attachments...</p>
          </div>
        ) : (
          <>
            {/* Dropzone Area (visible in manage mode) */}
            {isManageMode && (
              <div
                {...getRootProps()}
                className={`tw-mb-6 tw-border-[3px] tw-border-dashed tw-rounded-2xl tw-p-8 tw-transition-all tw-duration-300 ${
                  isSaving ? 'tw-cursor-not-allowed tw-opacity-70' : 'tw-cursor-pointer'
                } tw-relative tw-overflow-hidden ${
                  isDragActive
                    ? 'tw-border-purple-500 tw-bg-purple-100/30 tw-scale-[1.02] tw-shadow-gray-200'
                    : 'tw-border-gray-300 tw-bg-gray-100/50 hover:tw-border-gray-400 hover:tw-bg-gray-100'
                }`}
              >
                <input {...getInputProps()} />
                <div
                  className={`tw-absolute tw-inset-0 tw-opacity-0 hover:tw-opacity-100 tw-transition-opacity tw-duration-500 ${
                    isDragActive ? 'tw-opacity-100' : ''
                  }`}
                >
                  <div className='tw-absolute tw-inset-0 tw-bg-gradient-to-r tw-from-blue-600/10 tw-via-purple-600/10 tw-to-pink-600/10 tw-animate-pulse'></div>
                </div>

                <div className='tw-relative tw-flex tw-flex-col tw-items-center tw-justify-center tw-gap-4'>
                  <div className='tw-relative'>
                    <div
                      className={`tw-absolute tw-inset-0 tw-rounded-full tw-blur-2xl tw-transition-all tw-duration-300 ${
                        isDragActive
                          ? 'tw-bg-purple-500 tw-opacity-60 tw-scale-150'
                          : 'tw-bg-gradient-to-br tw-from-blue-500 tw-to-purple-600 tw-opacity-40'
                      }`}
                    ></div>
                    <div
                      className={`tw-relative tw-p-5 tw-rounded-full tw-transition-all tw-duration-300 tw-border-2 ${
                        isDragActive
                          ? 'tw-bg-purple-600 tw-border-purple-400 tw-scale-110'
                          : 'tw-bg-gradient-to-br tw-from-blue-600 tw-to-purple-600 tw-border-transparent'
                      }`}
                    >
                      <IoCloudUploadOutline className='tw-text-white tw-text-5xl' />
                    </div>
                  </div>
                  {isDragActive ? (
                    <div className='tw-text-center'>
                      <p className='tw-text-purple-600 tw-font-bold tw-text-2xl tw-animate-bounce'>
                        Drop files here! 🎯
                      </p>
                      <p className='tw-text-gray-700 tw-mt-2 tw-text-sm'>Release to upload your files</p>
                    </div>
                  ) : (
                    <div className='tw-text-center'>
                      <p className='tw-text-gray-900 tw-font-bold tw-text-xl tw-mb-2'>
                        ✨ Drag & drop files here, or click to browse
                      </p>
                      <p className='tw-text-gray-600 tw-text-sm tw-mb-4'>
                        Support: Images, PDFs, Word documents (Max 5MB)
                      </p>
                      <div className='tw-flex tw-flex-wrap tw-gap-2 tw-justify-center'>
                        <span className='tw-bg-blue-500/20 tw-border tw-border-blue-500/50 tw-text-blue-700 tw-px-3 tw-py-1.5 tw-rounded-full tw-text-xs tw-font-semibold tw-backdrop-blur-sm'>
                          📸 JPG, PNG, JPEG
                        </span>
                        <span className='tw-bg-red-500/20 tw-border tw-border-red-500/50 tw-text-red-700 tw-px-3 tw-py-1.5 tw-rounded-full tw-text-xs tw-font-semibold tw-backdrop-blur-sm'>
                          📄 PDF
                        </span>
                        <span className='tw-bg-purple-500/20 tw-border tw-border-purple-500/50 tw-text-purple-700 tw-px-3 tw-py-1.5 tw-rounded-full tw-text-xs tw-font-semibold tw-backdrop-blur-sm'>
                          📝 DOC, DOCX
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Attachments Display */}
            {getDisplayAttachments().length === 0 ? (
              <div className='tw-text-center tw-py-12'>
                <div className='tw-relative tw-mx-auto tw-w-20 tw-h-20 tw-mb-4'>
                  <div className='tw-absolute tw-inset-0 tw-bg-gradient-to-br tw-from-blue-500 tw-to-purple-600 tw-rounded-full tw-blur-xl tw-opacity-40'></div>
                  <div className='tw-relative tw-bg-gradient-to-br tw-from-blue-500 tw-to-purple-600 tw-p-3 tw-rounded-full tw-w-full tw-h-full tw-flex tw-items-center tw-justify-center tw-border-2 tw-border-gray-300'>
                    <HiOutlinePhotograph className='tw-text-white tw-text-4xl' />
                  </div>
                </div>
                <p className='tw-text-gray-700 tw-text-base tw-font-medium tw-mb-1'>No attachments yet</p>
                <p className='tw-text-gray-600 tw-text-sm'>
                  {isManageMode ? 'Upload files using the dropzone above' : 'Click "Manage" to add attachments'}
                </p>
              </div>
            ) : (
              <div className='tw-flex tw-gap-3 tw-flex-wrap tw-items-start'>
                {getDisplayAttachments().map((attachment) => (
                  <div key={attachment.id} className='tw-relative tw-group'>
                    {attachment.fileType.startsWith('image/') &&
                    attachment.attachmentURL &&
                    attachment.attachmentURL.trim() !== '' ? (
                      <Image
                        src={attachment.attachmentURL}
                        alt={attachment.fileName}
                        width={80}
                        height={80}
                        className='tw-border-2 tw-border-gray-300 tw-rounded-xl tw-object-cover tw-cursor-pointer hover:tw-border-purple-500 tw-transition-all tw-duration-300 hover:tw-scale-105 hover:tw-shadow-gray-200'
                        title={`Click to preview: ${attachment.fileName}`}
                        onClick={() => handleAttachmentClick(attachment)}
                      />
                    ) : (
                      <div
                        className='tw-w-20 tw-h-20 tw-bg-neutral-100 tw-rounded-xl tw-flex tw-flex-col tw-items-center tw-justify-center tw-cursor-pointer tw-transition-all tw-duration-300 hover:tw-scale-105 hover:tw-shadow-gray-200'
                        title={`Click to preview: ${attachment.fileName}`}
                        onClick={() => handleAttachmentClick(attachment)}
                      >
                        <div className='tw-text-[10px] tw-font-bold tw-text-gray-700 tw-mb-1'>
                          {getFileTypeDisplay(attachment.fileType).toUpperCase()}
                        </div>
                        <FaRegFileAlt className='tw-text-gray-600' size={24} />
                      </div>
                    )}

                    {isManageMode && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleRemoveAttachment(attachment.id);
                        }}
                        type='button'
                        className='tw-absolute tw-w-6 tw-h-6 tw-p-0 -tw-top-2 -tw-right-0.5 tw-bg-red-500 hover:tw-bg-red-600 tw-text-white tw-rounded-full tw-flex tw-items-center tw-justify-center tw-shadow-gray-200 hover:tw-shadow-gray-200 tw-transition-all tw-duration-300 hover:tw-scale-110 tw-z-10 tw-border-2 tw-border-red-400'
                        title='Remove attachment'
                        disabled={isSaving}
                        style={{ opacity: isSaving ? '0.7' : '1', cursor: isSaving ? 'not-allowed' : 'pointer' }}
                      >
                        <IoClose className='tw-w-3 tw-h-3 tw-flex-shrink-0' />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
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
    </div>
  );
}
