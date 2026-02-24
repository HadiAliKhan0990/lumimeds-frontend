import * as Sentry from '@sentry/nextjs';
import { PatientPrescriptionData } from '../types';

/**
 * Generates a filename for the prescription PDF
 */
export const generatePrescriptionFilename = (
  prescriptionData: PatientPrescriptionData | null
): string => {
  if (!prescriptionData?.patient) return 'Prescription.pdf';
  
  const patientName = `${prescriptionData.patient.firstName}_${prescriptionData.patient.lastName}`.replace(
    /[^a-zA-Z0-9_]/g,
    ''
  );
  const currentDate = new Date().toISOString().split('T')[0];
  return `Prescription_${patientName}_${currentDate}.pdf`;
};

/**
 * Captures PDF generation errors in Sentry with context
 */
export const capturePdfGenerationError = (
  error: unknown,
  prescriptionData: PatientPrescriptionData | null
): void => {
  Sentry.captureException(error instanceof Error ? error : new Error(String(error)), {
    tags: {
      component: 'PatientPrescriptionModal',
      action: 'generatePdf',
    },
    contexts: {
      prescription: {
        hasData: !!prescriptionData,
        hasPatient: !!prescriptionData?.patient,
        patientEmail: prescriptionData?.patient?.email || null,
        productsCount: prescriptionData?.products?.length || 0,
      },
      error: {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
    },
    level: 'error',
  });
};

/**
 * Captures PDF download errors in Sentry with context
 */
export const capturePdfDownloadError = (
  error: unknown,
  prescriptionData: PatientPrescriptionData | null
): void => {
  Sentry.captureException(error instanceof Error ? error : new Error(String(error)), {
    tags: {
      component: 'PatientPrescriptionModal',
      action: 'downloadPdf',
    },
    contexts: {
      prescription: {
        hasData: !!prescriptionData,
        hasPatient: !!prescriptionData?.patient,
        patientEmail: prescriptionData?.patient?.email || null,
        productsCount: prescriptionData?.products?.length || 0,
      },
      error: {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
    },
    level: 'error',
  });
};
