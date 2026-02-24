'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { Formik, Form, Field, FormikHelpers, FieldProps } from 'formik';
import * as Yup from 'yup';
import { TelegraSurveyQuestion, TelegraOptions, TelegraAnswerType, TelegraQuestionType } from '@/lib/types';
import { FaChevronLeft, FaChevronRight, FaRegCircle, FaRegCheckCircle } from 'react-icons/fa';
import { Spinner } from 'react-bootstrap';
import Dropzone from 'react-dropzone';
import { IoCloudUploadOutline, IoImageOutline } from 'react-icons/io5';
import { RiCloseLargeLine } from 'react-icons/ri';
import SignaturePad, { SignatureCanvas } from 'react-signature-canvas';
import { dataURLtoBlob } from '@/lib/helper';

interface SurveyFormProps {
  questions: TelegraSurveyQuestion[];
  onFinish: (answers: TelegraAnswerType[]) => void;
  isLoading?: boolean;
}

type FormValues = { [key: string]: string | string[] | File };

export default function DynamicSurveyForm({ questions, onFinish, isLoading }: SurveyFormProps) {
  const sigCanvas = useRef<SignatureCanvas>(null);

  const [index, setIndex] = useState(0);

  const grouped = useMemo(() => {
    return questions.reduce<Record<string, TelegraSurveyQuestion[]>>((acc, q) => {
      const id = q.metaData?.questionnaireId || 'default';
      acc[id] = acc[id] ? [...acc[id], q] : [q];
      return acc;
    }, {});
  }, [questions]);

  const questionnaireIds = Object.keys(grouped);

  const questionare = grouped[questionnaireIds[index]];

  const [answers, setAnswers] = useState<TelegraAnswerType[]>([]);
  const [formValues, setFormValues] = useState<FormValues>({});
  const [currentLocation, setCurrentLocation] = useState(questionare?.[0]?.metaData?.location || '');

  const questionMap = Object.fromEntries(questionare.map((q) => [q?.metaData?.location || '', q]));
  const currentQuestion = questionMap[currentLocation];

  const handleStepSubmit = (values: FormValues, actions: FormikHelpers<FormValues>) => {
    if (currentQuestion?.metaData?.isSignature && sigCanvas.current) {
      const isEmpty = sigCanvas.current.isEmpty();
      if (isEmpty) {
        actions.setFieldError(`${currentQuestion?.id}`, 'Signature is required');
        return;
      }

      const dataURL = sigCanvas.current.getCanvas().toDataURL('image/png');
      const blob = dataURLtoBlob(dataURL);
      const file = new File([blob], 'signature.png', { type: 'image/png' });
      values[`${currentQuestion?.id}`] = file;
    }

    const rawAnswer = values[`${currentQuestion?.id}`];

    let formattedAnswer;
    const options = currentQuestion?.metaData?.telegraOptions || [];
    if (Array.isArray(rawAnswer)) {
      formattedAnswer = rawAnswer.map(
        (val: string) => options.find((opt: TelegraOptions) => opt.label === val)?.label || val
      );
    } else {
      formattedAnswer = options.find((opt: TelegraOptions) => opt.label === rawAnswer)?.label || rawAnswer;
    }

    const answerObj: TelegraAnswerType = {
      questionId: currentQuestion?.id || '',
      answer: formattedAnswer as TelegraAnswerType['answer'],
      isRequired: !!currentQuestion?.isRequired,
    };

    setAnswers((prev) => [...prev.filter((a) => a.questionId !== currentQuestion?.id), answerObj]);

    setFormValues((prev) => ({
      ...prev,
      [`${currentQuestion?.id}`]: rawAnswer,
    }));

    const nextOpt = currentQuestion.metaData?.next
      ? currentQuestion.metaData
      : options.find((opt: TelegraOptions) => (rawAnswer as string | string[]).includes(opt.label));

    if (nextOpt?.next) {
      setCurrentLocation(nextOpt.next);
      actions.setTouched({});
    } else {
      if (index < questionnaireIds.length - 1) {
        setIndex((i) => i + 1);
      } else {
        onFinish([...answers.filter((a) => a.questionId !== currentQuestion?.id), answerObj]);
      }
    }
  };

  const images = {
    'image/jpeg': ['.jpeg', '.jpg'],
    'image/png': ['.png'],
    'image/gif': ['.gif'],
    'image/heic': ['.heic'],
    'image/heif': ['.heif'],
  };
  const fileTypes = { ...images, 'application/pdf': ['.pdf'] };
  const allowedMimeTypes = currentQuestion?.metaData?.isSignature ? Object.keys(images) : Object.keys(fileTypes);

  const validationSchema = useMemo(() => {
    let validator;
    switch (currentQuestion?.questionType) {
      case TelegraQuestionType.MULTIPLE_CHOICE:
        validator = Yup.array().min(currentQuestion?.isRequired ? 1 : 0, 'Please select at least one option');
        break;
      case TelegraQuestionType.FILE_UPLOAD:
        validator = currentQuestion?.metaData?.isSignature
          ? Yup.mixed()
          : Yup.mixed()
              .test('fileRequired', 'A file is required', (value) => {
                if (!currentQuestion?.isRequired) return true;
                return !!value;
              })
              .test('fileSize', 'File size must be less than 10MB', (value) => {
                if (!value) return !currentQuestion?.isRequired;
                return (value as File).size <= 10485760;
              })
              .test('fileType', 'Unsupported file type', (value) => {
                if (!value) return !currentQuestion?.isRequired;
                return allowedMimeTypes.includes((value as File).type);
              });
        break;
      default:
        validator = currentQuestion?.isRequired
          ? Yup.string().required('We would appreciate your response to this question')
          : Yup.string().nullable();
        break;
    }
    return Yup.object({ [`${currentQuestion?.id}`]: validator });
  }, [currentQuestion]);

  const renderField = (q: TelegraSurveyQuestion) => {
    const fieldName = q?.id || '';
    if (
      [TelegraQuestionType.MULTIPLE_CHOICE, TelegraQuestionType.RADIO, TelegraQuestionType.DROPDOWN].includes(
        q?.questionType as TelegraQuestionType
      )
    ) {
      return (
        <Field name={fieldName}>
          {({ field, form }: FieldProps) => {
            const value = field.value || (q?.questionType === TelegraQuestionType.MULTIPLE_CHOICE ? [] : '');
            const isMulti = q?.questionType === TelegraQuestionType.MULTIPLE_CHOICE;
            const handleClick = (opt: string) => {
              if (isMulti) {
                const isNone = opt.toLowerCase().includes('none');
                if (isNone) {
                  form.setFieldValue(fieldName, [opt]);
                } else {
                  const valuesWithoutNone = [...value].filter((o) => !o?.toLowerCase?.()?.includes?.('none'));
                  const arr = [...valuesWithoutNone];
                  const next = arr.includes(opt) ? arr.filter((v) => v !== opt) : [...arr, opt];
                  form.setFieldValue(fieldName, next);
                }
              } else {
                form.setFieldValue(fieldName, opt);
              }
            };
            const selected = isMulti ? (value as string[]) : [value as string];
            return (
              <div className='d-grid gap-3'>
                {q?.metaData?.telegraOptions?.map((opt) => (
                  <button
                    key={opt.label}
                    type='button'
                    onClick={() => handleClick(opt.label)}
                    className={`survey-option-button tw-rounded border tw-w-full tw-px-3 py-3 tw-flex tw-items-center tw-justify-start tw-gap-x-4 ${
                      selected.includes(opt.label) ? 'selected' : ''
                    }`}
                  >
                    {selected.includes(opt.label) ? (
                      <FaRegCheckCircle className='survey-option-icon flex-shrink-0' />
                    ) : (
                      <FaRegCircle className='survey-option-icon flex-shrink-0' />
                    )}
                    <p className='survey-option-text tw-text-base text-start tw-font-semibold m-0'>
                      {opt.label}
                    </p>
                  </button>
                ))}
              </div>
            );
          }}
        </Field>
      );
    }

    if (q?.questionType === TelegraQuestionType.FILE_UPLOAD) {
      return q.metaData?.isSignature ? (
        <Field name={fieldName}>
          {({ form }: FieldProps) => (
            <div className='shadow-md rounded-1 text-end'>
              {!isLoading && (
                <button
                  type='button'
                  className='btn-no-style me-3 my-2'
                  onClick={() => {
                    if (sigCanvas.current) {
                      sigCanvas.current.clear();
                      form.setFieldValue(fieldName, undefined);
                    }
                  }}
                >
                  Clear
                </button>
              )}
              <SignaturePad ref={sigCanvas} canvasProps={{ className: 'h-250px w-100' }} />
            </div>
          )}
        </Field>
      ) : (
        <Field name={fieldName}>
          {({ field, form }: FieldProps) => {
            const answer = field.value;

            const onDrop = async (files: File[]) => {
              form.setFieldValue(fieldName, files[0]);
            };

            function handleRemove() {
              form.setFieldValue(fieldName, undefined);
            }

            const allowedExtensions = Object.values(q.metaData?.isSignature ? images : fileTypes)
              .flat()
              .join(', ');
            return (
              <>
                <Dropzone onDrop={onDrop}>
                  {({ getRootProps, getInputProps, isDragActive }) => (
                    <div
                      {...getRootProps()}
                      className={
                        'tw-p-12 tw-rounded-lg file-dropzone tw-bg-white tw-flex tw-flex-col tw-items-center tw-gap-y-3 ' +
                        (isDragActive ? 'drag-active' : '')
                      }
                    >
                      <input {...getInputProps()} />
                      <IoCloudUploadOutline size={24} />
                      <span>Click or drag file to this area to upload</span>
                      <p className='tw-text-sm tw-text-gray-500'>Allowed file types: {allowedExtensions}</p>
                    </div>
                  )}
                </Dropzone>
                {(answer instanceof File || (answer && typeof answer === 'object' && 'name' in answer)) && (
                  <div className='rounded-2 file-name-container tw-flex tw-justify-between tw-items-center tw-bg-white mt-4'>
                    <div className='tw-inline-flex tw-items-center tw-gap-x-2'>
                      <IoImageOutline size={24} />
                      <span>{(answer as File).name}</span>
                    </div>
                    <RiCloseLargeLine className='cursor-pointer' onClick={handleRemove} />
                  </div>
                )}
              </>
            );
          }}
        </Field>
      );
    }

    if (q?.questionType === TelegraQuestionType.INPUT_BOX) {
      const isDescription =
        q.questionText?.toLowerCase().includes('height') || q.questionText?.toLowerCase().includes('width');
      return (
        <Field name={fieldName}>
          {({ field, form }: FieldProps) => {
            const value = field.value === undefined ? '' : String(field.value);
            return (
              <input
                {...field}
                value={value}
                onChange={(e) => {
                  form.setFieldValue(fieldName, e.target.value);
                }}
                type={q.validation || 'text'}
                placeholder={isDescription ? q?.description || 'Enter your answer' : 'Enter your answer'}
                className='form-control dark-input border-black rounded-1'
              />
            );
          }}
        </Field>
      );
    }

    return null;
  };

  useEffect(() => {
    const nextGroup = grouped[questionnaireIds[index]] || [];
    const firstLoc = nextGroup[0]?.metaData?.location || '';
    setCurrentLocation(firstLoc);
  }, [index]);

  const isFirst = !currentQuestion?.metaData?.previous;

  return (
    <div className='form-container mx-auto text-center mb-5'>
      <Formik
        enableReinitialize
        initialValues={formValues}
        validationSchema={validationSchema}
        onSubmit={handleStepSubmit}
        validateOnMount
        validateOnChange
        validateOnBlur
        isInitialValid={false}
      >
        {({ isValid, setFieldTouched, setTouched, setErrors, errors, touched }) => (
          <Form>
            <div className='mb-5'>
              {currentQuestion ? (
                <div className='mb-6'>
                  <label className='display-6 tw-font-tertiary mb-5 block'>{currentQuestion?.questionText}</label>
                  {currentQuestion?.metaData?.isSignature && (
                    <p className='text-muted'>{currentQuestion?.description}</p>
                  )}
                  {renderField(currentQuestion)}
                  {(currentQuestion?.questionType === TelegraQuestionType.FILE_UPLOAD
                    ? errors[`${currentQuestion.id}`]
                    : errors[`${currentQuestion.id}`] && touched[`${currentQuestion.id}`]) && (
                    <div className='text-danger text-sm mt-2'>{errors[`${currentQuestion.id}`]}</div>
                  )}
                </div>
              ) : (
                <div className='d-flex align-items-center flex-column gap-3 text-lg justify-content-center w-100 h-100 py-5 text-center'>
                  <Spinner className='size-75' />
                  Survey is being loaded... Please wait.
                </div>
              )}
            </div>
            <div className='row'>
              {!isFirst && (
                <div className='col-6'>
                  <button
                    type='button'
                    onClick={() => {
                      const prevLoc = currentQuestion?.metaData?.previous;
                      if (!prevLoc) return;
                      setCurrentLocation(prevLoc);
                      setTimeout(() => {
                        setTouched({});
                        setErrors({});
                      }, 100);
                    }}
                    disabled={isFirst}
                    className='btn rounded-pill py-12 btn-light border-secondary d-flex align-items-center w-100 justify-content-center gap-2'
                  >
                    <FaChevronLeft /> Back
                  </button>
                </div>
              )}
              <div className={isFirst ? 'col-12' : 'col-6'}>
                {currentQuestion?.metaData?.isSignature ? (
                  <button
                    type='submit'
                    disabled={isLoading}
                    onClick={() => setFieldTouched(`${currentQuestion.id}`, true)}
                    className='btn rounded-pill py-12 btn-primary d-flex align-items-center w-100 justify-content-center gap-2'
                  >
                    {index === questionnaireIds.length - 1 ? 'Submit' : 'Next'}{' '}
                    {isLoading ? <Spinner size='sm' /> : <FaChevronRight />}
                  </button>
                ) : (
                  <button
                    type='submit'
                    disabled={isLoading || !isValid}
                    onClick={() => setFieldTouched(`${currentQuestion.id}`, true)}
                    className='btn rounded-pill py-12 btn-primary d-flex align-items-center w-100 justify-content-center gap-2'
                  >
                    {index === questionnaireIds.length - 1 ? 'Submit' : 'Next'}{' '}
                    {isLoading ? <Spinner size='sm' /> : <FaChevronRight />}
                  </button>
                )}
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
