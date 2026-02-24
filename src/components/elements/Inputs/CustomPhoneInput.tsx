import { formatUSPhoneWithoutPlusOne } from '@/lib/helper';
import { InputHTMLAttributes, useEffect, useState } from 'react';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';

export const custonmPhoneInputOnKeyChange = (event: React.KeyboardEvent<HTMLInputElement>) => {
  if (event.key === 'Backspace') {
    const currentValue = (event.target as HTMLInputElement).value || '';
    const input = event.target as HTMLInputElement;
    const cursorPosition = input.selectionStart || 0;

    // If cursor is on a formatting character, move it back one position
    if (cursorPosition > 0 && ['(', ')', ' ', '-'].includes(currentValue[cursorPosition - 1])) {
      event.preventDefault();
      const newPosition = cursorPosition - 1;
      input.setSelectionRange(newPosition, newPosition);
    }
  }
};

export const custonmPhoneInputOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  const phone = event.target.value;

  // Extract only digits from the input
  const digits = phone.replace(/\D/g, '');

  // Limit to maximum 10 digits
  const limitedDigits = digits.slice(0, 10);

  // Format the limited phone number
  const formattedPhone = formatUSPhoneWithoutPlusOne(limitedDigits);

  return formattedPhone;
};

export const CustomPhoneInput = ({ onChange, className, ...props }: React.ComponentPropsWithoutRef<'input'>) => {
  return (
    <input
      type='tel'
      onChange={(event) => {
        const formattedPhone = custonmPhoneInputOnChange(event);

        onChange?.({ ...event, target: { ...event.target, value: formattedPhone } });
      }}
      onKeyDown={custonmPhoneInputOnKeyChange}
      className={`form-control rounded-1 ${className}`}
      {...props}
    />
  );
};

export const CustomInputFloating = ({ id, type, placeholder, ...props }: InputHTMLAttributes<HTMLInputElement>) => {
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
