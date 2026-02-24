'use client';

import { IntakeInitialStep, PatientSurveyAnswerType } from '@/lib/types';
import { SurveyQuestion } from '@/store/slices/surveyQuestionSlice';
import { STORAGE_STEP_KEY, FORM_STEP } from '@/constants/intakeSurvey';
import { AnswersResponse } from '@/store/slices/checkoutApiSlice';
import { QuestionType } from '@/lib/enums';

export interface SurveyProgressState {
  lastCompletedStep: number;
  totalSteps: number;
  answeredQuestions: string[];
  formStep: 'initial' | 'intake';
  isCompleted: boolean;
}

/**
 * Determines the last step the user completed based on their answered questions
 * @param answers - Array of user's survey answers
 * @param questions - Array of survey questions
 * @returns The position of the last completed step
 */
export function getLastCompletedStep(answers: PatientSurveyAnswerType[], questions: SurveyQuestion[]): number {
  if (!answers || answers.length === 0) {
    return 1; // Start from the first question
  }

  // Get all answered question IDs
  const answeredQuestionIds = new Set(
    answers
      .filter(
        (answer) =>
          answer.questionId &&
          answer.answer !== null &&
          answer.answer !== undefined &&
          answer.answer !== '' &&
          // Handle array answers (checkboxes, multiple choice)
          !(Array.isArray(answer.answer) && answer.answer.length === 0)
      )
      .map((answer) => answer.questionId)
  );

  if (answeredQuestionIds.size === 0) {
    return 1;
  }

  // Find the highest position among answered questions (even if some earlier questions are skipped)
  const answeredPositions = questions
    .filter((question) => answeredQuestionIds.has(question.id ?? ''))
    .map((question) => question.position ?? 1);

  if (answeredPositions.length === 0) {
    return 1;
  }

  // Return the highest answered position + 1, or the highest answered position if it's the last question
  const highestAnsweredPosition = Math.max(...answeredPositions);
  const maxPosition = Math.max(...questions.map((q) => q.position ?? 1));

  // If the highest answered position is the last question, stay there
  // Otherwise, go to the next position after the highest answered
  return highestAnsweredPosition === maxPosition ? highestAnsweredPosition : highestAnsweredPosition + 1;
}

/**
 * Gets the current survey progress state
 * @param answers - Array of user's survey answers
 * @param questions - Array of survey questions
 * @returns Complete progress state object
 */
export function getSurveyProgressState(
  answers: PatientSurveyAnswerType[],
  questions: SurveyQuestion[]
): SurveyProgressState {
  const answeredQuestionIds = answers
    .filter(
      (answer) =>
        answer.questionId &&
        answer.answer !== null &&
        answer.answer !== undefined &&
        answer.answer !== '' &&
        !(Array.isArray(answer.answer) && answer.answer.length === 0)
    )
    .map((answer) => answer.questionId as string);

  const lastCompletedStep = getLastCompletedStep(answers, questions);
  const totalSteps = questions.length;
  const isCompleted = answeredQuestionIds.length === totalSteps;

  // Check form step from localStorage
  const formStep = (
    typeof window === 'undefined' ? 'initial' : localStorage.getItem(FORM_STEP) || 'initial'
  ) as IntakeInitialStep;

  return {
    lastCompletedStep,
    totalSteps,
    answeredQuestions: answeredQuestionIds,
    formStep,
    isCompleted,
  };
}

/**
 * Gets the position to restore user to when they have skipped questions
 * @param answers - Array of user's survey answers
 * @param questions - Array of survey questions
 * @returns The position to restore the user to (highest answered question or next unanswered)
 */
export function getRestorationPosition(answers: PatientSurveyAnswerType[], questions: SurveyQuestion[]): number {
  if (!answers || answers.length === 0) {
    return 1;
  }

  // Get all answered question IDs
  // For restoration purposes, consider any answer object with a questionId as "answered",
  // regardless of whether the value is filled. This ensures we restore to a step
  // if the answer key exists (even empty or placeholder values).
  const answeredQuestionIds = new Set(answers.filter((answer) => answer.questionId).map((answer) => answer.questionId));

  if (answeredQuestionIds.size === 0) {
    return 1;
  }

  // Get all answered positions
  const answeredPositions = questions
    .filter((question) => answeredQuestionIds.has(question.id ?? ''))
    .map((question) => question.position ?? 1)
    .sort((a, b) => b - a); // Sort in descending order

  // Return the highest answered position (where user should continue from)
  return answeredPositions[0] || 1;
}

/**
 * Restores the user to their last survey position
 * @param answers - Array of user's survey answers
 * @param questions - Array of survey questions
 * @returns The position to restore the user to
 */
export function restoreUserPosition(answers: PatientSurveyAnswerType[], questions: SurveyQuestion[]): number {
  // Check if there's a stored step in localStorage
  const storedPosition =
    typeof window === 'undefined'
      ? 1
      : (() => {
          const storedStep = localStorage.getItem(STORAGE_STEP_KEY);
          return storedStep ? parseInt(storedStep, 10) : 1;
        })();

  // Get the position based on answered questions (handles skipped questions)
  const restorationPosition = getRestorationPosition(answers, questions);

  // Use the higher of the two positions to ensure we don't go backwards
  // This handles cases where user manually navigated forward
  if (storedPosition && !isNaN(storedPosition)) {
    return Math.max(storedPosition, restorationPosition);
  }

  return restorationPosition;
}

/**
 * Saves the current survey progress to localStorage
 * @param position - Current question position
 * @param formStep - Current form step ('initial' or 'intake')
 */
export function saveSurveyProgress(position: number): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_STEP_KEY, String(position));
  }
}

/**
 * Checks if the user should skip to a specific step based on conditional logic
 * @param currentPosition - Current question position
 * @param answers - Array of user's survey answers
 * @param questions - Array of survey questions
 * @returns The position to skip to, or the current position if no skip needed
 */
export function getNextPosition(
  currentPosition: number,
  answers: PatientSurveyAnswerType[],
  questions: SurveyQuestion[]
): number {
  const currentQuestion = questions.find((q) => q.position === currentPosition);

  if (!currentQuestion) {
    return currentPosition + 1;
  }

  const currentAnswer = answers.find((a) => a.questionId === currentQuestion.id);

  if (!currentAnswer || !currentAnswer.answer) {
    return currentPosition + 1;
  }

  return currentPosition + 1;
}

/**
 * Validates if a step can be accessed based on previous answers
 * @param targetPosition - Position user wants to access
 * @param answers - Array of user's survey answers
 * @param questions - Array of survey questions
 * @returns Whether the step can be accessed
 */
export function canAccessStep(
  targetPosition: number,
  answers: PatientSurveyAnswerType[],
  questions: SurveyQuestion[]
): boolean {
  if (targetPosition === 1) {
    return true; // First step is always accessible
  }

  const lastCompletedStep = getLastCompletedStep(answers, questions);

  // User can access any step up to one step ahead of their last completed step
  return targetPosition <= lastCompletedStep + 1;
}

/**
 * Gets survey completion percentage
 * @param answers - Array of user's survey answers
 * @param questions - Array of survey questions
 * @returns Completion percentage (0-100)
 */
export function getSurveyCompletionPercentage(answers: PatientSurveyAnswerType[], questions: SurveyQuestion[]): number {
  if (!questions || questions.length === 0) {
    return 1;
  }

  const answeredCount = answers.filter(
    (answer) =>
      answer.questionId &&
      answer.answer !== null &&
      answer.answer !== undefined &&
      answer.answer !== '' &&
      !(Array.isArray(answer.answer) && answer.answer.length === 0)
  ).length;

  return Math.round((answeredCount / questions.length) * 100);
}

const processMultipleChoiceAnswer = (answer: AnswersResponse) => {
  if (answer?.questionType === QuestionType.MULTIPLE_CHOICE && Array.isArray(answer.answer)) {
    const ansArr = answer?.answer?.filter((title) => answer?.options?.includes(title?.trim()));
    const otherText = answer?.answer?.filter((title) => !answer?.options?.includes(title));

    if (otherText && otherText.length > 0) {
      const other = answer?.options?.find((item) => item.toLowerCase().includes('other'));
      return { questionId: answer.questionId, answer: [...ansArr, other ?? ''], otherText: otherText[0] };
    }
    return { questionId: answer.questionId, answer: ansArr, otherText: otherText[0] };
  }
  return null;
};

const processDropdownAnswer = (answer: AnswersResponse) => {
  const isDropdownOrCheckbox = [QuestionType.CHECKBOXES, QuestionType.DROPDOWN].includes(answer?.questionType);
  const isNotGender = !answer?.questionText?.toLowerCase().includes('gender');

  if (isDropdownOrCheckbox && isNotGender) {
    const otherOption = answer?.options?.find(
      (option: string) => option.toLowerCase().includes('other') || option.toLowerCase().includes('please list')
    );

    if (answer.answer && otherOption && !answer?.options?.includes(answer.answer)) {
      return { questionId: answer.questionId, answer: otherOption, otherText: answer.answer.toString() };
    }
  }
  return { questionId: answer.questionId, answer: answer.answer };
};

export const processAnswerResponse = (answer: AnswersResponse) => {
  const multipleChoiceResult = processMultipleChoiceAnswer(answer);
  if (multipleChoiceResult) return multipleChoiceResult;

  return processDropdownAnswer(answer);
};
