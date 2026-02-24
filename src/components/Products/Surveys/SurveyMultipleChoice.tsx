import { SurveyQuestion } from '@/store/slices/surveyQuestionSlice';
import React from 'react';
import { FaRegCircle } from 'react-icons/fa6';
import { FaRegCheckCircle } from 'react-icons/fa';
import { SurveyAnswer } from '@/lib/types';

interface Props {
  question: SurveyQuestion;
  answers: SurveyAnswer[];
  setAnswers: React.Dispatch<React.SetStateAction<SurveyAnswer[]>>;
}

const SurveyMultipleChoice = ({ question, answers, setAnswers }: Props) => {
  const answer = answers.find((answer) => answer.questionId === question.id)?.answer as string[];

  const handleClick = (option: string) => {
    const _answers = answers.map((answer) => {
      if (answer.questionId === question.id) {
        const answers = answer.answer as string[];
        const isAnswerPresent = answers.includes(option);
        const _answers = isAnswerPresent ? answers.filter((a) => a !== option) : option === 'None' ? [option] : [...answers.filter((a) => a.toLowerCase() !== 'none'), option];
        return {
          questionId: question.id,
          answer: _answers,
          isRequired: question.isRequired ?? undefined,
          isValid: _answers.length > 0,
        };
      }

      return answer;
    });
    setAnswers(_answers);
  };

  return question.options?.map((option, i) => (
    <button
      key={i}
      type='button'
      onClick={() => handleClick(option)}
      className={`survey-option-button tw-rounded border tw-w-full tw-px-3 py-3 tw-flex tw-items-center tw-justify-start tw-gap-x-4 ${
        answer.includes(option) ? 'selected' : ''
      }`}
    >
      {answer.includes(option) ? (
        <FaRegCheckCircle className='survey-option-icon flex-shrink-0' />
      ) : (
        <FaRegCircle className='survey-option-icon flex-shrink-0' />
      )}
      <p className='survey-option-text tw-text-base text-start tw-font-semibold m-0'>
        {option}
      </p>
    </button>
  ));
};

export default SurveyMultipleChoice;
