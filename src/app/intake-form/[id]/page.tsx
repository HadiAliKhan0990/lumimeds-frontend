import IntakeForm from '@/modules/landing/survey/IntakeForm';
import { fetchSurveyFromProductList } from '@/services/survey';
import { IntakeFormSearchParams } from '@/services/survey/types';
import { SurveyCompleted } from '@/modules/landing/survey/GeneralSurvey/includes/SurveyCompleted';
import { redirect } from 'next/navigation';

export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<IntakeFormSearchParams>;
}

export default async function Page({ params, searchParams }: Readonly<PageProps>) {
  const [{ id }, searchParamsData] = await Promise.all([params, searchParams]);
  const { data } = await fetchSurveyFromProductList({ surveyId: id });

  if (!data) {
    return redirect('/');
  }

  const isSurveyCompleted = data.isSurveyCompleted || false;
  
  // If survey is already completed, show "already completed" message
  if (isSurveyCompleted) {
    return (
      <SurveyCompleted 
        title="Intake Form Already Submitted!"
        message="You have already submitted your intake form."
      />
    );
  }

  return <IntakeForm questions={data?.questions || []} searchParams={searchParamsData} surveyId={id} />;
}
