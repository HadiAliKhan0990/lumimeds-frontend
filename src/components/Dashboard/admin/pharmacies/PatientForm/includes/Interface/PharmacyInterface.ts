import { DosageMapping, PharmacyProduct } from '@/store/slices/adminPharmaciesSlice';
import { GroupBase, OptionsOrGroups } from 'react-select';

export interface DrugsCrafterPharmacyItemProps {
  products?: PharmacyProduct[];
  drugForms: OptionsOrGroups<unknown, GroupBase<unknown>>;
  shippingServices: Array<{ id: number; name: string }>;
  quantitites?: string[] | null;
  dosageData?: {
    semaglutide: number[];
    tirzepatide: number[];
    nad: {
      im: number[];
      sq: number[];
    };
  } | null;
  dosageMapping?: DosageMapping | null;
  supplyDays?: number[] | null;
}