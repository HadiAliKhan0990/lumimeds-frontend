import SurveyInputBox from '@/components/PatientSurvey/SurveyInputBox';
import SurveyMultipleChoice from '@/components/PatientSurvey/SurveyMultipleChoice';
import SurveyCheckbox from '@/components/PatientSurvey/SurveyCheckbox';
import SurveyMultiInbox from '@/components/PatientSurvey/SurveyMultiInbox';
import { QuestionType } from '@/lib/enums';
import { SurveyQuestion } from '@/store/slices/surveyQuestionSlice';
import { UploadDocument } from '@/components/PatientSurvey/UploadDocument';
import { PatientSurveyAnswerType } from '@/lib/types';

interface Props {
  question: SurveyQuestion;
  answers: PatientSurveyAnswerType[];
  setAnswers: (ag: PatientSurveyAnswerType[]) => void;
  patientId: string;
  surveyEmail: string;
}

export function SurveyForm({ question, setAnswers, answers, patientId, surveyEmail }: Readonly<Props>) {
  const surveyComponentMap = {
    [QuestionType.INPUT_BOX]: (
      <SurveyInputBox
        surveyEmail={surveyEmail}
        question={question}
        answers={answers}
        setAnswers={setAnswers}
        patientId={patientId}
      />
    ),
    [QuestionType.MULTIPLE_CHOICE]: (
      <SurveyMultipleChoice question={question} answers={answers} setAnswers={setAnswers} />
    ),
    [QuestionType.CHECKBOXES]: <SurveyCheckbox question={question} answers={answers} setAnswers={setAnswers} />,
    [QuestionType.DROPDOWN]: <SurveyCheckbox question={question} answers={answers} setAnswers={setAnswers} />,
    [QuestionType.FILE_UPLOAD]: <UploadDocument question={question} answers={answers} setAnswers={setAnswers} />,
    [QuestionType.MULTI_INBOX]: <SurveyMultiInbox question={question} answers={answers} setAnswers={setAnswers} />,
  };
  return (
    <div className='tw-space-y-4 tw-self-center w-100'>{surveyComponentMap[question.questionType as QuestionType]}</div>
  );
}
