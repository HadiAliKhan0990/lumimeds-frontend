'use client';

import { pharmacyColor } from '@/lib';
import { RootState } from '@/store';
import { Medication } from '@/store/slices/medicationSlice';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import ReactSelect, { GroupBase, OptionsOrGroups } from 'react-select';

interface Props {
  medication: Medication;
}

export const PharmacySelect = ({ medication }: Props) => {
  const pharmacies = useSelector((state: RootState) => state.pharmacies);

  const [pharmacy, setPharmacy] = useState({
    label: medication?.pharmacy?.name ?? '',
    value: medication?.pharmacy?.id,
  });

  const pharmacyOptions: OptionsOrGroups<unknown, GroupBase<unknown>> = useMemo(() => {
    return pharmacies.map((pharmacy) => ({
      label: pharmacy.name,
      value: pharmacy.id,
    }));
  }, [pharmacies]);

  return (
    <div onClick={(event) => event.stopPropagation()}>
      <ReactSelect
        key={medication.id}
        options={pharmacyOptions}
        value={pharmacy}
        isSearchable={false}
        onChange={(option) => setPharmacy(option as typeof pharmacy)}
        styles={{
          control: (baseStyles) => ({
            ...baseStyles,
            width: '100%',
            borderRadius: '8px',
            background: pharmacyColor(pharmacy.label ?? ''),
          }),
          indicatorSeparator: () => ({
            display: 'none',
          }),
          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
        }}
      />
    </div>
  );
};
