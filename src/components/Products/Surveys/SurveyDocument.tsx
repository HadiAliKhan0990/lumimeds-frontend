'use client';

import React from 'react';
import Dropzone from 'react-dropzone';
import { FaX } from 'react-icons/fa6';
import { IoCloudUploadOutline, IoImageOutline } from 'react-icons/io5';
import { SurveyQuestion } from '@/store/slices/surveyQuestionSlice';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import axios from 'axios';
import toast from 'react-hot-toast';
import { client } from '@/lib/baseQuery';
import { SurveyAnswer } from '@/lib/types';

interface Props {
  question: SurveyQuestion;
  answers: SurveyAnswer[];
  setAnswers: React.Dispatch<React.SetStateAction<SurveyAnswer[]>>;
  patientId: string;
}

const SurveyDocument = ({ question, answers, setAnswers, patientId }: Props) => {
  const product = useSelector((state: RootState) => state.productType);
  const answer = answers.find((answer) => answer.questionId === question.id)?.answer as string;

  const onDrop = async (files: File[]) => {
    const { data } = await client.post('/surveys/upload-url', {
      surveyId: product.surveyId,
      productId: product.id,
      patientId: patientId,
      fileName: files[0].name, // e.g., 'image.jpeg'
    });
    if (data) {
      const {
        data: { uploadUrl, fileUrl },
      }: { data: { uploadUrl: string; fileUrl: string } } = data;
      const res = await axios.put(uploadUrl, files[0], {
        headers: {
          'Content-Type': files[0].type,
        },
      });
      if (res) {
        const _answers = answers.map((answer) => {
          if (answer.questionId === question.id)
            return {
              questionId: question.id,
              answer: fileUrl,
              isRequired: question.isRequired ?? undefined,
              isValid: true,
            };
          return answer;
        });
        setAnswers(_answers);
      }
    } else
      toast.error('Error Uploading Document!', {
        position: 'top-right',
        duration: 3000,
      });
  };

  const getFilename = (url: string) => url.split('/')[url.split('/').length - 1];

  return (
    <>
      <Dropzone
        maxSize={10485760}
        accept={{
          'image/jpeg': [],
          'image/png': [],
          'application/msword': [],
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [],
          'application/pdf': [],
        }}
        onDrop={onDrop}
      >
        {({ getRootProps, getInputProps }) => (
          <div {...getRootProps()} className='tw-p-12 tw-rounded-lg file-dropzone tw-bg-white tw-flex tw-flex-col tw-items-center tw-gap-y-3'>
            <input {...getInputProps()} />
            <IoCloudUploadOutline size={24} color='#484848' />
            <p className='m-0 tw-text-[#484848]'>Click or drag file to this area to upload</p>
          </div>
        )}
      </Dropzone>
      {answer && answer.length > 0 && (
        <div style={{ border: '1px solid #CBCBCB' }} className='tw-rounded tw-flex tw-justify-between tw-items-center tw-p-3 tw-bg-white'>
          <div className='tw-inline-flex tw-items-center tw-gap-x-2'>
            <IoImageOutline size={24} />
            <span>{getFilename(answer)}</span>
          </div>

          <button className='p-0 m-0 tw-border-0 tw-bg-transparent'>
            <FaX />
          </button>
        </div>
      )}
    </>
  );
};

export default SurveyDocument;
