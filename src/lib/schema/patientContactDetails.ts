import * as yup from "yup";
import { generalPhoneSchema } from "./pharmacyPatient";

export const contactDetailsSchema = yup.object().shape({
  email: yup.string().email().required(),
  phoneNumber: generalPhoneSchema('Contact Number must be a valid US phone number')
    .required(),
});

export type ContactDetailsSchema = yup.InferType<typeof contactDetailsSchema>;
