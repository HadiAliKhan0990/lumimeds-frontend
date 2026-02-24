import { IApprovedRxApiOrder, IApprovedRxInfo } from '../types/approved';

export const transformApiToUI = (apiOrder: IApprovedRxApiOrder): IApprovedRxInfo => {
  return {
    id: apiOrder.uniqueOrderId, 
    uniqueOrderId: apiOrder.uniqueOrderId,
    orderId: apiOrder.orderId,
    prescribed: {
      primary: apiOrder.prescribed.medication,
      treatments: apiOrder.prescribed.treatment.map(t => t.name ? `${t.name} - ${t.dosage}` : t.dosage)
    },
    patientDetails: {
      name: apiOrder.patientDetails.name,
      age: apiOrder.patientDetails.age,
      gender: apiOrder.patientDetails.gender,
      weight: apiOrder.patientDetails.weight,
      bmi: `BMI ${apiOrder.patientDetails.bmi}`,
      location: apiOrder.patientDetails.location,
      id: apiOrder.patientDetails.pid,
    },
    prescriptionInstructions: apiOrder.prescriptionInstructions,
    assignedAt: apiOrder.assignedAt || 'Not assigned',
    rxStatus: {
      status: apiOrder.rxStatus as 'Approved' | 'Sent to Pharmacy',
      approvedBy: apiOrder.approvedBy
    },
    approvalDate: apiOrder.approvalDate
  };
};

export const transformApiResponseToUI = (apiOrders: IApprovedRxApiOrder[]): IApprovedRxInfo[] => {
  return apiOrders.map(transformApiToUI);
};
