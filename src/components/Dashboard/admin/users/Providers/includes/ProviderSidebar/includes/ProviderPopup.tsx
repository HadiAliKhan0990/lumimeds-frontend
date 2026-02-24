'use client';

import AvatarSample from '@/assets/female avatar.jpg';
import MaleAvatarPng from '@/assets/male avatar.png';
import NeutralAvatarPng from '@/assets/gender neutral avatar.png';
import Image, { StaticImageData } from 'next/image';
import toast from 'react-hot-toast';
import ConfirmationModal from '@/components/ConfirmationModal';
import EditProviderAnswersModal from '@/components/Dashboard/admin/users/Providers/includes/EditProviderAnswersModal';
import { getErrorMessage } from '@/lib/errors';
import { useStates } from '@/hooks/useStates';
import { RootState, AppDispatch } from '@/store';
import { useUpdateProviderStatusMutation, providersApi } from '@/store/slices/providersApiSlice';
import { setProvider } from '@/store/slices/providerSlice';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { formatUSPhoneWithoutPlusOne } from '@/lib/helper';
import { SurveyPopupCard } from '@/components/Dashboard/admin/SurveyPopupCard';
import { PatientSurvey } from '@/lib/types';
import { formatProviderName, formatProviderFirstName, formatProviderLastName } from '@/lib/utils/providerName';
import { SurveyQuestion } from '@/store/slices/surveyQuestionSlice';
import { surveysApi, SingleSurveyResponse } from '@/store/slices/surveysApiSlice';

interface Props {
  onClose: () => void;
}

export function ProviderPopup({ onClose }: Readonly<Props>) {
  const dispatch = useDispatch<AppDispatch>();
  const { stateNames } = useStates();

  const provider = useSelector((state: RootState) => state.provider);

  const [updateProviderStatus] = useUpdateProviderStatusMutation();
  const [isFetchingSurvey, setIsFetchingSurvey] = useState(false);
  const [loadingAction, setLoadingAction] = useState<'approve' | 'reject' | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showEditAnswersModal, setShowEditAnswersModal] = useState(false);
  const [showAllGroups, setShowAllGroups] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState<{
    submissionId: string;
    surveyId: string;
    surveyName: string;
    questions: SurveyQuestion[];
    responses: Array<{
      questionId: string;
      questionText: string;
      questionType: string;
      answer: unknown;
      options?: string[];
    }>;
  } | null>(null);

  const handleCancel = () => {
    dispatch(
      setProvider({
        createdAt: null,
        email: null,
        id: null,
        provider: null,
        status: null,
        userId: null,
        surveys: null,
      })
    );
    onClose();
  };

  const sortedSurveys: PatientSurvey[] =
    provider?.provider?.surveySubmissions?.map((survey) => ({
      ...survey,
      responses: [...survey.answers].map((answer, index) => ({
        ...answer,
        position: index + 1,
      })),
      name: survey.surveyName,
      updatedAt: survey.createdAt,
      type: {
        id: survey.surveyId,
        name: survey.surveyName,
        type: '',
      },
    })) || [];

  const handleApprove = async () => {
    try {
      if (!provider.provider?.id) {
        return;
      }
      setLoadingAction('approve');
      await updateProviderStatus({
        id: provider.provider?.id,
        status: 'approved',
      })
        .unwrap()
        .then(() => {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('providers:refresh'));
          }
          handleCancel();
          setShowApproveModal(false);
        })
        .catch((error) => {
          toast.error(getErrorMessage(error));
        });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoadingAction(null);
    }
  };

  const handleReject = async () => {
    if (!provider.provider?.id) {
      return;
    }
    try {
      setLoadingAction('reject');
      await updateProviderStatus({
        id: provider.provider?.id,
        status: 'rejected',
      })
        .unwrap()
        .then(() => {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('providers:refresh'));
          }
          handleCancel();
          setShowRejectModal(false);
        })
        .catch((error) => {
          toast.error(getErrorMessage(error));
        });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoadingAction(null);
    }
  };

  const handleConfirmApprove = () => {
    handleApprove();
  };

  const handleConfirmReject = () => {
    handleReject();
  };

  const handleEditIntakeForm = async (survey: PatientSurvey) => {
    try {
      setIsFetchingSurvey(true);
      const result = (await dispatch(
        surveysApi.endpoints.getSurvey.initiate({ surveyId: survey.type.id })
      ).unwrap()) as NonNullable<SingleSurveyResponse['data']>;

      if (!result || !result.questions) {
        toast.error('Failed to load survey questions');
        setIsFetchingSurvey(false);
        return;
      }

      const questionsWithStates = result.questions.map((question: SurveyQuestion) => {
        const questionText = (question.questionText || '').toLowerCase();
        const isLicenseTableQuestion =
          questionText.includes('license') &&
          (questionText.includes('provide') ||
            questionText.includes('enter') ||
            questionText.includes('list') ||
            questionText.includes('state license') ||
            questionText.includes('what state') ||
            !questionText.includes('do you have'));

        if (isLicenseTableQuestion) {
          return {
            ...question,
            options: stateNames,
          };
        }
        return question;
      });

      const currentResponses = survey.responses.map((response) => ({
        questionId: response.questionId || '',
        questionText: response.questionText || '',
        questionType: response.questionType || '',
        answer: response.answer,
        options: response.options,
      }));

      setSelectedSurvey({
        submissionId: survey.id,
        surveyId: survey.type.id,
        surveyName: result.name || survey.name,
        questions: questionsWithStates,
        responses: currentResponses,
      });
      setShowEditAnswersModal(true);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsFetchingSurvey(false);
    }
  };

  const handleCloseEditModal = () => {
    setShowEditAnswersModal(false);
    setSelectedSurvey(null);
  };

  const handleEditSuccess = async () => {
    try {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('providers:refresh'));
      }

      dispatch(providersApi.util.invalidateTags(['Provider']));

      handleCloseEditModal();
      handleCancel();
    } catch (error) {
      toast.error(getErrorMessage(error) || 'Could not update intake form');
      handleCloseEditModal();
    }
  };

  return (
    <>
      {/* Content area */}
      <div>
        <div className='d-flex flex-column align-items-center tw-mb-4 tw-md:tw-mb-0'>
          {(() => {
            const gender = provider?.provider?.gender?.toLowerCase();
            let avatarSrc: StaticImageData = AvatarSample;
            if (gender === 'male') avatarSrc = MaleAvatarPng;
            else if (gender !== 'female') avatarSrc = NeutralAvatarPng;
            return (
              <Image
                src={avatarSrc}
                alt='avatar-image'
                width={96}
                height={96}
                className='rounded-circle object-fit-cover'
              />
            );
          })()}
        </div>
        <div className='d-flex flex-column gap-3'>
          <div className='d-flex align-items-center justify-content-between'>
            <p className='text-sm fw-medium mb-0'>First Name:</p>
            <span className='text-sm'>{formatProviderFirstName(provider?.provider?.firstName)}</span>
          </div>
          <div className='d-flex align-items-center justify-content-between'>
            <p className='text-sm fw-medium mb-0'>Last Name:</p>
            <span className='text-sm'>{formatProviderLastName(provider?.provider?.lastName)}</span>
          </div>
          <div className='d-flex align-items-center justify-content-between'>
            <p className='text-sm fw-medium mb-0'>Email:</p>
            <span className='text-sm'>{provider?.email ?? 'N/A'}</span>
          </div>
          <div className='d-flex align-items-center justify-content-between'>
            <p className='text-sm fw-medium mb-0'>Gender:</p>
            <span className='text-sm'>
              {provider?.provider?.gender
                ? provider.provider.gender.charAt(0).toUpperCase() + provider.provider.gender.slice(1)
                : 'N/A'}
            </span>
          </div>
          <div className='d-flex align-items-center justify-content-between'>
            <p className='text-sm fw-medium mb-0'>Phone No:</p>
            <span className='text-sm'>
              {formatUSPhoneWithoutPlusOne(provider?.provider?.phoneNumber || '') || 'N/A'}
            </span>
          </div>
          <div className='d-flex align-items-center justify-content-between'>
            <p className='text-sm fw-medium mb-0'>Status:</p>
            <span className={`status-badge ${provider?.status?.toLowerCase()}`}>{provider?.status ?? 'N/A'}</span>
          </div>
          <div className='d-flex align-items-center justify-content-between'>
            <p className='text-sm fw-medium mb-0'>Auto Orders Limit:</p>
            <span className='text-sm'>{provider?.provider?.autoOrdersLimit ?? 'N/A'}</span>
          </div>
          {provider?.isSuspended && (
            <div className='d-flex align-items-center justify-content-between'>
              <p className='text-sm fw-medium mb-0'>Suspended Reason:</p>
              <span className='text-sm'>{provider?.suspendReason ?? 'N/A'}</span>
            </div>
          )}
          <div className='d-flex align-items-start justify-content-between'>
            <p className='text-sm fw-medium mb-0 text-nowrap mr-2'>Group:</p>
            <span className='text-sm text-end  ml-2'>
              {(() => {
                const groupString = provider?.provider?.group;
                if (!groupString) return 'N/A';

                try {
                  const groups = JSON.parse(groupString);
                  const filteredGroups = Array.isArray(groups) ? groups.filter((g) => g !== 'Other') : [];
                  if (filteredGroups.length === 0) return 'N/A';

                  if (showAllGroups || filteredGroups.length <= 2) {
                    return (
                      <div className='d-flex flex-column flex-md-row align-items-end flex-wrap gap-1'>
                        {filteredGroups.map((group, index) => (
                          <span key={index}>
                            {group}
                            {index < filteredGroups.length - 1 && <span className='d-none d-md-inline'>,</span>}
                          </span>
                        ))}
                        {filteredGroups.length > 2 && (
                          <button
                            type='button'
                            className='text-primary cursor-pointer border-0 bg-transparent p-0'
                            onClick={() => setShowAllGroups(false)}
                          >
                            Show less
                          </button>
                        )}
                      </div>
                    );
                  }

                  const displayGroups = filteredGroups.slice(0, 2);
                  const remainingCount = filteredGroups.length - 2;

                  return (
                    <>
                      {displayGroups.join(', ')}{' '}
                      {remainingCount > 0 && (
                        <span className='text-primary cursor-pointer' onClick={() => setShowAllGroups(true)}>
                          +{remainingCount} more
                        </span>
                      )}
                    </>
                  );
                } catch {
                  return groupString
                    ?.replaceAll('[', '')
                    ?.replaceAll(']', '')
                    ?.replaceAll('"', '')
                    ?.replaceAll(',', ', ');
                }
              })()}
            </span>
          </div>
        </div>

        {/* Display provider surveys/forms if available */}
        {sortedSurveys && sortedSurveys.length > 0 && (
          <div className='mt-3'>
            <SurveyPopupCard
              surveys={sortedSurveys}
              onEditAnswers={handleEditIntakeForm}
              isFetchingSurvey={isFetchingSurvey}
              context='provider'
            />
          </div>
        )}
      </div>

      {/* Action buttons - fixed at bottom */}
      {provider?.status === 'pending' && (
        <div>
          <div className='row'>
            <div className='col-6'>
              <button
                type={'button'}
                className='btn btn-outline-primary text-sm w-100 d-flex align-items-center justify-content-center gap-2'
                onClick={() => setShowRejectModal(true)}
                disabled={loadingAction !== null}
              >
                Reject
              </button>
            </div>
            <div className='col-6'>
              <button
                type={'button'}
                className='btn btn-primary text-sm w-100 d-flex align-items-center justify-content-center gap-2'
                onClick={() => setShowApproveModal(true)}
                disabled={loadingAction !== null}
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Approve */}
      <ConfirmationModal
        show={showApproveModal}
        onHide={() => setShowApproveModal(false)}
        onConfirm={handleConfirmApprove}
        title='Confirm Approval'
        message={
          <div>
            <p>Are you sure you want to approve the provider?</p>
            <span className='text-muted small fw-medium text-capitalize'>
              {formatProviderName(provider?.provider?.firstName, provider?.provider?.lastName).toLowerCase()}
            </span>
          </div>
        }
        confirmLabel='Approve'
        cancelLabel='Cancel'
        loading={loadingAction === 'approve'}
        confirmButtonDisabled={loadingAction !== null}
        cancelButtonDisabled={loadingAction !== null}
      />

      {/* Confirmation Modal for Reject */}
      <ConfirmationModal
        show={showRejectModal}
        onHide={() => setShowRejectModal(false)}
        onConfirm={handleConfirmReject}
        title='Confirm Rejection'
        message={
          <div>
            <p>Are you sure you want to reject the provider?</p>
            <span className='text-muted small fw-medium text-capitalize'>
              {formatProviderName(provider?.provider?.firstName, provider?.provider?.lastName).toLowerCase()}
            </span>
          </div>
        }
        confirmLabel='Confirm Reject'
        cancelLabel='Cancel'
        loading={loadingAction === 'reject'}
        confirmButtonDisabled={loadingAction !== null}
        cancelButtonDisabled={loadingAction !== null}
      />

      {selectedSurvey && (
        <EditProviderAnswersModal
          show={showEditAnswersModal}
          onClose={handleCloseEditModal}
          submissionId={selectedSurvey.submissionId}
          surveyName={selectedSurvey.surveyName}
          responses={selectedSurvey.responses}
          questions={selectedSurvey.questions}
          providerId={provider?.provider?.id || ''}
          onSuccess={handleEditSuccess}
        />
      )}
    </>
  );
}
