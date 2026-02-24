import { client } from '@/lib/baseQuery';
import axios, { isAxiosError } from 'axios';
import { Error as ApiError } from '@/lib/types';

export interface UploadParams {
  surveyId: string;
  productId?: string;
  patientId: string;
  file: File;
}

export interface ChatUploadParams {
  senderId: string;
  file: File;
}

export interface GeneralUploadParams {
  surveyId: string;
  file: File;
  email: string;
}

/**
 * Uploads a file for a survey question and returns the final public URL.
 */

export async function uploadSurveyFile({ surveyId, productId, patientId, file }: UploadParams): Promise<string> {
  if (!surveyId || !productId || !patientId || !file) {
    throw new Error('All parameters (surveyId, productId, patientId, file) are required');
  }

  try {
    const { data } = await client.post('/surveys/upload-url', {
      surveyId,
      productId,
      patientId,
      fileName: file.name,
    });

    const { uploadUrl, fileUrl } = data?.data || {};

    if (!uploadUrl || !fileUrl) {
      throw new Error('Upload URL or file URL not received from server');
    }

    // Use axios for the S3 upload instead of fetch
    await axios.put(uploadUrl, file, {
      headers: { 'Content-Type': file.type },
    });

    return fileUrl;
  } catch (err: unknown) {
    let message = 'Unknown error';

    if (err instanceof Error) {
      message = err.message;
    } else if (typeof err === 'string') {
      message = err;
    }
    // 3) Otherwise, try to stringify it
    else {
      try {
        message = JSON.stringify(err);
      } catch {
        // Leave fallback message
      }
    }

    throw new Error(`File upload failed: ${message}`);
  }
}

export async function uploadChatFile({ senderId, file }: ChatUploadParams): Promise<string> {
  if (!senderId || !file) {
    throw new Error('All parameters (senderId, file) are required');
  }

  try {
    const { data } = await client.post('/chat/upload-url', {
      senderId,
      fileName: file.name,
    });

    const { uploadUrl, fileUrl } = data?.data || {};

    if (!uploadUrl || !fileUrl) {
      throw new Error('Upload URL or file URL not received from server');
    }

    // Use axios for the S3 upload instead of fetch
    await axios.put(uploadUrl, file, {
      headers: { 'Content-Type': file.type },
    });

    return fileUrl;
  } catch (err: unknown) {
    let message = 'Unknown error';

    if (err instanceof Error) {
      message = err.message;
    } else if (typeof err === 'string') {
      message = err;
    }
    // 3) Otherwise, try to stringify it
    else {
      try {
        message = JSON.stringify(err);
      } catch {
        // Leave fallback message
      }
    }

    throw new Error(`File upload failed: ${message}`);
  }
}

/**
 * Uploads a file for a survey question and returns the final public URL.
 */

export async function uploadGeneralSurveyFile({ surveyId, file, email }: GeneralUploadParams): Promise<string> {
  if (!surveyId || !file || !email) {
    throw new Error('All parameters (surveyId, file, email) are required');
  }

  try {
    const { data } = await client.post('/surveys/general-survey/upload-url', {
      token: surveyId,
      fileName: file.name,
      email,
    });

    const { uploadUrl, fileUrl } = data?.data || {};

    if (!uploadUrl || !fileUrl) {
      throw new Error('Upload URL or file URL not received from server');
    }

    // Use axios for the S3 upload instead of fetch
    await axios.put(uploadUrl, file, {
      headers: { 'Content-Type': file.type },
    });

    return fileUrl;
  } catch (err: unknown) {
    let message = '';

    if (isAxiosError(err)) {
      message = err.response?.data?.message || 'Failed to upload file';
    } else if ((err as ApiError).data) {
      message = (err as ApiError).data.message || 'Failed to upload file';
    } else {
      message = 'Failed to upload file';
    }

    throw new Error(message);
  }
}
