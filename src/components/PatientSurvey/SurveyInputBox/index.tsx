import { SurveyQuestion } from '@/store/slices/surveyQuestionSlice';
import { useMemo, useState } from 'react';
import { PatientSurveyAnswerType } from '@/lib/types';
import { InputTypeQuestionFields } from './includes/InputTypeQuestionFields';

interface Props {
  surveyEmail: string;
  question: SurveyQuestion;
  answers: PatientSurveyAnswerType[];
  setAnswers: (ag: PatientSurveyAnswerType[]) => void;
  patientId: string;
}

export default function SurveyInputBox({ surveyEmail, question, answers, setAnswers, patientId }: Readonly<Props>) {
  const [touched, setTouched] = useState(false);

  // Current answer value and validity
  const answerEntry = useMemo(() => answers.find((a) => a.questionId === question.id), [answers, question.id]);
  const isValid = answerEntry?.isValid;

  // Helper to update answer
  const updateAnswer = (qid: string, val: string, valid: boolean) => {
    setAnswers(answers.map((a) => (a.questionId === qid ? { ...a, answer: val, isValid: valid } : a)));
  };

  const handleChange = (raw: string) => {
    setTouched(true);

    // Check if this is a height/weight question or just height question
    const textKey = question.questionText?.toLowerCase() ?? '';
    // Check for height/weight question: must contain BOTH "height" AND "weight"
    const isHeightWeight = textKey.includes('height') && textKey.includes('weight');
    // Check for simple height question: contains "height" but NOT "weight"
    const isHeight = textKey.includes('height') && !textKey.includes('weight');

    // General validation
    let valid = false;
    switch (question.validation) {
      case 'email':
        valid = /^[A-Za-z0-9!#$%&'*+\/=?^_`{|}~.\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/.test(raw);
        break;
      case 'date':
      case 'datetime':
        valid = raw.length > 0 && new Date(raw).toString() !== 'Invalid Date';
        break;
      case 'phone':
        valid = /^[2-9]\d{2}[2-9]\d{6}$/.test(raw);
        break;
      case 'number':
        valid = /^\d+(\.\d+)?$/.test(raw);
        break;
      default:
        // Height/Weight validation: format should be "feet-inches,weight" (e.g., "5-10,160")
        // Allow partial input during typing: "feet-inches," is valid while user is entering weight
        if (isHeightWeight) {
          // Allow both partial format (feet-inches,) and complete format (feet-inches,weight)
          const heightWeightPattern = /^\d+-\d+(,\d*)?$/;
          if (heightWeightPattern.test(raw)) {
            const [heightPart = '', weightPart = ''] = raw.split(',');
            const [feetStr = '', inchesStr = ''] = heightPart.split('-');
            const feet = Number.parseInt(feetStr, 10);
            const inches = Number.parseInt(inchesStr, 10);

            // Validate height ranges:
            // - feet must be 1-8 (not 0)
            // - inches must be 0-11
            const isValidFeet = !Number.isNaN(feet) && feet >= 1 && feet <= 8;
            const isValidInches = !Number.isNaN(inches) && inches >= 0 && inches <= 11;
            
            // If weight is provided, validate it (must be > 0, maxLength=3 handles max value)
            if (weightPart && weightPart.trim() !== '') {
              const weight = Number.parseInt(weightPart, 10);
              const isValidWeight = !Number.isNaN(weight) && weight > 0;
              valid = isValidFeet && isValidInches && isValidWeight;
            } else {
              // Partial input: only validate height, weight can be empty during input
              valid = isValidFeet && isValidInches;
            }
          }
          // If pattern doesn't match, valid remains false
        } else if (isHeight) {
          // Height validation: format should be "feet-inches" (e.g., "5-10")
          const heightPattern = /^\d+-\d+$/;
          if (heightPattern.test(raw)) {
            const [feetStr, inchesStr] = raw.split('-');
            const feet = Number.parseInt(feetStr, 10);
            const inches = Number.parseInt(inchesStr, 10);

            // Validate: feet must be 1-8, inches must be 0-11, and height must be at least 1 foot
            valid =
              !Number.isNaN(feet) && !Number.isNaN(inches) && feet >= 1 && feet <= 8 && inches >= 0 && inches <= 11;
          }
          // If pattern doesn't match, valid remains false
        } else {
          valid = !!raw;
        }
    }

    // For optional questions, an empty value should be considered valid
    if (!question.isRequired && !raw) {
      valid = true;
    }

    updateAnswer(question.id || '', raw, valid);
  };

  const handleBlur = () => setTouched(true);

  return (
    <div className={`${['date', 'datetime'].includes(question.validation || '') ? 'tw-flex tw-flex-col' : ''}`}>
      <InputTypeQuestionFields
        question={question}
        answers={answers}
        patientId={patientId}
        handleChange={handleChange}
        handleBlur={handleBlur}
        surveyEmail={surveyEmail}
      />
      {touched && question.isRequired && !isValid && <ErrorMessage question={question} />}
    </div>
  );
}

const ErrorMessage = ({ question }: { question: SurveyQuestion }) => {
  const textKey = question.questionText?.toLowerCase() ?? '';
  // Check for height/weight question: must contain BOTH "height" AND "weight"
  const isHeightWeight = textKey.includes('height') && textKey.includes('weight');
  // Check for simple height question: contains "height" but NOT "weight"
  const isHeight = textKey.includes('height') && !textKey.includes('weight');

  switch (question.validation) {
    case 'email':
      return <div className='text-danger text-start tw-text-sm mt-2'>Should be a valid email</div>;
    case 'date':
    case 'datetime':
      return <div className='text-danger text-start tw-text-sm mt-2'>Should be a valid date</div>;
    case 'phone':
      return <div className='text-danger text-start tw-text-sm mt-2'>Should be a valid US phone number</div>;
    case 'number':
      return <div className='text-danger text-start tw-text-sm mt-2'>Should be a valid number</div>;
    case 'tags':
      return <div className='text-danger text-start tw-text-sm mt-2'>Please enter at least one tag</div>;
    default:
      if (isHeightWeight) {
        return <div className='text-danger text-start tw-text-sm mt-2'>Please enter a valid height and weight</div>;
      }
      if (isHeight) {
        return <div className='text-danger text-start tw-text-sm mt-2'>Please select a valid height</div>;
      }
      return null;
  }
};
