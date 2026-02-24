import GeneralSurvey from '@/modules/landing/survey/GeneralSurvey';
import { fetchGeneralSurvey, fetchPatientDataForRenewalSurvey } from '@/services/survey';
import { redirect } from 'next/navigation';
import { SurveyCompleted } from '@/modules/landing/survey/GeneralSurvey/includes/SurveyCompleted';
import { PatientDataForRenewalSurveyResponse } from '@/services/survey/types';
import { getAuth } from '@/lib/tokens';
import { ROUTES } from '@/constants';

export const revalidate = 0;

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    email?: string;
    orderAddress?: string;
    preventClose?: string;
  }>;
}

export default async function Page({ params, searchParams }: Readonly<Props>) {
  const { id } = await params;
  const { email = '', orderAddress, preventClose } = await searchParams;
  const data = await fetchGeneralSurvey(id, { email, preventClose });

  if (!data) {
    return redirect('/');
  }

  const { accessToken } = await getAuth();

  const homeUrl = accessToken ? ROUTES.PATIENT_HOME : ROUTES.HOME;

  const [typePrefix] = id.split('_');

  let patientData: PatientDataForRenewalSurveyResponse['data'] | undefined;

  if (typePrefix === 'REN') {
    patientData = await fetchPatientDataForRenewalSurvey(id);
  }

  const isSurveyCompleted = data.isSurveyCompleted || false;

  // If survey is already completed (regardless of submitted param), show "already completed" message
  if (isSurveyCompleted) {
    return (
      <SurveyCompleted
        homeUrl={homeUrl}
        title='Intake Form Already Submitted!'
        message='You have already submitted your intake form.'
      />
    );
  }

  return (
    <GeneralSurvey
      homeUrl={homeUrl}
      surveyId={id}
      surveyEmail={email}
      data={data}
      orderAddress={orderAddress}
      patientData={patientData}
      preventClose={preventClose !== 'false'} // Default to true (show success), only close if explicitly set to 'false'
    />
  );
}
