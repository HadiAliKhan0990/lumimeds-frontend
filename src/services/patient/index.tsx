import { fetcher } from '@/lib/fetcher';
import { PatientProfile } from '@/store/slices/patientProfileSlice';
import { PatientProfileResponse } from '@/store/slices/userApiSlice';

export async function getPatientProfile(): Promise<PatientProfile | undefined> {
  try {
    const { data, success } = await fetcher<PatientProfileResponse>('/patients/profile');

    if (success && data) {
      return data;
    }

    return undefined;
  } catch (error) {
    console.log('Failed to fetch patient profile:', error);
    return undefined;
  }
}
