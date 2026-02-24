'use client';

import InvoicePDF from '@/modules/protected/patient/orders/includes/Invoices/includes/InvoicePDF';
import Image from 'next/image';
import Logo from '@/assets/logo.svg';
import Link from 'next/link';
import { useRef } from 'react';
import { Card } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import { IoArrowBack } from 'react-icons/io5';
import { useGetInvoiceByIdQuery } from '@/store/slices/invoicesApiSlice';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { useReactToPrint } from 'react-to-print';
import { LuDownload } from 'react-icons/lu';
import { PiPrinterLight } from 'react-icons/pi';
import { ROUTES } from '@/constants';
import { formatUSDate, formatUSDateTime } from '@/helpers/dateFormatter';
import '@/styles/SingleInvoice.css';

interface Props {
  invoiceId: string;
}

export default function SingleInvoice({ invoiceId }: Props) {
  const invoiceRef = useRef(null);
  const router = useRouter();
  const { data: invoice } = useGetInvoiceByIdQuery(invoiceId);

  const handlePrint = useReactToPrint({
    contentRef: invoiceRef,
    documentTitle: `Invoice-${invoice?.invoiceNumber || invoiceId}`,
  });

  return (
    <div style={{ background: '#FCFBF6', minHeight: '100vh' }} className='invoice-container'>
      <div className='invoice-actions-container'>
        {invoice && (
          <PDFDownloadLink
            document={<InvoicePDF invoice={invoice} />}
            fileName={`Invoice-${invoice.invoiceNumber || invoiceId}.pdf`}
          >
            {({ loading }) => (
              <button disabled={loading} className='invoice-action-btn'>
                <LuDownload className='invoice-action-icon' />
                <span className='invoice-action-text'>{loading ? 'Generating...' : 'Download'}</span>
                <span className='invoice-action-text-full'>{loading ? 'Generating PDF...' : 'Download Invoice'}</span>
              </button>
            )}
          </PDFDownloadLink>
        )}
        <button onClick={handlePrint} className='invoice-action-btn invoice-action-btn-outline'>
          <PiPrinterLight className='invoice-action-icon' />
          <span className='invoice-action-text'>Print</span>
          <span className='invoice-action-text-full'>Print Invoice</span>
        </button>
      </div>

      <div ref={invoiceRef}>
        {/* Invoice Card Section */}
        <Card className='invoice-card'>
          <div className='invoice-header-bg'>
            <div className='invoice-header-row'>
              <div className='invoice-header-left'>
                <div className='invoice-header-title-row'>
                  <IoArrowBack
                    size={28}
                    className='invoice-back-btn hide-on-print'
                    onClick={() => router.push('/patient/orders?tab=invoices')}
                  />
                  <span className='invoice-header-title'>Order ID: #{invoice?.invoiceNumber || ''}</span>
                  {invoice && (
                    <span
                      className={`invoice-status-badge${
                        invoice?.status === 'Past_Due' ? ' invoice-status-badge-warning' : ''
                      }`}
                    >
                      {invoice?.status || 'Paid'}
                    </span>
                  )}
                </div>
              </div>
              {invoice && <div className='invoice-header-date'>{formatUSDateTime(invoice?.createdAt)}</div>}
            </div>
          </div>

          <Card.Body className='invoice-card-body'>
            <div className='invoice-logo-section'>
              <div className='invoice-logo-container'>
                <Image src={Logo} alt='LumiMeds Logo' width={165} height={28} priority />
              </div>
              <div className='invoice-thankyou'>Thank you for your purchase!</div>
            </div>

            {/* Invoice Info Table - Mobile Responsive */}
            <div className='invoice-info-section'>
              <div className='invoice-info-row'>
                <span className='invoice-info-label'>Invoice number</span>
                <span className='invoice-info-value'>#{invoice?.invoiceNumber || '-'}</span>
              </div>
              <div className='invoice-info-row'>
                <span className='invoice-info-label'>Date issued</span>
                <span className='invoice-info-value'>{formatUSDate(invoice?.invoiceCreationDate)}</span>
              </div>
              {invoice?.status === 'Past_Due' ? (
                <div className='invoice-info-row'>
                  <span className='invoice-info-label'>Due Date</span>
                  <span className='invoice-info-value'>{formatUSDate(invoice?.dueDate)}</span>
                </div>
              ) : (
                <div className='invoice-info-row'>
                  <span className='invoice-info-label'>Date paid</span>
                  <span className='invoice-info-value'>{formatUSDate(invoice?.paymentDate)}</span>
                </div>
              )}
              {invoice?.status !== 'Past_Due' && (
                <div className='invoice-info-row'>
                  <span className='invoice-info-label'>Paid with</span>
                  <span className='invoice-info-value'>{invoice?.paidWith || '-'}</span>
                </div>
              )}
              <div className='invoice-info-row'>
                <span className='invoice-info-label'>Bill to</span>
                <span className='invoice-info-value'>
                  {invoice?.patient?.firstName} {invoice?.patient?.lastName}
                </span>
              </div>
            </div>

            {/* Line Items Section - Mobile Responsive */}
            <div className='invoice-line-items'>
              <div className='invoice-line-header'>
                <div className='invoice-line-col-desc'>Description</div>
                <div className='invoice-line-col-qty'>Qty</div>
                <div className='invoice-line-col-amount'>Amount</div>
              </div>
              <div className='invoice-line-item'>
                <div className='invoice-line-col-desc'>
                  <div className='invoice-item-title'>{invoice?.description || '-'}</div>
                  <div className='invoice-item-period'>
                    ({formatUSDate(invoice?.billingPeriodStartDate)} - {formatUSDate(invoice?.billingPeriodEndDate)})
                  </div>
                </div>
                <div className='invoice-line-col-qty'>1</div>
                <div className='invoice-line-col-amount'>
                  {invoice?.subtotal !== undefined && invoice?.subtotal !== null
                    ? `$${Number(invoice.subtotal).toFixed(2)}`
                    : '-'}
                </div>
              </div>
            </div>

            {/* Summary Section - Mobile Responsive */}
            <div className='invoice-summary-section'>
              <div className='invoice-summary-table'>
                <div className='invoice-summary-row'>
                  <span className='invoice-summary-label'>Subtotal</span>
                  <span className='invoice-summary-value'>
                    {invoice?.subtotal ? `$${Number(invoice.subtotal).toFixed(2)}` : '-'}
                  </span>
                </div>
                <div className='invoice-summary-row'>
                  <span className='invoice-summary-label'>Discounts</span>
                  <span className='invoice-summary-value'>
                    {invoice?.discountAmount && Number(invoice.discountAmount) > 0
                      ? `-$${Number(invoice.discountAmount).toFixed(2)}`
                      : '$0.00'}
                  </span>
                </div>
                <div className='invoice-summary-row'>
                  <span className='invoice-summary-label'>Taxes</span>
                  <span className='invoice-summary-value'>$0.00</span>
                </div>
                <div className='invoice-summary-row'>
                  <span className='invoice-summary-label'>Applied Balance</span>
                  <span className='invoice-summary-value'>$0.00</span>
                </div>
                <div className='invoice-summary-row invoice-summary-total'>
                  <span className='invoice-summary-label'>Total</span>
                  <span className='invoice-summary-value'>
                    {invoice?.subtotal && invoice?.discountAmount
                      ? `$${(Number(invoice.subtotal) - Number(invoice.discountAmount)).toFixed(2)}`
                      : invoice?.subtotal
                      ? `$${Number(invoice.subtotal).toFixed(2)}`
                      : '-'}
                  </span>
                </div>
                {invoice && (
                  <div className='invoice-summary-row invoice-summary-paid'>
                    <span className='invoice-summary-label'>Paid</span>
                    <span className='invoice-summary-value'>
                      {invoice?.amountPaid !== undefined ? `$${Number(invoice.amountPaid).toFixed(2)}` : '-'}
                    </span>
                  </div>
                )}
                <div className='invoice-summary-row invoice-summary-due'>
                  <span className='invoice-summary-label'>Amount Due</span>
                  <span className='invoice-summary-value'>
                    {invoice?.subtotal && invoice?.discountAmount
                      ? `$${(
                          Number(invoice.subtotal) -
                          Number(invoice.discountAmount) -
                          Number(invoice.amountPaid || 0)
                        ).toFixed(2)}`
                      : invoice?.subtotal && invoice?.amountPaid !== undefined
                      ? `$${(Number(invoice.subtotal) - Number(invoice.amountPaid)).toFixed(2)}`
                      : '$0.00'}
                  </span>
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>

        <div className='invoice-help hide-on-print'>
          Do you need help?{' '}
          <Link href={ROUTES.PATIENT_SUPPORT} className='text-primary'>
            Contact our care team.
          </Link>
        </div>
      </div>
    </div>
  );
}
