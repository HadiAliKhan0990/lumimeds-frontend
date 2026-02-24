'use client';

import Select, { Props as SelectProps, StylesConfig } from 'react-select';

interface Props extends SelectProps {
  width?: string;
  customClassNames?: SelectProps['classNames'];
}

export const ReactSelect = ({ customClassNames, className, styles, ...props }: Props) => {
  const defaultClassNames = {
    control: () => `w-100 rounded`,
    indicatorSeparator: () => 'd-none',
    placeholder: () => 'text-nowrap',
  };

  const mergedClassNames = {
    ...defaultClassNames,
    ...customClassNames,
  };

  const defaultStyles: StylesConfig = {
    menu: (baseStyles) => ({
      ...baseStyles,
      zIndex: 100,
    }),
    control: (baseStyles) => ({
      ...baseStyles,
      borderColor: '#dee2e6',
      '&:hover': {
        borderColor: '#adb5bd',
      },
    }),
    option: (baseStyles, state) => ({
      ...baseStyles,
      backgroundColor: state.isSelected ? '#0d6efd' : state.isFocused ? '#e9ecef' : 'white',
      color: state.isSelected ? 'white' : '#212529',
      '&:active': {
        backgroundColor: '#0d6efd',
      },
    }),
  };

  const mergedStyles: StylesConfig = {
    ...defaultStyles,
    ...styles,
    menu: (baseStyles, state) => ({
      ...defaultStyles.menu?.(baseStyles, state),
      ...(styles?.menu?.(baseStyles, state) || {}),
    }),
    control: (baseStyles, state) => ({
      ...defaultStyles.control?.(baseStyles, state),
      ...(styles?.control?.(baseStyles, state) || {}),
    }),
    option: (baseStyles, state) => ({
      ...defaultStyles.option?.(baseStyles, state),
      ...(styles?.option?.(baseStyles, state) || {}),
    }),
  };

  return (
    <Select {...props} className={`tw-text-left ${className}`} classNames={mergedClassNames} styles={mergedStyles} />
  );
};
