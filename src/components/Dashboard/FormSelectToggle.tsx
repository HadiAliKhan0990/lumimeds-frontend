import { forwardRef, MouseEvent } from 'react';

interface FormSelectToggle {
  children: React.ReactNode;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
}

export const FormSelectToggle = forwardRef<HTMLButtonElement, FormSelectToggle>(({ children, onClick }, ref) => {
  return (
    <button className='form-select text-start shadow-none' type={'button'} onClick={onClick} ref={ref}>
      {children}
    </button>
  );
});

FormSelectToggle.displayName = 'FormSelectToggle';
