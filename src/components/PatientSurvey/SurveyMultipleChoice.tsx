import { SurveyQuestion } from '@/store/slices/surveyQuestionSlice';
import { FaRegCircle } from 'react-icons/fa6';
import { FaRegCheckCircle } from 'react-icons/fa';
import { PatientSurveyAnswerType } from '@/lib/types';
import { usePathname } from 'next/navigation';
import { ROUTES } from '@/constants';
import { motion } from 'framer-motion';

interface Props {
  question: SurveyQuestion;
  answers: PatientSurveyAnswerType[];
  setAnswers: (ag: PatientSurveyAnswerType[]) => void;
}

export default function SurveyMultipleChoice({ question, answers, setAnswers }: Props) {
  const pathname = usePathname();

  const answer = (answers.find((answer) => answer.questionId === question.id)?.answer as string[]) || [];
  const otherValue = answers.find((answer) => answer.questionId === question.id)?.otherText;

  const handleClick = (option: string) => {
    const _answers = answers.map((answer) => {
      if (answer.questionId === question.id) {
        const currentSelected = (answer.answer as string[]) || [];
        const isNoneOfTheAbove =
          option.toLowerCase().includes('none of the above') || option.toLowerCase().includes('does not apply');

        if (isNoneOfTheAbove) {
          // If "none of the above" is clicked, clear all other selections
          if (currentSelected.includes(option)) {
            return {
              questionId: question.id,
              answer: [],
              isValid: false,
            };
          } else {
            return {
              questionId: question.id,
              answer: [option],
              isValid: true,
            };
          }
        } else {
          // If any other option is clicked, remove "none of the above"
          const filteredSelected = currentSelected.filter(
            (item) =>
              !item.toLowerCase().includes('none of the above') && !item.toLowerCase().includes('does not apply')
          );

          if (filteredSelected.includes(option)) {
            const newAnswers = filteredSelected.filter((item) => item !== option);
            return {
              questionId: question.id,
              answer: newAnswers,
              isValid: newAnswers.length > 0,
            };
          } else {
            return {
              questionId: question.id,
              answer: [...filteredSelected, option],
              isValid: true,
            };
          }
        }
      }
      return answer;
    });
    setAnswers(_answers);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.slice(0, 100);

    const _answers = answers.map((answer) => {
      if (answer.questionId === question.id) {
        return {
          ...answer,
          otherText: value,
        };
      }
      return answer;
    });
    setAnswers(_answers);
  };

  return question.options?.map((option, i) => {
    const isSelected = answer?.includes(option);
    const isOtherOption =
      (option.toLowerCase().includes('other') && !option.toLowerCase().includes('another')) ||
      option.toLowerCase().includes('please list');
    const shouldShowInput = isSelected && isOtherOption && !pathname.includes(ROUTES.PATIENT_SURVEY);

    return (
      <div key={i}>
        <button
          style={{ border: `1px solid ${isSelected ? 'transparent' : 'black'}` }}
          onClick={() => handleClick(option)}
          className={`tw-w-full tw-rounded border tw-cursor-pointer tw-px-3 tw-py-2 md:tw-p-4 tw-text-sm md:tw-text-base tw-flex tw-select-none tw-items-center tw-justify-start tw-gap-x-4 tw-bg-${
            isSelected ? 'primary' : 'white'
          }`}
        >
          {isSelected ? (
            <FaRegCheckCircle className='flex-shrink-0' color='white' />
          ) : (
            <FaRegCircle className='flex-shrink-0' />
          )}
          <span className={`tw-text-sm md:tw-text-base text-start tw-text-${isSelected ? 'white' : 'black'}`}>
            {option}
          </span>
        </button>

        {shouldShowInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className='tw-mt-4'
          >
            <input
              type='text'
              value={otherValue}
              onChange={handleChange}
              maxLength={100}
              className='form-control dark-input border-black rounded-1'
            />
          </motion.div>
        )}
      </div>
    );
  });
}
