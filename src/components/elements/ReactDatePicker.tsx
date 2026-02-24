import { FiCalendar } from 'react-icons/fi';
import DatePicker, { DatePickerProps } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface ReactDatePickerProps {
  allowManualDateEntry?: boolean;
  className?: string;
}

export const ReactDatePicker = ({ className, allowManualDateEntry = false, onKeyDown, ...props }: Readonly<ReactDatePickerProps & DatePickerProps>) => (
  <DatePicker
    showIcon
    className={`form-control shadow-none !tw-pl-9 tw-cursor-pointer ${className}`}
    popperPlacement='bottom-start'
    icon={<FiCalendar className='tw-pointer-events-none' size={16} />}
    popperClassName='react-datepicker-popper'
    onKeyDown={(event) => {
      if (!allowManualDateEntry) {
        event.preventDefault();
      }
      if (onKeyDown) {
        onKeyDown(event);
      }
    }}
    {...props}
  />
);
