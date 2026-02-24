'use client';

import { SurveyQuestion } from '@/store/slices/surveyQuestionSlice';
import { TextInputType } from '@/lib/enums';
import { PatientSurveyAnswerType } from '@/lib/types';

interface Props {
  question: SurveyQuestion;
  answers: PatientSurveyAnswerType[];
  setAnswers: (answers: PatientSurveyAnswerType[]) => void;
}

export default function SurveyMultiInbox({ question, answers, setAnswers }: Readonly<Props>) {
  console.log('SurveyMultiInbox - question:', question);
  console.log('SurveyMultiInbox - multiInputs:', question.multiInputs);

  if (!question.multiInputs || question.multiInputs.length === 0) {
    return <div className='tw-text-gray-500'>No input fields configured</div>;
  }

  // Get current answer for this question
  const currentAnswer = answers.find((a) => a.questionId === question.id);

  // Parse multiInboxAnswers from the answer string (if it exists)
  let multiInboxAnswers: Record<string, string> = {};
  if (currentAnswer?.answer && typeof currentAnswer.answer === 'string') {
    try {
      multiInboxAnswers = JSON.parse(currentAnswer.answer);
    } catch {
      // If parsing fails, initialize empty object
      multiInboxAnswers = {};
    }
  }

  // Initialize empty values for each field if not present
  question.multiInputs.forEach((input) => {
    if (input.fieldName && !multiInboxAnswers[input.fieldName]) {
      multiInboxAnswers[input.fieldName] = '';
    }
  });

  const handleInputChange = (fieldName: string, value: string) => {
    const updatedMultiInboxAnswers = {
      ...multiInboxAnswers,
      [fieldName]: value,
    };

    // Update answers array
    const updatedAnswers = answers.filter((a) => a.questionId !== question.id);
    updatedAnswers.push({
      questionId: question.id || '',
      answer: JSON.stringify(updatedMultiInboxAnswers),
      isValid: Object.values(updatedMultiInboxAnswers).every((v) => v.trim() !== ''),
    });

    setAnswers(updatedAnswers);
  };

  return (
    <div className='tw-space-y-4'>
      {question.multiInputs.map((input, index) => {
        const inputType = input.fieldType || TextInputType.TEXT;
        const fieldValue = multiInboxAnswers[input.fieldName || ''] || '';

        return (
          <div key={`${question.id}-${input.fieldName || index}`} className='tw-space-y-2'>
            {input.fieldName && (
              <label htmlFor={input.fieldName} className='tw-block tw-text-sm tw-font-medium tw-text-gray-700'>
                {input.fieldName}
                {question.isRequired && <span className='tw-text-red-500 tw-ml-1'>*</span>}
              </label>
            )}

            <input
              id={input.fieldName}
              type={inputType === TextInputType.DATETIME ? 'datetime-local' : inputType}
              placeholder={input.placeholder}
              value={fieldValue}
              onChange={(e) => handleInputChange(input.fieldName || '', e.target.value)}
              className='form-control form-control-lg shadow-none text-base tw-w-full'
            />
          </div>
        );
      })}
    </div>
  );
}
