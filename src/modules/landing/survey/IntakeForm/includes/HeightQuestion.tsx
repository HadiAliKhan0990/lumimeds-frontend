'use client';

import SlotCounter from 'react-slot-counter';
import { useState, useEffect, useRef } from 'react';
import { GoAlertFill, GoCheck } from 'react-icons/go';
import { motion } from 'framer-motion';
import { useFormikContext } from 'formik';
import { IntakeFormValues } from '@/types/survey';
import { calculateBMI } from '@/helpers/intakeSurvey';

interface Props {
  name: string;
}

export function HeightQuestion({ name }: Readonly<Props>) {
  const debounceTimerRef = useRef<number | null>(null);

  const { setFieldValue, values } = useFormikContext<IntakeFormValues>();

  const [feet, setFeet] = useState('0');
  const [inches, setInches] = useState('0');
  const [weight, setWeight] = useState('');
  const [bmi, setBmi] = useState(0);

  const emitValue = (answer: string) => {
    setFieldValue(name, answer);
  };

  const handleHeightChange = (value: string, part: 'feet' | 'inches') => {
    let newFeet = feet;
    let newInches = inches;

    if (part === 'feet') {
      newFeet = value;
      setFeet(value);
    } else if (part === 'inches') {
      newInches = value;
      setInches(value);
    }

    emitValue(`${newFeet}-${newInches},${weight}`);
  };

  const handleWeightChange = (value: string) => {
    if (!/^\d*$/.test(value)) return;

    setWeight(value);
    emitValue(`${feet}-${inches},${value}`);
  };

  useEffect(() => {
    // Clear any pending debounce
    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
    }

    // Debounce BMI calculation and API call to avoid firing on every keystroke
    debounceTimerRef.current = window.setTimeout(() => {
      const feetNum = feet ? parseInt(feet) : 0;
      const inchesNum = inches ? parseInt(inches) : 0;
      const weightNum = weight ? parseInt(weight) : 0;

      // Don't calculate BMI if feet is 0 (unrealistic height)
      if (feetNum === 0) {
        setBmi(0);
        return;
      }

      const heightInInches = feetNum * 12 + inchesNum;
      const calculatedBMI = calculateBMI(heightInInches, weightNum);

      setBmi(calculatedBMI);
    }, 500);

    return () => {
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
      }
    };
  }, [feet, inches, weight]);

  useEffect(() => {
    if (values[name]) {
      const [height = '', width = ''] = (values[name] as string).split(',');
      const [feetValue = '', inchesValue = ''] = height.split('-');

      setFeet(feetValue);
      setInches(inchesValue);
      setWeight(width);
    }
  }, [values[name]]);

  return (
    <>
      <div className='my-3 my-md-4 text-center'>
        <p className='text-dark-gray mb-2'>Your BMI</p>

        <motion.div
          key='bmi-value'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <SlotCounter
            value={bmi <= 0 ? '0.0' : bmi.toFixed(1)}
            duration={1}
            key={bmi}
            containerClassName='text-primary display-4 font-instrument-serif'
          />
        </motion.div>

        {bmi > 0 && bmi < 18 && (
          <motion.div
            key='warning'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div
              className='alert alert-warning gap-3 d-flex align-items-center mt-4 !tw-p-2 md:!tw-p-3 tw-text-sm md:tw-text-base'
              role='alert'
            >
              <GoAlertFill className='flex-shrink-0' size={24} color='#CA8A04' />
              <div className='fw-bold'>
                <span className='text-light-brown'>Your BMI is</span> {bmi.toFixed(1)}.{' '}
                <span className='text-light-brown'>Our doctors can only prescribe if your BMI is over</span> 18.
              </div>
            </div>
          </motion.div>
        )}

        {bmi >= 18 && (
          <motion.div
            key='success'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div
              className='alert alert-success gap-3 d-flex align-items-center mt-4 !tw-p-2 md:!tw-p-3 tw-text-sm md:tw-text-base'
              role='alert'
            >
              <GoCheck className='flex-shrink-0' size={24} color='#16A34A' />
              <div className='fw-bold text-start'>
                <span className='fw-lighter'>
                  Great news! Your BMI pre-qualifies you for treatment. A doctor will review the information you have
                  provided.
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
      <div className='row g-2 g-md-4'>
        <div className='col-6 text-start'>
          <label htmlFor='height-feet' className='form-label fw-medium'>
            Feet
          </label>
          <select
            id='height-feet'
            className='form-select dark-input border-black rounded-1'
            value={feet}
            onChange={(e) => handleHeightChange(e.target.value, 'feet')}
          >
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((f) => (
              <option key={f} value={String(f)}>
                {f}
              </option>
            ))}
          </select>
        </div>

        <div className='col-6 text-start'>
          <label htmlFor='height-inches' className='form-label fw-medium'>
            Inches
          </label>
          <select
            id='height-inches'
            className='form-select dark-input border-black rounded-1'
            value={inches}
            onChange={(e) => handleHeightChange(e.target.value, 'inches')}
          >
            {Array.from({ length: 12 }, (_, i) => i).map((inch) => (
              <option key={inch} value={String(inch)}>
                {inch}
              </option>
            ))}
          </select>
        </div>

        <div className='col-12 text-start'>
          <label htmlFor='height-weight' className='form-label fw-medium'>
            Weight (lbs)
          </label>
          <input
            id='height-weight'
            type='number'
            className='form-control dark-input border-black rounded-1'
            value={weight}
            onChange={(e) => handleWeightChange(e.target.value)}
            placeholder='e.g. 160'
            maxLength={3}
            inputMode='numeric'
            required
          />
        </div>
      </div>
    </>
  );
}
