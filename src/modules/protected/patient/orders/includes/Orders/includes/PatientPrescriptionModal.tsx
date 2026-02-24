'use client';

import { useEffect } from 'react';
import { Modal, ModalProps } from 'react-bootstrap';
import { PatientPrescriptionContent } from './PatientPrescriptionContent';
import { PatientPrescriptionData } from './types';
import { usePrescriptionPdf } from './hooks/usePrescriptionPdf';
import { PrescriptionModalFooter } from './components/PrescriptionModalFooter';

interface Props extends ModalProps {
  prescriptionData: PatientPrescriptionData | null;
}

export const PatientPrescriptionModal = ({ prescriptionData, show, onHide, ...props }: Props) => {
  const { contentRef, downloadingPdf, handleDownloadPdf } = usePrescriptionPdf(prescriptionData);

  useEffect(() => {
    if (show) {
      document.documentElement.style.overflowY = 'hidden';
    }
    return () => {
      document.documentElement.style.overflowY = 'auto';
    };
  }, [show]);

  const handleClose = () => {
    if (onHide) onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} fullscreen backdrop='static' {...props}>
      <div className='min-vh-100 d-flex flex-column bg-light' onClick={(e) => e.stopPropagation()}>
        <div className='flex-grow-1 bg-light d-flex flex-column tw-pb-[100px]'>
          <Modal.Header className='border-0 justify-content-center text-center'>
            <Modal.Title>Prescription</Modal.Title>
          </Modal.Header>
          <div className='flex-grow-1 d-flex flex-column align-items-center p-0 overflow-auto'>
            <div
              ref={contentRef}
              className='position-relative bg-white w-100 shadow-sm my-3 tw-max-w-[850px] tw-mx-auto border rounded-3'
            >
              {prescriptionData && <PatientPrescriptionContent prescriptionData={prescriptionData} />}
            </div>
          </div>
        </div>

        <PrescriptionModalFooter
          onClose={handleClose}
          onDownload={handleDownloadPdf}
          isDownloading={downloadingPdf}
          isDownloadDisabled={!prescriptionData}
        />
    </div>
  </Modal>
  );
};
