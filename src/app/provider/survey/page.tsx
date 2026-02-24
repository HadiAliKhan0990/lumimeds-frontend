import { ProviderIntakeSurvey } from '@/components/ProvidersModule/ProviderIntakeSurvey';
import { acceptProviderSurveyInvitation, fetchProviderSurveyById } from '@/services/providerIntake';
import { Metadata } from 'next';

export const revalidate = 0;

export const metadata: Metadata = {
  robots: 'noindex, nofollow',
};

interface Props {
  searchParams: Promise<{ token?: string; email?: string }>;
}

export default async function Page({ searchParams }: Readonly<Props>) {
  const { email = '', token = '' } = await searchParams;
  const { surveyId: surveyIdFromInvite, message } = await acceptProviderSurveyInvitation(token || '');
  const { questions } = await fetchProviderSurveyById({ email, token, surveyIdFromInvite });
  return (
    <ProviderIntakeSurvey
      email={email}
      token={token}
      message={message}
      questions={questions}
      surveyId={surveyIdFromInvite}
    />
  );
}
