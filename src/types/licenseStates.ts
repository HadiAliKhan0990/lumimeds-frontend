import { Response } from '@/lib/types';

export interface UploadLicenseStatesResponse extends Response {
  data?: {
    processedCount?: number;
  } | null;
}

export type UploadLicenseStatesPayload = {
  data: FormData;
  providerId: string;
};
