'use client';

import SlotCounter from 'react-slot-counter';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { calculateBMI } from '@/helpers/intakeSurvey';

interface Props {
  value?: string;
  handleChange: (raw: string) => void;
  handleBlur: () => void;
}

/**
 * Height and Weight Question Component for GeneralSurvey
 * Stores value as comma-separated: "feet-inches,weight" (e.g., "5-10,160")
 */
export function HeightWeightQuestion({ value, handleChange, handleBlur }: Readonly<Props>) {
  const debounceTimerRef = useRef<number | null>(null);

  const [feet, setFeet] = useState('0');
  const [inches, setInches] = useState('0');
  const [weight, setWeight] = useState('');
  const [bmi, setBmi] = useState(0);

  const emitValue = (answer: string) => {
    handleChange(answer);
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
    
    // Limit to max 3 digits
    if (value.length > 3) return;

    setWeight(value);
    emitValue(`${feet}-${inches},${value}`);
  };

  useEffect(() => {
    // Clear any pending debounce
    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
    }

    // Debounce BMI calculation to avoid firing on every keystroke
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
    if (value) {
      const [height = '', width = ''] = (value as string).split(',');
      const [feetValue = '', inchesValue = ''] = height.split('-');

      setFeet(feetValue);
      setInches(inchesValue);
      setWeight(width);
    }
  }, [value]);

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
            onBlur={handleBlur}
          >
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((f) => (
              <option key={'feet' + f} value={String(f)}>
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
            onBlur={handleBlur}
          >
            {Array.from({ length: 12 }, (_, i) => i).map((inch) => (
              <option key={'inches' + inch} value={String(inch)}>
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
            onBlur={handleBlur}
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
