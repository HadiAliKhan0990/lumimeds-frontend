'use client';

import { useState } from 'react';
import DatePicker, { DatePickerProps } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';




export interface DateTimeFieldProps extends Omit<DatePickerProps, 'onChange'> {
    value?: string;
    onChangeDate?: (iso: string | Date | null) => void;
    className?: string;
}

export function DateTimeField({
    value,
    onChangeDate,
    className,
    wrapperClassName,
    maxDate,
    placeholderText = 'Select date & time',
}: DateTimeFieldProps) {
    const [selected, setSelected] = useState<Date | null>(value ? new Date(value) : null);

    const handleChange = (date: Date | null) => {
        setSelected(date);

        onChangeDate?.(date ? date.toISOString() : '');
    };

    return (
        <DatePicker
            selected={selected}
            onChange={handleChange}
            showTimeSelect
            timeIntervals={15}
            timeCaption='Time'
            dateFormat='MM/dd/yyyy h:mm aa'
            className={`form-control shadow-none ${className}`}
            wrapperClassName={wrapperClassName}
            maxDate={maxDate}
            placeholderText={placeholderText}
        />
    );
}