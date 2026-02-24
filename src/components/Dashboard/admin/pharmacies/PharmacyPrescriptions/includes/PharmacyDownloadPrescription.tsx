import toast from 'react-hot-toast';
import { Prescription, useLazyGetPrescriptionFileUrlQuery } from '@/store/slices/pharmaciesApiSlice';
import { MouseEvent } from 'react';
import { isAxiosError } from 'axios';
import { Error } from '@/lib/types';

interface Props {
  prescription: Prescription;
}

export const PharmacyDownloadPrescription = ({ prescription }: Readonly<Props>) => {
  const [getPrescriptionFileUrl, { isLoading }] = useLazyGetPrescriptionFileUrlQuery();

  const handleDownloadFromUrl = async (url: string, fileName: string) => {
    try {
      // Fetch the file as a blob first
      const response = await fetch(url);
      const blob = await response.blob();

      // Create a blob URL and download
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the blob URL
      window.URL.revokeObjectURL(blobUrl);

      toast.success('PDF download started!');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Error downloading PDF file. Please try again.');
    }
  };

  const handleDownload = async (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    try {
      const { success, data, message } = await getPrescriptionFileUrl(prescription.id).unwrap();
      if (success && data?.url) {
        const fileName = `prescription-${prescription.patient.firstName ?? ''} ${
          prescription.patient.lastName ?? ''
        }.pdf`;
        await handleDownloadFromUrl(data.url, fileName);
      } else {
        toast.error(message || 'No prescription file URL found');
      }
    } catch (error) {
      toast.error(
        isAxiosError(error)
          ? error.response?.data.message
          : (error as Error).data.message || 'Error fetching prescription file. Please try again.'
      );
    }
  };

  return prescription?.hasFile ? (
    <button
      disabled={isLoading}
      type='button'
      key={prescription.id}
      className='btn btn-link p-0 text-sm tw-text-nowrap'
      onClick={handleDownload}
    >
      Download
    </button>
  ) : (
    <span>-</span>
  );
};
