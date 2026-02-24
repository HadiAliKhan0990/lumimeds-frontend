'use client';

import { PatientSurveyAnswerType } from '@/lib/types';
import { SurveyQuestion } from '@/store/slices/surveyQuestionSlice';
import { Field, useFormikContext } from 'formik';
import { FaRegCheckCircle, FaRegCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';

interface Props {
  question: SurveyQuestion;
}

export const MultipleChoice = ({ question }: Readonly<Props>) => {
  const { values, setFieldValue } = useFormikContext<PatientSurveyAnswerType>();

  return (
    <div className='tw-grid tw-gap-3 tw-grid-cols-1'>
      {question?.options?.map((opt, index) => {
        const isSelected = Array.isArray(values.answer) && values.answer.includes(opt);
        const isOtherOption = opt.toLowerCase().includes('other');
        const shouldShowInput = isSelected && isOtherOption;

        const handleOptionClick = () => {
          const isNone = opt.toLowerCase().includes('none');
          const isOther = opt.toLowerCase().includes('other');

          if (isNone) {
            const arr = Array.isArray(values.answer) && values.answer.includes(opt) ? [] : [opt];
            setFieldValue('answer', arr);
          } else if (isOther) {
            const arr = Array.isArray(values.answer)
              ? [...values.answer.filter((item) => !item.toLowerCase().includes('none'))]
              : [];
            const idx = arr.indexOf(opt);
            if (idx > -1) {
              arr.splice(idx, 1);
              setFieldValue('otherText', '');
            } else {
              arr.push(opt);
            }
            setFieldValue('answer', arr);
            // Don't auto-skip for "Other" option as user needs to enter text
          } else {
            const arr = Array.isArray(values.answer)
              ? [...values.answer.filter((item) => !item.toLowerCase().includes('none'))]
              : [];
            const idx = arr.indexOf(opt);
            if (idx > -1) {
              arr.splice(idx, 1);
            } else {
              arr.push(opt);
            }
            setFieldValue('answer', arr);
          }
        };

        return (
          <div key={opt + index}>
            <motion.button
              type='button'
              onClick={handleOptionClick}
              className={`tw-rounded border ${
                isSelected ? 'border-primary text-white bg-primary' : 'border-secondary bg-white'
              } tw-w-full tw-px-3 tw-py-2 md:tw-p-4 tw-flex tw-items-center tw-justify-start tw-gap-2 md:tw-gap-3 tw-text-sm md:tw-text-base tw-text-start`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.3,
                ease: 'easeOut',
              }}
            >
              {isSelected ? (
                <FaRegCheckCircle className='flex-shrink-0' color={isSelected ? 'white' : undefined} />
              ) : (
                <FaRegCircle className='flex-shrink-0' />
              )}
              {opt}
            </motion.button>
            {shouldShowInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className='tw-mt-4'
              >
                <Field 
                  name='otherText' 
                  className='form-control dark-input border-black rounded-1'
                />
              </motion.div>
            )}
          </div>
        );
      })}
    </div>
  );
};
