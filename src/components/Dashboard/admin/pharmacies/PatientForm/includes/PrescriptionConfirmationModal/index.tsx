'use client';

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { PatientFormValues } from '@/lib/schema/pharmacyPatient';
import { useEffect, useRef, useState } from 'react';
import { Button, Modal, ModalProps, Spinner } from 'react-bootstrap';
import { useFormikContext } from 'formik';
import { PrescrioptionConfirmationContent } from './includes/PrescrioptionConfirmationContent';
import { downloadFileFromBlob } from '@/lib/helper';
import { FiDownload } from 'react-icons/fi';

interface Props extends ModalProps {
  onPdfGenerated?: (pdfBlob: Blob) => void;
  isLoading?: boolean;
}

export const PrescriptionConfirmationModal = ({ isLoading, onPdfGenerated, show, ...props }: Props) => {
  const contentRef = useRef<HTMLDivElement>(null);

  const { submitForm, values } = useFormikContext<PatientFormValues>();

  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const generatePdfFilename = () => {
    const patientName = `${values.firstName}_${values.lastName}`.replace(/[^a-zA-Z0-9_]/g, '');
    const currentDate = new Date().toISOString().split('T')[0];
    return `Prescription_${patientName}_${currentDate}.pdf`;
  };

  const handleGeneratePdf = async () => {
    if (!contentRef.current) return;
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
        logging: true,
        windowHeight: contentHeight + 200, // Add extra buffer for window height
        scrollY: -window.scrollY,
        scrollX: -window.scrollX,
      });

      // Create PDF with A4 width but increased height
      const pdf = new jsPDF({
        unit: 'pt',
        format: [595.28, 1200], // A4 width (595.28pt) with increased height (1200pt)
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

        // Calculate source and destination dimensions
        // const srcY = (i * pageHeight) / scale;
        // const srcHeight = Math.min(pageHeight / scale, canvas.height - srcY);
        // const destHeight = srcHeight * scale;

        pdf.addImage(
          canvas.toDataURL('image/jpeg', 1),
          'JPEG',
          0,
          -i * pageHeight,
          pageWidth,
          (canvas.height * pageWidth) / canvas.width
        );
      }

      const pdfBlob = pdf.output('blob');
      if (onPdfGenerated) onPdfGenerated(pdfBlob);
      return pdfBlob;
    } catch (err) {
      console.error('PDF generation failed', err);
      throw err;
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setDownloadingPdf(true);
      const pdfBlob = await handleGeneratePdf();
      if (pdfBlob) {
        const filename = generatePdfFilename();
        downloadFileFromBlob(pdfBlob, filename);
      }
    } catch (error) {
      console.error('Failed to download PDF:', error);
    } finally {
      setDownloadingPdf(false);
    }
  };

  useEffect(() => {
    if (show) {
      handleGeneratePdf();
      document.documentElement.style.overflowY = 'hidden';
    }
    return () => {
      document.documentElement.style.overflowY = 'auto';
    };
  }, [show]);

  return (
    <Modal show={show} {...props} {...(isLoading && { backdrop: 'static', keyboard: false })} fullscreen>
      <div className='min-vh-100 d-flex flex-column bg-light'>
        <div className='flex-grow-1 bg-light d-flex flex-column tw-pb-[100px]'>
          <Modal.Header className='border-0 justify-content-center text-center'>
            <Modal.Title>Electronic Prescription</Modal.Title>
          </Modal.Header>
          <div className='flex-grow-1 d-flex flex-column align-items-center p-0 overflow-auto'>
            <div
              ref={contentRef}
              className='position-relative bg-white w-100 shadow-sm my-3 tw-max-w-[850px] tw-mx-auto border rounded-3'
            >
              <PrescrioptionConfirmationContent />
            </div>
          </div>
        </div>

        <div className='position-fixed bottom-0 start-0 end-0 bg-light py-3 tw-border-t tw-border-gray-300 tw-z-[1050]'>
          <div className='d-flex justify-content-center gap-2'>
            <Button
              className='d-flex align-items-center justify-content-center gap-2 px-3'
              variant='outline-primary'
              onClick={props.onHide}
              disabled={isLoading}
            >
              Close
            </Button>

            <Button
              className='d-flex align-items-center justify-content-center gap-2 px-3'
              variant='primary'
              type='submit'
              onClick={submitForm}
              disabled={isLoading}
            >
              {isLoading && <Spinner className='border-2' size='sm' />}
              Submit
            </Button>

            <Button
              className='d-flex align-items-center justify-content-center gap-2 px-3'
              variant='outline-primary'
              onClick={handleDownloadPdf}
              disabled={isLoading || downloadingPdf}
            >
              {downloadingPdf ? <Spinner className='border-2' size='sm' /> : <FiDownload size={16} />}
              Download PDF
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
