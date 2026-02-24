'use client';

import React, { useRef, useState } from 'react';
import './styles.css';
import Image from 'next/image';
import SliderImg from '@/assets/weight-slider-test.png';

const WeightSlider = () => {
  const [weight, setWeight] = useState<number>(150);
  const weightRef = useRef<HTMLSpanElement>(null);
  const weightResultRef = useRef<HTMLSpanElement>(null);

  const onSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (weightRef.current && weightResultRef.current) {
      const weight = parseFloat(e.target.value);
      setWeight(weight);
      weightRef.current.innerHTML = e.target.value;
      weightResultRef.current.innerHTML = Math.round(weight * 0.2).toString();
    }
  };

  return (
    <section id="weight-slider-section">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <p className="font-weight-500 text-center" id="weight-slider-title">
              Discover{' '}
              <span
                style={{
                  fontFamily: 'Instrument Serif, serif',
                  fontWeight: 400,
                }}
              >
                How Much Weight
                <br />
              </span>
              you could lose with GLP-1s
            </p>
          </div>
          <div
            className="col-lg-6 d-flex flex-column justify-content-center mb-5 mb-lg-0"
            style={{ color: 'black' }}
          >
            <div
              style={{
                backgroundColor: '#CDDFFF',
                borderRadius: '24px',
                padding: '32px',
              }}
            >
              <div id="weight-slider-label">
                <p className="mb-5">Enter your current weight:</p>
                <div>
                  <span ref={weightRef} id="weight">
                    150
                  </span>
                  &nbsp;
                  <span>lbs</span>
                </div>
              </div>
              <input
                onChange={onSliderChange}
                type="range"
                value={weight}
                step="1"
                min="50"
                max="500"
                name="weight"
                id="weight-slider"
                style={{ marginBottom: '32px' }}
              />
              <div id="weight-slider-value">
                <p>You can lose up to:</p>
                <div>
                  <span ref={weightResultRef} id="weight-result">
                    30
                  </span>
                  &nbsp;
                  <span>lbs</span>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-6 d-none d-lg-flex justify-content-center">
            <Image src={SliderImg} alt="" className={'object-fit-contain'} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default WeightSlider;
