'use client';

import React, { useEffect, useState } from 'react';
import { Modal, Button, Spinner } from 'react-bootstrap';
import { FiDownload } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { PDFPreviewModal } from '@/components/Dashboard/PDFPreviewModal';
import jsPDF from 'jspdf';
import { downloadFileFromBlob } from '@/lib/helper';

interface EncounterDetailsModalProps {
  show: boolean;
  onHide: () => void;
  encounter: {
    id: string;
    medication: string;
    date: string;
    directions: string;
    notes: string;
    prescriber: string;
    status: string;
    orderId: string;
    rxNumber?: string;
    quantity?: number;
    refills?: number;
    vials?: string;
    productName?: string;
    concentration?: string;
    createdAt?: string;
    dateWritten?: string;
    file?: string;
  } | null;
}

export const EncounterDetailsModal: React.FC<EncounterDetailsModalProps> = ({ show, onHide, encounter }) => {
  // Helper function to format text with proper line breaks for bullets
  const formatTextWithBullets = (text: string) => {
    if (!text) return text;
    // Ensure bullet points start on new line without adding extra bullets
    return text
      .replace(/\n\s*•/g, '\n•') // Ensure bullets start on new line
      .replace(/\n\s*-\s*/g, '\n- ') // Ensure dashes start on new line
      .replace(/\n\s*\*\s*/g, '\n* '); // Ensure asterisks start on new line
  };

  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isFetchingPreview, setIsFetchingPreview] = useState(false);

  // Build a simple PDF from encounter data (FE-only, no backend URL needed)
  const buildPdfBlob = async () => {
    const doc = new jsPDF({ unit: 'pt' });
    const margin = 32;
    let y = 40;

    const addSection = (title: string, lines: string[]) => {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(title, margin, y);
      y += 18;
      doc.setFont('helvetica', 'normal');
      lines.forEach((line) => {
        const split = doc.splitTextToSize(line || 'N/A', 530);
        doc.text(split, margin, y);
        y += 16 * (split.length || 1);
      });
      y += 6;
    };

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Prescription Summary', margin, y);
    y += 24;

    addSection('Medication', [encounter?.medication || 'N/A']);
    addSection('RX Number', [encounter?.rxNumber || 'N/A']);
    addSection('Status', [encounter?.status || 'N/A']);
    addSection('Prescriber', [encounter?.prescriber || 'N/A']);
    addSection('Created', [
      encounter?.createdAt ? new Date(encounter?.createdAt).toLocaleString() : encounter?.date || 'N/A',
    ]);
    addSection('Date Written', [encounter?.dateWritten ? new Date(encounter?.dateWritten).toLocaleString() : 'N/A']);
    addSection('Quantity / Refills / Vials / Concentration', [
      `Quantity: ${encounter?.quantity ?? 'N/A'}`,
      `Refills: ${encounter?.refills ?? 'N/A'}`,
      `Vials: ${encounter?.vials ?? 'N/A'}`,
      `Concentration: ${encounter?.concentration ?? 'N/A'}`,
    ]);
    addSection('Directions', [encounter?.directions || 'N/A']);
    addSection("Doctor's Note", [encounter?.notes || 'N/A']);

    return doc.output('blob');
  };

  const handlePreview = async () => {
    setIsFetchingPreview(true);
    try {
      const pdfBlob = await buildPdfBlob();
      const url = window.URL.createObjectURL(pdfBlob);
      if (pdfUrl) window.URL.revokeObjectURL(pdfUrl);
      setPdfUrl(url);
      setPdfPreviewOpen(true);
    } catch (error) {
      console.error('Error building prescription PDF:', error);
      toast.error('Unable to build prescription PDF. Please try again.');
    } finally {
      setIsFetchingPreview(false);
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const fileName = `prescription-${encounter?.rxNumber || 'document'}.pdf`;
      const pdfBlob = await buildPdfBlob();
      downloadFileFromBlob(pdfBlob, fileName);
    } catch (error) {
      console.error('Error generating prescription PDF:', error);
      toast.error('Error generating prescription PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    if (!show) {
      setPdfPreviewOpen(false);
      setPdfUrl('');
    }
  }, [show]);

  if (!encounter) return null;

  return (
    <>
      <Modal show={show} onHide={onHide} size='lg' centered>
        <Modal.Header className='tw-border-b tw-border-gray-200 tw-flex tw-flex-col sm:tw-flex-row tw-justify-between !tw-items-start sm:tw-items-center tw-gap-2 sm:tw-gap-0'>
          <Modal.Title className='tw-text-xl tw-font-semibold tw-text-gray-800'>Prescription Details</Modal.Title>
          <div className='d-flex align-items-center gap-2 tw-justify-end sm:tw-justify-start tw-w-full sm:tw-w-auto'>
            <button
              onClick={handlePreview}
              disabled={isFetchingPreview || isDownloading}
              className='btn btn-outline-secondary btn-sm d-flex align-items-center gap-2'
              type='button'
            >
              {isFetchingPreview ? <Spinner size='sm' animation='border' /> : null}
              <span>Preview</span>
            </button>
            <button
              onClick={handleDownload}
              disabled={isDownloading || isFetchingPreview}
              className='btn btn-outline-primary btn-sm d-flex align-items-center gap-2'
              type='button'
            >
              {isDownloading ? <Spinner size='sm' animation='border' /> : <FiDownload size={14} />}
              <span>{isDownloading ? 'Downloading...' : 'Download PDF'}</span>
            </button>
          </div>
        </Modal.Header>

        <Modal.Body className='tw-p-6'>
          <div className=''>
            <div className='row gy-3'>
              <div className='col-12'>
                <div className='row g-4'>
                  {/* Left Column */}
                  <div className='col-lg-6'>
                    <div className='row text-xs align-items-center gy-3'>
                      <div className='col-6 text-placeholder'>RX Number</div>
                      <div className='col-6'>
                        {encounter.rxNumber && encounter.rxNumber !== '' ? encounter.rxNumber : 'N/A'}
                      </div>

                      <div className='col-6 text-placeholder'>Quantity</div>
                      <div className='col-6'>
                        {encounter.quantity !== undefined && encounter.quantity !== null ? encounter.quantity : 'N/A'}
                      </div>

                      <div className='col-6 text-placeholder'>Refills</div>
                      <div className='col-6'>
                        {encounter.refills !== undefined && encounter.refills !== null ? encounter.refills : 'N/A'}
                      </div>

                      <div className='col-6 text-placeholder'>Vials</div>
                      <div className='col-6'>{encounter.vials && encounter.vials !== '' ? encounter.vials : 'N/A'}</div>

                      <div className='col-6 text-placeholder'>Doctor&apos;s Note</div>
                      <div style={{ whiteSpace: 'pre-line' }}>
                        {encounter.notes && encounter.notes !== '' ? formatTextWithBullets(encounter.notes) : 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className='col-lg-6'>
                    <div className=''>
                      <div className='row text-xs gy-2'>
                        <div className='col-6 text-placeholder'>Product Name</div>
                        <div className='col-6'>{encounter.productName || encounter.medication || 'N/A'}</div>

                        <div className='col-6 text-placeholder'>Concentration</div>
                        <div className='col-6'>{encounter.concentration && encounter.concentration !== '' ? encounter.concentration : 'N/A'}</div>

                        <div className='col-6 text-placeholder'>Created At</div>
                        <div className='col-6'>
                          {encounter.createdAt
                            ? new Date(encounter.createdAt).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true,
                            })
                            : encounter.date || 'N/A'}
                        </div>

                        <div className='col-6 text-placeholder'>Date Written</div>
                        <div className='col-6'>
                          {encounter.dateWritten && encounter.dateWritten !== ''
                            ? new Date(encounter.dateWritten).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true,
                            })
                            : 'N/A'}
                        </div>

                        <div className='col-6 text-placeholder'>Directions</div>
                        <div className='col-6' style={{ whiteSpace: 'pre-line' }}>
                          {encounter.directions && encounter.directions !== ''
                            ? formatTextWithBullets(encounter.directions)
                            : 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* File Attachment Section */}
          </div>
        </Modal.Body>

        <Modal.Footer className='tw-border-t tw-border-gray-200 tw-bg-gray-50'>
          <Button variant='secondary' onClick={onHide} className='tw-px-6 tw-py-2'>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <PDFPreviewModal open={pdfPreviewOpen} setOpen={setPdfPreviewOpen} url={pdfUrl} />
    </>
  );
};

export default EncounterDetailsModal;
