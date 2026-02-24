import ExcelJS from 'exceljs';
import { Prescription } from '@/store/slices/pharmaciesApiSlice';
import { formatProviderName } from '@/lib/utils/providerName';
import { formatUSDateTime } from '@/helpers/dateFormatter';

/**
 * Generates an Excel file from prescription data with formatted headers
 * @param prescriptions - Array of prescription data
 * @returns Promise that resolves to a Blob containing the Excel file
 */
export async function generatePrescriptionsExcel(prescriptions: Prescription[]): Promise<Blob> {
  // Create a new Excel workbook
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Prescriptions');

  // Define column headers
  const headers = [
    'Prescription ID',
    'Patient',
    'Patient Type',
    'Product Name',
    'Signed By',
    'Email',
    'Courier',
    'Status',
    'Tracking ID',
    'Updated At',
  ];

  // Add headers row with bold and center alignment
  const headerRow = worksheet.addRow(headers);
  headerRow.font = { bold: true };
  headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
  headerRow.height = 20;

  // Style header cells
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };
  });

  // Add data rows
  prescriptions.forEach((prescription) => {
    const row = worksheet.addRow([
      prescription.prescriptionId || 'Not generated yet',
      `${prescription.patient.firstName} ${prescription.patient.lastName}`,
      prescription.orderId && prescription.patientid ? 'In-System' : 'Walk-In',
      prescription.productDetails[0]?.drugName || '',
      formatProviderName(prescription.doctor.firstName, prescription.doctor.lastName),
      prescription.patient.email || '',
      prescription.courier?.toUpperCase() || '',
      prescription.status?.split('_')?.join('-')?.toLowerCase() || '',
      prescription.trackingId || '',
      formatUSDateTime(prescription.updatedAt),
    ]);

    // Add borders to data cells
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });
  });

  // Auto-fit column widths
  worksheet.columns.forEach((column) => {
    if (column.header) {
      column.width = Math.max(column.header.length + 2, 15);
    }
  });

  // Generate Excel file buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}
