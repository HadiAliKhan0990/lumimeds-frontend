'use client';

import React from 'react';

interface DividerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    icon?: React.ReactNode;
    shadowDirection?: 'left' | 'right';
    shadowClassName?: string;
    dividerClassName?: string;
}

export const DividerButton: React.FC<DividerButtonProps> = ({
    icon,
    shadowDirection = 'right',
    className = '',
    dividerClassName = '',
    ...buttonProps
}) => {


    return (<div className={`tw-flex ${shadowDirection === 'right' ? 'tw-flex-row-reverse' : 'tw-flex-row'} tw-items-center tw-justify-center tw-gap-2`}>
        <div className={`tw-w-1 tw-h-5 tw-rounded-full  tw-bg-light-beige ${dividerClassName}`}>

        </div>
        <button
            className={`tw-inline-flex tw-items-center tw-justify-center tw-gap-2 tw-transition-all tw-duration-200  ${className}`}
            {...buttonProps}

        >
            {icon}
        </button>
    </div>

    );
};



