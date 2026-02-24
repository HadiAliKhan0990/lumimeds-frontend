'use client';

import InvoicePDF from '@/modules/protected/patient/orders/includes/Invoices/includes/InvoicePDF';
import Image from 'next/image';
import Logo from '@/assets/logo.svg';
import { Invoice } from '@/store/slices/invoiceSlice';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { Button, Card, Modal, ModalProps } from 'react-bootstrap';
import { LuDownload } from 'react-icons/lu';
import { PiPrinterLight } from 'react-icons/pi';
import { useReactToPrint } from 'react-to-print';
import { useRef } from 'react';
import { formatUSDate, formatUSDateTime } from '@/helpers/dateFormatter';

interface Props extends ModalProps {
  selectedInvoice: Invoice | null;
  modalAction: 'print' | 'download' | null;
}

export const InvoicePreviewModal = ({ selectedInvoice, modalAction, show, onHide }: Props) => {
  const invoiceRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef: invoiceRef,
    documentTitle: selectedInvoice ? `Invoice-${selectedInvoice.invoiceNumber}` : 'Invoice',
  });
  return (
    <Modal show={show} onHide={onHide} size='lg' centered dialogClassName='rounded-modal'>
      <Modal.Body>
        {selectedInvoice && (
          <>
            <div
              className='invoice-header-actions'
              style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: 8 }}
            >
              {modalAction === 'download' && (
                <PDFDownloadLink
                  document={<InvoicePDF invoice={selectedInvoice} />}
                  fileName={`Invoice-${selectedInvoice.invoiceNumber}.pdf`}
                >
                  {({ loading }) => (
                    <Button
                      variant='primary'
                      size='sm'
                      disabled={loading}
                      className='invoice-action-btn-modal d-flex align-items-center gap-2 hide-on-print'
                    >
                      <LuDownload size={18} />
                      {loading ? 'Generating PDF...' : 'Download PDF'}
                    </Button>
                  )}
                </PDFDownloadLink>
              )}
              {modalAction === 'print' && (
                <Button
                  variant='primary'
                  size='sm'
                  onClick={handlePrint}
                  className='invoice-action-btn-modal d-flex align-items-center gap-2 hide-on-print'
                >
                  <PiPrinterLight size={18} />
                  Print PDF
                </Button>
              )}
              <button
                type='button'
                className='btn-close ms-2 shadow-none invoice-modal-close-btn hide-on-print'
                onClick={onHide}
              />
            </div>
            <div ref={invoiceRef}>
              <Card className='invoice-card mt-4 mb-4'>
                <Card.Body className='p-4'>
                  <div className='invoice-header-bg w-100 invoice-header-bg-border-none'>
                    <div className='invoice-header-row'>
                      <div className='invoice-header-left'>
                        <div>
                          <div className='invoice-header-title invoice-header-title-flex'>
                            <span className=''>Order ID:</span>{' '}
                            <span className='fw-normal'>#{selectedInvoice.invoiceNumber || ''}</span>
                            <span
                              className={`invoice-status-badge${
                                selectedInvoice.status === 'Past_Due' ? ' invoice-status-badge-warning' : ''
                              }`}
                            >
                              {selectedInvoice.status || 'Paid'}
                            </span>
                          </div>
                          <div className='invoice-header-date'>
                            {formatUSDateTime(selectedInvoice.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='text-center mb-4'>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <Image src={Logo} alt='LumiMeds Logo' width={165} height={28} priority />
                    </div>
                    <div className='fw-semibold text-lg mt-4 pt-2'>Thank you for your purchase!</div>
                  </div>
                  <table className='w-100 invoice-info-table mb-4'>
                    <tbody>
                      <tr>
                        <td className='text-nowrap fw-semibold'>Invoice number</td>
                        <td className='invoice-info-value'>#{selectedInvoice.invoiceNumber || '-'}</td>
                      </tr>
                      <tr>
                        <td className='text-nowrap fw-semibold'>Date issued</td>
                        <td className='invoice-info-value'>{formatUSDate(selectedInvoice.invoiceCreationDate)}</td>
                      </tr>
                      {selectedInvoice.status === 'Past_Due' ? (
                        <tr>
                          <td className='text-nowrap fw-semibold'>Due Date</td>
                          <td className='invoice-info-value'>{formatUSDate(selectedInvoice.dueDate)}</td>
                        </tr>
                      ) : (
                        <tr>
                          <td className='text-nowrap fw-semibold'>Date paid</td>
                          <td className='invoice-info-value'>{formatUSDate(selectedInvoice.paymentDate)}</td>
                        </tr>
                      )}
                      {selectedInvoice.status !== 'Past_Due' && (
                        <tr>
                          <td className='text-nowrap fw-semibold'>Paid with</td>
                          <td className='invoice-info-value'>{selectedInvoice.paidWith || '-'}</td>
                        </tr>
                      )}
                      <tr>
                        <td className='text-nowrap fw-semibold'>Bill to</td>
                        <td className='invoice-info-value'>
                          {selectedInvoice.patient?.firstName} {selectedInvoice.patient?.lastName}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div className='row invoice-line-header mb-2' style={{ borderBottom: '2px solid #222' }}>
                    <div className='col-6'>Description</div>
                    <div className='col-3'>Qty</div>
                    <div className='col-3 text-end'>Amount</div>
                  </div>
                  <div className='row mb-4'>
                    <div className='col-6'>
                      <div className='fw-bold'>{selectedInvoice.description || '-'}</div>
                      <div className='text-muted small'>
                        ({formatUSDate(selectedInvoice.billingPeriodStartDate)} -{' '}
                        {formatUSDate(selectedInvoice.billingPeriodEndDate)})
                      </div>
                    </div>
                    <div className='col-3'>1</div>
                    <div className='col-3 text-end'>
                      {selectedInvoice.subtotal !== undefined && selectedInvoice.subtotal !== null
                        ? `$${Number(selectedInvoice.subtotal).toFixed(2)}`
                        : '-'}
                    </div>
                  </div>
                  <div className='row justify-content-end'>
                    <div className='col-12 col-sm-6'>
                      <table className='table invoice-summary-table mb-0'>
                        <tbody>
                          <tr>
                            <td>Subtotal</td>
                            <td className='text-end tw-whitespace-nowrap'>
                              {selectedInvoice.subtotal !== undefined && selectedInvoice.subtotal !== null
                                ? `$${Number(selectedInvoice.subtotal).toFixed(2)}`
                                : '-'}
                            </td>
                          </tr>
                          <tr>
                            <td>Discounts</td>
                            <td className='text-end tw-whitespace-nowrap'>
                              {selectedInvoice.discountAmount && Number(selectedInvoice.discountAmount) > 0
                                ? `-$${Number(selectedInvoice.discountAmount).toFixed(2)}`
                                : '$0.00'}
                            </td>
                          </tr>
                          <tr>
                            <td>Taxes</td>
                            <td className='text-end'>$0.00</td>
                          </tr>
                          <tr>
                            <td>Applied Balance</td>
                            <td className='text-end'>$0.00</td>
                          </tr>
                          <tr className='fw-bold total-row'>
                            <td>Total</td>
                            <td className='text-end tw-whitespace-nowrap'>
                              {selectedInvoice.subtotal !== undefined && selectedInvoice.subtotal !== null
                                ? `$${(
                                    Number(selectedInvoice.subtotal) - Number(selectedInvoice.discountAmount || 0)
                                  ).toFixed(2)}`
                                : '-'}
                            </td>
                          </tr>
                          {selectedInvoice && selectedInvoice.status !== 'Past_Due' && (
                            <tr className='fw-bold paid-row'>
                              <td>Paid</td>
                              <td className='text-end tw-whitespace-nowrap'>
                                {selectedInvoice.amountPaid !== undefined && selectedInvoice.amountPaid !== null
                                  ? `$${Number(selectedInvoice.amountPaid).toFixed(2)}`
                                  : '-'}
                              </td>
                            </tr>
                          )}
                          <tr className='fw-bold'>
                            <td>Amount Due</td>
                            <td className='text-end tw-whitespace-nowrap'>
                              {selectedInvoice.subtotal !== undefined && selectedInvoice.subtotal !== null
                                ? `$${(
                                    Number(selectedInvoice.subtotal) -
                                    Number(selectedInvoice.discountAmount || 0) -
                                    Number(selectedInvoice.amountPaid || 0)
                                  ).toFixed(2)}`
                                : '$0.00'}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </div>
          </>
        )}
      </Modal.Body>
    </Modal>
  );
};
