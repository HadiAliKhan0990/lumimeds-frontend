import PatientIntakeSurvey from '@/modules/landing/survey/PatientIntakeSurvey';
import { fetchSurveyFromProductList } from '@/services/survey';
import { SurveyCategoryType } from '@/store/slices/checkoutSlice';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;

  // Handle weight_loss category specifically
  if (category === 'weight_loss') {
    return {
      title: 'Weight Loss Product Survey',
      description:
        'Complete this form to get your weight loss program from Lumimeds which will help you to loss your weight.',
      robots: 'noindex, nofollow',
      alternates: {
        canonical: 'https://www.lumimeds.com/products/survey/weight_loss',
      },
      openGraph: {
        title: 'Weight Loss Product Survey',
        description:
          'Complete this form to get your weight loss program from Lumimeds which will help you to loss your weight.',
        type: 'website',
        url: 'https://www.lumimeds.com/products/survey/weight_loss',
      },
    };
  }

  // Handle weight_loss category specifically
  if (category === 'longevity') {
    return {
      title: 'Longevity Product Survey',
      description:
        'Complete this form to get your longevity program from Lumimeds which will help you to loss your weight.',
      robots: 'noindex, nofollow',
      alternates: {
        canonical: 'https://www.lumimeds.com/products/survey/longevity',
      },
      openGraph: {
        title: 'Longevity Product Survey',
        description:
          'Complete this form to get your longevity program from Lumimeds which will help you to loss your weight.',
        type: 'website',
        url: 'https://www.lumimeds.com/products/survey/longevity',
      },
    };
  }

  // Default metadata for other categories
  return {
    robots: 'noindex, nofollow',
  };
}

interface Props {
  params: Promise<{ category: SurveyCategoryType }>;
  searchParams: Promise<{ flow?: string }>;
}

export default async function Page({ params, searchParams }: Readonly<Props>) {
  const [{ category }, { flow }] = await Promise.all([params, searchParams]);

  if ((category && category === 'longevity') || category === 'weight_loss') {
    // Fetch survey based on category (weight_loss, longevity, etc.)
    const { data } = await fetchSurveyFromProductList({ category });

    return <PatientIntakeSurvey data={data} flow={flow} category={category} />;
  }

  return redirect('/');
}
