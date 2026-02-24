import * as Yup from 'yup';


export const passwordUpdateSchema = Yup.object({
  newPassword: Yup.string()
    .required('New password is required')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/,
      'Password must contain at least one lowercase letter, one uppercase letter, and one special character'
    ),

  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Passwords must match')
    .required('Please confirm your new password'),
});