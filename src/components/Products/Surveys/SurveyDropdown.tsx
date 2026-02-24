import { SurveyAnswer } from '@/lib/types';
import { SurveyQuestion } from '@/store/slices/surveyQuestionSlice';
import React from 'react';
import ReactSelect, { SingleValue } from 'react-select';

interface Props {
  question: SurveyQuestion;
  answers: SurveyAnswer[];
  setAnswers: React.Dispatch<React.SetStateAction<SurveyAnswer[]>>;
}

const SurveyDropdown = ({ question, answers, setAnswers }: Props) => {
  const options = question.options?.map((option) => ({
    label: option,
    value: option,
  }));

  const selectedAnswer = answers.find((a) => a.questionId === question.id);
  const selectedValue = options?.find((opt) => opt.value === selectedAnswer?.answer) ?? null;

  const handleOnChange = (newValue: SingleValue<{ label: string; value: string }>) => {
    const _answers = answers.map((answer) => {
      if (answer.questionId === question.id)
        return {
          questionId: question.id,
          answer: newValue?.value ?? answer.answer,
          isRequired: question.isRequired ?? undefined,
          isValid: true,
        };
      return answer;
    });
    setAnswers(_answers);
  };

  return (
    <ReactSelect
      options={options}
        isSearchable={true}
        openMenuOnFocus={true}
      placeholder={'--Click to select--'}
      onChange={handleOnChange}
      value={selectedValue}
      styles={{
        control: (baseStyles) => ({
          ...baseStyles,
          border: '1px solid black',
          borderRadius: '4px',
          color: '#000 !important',
          fontStyle: 'bold',
          textAlign: 'left',
          padding: '6px 9px',
        }),
        placeholder: (baseStyles) => ({
          ...baseStyles,
          color: '#000',
        }),
        indicatorSeparator: () => ({
          display: 'none',
        }),
      }}
    />
  );
};

export default SurveyDropdown;
