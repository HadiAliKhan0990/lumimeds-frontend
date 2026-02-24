import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { SurveyQuestion } from '@/store/slices/surveyQuestionSlice';
import { useState } from 'react';
import { SurveyAnswer } from '@/lib/types';
import { CustomPhoneInput } from '@/components/elements/Inputs/CustomPhoneInput';

interface Props {
  question: SurveyQuestion;
  answers: SurveyAnswer[];
  setAnswers: React.Dispatch<React.SetStateAction<SurveyAnswer[]>>;
  patientId: string;
  email?: string; // Add email parameter for pre-populating email fields
}

export default function SurveyInputBox({ question, setAnswers, answers, patientId, email }: Props) {
  // Check if this is an email question that should be disabled
  const isEmailQuestion = question.questionText?.toLowerCase().includes('email address');
  const isDisabled = isEmailQuestion;

  // Use email from URL params if this is an email question, otherwise use existing answer
  const initial =
    isEmailQuestion && email ? email : (answers.find((a) => a.questionId === question.id)?.answer as string) || '';

  const [inputValue, setInputValue] = useState<string>(initial);

  const validateField = (value: string, question: SurveyQuestion): boolean => {
    if (!question.isRequired && !value) return true;

    switch (question.validation) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
      case 'phone':
        return value.length >= 10;
      case 'number':
        if (question.questionText?.toLowerCase().includes('bank account number')) {
          const trimmedValue = value.trim();
          const regexTest = /^[0-9a-zA-Z]+$/.test(trimmedValue);
          const isValid = trimmedValue.length > 0 && regexTest;
          return isValid;
        }
        const num = parseFloat(value);
        if (question.questionText?.toLowerCase().includes('years of experience')) {
          return !isNaN(num) && num >= 0 && num <= 99;
        }
        return !isNaN(num);
      default:
        if (
          question.questionText?.toLowerCase().includes('first name') ||
          question.questionText?.toLowerCase().includes('last name')
        ) {
          return value.trim().length > 0 && /^[a-zA-Z\s]+$/.test(value.trim());
        }
        return value.trim().length > 0;
    }
  };

  const setValue = (value: string) => {
    // Don't allow changes if field is disabled
    if (isDisabled) return;

    setInputValue(value);
    const isValid = validateField(value, question);

    const updated = answers.map((a) => (a.questionId === question.id ? { ...a, answer: value, isValid: isValid } : a));
    setAnswers(updated);
  };
  return (
    <div className={`tw-space-y-3 ${['date', 'datetime'].includes(question.validation!) ? 'tw-flex tw-flex-col' : ''}`}>
      {question.validation === 'phone' ? (
        <CustomPhoneInput
          value={inputValue}
          onChange={(e) => {
            const phone = e.target.value;
            setValue(phone);
          }}
          name='contactNumber'
          className='form-control dark-input border-black rounded-1'
        />
      ) : question.validation === 'date' && !patientId ? (
        <DatePicker
          selected={inputValue ? new Date(inputValue) : null}
          onChange={(date) =>
            setValue(
              date
                ? new Intl.DateTimeFormat('en-US', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                  }).format(date)
                : ''
            )
          }
          dateFormat='MM/dd/yyyy'
          className='form-control dark-input border-black rounded-1'
          placeholderText={question.description ?? ''}
          minDate={new Date()}
        />
      ) : (
        <input
          type={
            question.questionText?.toLowerCase().includes('bank account number')
              ? 'text'
              : question.validation === 'number'
              ? 'number'
              : 'text'
          }
          className={`form-control dark-input border-black rounded-1 ${isDisabled ? 'disabled-field' : ''}`}
          value={inputValue}
          disabled={isDisabled}
          onChange={(e) => {
            let value = e.target.value;
            if (
              question.validation === 'number' &&
              question.questionText?.toLowerCase().includes('years of experience')
            ) {
              const num = parseFloat(value);
              if (value && (isNaN(num) || num < 0 || num > 99)) {
                return;
              }
            }
            if (
              question.questionText?.toLowerCase().includes('first name') ||
              question.questionText?.toLowerCase().includes('last name')
            ) {
              value = value.replace(/[^a-zA-Z\s]/g, '');
            }
            if (question.questionText?.toLowerCase().includes('bank account number')) {
              value = value.replace(/[^0-9a-zA-Z]/g, '');
            }
            setValue(value);
          }}
          placeholder={question.description ?? ''}
          maxLength={question.validationRules?.max}
          min={
            question.validation === 'number' && question.questionText?.toLowerCase().includes('years of experience')
              ? 0
              : undefined
          }
          max={
            question.validation === 'number' && question.questionText?.toLowerCase().includes('years of experience')
              ? 99
              : undefined
          }
        />
      )}
    </div>
  );
}
