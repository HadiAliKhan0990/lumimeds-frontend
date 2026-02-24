import { RootState } from '@/store';
import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { LuSquarePen } from 'react-icons/lu';
import { pharmacyColor } from '@/lib';
import ReactSelect, { GroupBase, OptionsOrGroups } from 'react-select';

interface OptionValue {
  label: string;
  value: string;
}

export default function MedicationPopup() {
  const medication = useSelector((state: RootState) => state.medication);
  const pharmacies = useSelector((state: RootState) => state.pharmacies);

  const pharmacyOptions: OptionsOrGroups<unknown, GroupBase<unknown>> = useMemo(() => {
    return pharmacies.map((pharmacy) => ({
      label: pharmacy.name,
      value: pharmacy.id,
    }));
  }, [pharmacies]);

  const [pharmacy, setPharmacy] = useState({
    label: medication?.pharmacy?.name ?? '',
    value: medication?.pharmacy?.id ?? '',
  });

  useEffect(() => {
    if (medication)
      setPharmacy({
        label: medication?.pharmacy?.name ?? '',
        value: medication?.pharmacy?.id ?? '',
      });
  }, [medication]);

  const handleUpdatePharmacy = (option: OptionValue) => {
    setPharmacy(option);
  };

  return (
    <div>
      <div className='text-4xl mb-4 fw-medium'>{medication.productType?.name}</div>
      <div className='row g-3 align-items-center'>
        <div className='text-xs col-4'>Pharmacy</div>
        <div className='col-sm-4 col-8'>
          <ReactSelect
            options={pharmacyOptions}
            value={pharmacy}
            onChange={(option) => handleUpdatePharmacy(option as OptionValue)}
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
            }}
          />
        </div>
        <div className='col-sm-4 d-none d-sm-block' />
        <div className='text-xs col-4'>Description</div>
        <div className='text-xs col-6 col-sm-4'>{medication.description || '-'}</div>
        <div className='col-sm-4 col-2 text-center'>
          <button className='btn-no-style'>
            <LuSquarePen />
          </button>
        </div>
        <div className='col-4'>Dosage</div>
        <div className='col-sm-4 col-6 text-xs'>{medication.dosage}</div>
        <div className='col-sm-4 col-2 text-center'>
          <button className='btn-no-style'>
            <LuSquarePen />
          </button>
        </div>
      </div>
    </div>
  );
}
