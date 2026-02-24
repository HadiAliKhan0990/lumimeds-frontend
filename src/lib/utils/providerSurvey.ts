import { Provider } from '@/store/slices/providerSlice';

/**
 * Check if provider is available for synchronous video visits
 * based on their survey response
 */
export function isProviderAvailableForVideoVisits(provider: Provider | null): boolean {
  if (!provider?.provider?.surveySubmissions) {
    return true; // Default to true if no survey data
  }

  // Find the most recent survey submission
  const latestSubmission = provider.provider.surveySubmissions[0];
  
  if (!latestSubmission?.answers) {
    return true;
  }

  // Look for the question about synchronous video visits
  const videoVisitsQuestion = latestSubmission.answers.find((answer) =>
    answer.questionText?.toLowerCase().includes('synchronous video visits') ||
    answer.questionText?.toLowerCase().includes('available for synchronous') ||
    (answer.questionText?.toLowerCase().includes('video') && answer.questionText?.toLowerCase().includes('visits'))
  );

  if (!videoVisitsQuestion) {
    return true; // If question not found, default to true
  }

  // Check if answer is "No" or similar negative responses
  const answer = videoVisitsQuestion.answer?.toString().toLowerCase() || '';
  const isNo = answer === 'no' || answer === 'n' || answer === 'false';

  return !isNo; // Return true if NOT "No"
}

