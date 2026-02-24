import { fetcher } from '@/lib/fetcher';
import {
  AcceptProviderSurveyInvitationResponse,
  GetProviderSurveyByIdPayload,
  GetProviderSurveyByIdResponse,
} from '@/services/providerIntake/types';

export async function fetchProviderSurveyById({
  email,
  surveyIdFromInvite,
  token,
}: GetProviderSurveyByIdPayload): Promise<GetProviderSurveyByIdResponse['data']> {
  try {
    const { data } = await fetcher<GetProviderSurveyByIdResponse>('/providers/survey/' + surveyIdFromInvite, {
      method: 'GET',
      params: { email: email || '', token },
    });
    return (
      data ?? {
        id: '',
        name: '',
        description: '',
        isActive: false,
        createdById: '',
        typeId: '',
        questions: [],
        isSystemGenerated: false,
        createdAt: '',
        updatedAt: '',
        surveyToken: null,
      }
    );
  } catch (error) {
    console.log('Failed to fetch provider survey:', error);
    return {
      id: '',
      name: '',
      description: '',
      isActive: false,
      createdById: '',
      typeId: '',
      questions: [],
      isSystemGenerated: false,
      createdAt: '',
      updatedAt: '',
      surveyToken: null,
    };
  }
}

export async function acceptProviderSurveyInvitation(
  token: string
): Promise<AcceptProviderSurveyInvitationResponse['data']> {
  try {
    const { data } = await fetcher<AcceptProviderSurveyInvitationResponse>('/providers/accept-invitation/', {
      method: 'GET',
      params: { token },
    });
    return (
      data ?? {
        message: '',
        surveyId: '',
      }
    );
  } catch (error) {
    console.log('Failed to fetch provider survey:', error);
    return {
      message: '',
      surveyId: '',
    };
  }
}
