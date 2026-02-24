'use client';

import React, { useState } from 'react';
import { FaRegEyeSlash } from 'react-icons/fa';
import { FaEye } from 'react-icons/fa6';

const PasswordInput = ({ ...props }: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>) => {
  const [isHidden, setIsHidden] = useState(true);

  return (
    <div style={{ position: 'relative' }}>
      <input type={isHidden ? 'password' : 'text'} {...props} />
      <button
        type='button'
        style={{
          padding: 0,
          background: 'transparent',
          margin: 0,
          border: 0,
          position: 'absolute',
          right: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
        }}
        onClick={() => setIsHidden(!isHidden)}
      >
        {isHidden ? <FaRegEyeSlash size={24} /> : <FaEye size={24} />}
      </button>
    </div>
  );
};

export default PasswordInput;
