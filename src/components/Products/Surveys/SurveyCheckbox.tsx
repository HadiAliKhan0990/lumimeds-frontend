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

const SurveyCheckbox = ({ question, answers, setAnswers }: Props) => {
  const answer = answers.find((answer) => answer.questionId === question.id)?.answer as string;

  const handleClick = (option: string) => {
    const _answers = answers.map((answer) => {
      if (answer.questionId === question.id)
        return {
          questionId: question.id,
          answer: option,
          isRequired: question.isRequired ?? undefined,
          isValid: true,
        };
      return answer;
    });
    setAnswers(_answers);
  };

  return question.options?.map((option, i) => (
    <button
      key={i}
      style={{
        border: `1px solid ${answer === option ? 'transparent' : 'black'}`,
      }}
      onClick={() => handleClick(option)}
      className={`tw-rounded tw-bg-${answer === option ? 'primary' : 'white'} tw-w-full tw-px-3 py-3 tw-flex tw-items-center tw-justify-start tw-gap-x-4`}
    >
      {answer === option ? <FaRegCheckCircle color='white' /> : <FaRegCircle />}
      <p className={`tw-text-base tw-font-semibold m-0 tw-text-${answer === option ? 'white' : 'black'}`}>{option}</p>
    </button>
  ));
};

export default SurveyCheckbox;
