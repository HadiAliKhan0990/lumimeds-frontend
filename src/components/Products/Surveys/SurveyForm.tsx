import { QuestionType } from '@/lib/enums';
import React from 'react';
import SurveyInputBox from './SurveyInputBox';
import { SurveyQuestion } from '@/store/slices/surveyQuestionSlice';
import SurveyCheckbox from './SurveyCheckbox';
import SurveyMultipleChoice from './SurveyMultipleChoice';
import SurveyDocument from './SurveyDocument';
import SurveyDropdown from './SurveyDropdown';
import { SurveyAnswer } from '@/lib/types';

interface Props {
  question: SurveyQuestion;
  answers: SurveyAnswer[];
  setAnswers: React.Dispatch<React.SetStateAction<SurveyAnswer[]>>;
  patientId: string;
  email?: string; // Add email parameter
}

const SurveyInputType = ({ question, setAnswers, answers, patientId, email }: Props) => {
  switch (question?.questionType) {
    case QuestionType.INPUT_BOX:
      return <SurveyInputBox question={question} answers={answers} setAnswers={setAnswers} patientId={patientId} email={email} />;
    case QuestionType.MULTIPLE_CHOICE:
      return <SurveyMultipleChoice question={question} answers={answers} setAnswers={setAnswers} />;
    case QuestionType.CHECKBOXES:
      return <SurveyCheckbox question={question} answers={answers} setAnswers={setAnswers} />;
    case QuestionType.DROPDOWN:
      return <SurveyDropdown question={question} answers={answers} setAnswers={setAnswers} />;
    case QuestionType.FILE_UPLOAD:
      return <SurveyDocument question={question} answers={answers} setAnswers={setAnswers} patientId={patientId} />;
  }
};

export default function SurveyForm({ question, setAnswers, answers, patientId, email }: Props) {
  return (
    <div className='tw-space-y-6 tw-self-center w-100'>
      <SurveyInputType question={question} answers={answers} setAnswers={setAnswers} patientId={patientId} email={email} />
    </div>
  );
}
