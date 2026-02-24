import * as Yup from 'yup';

const calculateAge = (dob: string): number => {
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};

const isAtLeastMinAge = (dob: string, minAge: number): boolean => {
  return calculateAge(dob) >= minAge;
};

const isWithinMaxAge = (dob: string, maxAge: number): boolean => {
  return calculateAge(dob) <= maxAge;
};

export const generalDetailsSchema = Yup.object().shape({
  firstName: Yup.string().min(2, 'First name must be at least 2 characters').required('First name is required'),
  lastName: Yup.string().min(2, 'Last name must be at least 2 characters').required('Last name is required'),
  dob: Yup.string()
    .required('Date of birth is required')
    .test('min-age', 'You must be at least 18 years old', function (value) {
      if (!value) return false;
      return isAtLeastMinAge(value, 18);
    })
    .test('max-age', 'Age must not exceed 100 years', function (value) {
      if (!value) return false;
      return isWithinMaxAge(value, 100);
    }),
  gender: Yup.string()
    .oneOf(['male', 'female', 'other'], 'Gender must be one of: Male, Female, Other')
    .required('Gender is required'),
});

export type PatientGeneralDetailsSchema = Yup.InferType<typeof generalDetailsSchema>;
