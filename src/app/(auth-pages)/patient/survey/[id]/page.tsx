'use client';

export const dynamic = 'force-dynamic';

import Image from 'next/image';
import Logo from '@/assets/logo.svg';
import toast from 'react-hot-toast';
import Link from 'next/link';
import DynamicSurveyForm from '@/components/Survey/TelegraSurvey/DynamicForm';
import { useState, Suspense } from 'react';
import { Modal, Spinner } from 'react-bootstrap';
import { useParams, useSearchParams } from 'next/navigation';
import {
  useGetTelegraPatientSurveyQuery,
  useSubmitTelegraSurveyFormResponsesMutation,
} from '@/store/slices/surveysApiSlice';
import { uploadSurveyFile } from '@/lib/fileUpload';
import { TelegraAnswerType } from '@/lib/types';

function SurveyContent() {
  const { id } = useParams();
  const params = useSearchParams();
  const email = params.get('email');
  const token = params.get('token');

  const [submitSurvey, { isSuccess, isLoading }] = useSubmitTelegraSurveyFormResponsesMutation();
  const { data, isFetching, isError } = useGetTelegraPatientSurveyQuery({ id, email, token });

  const questions = data?.questions || [];

  const [showThankYouModal, setShowThankYouModal] = useState(false);
  const [showAlreadySubmittedModal, setShowAlreadySubmittedModal] = useState(false);
  const [isPending, setLoading] = useState(false);

  const handleSubmit = async (answers: TelegraAnswerType[]) => {
    if (!token || !data?.id) return;

    try {
      setLoading(true);

      const sanitizedAnswers = await Promise.all(
        answers.map(async ({ questionId, answer }, i) => {
          const { isRequired } = questions[i];
          if (answer instanceof File) {
            const fileUrl = await uploadSurveyFile({
              surveyId: data.id,
              productId: data.productId,
              patientId: data.patientId,
              file: answer,
            });
            return { questionId, answer: fileUrl, isRequired };
          }
          return { questionId, answer, isRequired };
        })
      );

      await submitSurvey({
        email: email as string,
        token,
        answers: sanitizedAnswers,
        surveyId: data?.id,
        productId: data.productId,
      }).unwrap();

      setShowThankYouModal(true);
      toast.success('Intake form submitted successfully');
      localStorage.setItem('invitationToken', token);
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'data' in error &&
        typeof error.data === 'object' &&
        error.data !== null &&
        'message' in error.data
      ) {
        toast.error(error.data.message as string);
      } else {
        toast.error('Failed to submit the survey, Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (isError || (!isFetching && (!data || questions.length === 0))) {
    return (
      <div className='container d-flex align-items-center justify-content-center py-5 mt-5 patient_survey_form'>
        <div className='text-center mt-5'>
          <Image src={Logo} className='patient-dashboard__navbar__logo mb-5' quality={100} alt='LumiMeds' />
          <h3 className='mb-3 text-danger'>🚫 Unable to load the survey</h3>
          <p className='text-muted'>
            {"We're sorry, but we couldn't load the survey at this time. This could be due to:"}
          </p>
          <ul className='text-muted text-start mx-auto max-w-400'>
            <li>The survey link is invalid or expired.</li>
            <li>Your email or token might be missing or incorrect.</li>
            <li>There was a problem connecting to the server.</li>
          </ul>
          <p className='my-4'>Please contact support or try again later.</p>
          <div className='d-flex align-items-center justify-content-center gap-3'>
            <button onClick={() => window.location.reload()} className='btn btn-outline-primary rounded-pill px-4 py-2'>
              Refresh
            </button>
            <Link href={'/'} className='btn btn-primary rounded-pill px-4 py-2'>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return isSuccess ? (
    <>
      <Modal
        show={showThankYouModal}
        onHide={() => setShowThankYouModal(false)}
        centered
        backdrop='static'
        keyboard={false}
      >
        <Modal.Body className='text-center p-5'>
          <h4 className='mb-3'>🎉 Thank you for your submission!</h4>
          <p>Your feedback has been recorded successfully.</p>
          <p className='mt-3 text-muted'>
            An administrator will review your response and contact you shortly if necessary.
          </p>
          <Link href={'/'} className='btn btn-primary rounded-pill d-inline-block mt-3 py-2 px-3'>
            Back to Home
          </Link>
        </Modal.Body>
      </Modal>

      <Modal
        show={showAlreadySubmittedModal}
        onHide={() => setShowAlreadySubmittedModal(false)}
        centered
        backdrop='static'
        keyboard={false}
      >
        <Modal.Body className='text-center p-5'>
          <h4 className='mb-3'>⚠️ You&rsquo;ve already submitted this survey</h4>
          <p>Thank you! Your response has already been recorded.</p>
          <Link href={'/'} className='btn btn-primary rounded-pill d-inline-block mt-3 py-2 px-3'>
            Back to Home
          </Link>
        </Modal.Body>
      </Modal>
    </>
  ) : (
    <div className='container d-flex align-items-center justify-content-center py-5 patient_survey_form'>
      <div className='flex-grow-1 py-5'>
        <div className='form-container mx-auto text-center mb-5'>
          <Image src={Logo} className='patient-dashboard__navbar__logo' quality={100} alt='LumiMeds' />
        </div>
        {isFetching ? (
          <div className='d-flex align-items-center flex-column gap-5 text-lg justify-content-center py-5 text-center'>
            <Spinner className='size-75' />
            Survey is being loaded... Please wait.
          </div>
        ) : (
          questions &&
          questions.length > 0 && (
            <DynamicSurveyForm questions={questions} onFinish={handleSubmit} isLoading={isPending || isLoading} />
          )
        )}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className='container d-flex align-items-center justify-content-center py-5 mt-5'>
          <div className='d-flex align-items-center flex-column gap-3'>
            <Image src={Logo} className='patient-dashboard__navbar__logo mb-3' quality={100} alt='LumiMeds' />
            <Spinner className='size-75' />
            <div>Loading survey...</div>
          </div>
        </div>
      }
    >
      <SurveyContent />
    </Suspense>
  );
}
