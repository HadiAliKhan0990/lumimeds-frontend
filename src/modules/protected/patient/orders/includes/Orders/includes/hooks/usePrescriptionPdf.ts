import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';
import { downloadFileFromBlob } from '@/lib/helper';
import { PatientPrescriptionData } from '../types';
import {
  generatePrescriptionFilename,
  capturePdfGenerationError,
  capturePdfDownloadError,
} from '../utils/prescriptionPdfUtils';

interface UsePrescriptionPdfReturn {
  contentRef: React.RefObject<HTMLDivElement | null>;
  downloadingPdf: boolean;
  handleDownloadPdf: () => Promise<void>;
}

export const usePrescriptionPdf = (
  prescriptionData: PatientPrescriptionData | null
): UsePrescriptionPdfReturn => {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const generatePdfBlob = async (): Promise<Blob> => {
    if (!contentRef.current) {
      const error = new Error('Content ref is not available');
      capturePdfGenerationError(error, prescriptionData);
      throw error;
    }

    try {
      const contentDiv = contentRef.current;

      // Get all child elements to calculate total height
      const allElements = contentDiv.querySelectorAll('*');
      let maxBottom = 0;

      for (const el of allElements) {
        const rect = el.getBoundingClientRect();
        const parentRect = contentDiv.getBoundingClientRect();
        const bottom = rect.bottom - parentRect.top;
        maxBottom = Math.max(maxBottom, bottom);
      }

      // Use the maximum of scrollHeight, offsetHeight, and calculated height
      const contentHeight = Math.max(
        contentDiv.scrollHeight,
        contentDiv.offsetHeight,
        maxBottom,
        contentDiv.getBoundingClientRect().height
      );

      // Capture the original content directly without cloning
      const canvas = await html2canvas(contentDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        width: 850,
        height: contentHeight,
        logging: false,
        windowHeight: contentHeight + 200, // Add extra buffer for window height
        scrollY: -window.scrollY,
        scrollX: -window.scrollX,
      });

      // Create PDF with A4 width but increased height
      const pdf = new jsPDF({
        unit: 'pt',
        format: [595.28, 800], // A4 width (595.28pt) with increased height (800pt)
        orientation: 'portrait',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Calculate scaling to fit content
      const scale = pageWidth / canvas.width;
      const scaledHeight = canvas.height * scale;

      // Calculate number of pages needed
      const totalPages = Math.ceil(scaledHeight / pageHeight);

      for (let i = 0; i < totalPages; i++) {
        if (i > 0) {
          pdf.addPage();
        }

        pdf.addImage(
          canvas.toDataURL('image/jpeg', 1),
          'JPEG',
          0,
          -i * pageHeight,
          pageWidth,
          (canvas.height * pageWidth) / canvas.width
        );
      }

      return pdf.output('blob');
    } catch (err) {
      capturePdfGenerationError(err, prescriptionData);
      throw err;
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setDownloadingPdf(true);
      const pdfBlob = await generatePdfBlob();
      if (pdfBlob) {
        const filename = generatePrescriptionFilename(prescriptionData);
        downloadFileFromBlob(pdfBlob, filename);
      }
    } catch (error) {
      console.error('Failed to download PDF:', error);
      capturePdfDownloadError(error, prescriptionData);
      toast.error('Failed to download PDF. Please try again.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  return {
    contentRef,
    downloadingPdf,
    handleDownloadPdf,
  };
};
