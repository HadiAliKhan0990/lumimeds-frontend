import { useState, useCallback } from 'react';
import { client } from '@/lib/baseQuery';
import { toast } from 'react-hot-toast';
import { isAxiosError } from 'axios';
import { Error as ApiError } from '@/lib/types';

const getErrorMessage = (error: unknown, defaultMessage: string): string => {
  if (error && typeof error === 'object') {
    if (isAxiosError(error)) {
      return error.response?.data?.message || defaultMessage;
    } else if ((error as ApiError)?.data?.message) {
      return (error as ApiError)?.data?.message || defaultMessage;
    } else if (error instanceof Error) {
      return error.message || defaultMessage;
    }
  }
  if (typeof error === 'string') {
    return error;
  }
  return defaultMessage;
};

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

interface UploadAttachmentParams {
  patientId: string;
  orderId?: string;
  messageId?: string;
  providerId?: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}

interface UseAttachmentsReturn {
  attachments: Attachment[];
  isLoading: boolean;
  fetchAttachments: (patientId: string) => Promise<Attachment[]>;
  fetchOrderAttachments: (orderId: string) => Promise<Attachment[]>;
  uploadAttachment: (file: File, params: UploadAttachmentParams) => Promise<string>;
  removeAttachment: (attachmentId: string) => Promise<void>;
  getOrderAttachments: (patientId: string, orderId: string) => Attachment[];
  getMessageAttachments: (patientId: string, messageId: string) => Attachment[];
}

export const useAttachments = (): UseAttachmentsReturn => {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAttachments = useCallback(async (patientId: string): Promise<Attachment[]> => {
    try {
      setIsLoading(true);
      const { data } = await client.get(`/attachments/patient/${patientId}`);
      setAttachments(data.data);
      return data.data;
    } catch (error) {
      const errorMessage = getErrorMessage(error, 'Failed to load attachments');
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchOrderAttachments = useCallback(async (orderId: string): Promise<Attachment[]> => {
    try {
      setIsLoading(true);
      const { data } = await client.get(`/attachments/order/${orderId}`);
      setAttachments(data.data);
      return data.data;
    } catch (error) {
      const errorMessage = getErrorMessage(error, 'Failed to load order attachments');
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const uploadAttachment = useCallback(async (file: File, params: UploadAttachmentParams): Promise<string> => {
    try {
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
        throw new Error('File type not supported. Please upload images, PDFs, or Word documents.');
      }

      const maxSize = 10 * 1024 * 1024; // 10MB file size restriction
      if (file.size > maxSize) {
        throw new Error('File size exceeds 10MB limit.');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('patientId', params.patientId);
      if (params.orderId) formData.append('orderId', params.orderId);
      if (params.messageId) formData.append('messageId', params.messageId);
      if (params.providerId) formData.append('providerId', params.providerId);

      // Upload file to backend (backend handles S3 upload just like the implementation in pharmacy module)
      const { data } = await client.post('/attachments/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return data.data.attachment.id;
    } catch (error) {
      const errorMessage = getErrorMessage(error, 'Failed to upload attachment');
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  const removeAttachment = useCallback(async (attachmentId: string): Promise<void> => {
    try {
      await client.delete(`/attachments/remove-attachment/${attachmentId}`);

      setAttachments((prev) => prev.filter((attachment) => attachment.id !== attachmentId));
    } catch (error) {
      const errorMessage = getErrorMessage(error, 'Failed to remove attachment');
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  const getOrderAttachments = useCallback(
    (patientId: string, orderId: string): Attachment[] => {
      return attachments.filter((attachment) => attachment.patientId === patientId && attachment.orderId === orderId);
    },
    [attachments]
  );

  const getMessageAttachments = useCallback(
    (patientId: string, messageId: string): Attachment[] => {
      return attachments.filter(
        (attachment) => attachment.patientId === patientId && attachment.messageId === messageId
      );
    },
    [attachments]
  );

  return {
    attachments,
    isLoading,
    fetchAttachments,
    fetchOrderAttachments,
    uploadAttachment,
    removeAttachment,
    getOrderAttachments,
    getMessageAttachments,
  };
};
