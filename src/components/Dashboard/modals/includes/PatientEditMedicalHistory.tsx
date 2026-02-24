'use client';

import toast from 'react-hot-toast';
import ReactSelect from 'react-select';
import { MEDICAL_CONDITIONS } from '@/constants';
import { patientMedicalHistorySchema, PatientMedicalHistorySchema } from '@/lib/schema/patientMedicalHistory';
import type { Error } from '@/lib/types';
import { Response } from '@/lib/types';
import { RootState } from '@/store';
import { setModal } from '@/store/slices/modalSlice';
import { useUpdatePatientDetailsMutation } from '@/store/slices/patientsApiSlice';
import { yupResolver } from '@hookform/resolvers/yup';
import { isAxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { setSinglePatientAllergies } from '@/store/slices/singleOrderSlice';
import { setPatient } from '@/store/slices/patientSlice';
import { IoClose } from 'react-icons/io5';
import { Modal, CircularProgress } from '@/components/elements';

export function PatientEditMedicalHistory() {
  const dispatch = useDispatch();
  const { modalType } = useSelector((state: RootState) => state.modal);
  const patient = useSelector((state: RootState) => state.patient);
  const isOpen = modalType === 'Edit Patient Medical History';
  const { patient: singlePatient } = useSelector((state: RootState) => state.singleOrder);
  const ctx = useSelector((state: RootState) => state.modal.ctx) as unknown as {
    allergies: string;
    conditions: string;
    medications: string;
    chronicConditions: boolean;
    reactionTo?: string[];
  };

  const [updatePatientDetails, { isLoading }] = useUpdatePatientDetailsMutation();

  // Get the exact "None" value from MEDICAL_CONDITIONS (case-insensitive)
  const noneValue = MEDICAL_CONDITIONS.find((c) => c.toLowerCase() === 'none') || 'None';

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<PatientMedicalHistorySchema>({
    defaultValues: {
      allergies: '',
      medicalConditions: [
        {
          label: noneValue,
          value: noneValue,
        },
      ],
      medications: '',
      reactionTo: [],
    },
    resolver: yupResolver(patientMedicalHistorySchema),
  });

  const [reactionToInput, setReactionToInput] = useState('');

  const handleClose = () => {
    reset();
    dispatch(setModal({ modalType: undefined }));
  };

  const handleEditMedicalHistory = async (data: PatientMedicalHistorySchema) => {
    const keys = Object.keys(data);

    const updatedPatientDetails = {
      ...keys.map((k) => {
        if (k !== 'medicalConditions' && k !== 'otherCondition' && k !== 'reactionTo')
          return { [k]: data[k as keyof typeof data] };
        if (k === 'medicalConditions') {
          return {
            medicalConditions: data.medicalConditions
              ?.map((condition) => {
                if (condition.value === 'Other') return data.otherCondition;
                return condition.value;
              })
              .join(', '),
          };
        }
        if (k === 'reactionTo') {
          return {
            reactionTo: Array.isArray(data.reactionTo)
              ? data.reactionTo.filter((r): r is string => r != null && typeof r === 'string' && r.trim().length > 0)
              : [],
          };
        }
        return {};
      }),
    };

    const mergedObject = Object.assign({}, ...Object.values(updatedPatientDetails));

    try {
      const { success, message }: Response = await updatePatientDetails({
        id: patient.id,
        medicalHistory: {
          ...mergedObject,
        },
      }).unwrap();

      if (success) {
        if (singlePatient?.email === patient.email) {
          dispatch(setSinglePatientAllergies(mergedObject.allergies));
        }

        if (patient.medicalHistory) {
          dispatch(
            setPatient({
              ...patient,
              medicalHistory: {
                ...patient.medicalHistory,
                ...mergedObject,
              },
            })
          );
        }

        toast.success(message || 'Patient Medical History Updated!');
        handleClose();
      } else {
        toast.error(message || 'Error updating Patient Medical History!');
      }
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data.message);
      } else {
        toast.error((error as Error).data.message || 'Error updating Patient Medical History!');
      }
    }
  };

  useEffect(() => {
    if (patient) {
      const otherConditionArr: string[] = [];
      const conditions = (ctx?.conditions.split(', ') ?? [])
        .map((condition) => {
          if (
            !MEDICAL_CONDITIONS.some(
              (c) =>
                c.toLowerCase() ===
                condition
                  .replace(/\b\w+\b/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                  .toLowerCase()
            )
          ) {
            otherConditionArr.push(condition);
            return null;
          } else
            return condition.replace(/\b\w+\b/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
        })
        .filter((condition) => condition !== null);

      const otherCondition = otherConditionArr.join(', ') ?? '';
      if (otherCondition !== '') {
        setValue('otherCondition', otherCondition);
      }
      setValue('allergies', ctx?.allergies ?? '');

      let medicalConditions: { label: string; value: string }[] = [];

      // Set medical conditions
      if (conditions.length === 0 || conditions.some((c) => c != null && c.toLowerCase() === noneValue.toLowerCase())) {
        medicalConditions = [{ label: noneValue, value: noneValue }];
      } else {
        const mappedConditions = conditions
          .filter((condition): condition is string => condition != null)
          .map((condition) => ({
            label: condition,
            value: condition,
          }));

        if (otherCondition !== '') {
          medicalConditions.push({
            label: 'Other',
            value: 'Other',
          });
        }
        medicalConditions = mappedConditions;
        setValue('medicalConditions', mappedConditions);
      }

      const reactionToValue = ctx?.reactionTo && Array.isArray(ctx.reactionTo) ? ctx.reactionTo : [];

      reset({
        allergies: ctx?.allergies ?? '',
        medications: ctx?.medications ?? '',
        otherCondition: otherCondition,
        medicalConditions,
        reactionTo: reactionToValue,
      });
    }
  }, [patient]);

  const footer = (
    <div className='tw-grid tw-grid-cols-2 tw-gap-2 tw-w-full'>
      <button
        type='button'
        className='tw-w-full tw-px-4 tw-py-2 tw-text-primary tw-border tw-border-solid tw-border-primary tw-rounded-lg tw-bg-white tw-transition-all hover:tw-bg-primary/10'
        onClick={handleClose}
      >
        Discard
      </button>
      <button
        type='submit'
        form='patient-edit-medical-history-form'
        disabled={!isDirty || isLoading}
        className='tw-w-full tw-px-4 tw-py-2 tw-bg-primary tw-text-white tw-rounded-lg tw-flex tw-items-center tw-justify-center tw-gap-2 tw-transition-all hover:tw-bg-primary/90 disabled:tw-opacity-70 disabled:tw-pointer-events-none'
      >
        {isLoading && <CircularProgress className='!tw-w-4 !tw-h-4' />}
        Save
      </button>
    </div>
  );

  return (
    <Modal title='Medical History' isOpen={isOpen} onClose={handleClose} size='md' footer={footer} showFooter={true}>
      <form
        id='patient-edit-medical-history-form'
        onSubmit={handleSubmit(handleEditMedicalHistory)}
        className='tw-space-y-4'
      >
        <div>
          <label htmlFor='allergies' className='form-label small text-secondary'>
            Allergies
          </label>
          <input
            {...register('allergies')}
            className={`form-control shadow-none ${errors.allergies ? ' is-invalid' : ''}`}
            type='text'
          />
          {!!errors.allergies && <span className='small text-danger'>{errors.allergies.message}</span>}
        </div>
        <div>
          <label htmlFor='medicalConditions' className='form-label small text-secondary'>
            Medical Conditions
          </label>
          <ReactSelect
            isMulti
            options={MEDICAL_CONDITIONS.filter(
              (condition) =>
                !watch('medicalConditions')?.some(
                  (selected) => selected.value.toLowerCase() === condition.toLowerCase()
                )
            ).map((condition) => ({
              label: condition.replace(
                /\b\w+\b/g,
                (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
              ),
              value: condition,
            }))}
            value={watch('medicalConditions')}
            onChange={(newValue) => {
              const newValues = newValue as Array<{ label: string; value: string }>;
              const noneSelectedInNew = newValues.some(
                (option) => option.value.toLowerCase() === noneValue.toLowerCase()
              );

              const currentValues = watch('medicalConditions') || [];
              const noneSelectedInCurrent = currentValues.some(
                (option) => option.value.toLowerCase() === noneValue.toLowerCase()
              );

              // If "None" was just selected (fresh selection), reset selection to only "None"
              if (noneSelectedInNew && !noneSelectedInCurrent) {
                setValue('medicalConditions', [{ label: noneValue, value: noneValue }], {
                  shouldDirty: true,
                  shouldValidate: true,
                });
                return;
              }

              // ✅ If "None" is already selected and user selects another value, remove "None"
              if (noneSelectedInCurrent && newValues.length > 1) {
                const filtered = newValues.filter((option) => option.value.toLowerCase() !== noneValue.toLowerCase());
                setValue('medicalConditions', filtered, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
                return;
              }

              // Default case
              setValue('medicalConditions', newValues, {
                shouldDirty: true,
                shouldValidate: true,
              });
            }}
            isSearchable={true}
            styles={{
              indicatorSeparator: () => ({
                display: 'none',
              }),
            }}
          />
          {!!errors.medicalConditions && <span className='small text-danger'>{errors.medicalConditions.message}</span>}
        </div>
        {watch('medicalConditions')?.some((condition) => condition.value === 'Other') && (
          <div>
            <input
              {...register('otherCondition')}
              className={`form-control shadow-none ${errors.otherCondition ? ' is-invalid' : ''}`}
              type='text'
            />
            {!!errors.otherCondition && <span className='small text-danger'>{errors.otherCondition.message}</span>}
          </div>
        )}
        <div>
          <label htmlFor='medications' className='form-label small text-secondary'>
            Medications
          </label>
          <input
            {...register('medications')}
            className={`form-control shadow-none ${errors.medications ? ' is-invalid' : ''}`}
          />
          {!!errors.medications && <span className='small text-danger'>{errors.medications.message}</span>}
        </div>
        <div className='col-12'>
          <label htmlFor='reactionTo' className='form-label small text-secondary'>
            Reaction To
          </label>
          <div className='position-relative'>
            <input
              id='reactionTo'
              type='text'
              value={reactionToInput}
              onChange={(e) => setReactionToInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const trimmedValue = reactionToInput.trim();
                  if (trimmedValue) {
                    const currentReactions = watch('reactionTo') || [];
                    const updatedReactions = [...currentReactions, trimmedValue];
                    setValue('reactionTo', updatedReactions, {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                    setReactionToInput('');
                  }
                }
              }}
              className={`form-control shadow-none ${errors.reactionTo ? ' is-invalid' : ''}`}
              placeholder='Enter a reaction and press Enter'
            />
          </div>
          {(() => {
            const reactionToValue = watch('reactionTo');
            return reactionToValue && Array.isArray(reactionToValue) && reactionToValue.length > 0 ? (
              <div className='d-flex align-items-center gap-2 mt-2 flex-wrap'>
                {reactionToValue
                  .filter((reaction): reaction is string => reaction != null && typeof reaction === 'string')
                  .map((reaction, index) => (
                    <div
                      key={index}
                      className='d-inline-flex tw-items-center gap-1 py-1 px-2 rounded-pill border border-primary text-primary bg-light'
                    >
                      <span className='text-sm'>{reaction}</span>
                      <IoClose
                        size={16}
                        onClick={() => {
                          const currentReactions = watch('reactionTo') || [];
                          const updatedReactions = currentReactions.filter((_, i) => i !== index);
                          setValue('reactionTo', updatedReactions, {
                            shouldDirty: true,
                            shouldValidate: true,
                          });
                        }}
                        className='cursor-pointer text-danger'
                        style={{ cursor: 'pointer' }}
                      />
                    </div>
                  ))}
              </div>
            ) : null;
          })()}
          {!!errors.reactionTo && <span className='small text-danger'>{errors.reactionTo.message}</span>}
        </div>
      </form>
    </Modal>
  );
}
