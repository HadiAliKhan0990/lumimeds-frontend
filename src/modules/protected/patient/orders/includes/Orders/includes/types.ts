export interface PatientPrescriptionData {
  patient: {
    firstName: string;
    lastName: string;
    dob: string;
    gender: string;
    email: string;
    phone: string;
    allergies: string;
    medicationList: string;
    address: {
      billing: {
        street: string;
        street2?: string;
        city: string;
        state: string;
        zip: string;
      };
      shipping: {
        street: string;
        street2?: string;
        city: string;
        state: string;
        zip: string;
      };
    };
  } | null;
  products: Array<{
    productName: string;
    totalQuantity: string | number;
    dateWritten: string;
    productForm: string;
    docNotes: string;
    directions: string;
    route?: string;
    drugStrength?: string;
  }>;
  shipping: {
    courier: string | null;
    trackingNumber: string | null;
    status: string | null;
  };
  physician: {
    name: string;
    npi: string;
  } | null;
}
