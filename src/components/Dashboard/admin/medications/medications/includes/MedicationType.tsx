'use client';

import { useWindowWidth } from '@/hooks/useWindowWidth';
import { RootState } from '@/store';
import { Medication } from '@/store/slices/medicationSlice';
import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import ReactSelect, { GroupBase, OptionsOrGroups } from 'react-select';

interface Props {
  medication: Medication;
}

export const MedicationType = ({ medication }: Props) => {
  const { windowWidth } = useWindowWidth();

  const productTypes = useSelector((state: RootState) => state.productTypes);

  const [productType, setProductType] = useState({
    label: medication?.productType?.name ?? '',
    value: medication?.productType?.id,
  });

  const productTypeOptions: OptionsOrGroups<unknown, GroupBase<unknown>> = useMemo(() => {
    return productTypes.map((productType) => ({
      label: productType.name,
      value: productType.id,
    }));
  }, [productTypes]);

  useEffect(() => {
    setProductType({ label: medication?.productType?.name ?? '', value: medication?.productType?.id });
  }, [medication]);
  return (
    <div key={medication.id} onClick={(event) => event.stopPropagation()}>
      <ReactSelect
        key={medication.id}
        options={productTypeOptions}
        isSearchable={false}
        value={productType}
        onChange={(option) => setProductType(option as typeof productType)}
        styles={{
          control: (baseStyles) => ({
            ...baseStyles,
            width: windowWidth < 768 ? '100%' : '80%',
            borderRadius: '8px',
          }),
          indicatorSeparator: () => ({
            display: 'none',
          }),
          menu: (base) => ({
            ...base,
            zIndex: 9999,
          }),
        }}
      />
    </div>
  );
};
