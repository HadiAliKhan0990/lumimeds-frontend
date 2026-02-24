'use client';

import { InputHTMLAttributes, useEffect, useState } from 'react';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';

export const ProfileField = ({ id, type, placeholder, ...props }: InputHTMLAttributes<HTMLInputElement>) => {
  const [show, setShow] = useState(false);
  const [isPassword, setIsPassword] = useState(false);

  useEffect(() => {
    if (type) {
      setIsPassword(type === 'password');
    }
  }, [type]);

  return (
    <div className='form-floating profile_field position-relative'>
      <input
        type={show ? 'text' : type === 'password' ? 'password' : type}
        placeholder={placeholder}
        className='form-control pe-5 shadow-none'
        id={id}
        {...props}
      />
      <label htmlFor={id}>{placeholder}</label>
      {isPassword && (
        <span
          onClick={() => setShow((v) => !v)}
          className='cursor-pointer position-absolute top-50 end-0 translate-middle-y me-3'
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
        </span>
      )}
    </div>
  );
};
