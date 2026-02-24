import { RefObject, useEffect } from 'react';

interface Props {
  ref: RefObject<HTMLElement | null>;
  handler: () => void;
}

export const useOutsideClick = ({ ref, handler }: Props): void => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (ref.current && event.target instanceof Node && !ref.current.contains(event.target)) {
        handler();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, handler]);
};
