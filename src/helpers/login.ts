import { PatientSurveyAnswerType } from '@/lib/types';
import * as Yup from 'yup';

const emailSchema = Yup.string().trim().email('Invalid email address');

export function getEmailFromAnswers(answers: PatientSurveyAnswerType[]): string | null {
  for (const { answer } of answers) {
    if (emailSchema.isValidSync(answer)) {
      return answer?.trim() || '';
    }
  }
  return null;
}
