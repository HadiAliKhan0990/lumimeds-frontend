import * as yup from "yup";

export const medicationBodySchema = yup.object().shape({
	description: yup
		.string()
		.required("Product Description is required")
		.max(255, "Product Description must be less than 255 characters"),
	weeklyDosage: yup
		.number()
		.required("Weekly Dosage is required")
		.typeError("Please enter a valid number")
		.positive("Weekly Dosage should be greater than zero")
		.max(3, "Weekly Dosage must be less than 3 characters"),

	monthlyDosage: yup
		.number()
		.required("Monthly Dosage is required")
		.typeError("Please enter a valid number")
		.positive("Weekly Dosage should be greater than zero")
		.max(3, "Monthly Dosage must be less than 3 characters")
		.test(
			"greater-than-weekly",
			"Monthly dosage should be greater than weekly dosage",
			function (value) {
				return value > this.parent.weeklyDosage;
			}
		),
	productTypeId: yup.string().required("Product Type is required"),
	pharmacyId: yup.string().required("Pharmacy is required"),
});

export type MedicationBodySchema = yup.InferType<typeof medicationBodySchema>;
