'use client';

import { SurveyQuestion } from '@/store/slices/surveyQuestionSlice';
import { useState, InputHTMLAttributes } from 'react';
import { IoClose } from 'react-icons/io5';
import { IoMdAdd } from 'react-icons/io';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  handleChange: (ag: string) => void;
  question: SurveyQuestion;
}

export const TagsInput = ({ value, handleChange, question, ...props }: Props) => {
  const [inputValue, setInputValue] = useState('');
  const tags = value ? (value as string).split(',').filter((tag) => tag.trim()) : [];

  const addTag = () => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue) {
      const filteredTags = tags.filter((tag) => tag.toLowerCase() !== 'none');
      const newTags = [...filteredTags, trimmedValue];
      handleChange(newTags.join(','));
      setInputValue('');
    }
  };

  const removeTag = (indexToRemove: number) => {
    const newTags = tags.filter((_, index) => index !== indexToRemove);
    handleChange?.(newTags.join(','));
  };

  return (
    <>
      <div className='form-control dark-input border-black rounded-1 d-flex align-items-center gap-2'>
        <input
          {...props}
          type='text'
          value={inputValue}
          autoFocus
          onChange={(e) => setInputValue(e.target.value)}
          className='border-0 p-0 text-dark'
          placeholder={question?.description || ''}
        />
        <button
          className='btn btn-outline-primary py-1 flex-shrink-0 rounded-pill d-flex align-items-center justify-content-center gap-2'
          type='button'
          onClick={addTag}
        >
          Add
          <IoMdAdd size={20} />
        </button>
      </div>
      {tags.length > 0 && (
        <div className='d-flex align-items-center gap-2 mt-3 flex-wrap'>
          {tags.map((tag, index) => (
            <div
              key={index}
              className='d-inline-flex tw-items-center gap-1 py-1 px-2 rounded-pill border border-primary text-primary'
            >
              <span className='text-sm'>{tag}</span>
              <IoClose size={16} onClick={() => removeTag(index)} className='cursor-pointer text-danger' />
            </div>
          ))}
        </div>
      )}
    </>
  );
};
