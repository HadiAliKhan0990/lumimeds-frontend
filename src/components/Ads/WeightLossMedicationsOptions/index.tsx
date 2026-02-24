'use client';

import { useBannerVisibility } from '@/hooks/useBannerVisibility';
import Image from 'next/image';
import HeroImage from '@/assets/ads/weight-loss-medications-options/hero.png';
import WeightGain from '@/assets/ads/weight-loss-medications-options/weight-gain.png';
import WeightGain2 from '@/assets/ads/weight-loss-medications-options/weight-gain-2.png';
import WeightInjection from '@/assets/ads/weight-loss-medications-options/weight-loss-injection.png';
import WeightCover from '@/assets/ads/weight-loss-medications-options/weight-loss-cover.png';
import { useRouter, useSearchParams } from 'next/navigation';
import { ROUTES } from '@/constants';
import { useState } from 'react';
import { Spinner } from 'react-bootstrap';
import { showToast } from '@/lib/toast';

export default function WeightLossMedicationsOptionsPage() {
  const { isGeneralSaleActive } = useBannerVisibility();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  // Shared error handler to avoid duplication
  const handleNavigationError = (error: unknown) => {
    console.error('Navigation error:', error);
    showToast({
      title: 'Navigation Error',
      message: 'Unable to navigate. Please try again.',
      type: 'error',
    });
  };

  const navigateToIntake = async () => {
    // Preserve overrideTime query param if present
    const params = new URLSearchParams();
    const overrideTime = searchParams.get('overrideTime');
    if (overrideTime) params.set('overrideTime', overrideTime);

    const url = params.toString() ? `${ROUTES.PATIENT_INTAKE}?${params.toString()}` : ROUTES.PATIENT_INTAKE;
    await router.push(url);
  };

  const handleNavigation = async () => {
    setIsLoading(true);

    try {
      await navigateToIntake();

    } catch (error) {
      handleNavigationError(error);
      setIsLoading(false);
    }
  };

  const handleLinkNavigation = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    try {
      await navigateToIntake();
    } catch (error) {
      handleNavigationError(error);
    }
  };
  return (
    <div className={`${isGeneralSaleActive ? 'lg:tw-pt-[0px] tw-pt-[0]' : 'lg:tw-pt-[72px] tw-pt-[100px]'}`}>
      <div className='tw-bg-[#0577FE] tw-h-12'></div>
      <div className='tw-max-w-[912px] tw-w-full tw-mx-auto tw-px-4 md:tw-pt-16 tw-pt-8 tw-text-[#89888B]'>
        <h1 className='md:tw-text-[64px] tw-text-[32px] tw-text-black-22 tw-font-lumitype tw-font-bold tw-leading-[120%] md:tw-tracking-[-3.2px] tw-tracking-[-1.6px] tw-mb-0'>
          <span className='tw-block'>Weight Loss Medications:</span>
          <span className='tw-block'>What Are Your Options?</span>
        </h1>
        <div className='tw-flex md:tw-items-center md:tw-flex-row tw-flex-col md:tw-gap-4 tw-gap-2 tw-my-6 tw-font-lato md:tw-text-lg tw-border-b tw-border-gray-400 tw-pb-6 tw-mb-8'>
          <div className='tw-text-black-22'>December 11, 2025</div>
          <div className='tw-text-[#89888B]'>5-Minute read</div>
        </div>
        <p className='tw-text-xl tw-leading-[120%] tw-font-lato tw-mb-0'>
          Obesity is classified as a disease and, therefore, can be treated with medication. With the success of GLP-1
          diabetes drugs in promoting weight loss, interest and demand for weight loss medications are at an all-time
          high. Is the solution suitable for everyone looking to shed excess pounds? Keep reading to find out what your
          options are.
        </p>
      </div>
      <div className='tw-max-w-[1112px] tw-w-full tw-mx-auto tw-px-4'>
        <Image
          src={HeroImage}
          alt='Weight Loss Medications Options'
          className='tw-h-full tw-object-cover tw-w-full tw-my-16'
        />
      </div>
      <div className='tw-max-w-[912px] tw-w-full tw-mx-auto tw-px-4 tw-font-lato tw-text-[#89888B]'>
        <h2 className='tw-text-[32px] tw-text-black-22 tw-font-lumitype tw-leading-[120%] tw-tracking-[-1.6px] tw-mb-6'>
          Who Can Take Weight Loss Medications?
        </h2>
        <p className='tw-text-xl tw-leading-[120%] tw-mb-5'>
          Are you an overweight or obese adult with health risks or conditions associated with your weight? If you have
          tried numerous diets and exercise routines but have been unable to manage your weight successfully,
          prescription weight loss drugs may be a good option.
        </p>
        <p className='tw-text-xl tw-leading-[120%] tw-mb-5'>
          Prescription weight loss medicines are approved by the Food and Drug Administration (FDA) to treat overweight
          or obesity and certain associated health conditions. Their use cases are very specific and you need a
          healthcare provider to prescribe them for you. Typically, they will also monitor your use of the medicine.
        </p>
        <p className='tw-text-xl tw-leading-[120%] tw-mb-5'>
          Medications for weight loss may be prescribed if a person has:
        </p>
        <ul className='tw-list-disc tw-text-xl tw-leading-[120%] tw-mb-5'>
          <li>
            A body mass index (BMI) of 30 or higher, which is considered obese. BMI is a measure of a person&apos;s body
            fat percentage relative to their height.
          </li>
          <li>
            A BMI over 27, which is considered overweight, and if they have at least one weight-related condition.
          </li>
        </ul>
        <p className='tw-text-xl tw-leading-[120%] tw-mb-5'>
          Before your doctor prescribes a medication, they also have to consider your health history, risks, and
          lifestyle. These drugs should not be taken by certain individuals, such as pregnant or breastfeeding women.
        </p>
        <p className='tw-text-xl tw-leading-[120%] tw-mb-0'>
          These medications are formulated specifically to help with chronic weight management. But even the best weight
          loss medication is not supposed to be a substitute for a healthy diet and regular exercise. Health experts
          recommend using weight loss drugs together with lifestyle interventions.
        </p>
        <div>
          <Image src={WeightGain} alt='Weight Gain' className='tw-w-full tw-h-auto md:tw-my-16 tw-my-14' />
        </div>
        <h2 className='tw-text-[32px] tw-text-black-22 tw-font-lumitype tw-leading-[120%] tw-tracking-[-1.6px] tw-mb-6'>
          Top Rated Weight Loss Pills
        </h2>
        <p className='tw-text-xl tw-leading-[120%] tw-mb-5'>
          Medications that contain semaglutide are among the top rated weight loss pills today. These FDA-approved
          medicines have a common active ingredient: glucagon-like peptide-1 (GLP-1).
        </p>
        <p className='tw-text-xl tw-leading-[120%] tw-mb-5'>
          Semaglutide (the generic name for GLP-1 medications) is the active ingredient in popular brand name drugs
          Ozempic, Wegovy, and Rybelsus. Among these brands, only Rybelsus is available as a pill. Tirzepatide is
          another popular weight loss medication, and is the active ingredient in Zepbound and Mounjaro. It is actually
          a GLP-1 and GIP (gastric inhibitory polypeptide) agonist combo. Tirzepatide is not available as a pill. Both
          semaglutide and tirzepatide mimic the mechanisms of action of naturally occurring GLP-1 hormones in the gut.
        </p>
        <p className='tw-text-xl tw-leading-[120%] tw-mb-5'>
          More specifically, semaglutide and tirzepatide trigger insulin release to regulate blood sugar levels after
          food intake. They also help suppress appetite and delay gastric emptying to promote satiety.
        </p>
        <p className='tw-text-xl tw-leading-[120%] tw-mb-5'>
          Take note that Ozempic, Rybelsus, and Mounjaro are indicated for the treatment of type 2 diabetes; weight loss
          is a common side effect of these drugs. Wegovy and Zepbound are the FDA-approved medications for weight loss.
        </p>
        <p className='tw-text-xl tw-leading-[120%] tw-mb-5'>
          Here are other prescription medications for weight loss that you can ask your doctor about:
        </p>
        <ul className='tw-list-disc tw-text-xl tw-leading-[120%] tw-mb-16'>
          <li>
            Liraglutide (Saxenda). A daily injectable that inhibits hunger signals from the brain and promotes satiety.
          </li>
          <li>
            Phentermine (Adipex, Suprenza). This class of weight loss drugs has been around the longest. Both brands are
            available as oral medications.
          </li>
          <li>Phentermine-topiramate (Qsymia). This once-daily pill helps suppress appetite and cravings.</li>
          <li>
            Naltrexone-bupropion (Contrave). The drug targets the brain&apos;s pleasure centers to decrease appetite and
            cravings.
          </li>
          <li>
            Setmelanotide (Imcivree). The drug is formulated for chronic weight management in adults and children aged 6
            years and older with obesity associated with a rare genetic disorder.
          </li>
          <li>
            Orlistat (Xenical, Alli). The drug inhibits the body&apos;s absorption of dietary fats by blocking the
            enzyme that breaks down fats from food.
          </li>
        </ul>
        <div>
          <Image src={WeightGain2} alt='Weight Gain' className='tw-w-full tw-h-auto tw-my-16' />
        </div>
        <h2 className='tw-text-[32px] tw-text-black-22 tw-font-lumitype tw-leading-[120%] tw-tracking-[-1.6px] tw-mb-6'>
          How To Get Weight Loss Medication
        </h2>
        <p className='tw-text-xl tw-leading-[120%] tw-mb-5'>
          It&apos;s always best to consult a healthcare professional if you want to know how to get weight loss medication.
          Determining whether or not you can benefit from pharmaceutical intervention usually begins with your BMI.
        </p>
        <p className='tw-text-xl tw-leading-[120%] tw-mb-5'>
          Most prescription drugs for weight loss require a minimum BMI. A BMI of at least 30 may be required for
          obesity treatment, or a BMI of 27 for overweight individuals with a weight-related condition.
        </p>
        <p className='tw-text-xl tw-leading-[120%] tw-mb-5'>
          Your doctor will also take a complete medical history and lifestyle check. Those who have been struggling to
          lose weight despite dieting and exercise are top candidates for weight loss drugs. You can also be a candidate
          if you are at a high risk for or already have cardiovascular disease.
        </p>
        <p className='tw-text-xl tw-leading-[120%] tw-mb-0'>
          Make sure to ask your doctor about the side effects of these drugs. Common ones include GI issues, such as
          nausea, vomiting, diarrhea, constipation, gas, and stomach pain. They typically occur at the start of
          treatment and with every dosage increase.
        </p>
        <Image src={WeightInjection} alt='Weight injection' className='tw-w-full tw-h-auto tw-my-16' />
        <h2 className='tw-text-[32px] tw-text-black-22 tw-font-lumitype tw-leading-[120%] tw-tracking-[-1.6px] tw-mb-6'>
          Does Medicaid Cover Ozempic for Weight Loss?
        </h2>
        <p className='tw-text-xl tw-leading-[120%] tw-mb-5'>
          Does Medicaid cover Ozempic for weight loss? Unfortunately, state Medicaid programs cover Ozempic only for the
          treatment of approved conditions. These include type 2 diabetes, cardiovascular risk reduction, and chronic
          kidney disease associated with type 2 diabetes. Off-label use of Ozempic for weight loss is not covered under
          Medicaid.
        </p>
        <h2 className='tw-text-[32px] tw-text-black-22 tw-font-lumitype tw-leading-[120%] tw-tracking-[-1.6px] tw-mb-6 tw-mt-16'>
          How To Get Insurance To Cover Weight Loss Medication
        </h2>
        <p className='tw-text-xl tw-leading-[120%] tw-mb-5'>
          Do you want to know how to get insurance to cover weight loss medication? By law, medications prescribed
          specifically for weight loss cannot be covered by Medicare. However, most insurance plans do cover other
          weight loss interventions if the individual meets specific eligibility criteria.
        </p>
        <p className='tw-text-xl tw-leading-[120%] tw-mb-5'>
          According to the Affordable Care Act (ACA),
          <a
            href='https://www.goodrx.com/conditions/weight-loss/weight-loss-treatments-insurance-coverage'
            target='_blank'
            rel='noopener noreferrer'
            className='tw-text-[#3C77EA] tw-underline hover:tw-text-blue-800'
          >
            most health insurers are required to cover preventive care services
          </a>
          , such as obesity screening and counseling. Adults with a higher risk for chronic conditions may also be
          covered for diet counseling. Some insurers may cover additional services, such as surgery, medication,
          nutrition counseling, and nutrition therapy.
        </p>
        <p className='tw-text-xl tw-leading-[120%] tw-mb-0'>
          If you have a commercial health plan, you should check if your policy covers prescription weight loss
          medications. Take note that if covered, it often comes with restrictions. You should also check with your
          provider if you can secure prior authorization or a specific FDA approval to get coverage.
        </p>
        <Image src={WeightCover} alt='weight loss cover' className='tw-w-full tw-h-auto tw-my-16' />
        <div className='tw-pb-24'>
          <h2 className='tw-text-[32px] tw-text-black-22 tw-font-lumitype tw-leading-[120%] tw-tracking-[-1.6px] tw-mb-6'>
            Prescription Weight Loss Pills
          </h2>
          <p className='tw-text-xl tw-leading-[120%] tw-mb-5'>
            Prescription weight loss pills and injections are in extremely high demand these days. In fact, the most
            popular brand name semaglutide and tirzepatide drugs are often out of stock. Even when they’re available,
            however, most patients cannot afford their high costs — especially as they’re not covered by insurance.
          </p>
          <p className='tw-text-xl tw-leading-[120%] tw-mb-16'>
            If you feel that weight loss medication is the ideal solution for you, inquire about compounded semaglutide
            or compounded tirzepatide options, which are more affordable. Take the{' '}
            <a
              href='#'
              onClick={handleLinkNavigation}
              className='tw-text-[#3C77EA] tw-underline hover:tw-text-blue-800 tw-cursor-pointer'
            >
              LumiMeds health quiz
            </a>{' '}
            today and find out if you can sign up for our clinically proven weight loss program.
          </p>
          <button
            type='button'
            onClick={handleNavigation}
            disabled={isLoading}
            style={{
              background: 'var(--Gradient-D, linear-gradient(0deg, #3D77EA 0%, #9CF 100.04%))',
            }}
            className='tw-flex tw-items-center tw-justify-center tw-gap-4 tw-w-full tw-tracking-[-1.2px] tw-h-14 tw-font-bold tw-text-white tw-text-2xl tw-font-lato tw-rounded-lg tw-transition-all tw-duration-300 tw-shadow-[0_5.583px_5.583px_rgba(0,0,0,0.25)] hover:tw-shadow-lg hover:tw-scale-[1.02] hover:tw-opacity-90 disabled:tw-opacity-60 disabled:tw-cursor-not-allowed disabled:hover:tw-scale-100'
          >
            {isLoading && <Spinner className='border-2 tw-mr-2' size='sm' />}
            <span>Get Started</span>
            <span>
              <svg xmlns='http://www.w3.org/2000/svg' width='22' height='15' fill='none'>
                <path
                  fill='#fff'
                  d='m21.54 7.056-7.033 7.008-1.032-1.044c-.208-.208-.292-.416-.252-.624.04-.216.156-.42.348-.612l2.496-2.52a14.096 14.096 0 0 1 1.248-1.116c-.528.064-1.084.116-1.668.156-.576.04-1.156.06-1.74.06H0V5.712h13.908c.592 0 1.176.024 1.752.072.584.04 1.14.092 1.668.156a17.404 17.404 0 0 1-1.26-1.116L13.56 2.28c-.2-.184-.32-.38-.36-.588-.032-.216.056-.428.264-.636L14.495 0l7.044 7.056Z'
                />
              </svg>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}