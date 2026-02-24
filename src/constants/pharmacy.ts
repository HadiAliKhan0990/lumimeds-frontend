import { EnumRxType, PharmacyName } from '@/store/slices/adminPharmaciesSlice';
import { GroupBase, OptionsOrGroups } from 'react-select';

export const rxTypeIncludedPharmacyMap: Record<PharmacyName, boolean> = {
  axtell: true,
  'script rx': true,
  olympia: false,
  'drug crafters': true,
  'premier rx': true,
  cre8: true,
  optiorx: false,
  valiant: true,
  beaker: true,
  boothwyn: false,
  'first choice': true,
};

export const pharmacyFileRequiredMap: Record<PharmacyName, boolean> = {
  axtell: true,
  'script rx': true,
  olympia: false,
  'drug crafters': true,
  'premier rx': true,
  cre8: true,
  optiorx: true,
  valiant: true,
  beaker: true,
  boothwyn: true,
  'first choice': true,
};

export const shippingServiceRequiredMap: Record<PharmacyName, boolean> = {
  axtell: true,
  'script rx': true,
  olympia: true,
  'drug crafters': false,
  'premier rx': false,
  cre8: true,
  optiorx: false,
  valiant: true,
  beaker: true,
  boothwyn: true,
  'first choice': true,
};

export const DRUGS_DOSAGES = {
  semaglutide: [0.22, 0.44, 0.89, 1.5, 2, 2.22],
  tirzepatide: [2.22, 4.45, 6.67, 8.9, 11.12, 13.35, 15, 16.65],
  nad: {
    im: [25, 50, 75, 100, 125, 150],
    sq: [10, 20, 25, 30],
  },
};

export const RX_TYPE_OPTIONS: OptionsOrGroups<unknown, GroupBase<unknown>> = [
  { label: 'New', value: EnumRxType.NEW },
  { label: 'Refill', value: EnumRxType.REFILL },
];

// ScriptRx Diagnosis Codes
export const SCRIPT_RX_DIAGNOSIS_CODES = {
  E66_9: 'ICD 10 E66.9',
  E66_01: 'ICD 10 E66.01',
} as const;

export const SCRIPT_RX_DIAGNOSIS_DEFAULT = SCRIPT_RX_DIAGNOSIS_CODES.E66_9;

export const SCRIPT_RX_DIAGNOSIS_OPTIONS: OptionsOrGroups<unknown, GroupBase<unknown>> = [
  { label: SCRIPT_RX_DIAGNOSIS_CODES.E66_9, value: SCRIPT_RX_DIAGNOSIS_CODES.E66_9 },
  { label: SCRIPT_RX_DIAGNOSIS_CODES.E66_01, value: SCRIPT_RX_DIAGNOSIS_CODES.E66_01 },
];

export const SCRIPT_RX_DIAGNOSIS_VALUES = [
  SCRIPT_RX_DIAGNOSIS_CODES.E66_9,
  SCRIPT_RX_DIAGNOSIS_CODES.E66_01,
] as const;

export const FIRST_CHOICE_QUANTITY_OPTIONS_TIRZEPITIDE: OptionsOrGroups<unknown, GroupBase<unknown>> = [
  { label: `1mL (1 Vial Total) = 1mL = 20mg`, value: `1mL (1 Vial Total) = 1mL = 20mg` },
  { label: `2mL (1 Vial Total) = 2mL = 40mg`, value: `2mL (1 Vial Total) = 2mL = 40mg` },
  { label: `3mL (1 Vial Total) = 3mL = 60mg`, value: `3mL (1 Vial Total) = 3mL = 60mg` },
  { label: `(2x 1ml) = 2mL = 40mg`, value: `(2x 1ml) = 2mL = 40mg` },
  { label: `(1mL, 2mL) = 3mL = 60mg`, value: `(1mL, 2mL) = 3mL = 60mg` },
  { label: `(2x 2ml) = 4mL = 80mg`, value: `(2x 2ml) = 4mL = 80mg` },
  { label: `(2mL, 3mL) = 5mL = 100mg`, value: `(2mL, 3mL) = 5mL = 100mg` },
  { label: `(2x 3ml) = 6mL = 120mg`, value: `(2x 3ml) = 6mL = 120mg` },
  { label: `1mL, 1mL, 2mL (3 Vials Total) = 4mL = 80mg`, value: `1mL, 1mL, 2mL (3 Vials Total) = 4mL = 80mg` },
  { label: `1mL, 2mL, 2mL (3 Vials Total) = 5mL = 100mg`, value: `1mL, 2mL, 2mL (3 Vials Total) = 5mL = 100mg` },
  { label: `2mL, 2mL, 2mL (3 Vials Total) = 6mL = 120mg`, value: `2mL, 2mL, 2mL (3 Vials Total) = 6mL = 120mg` },
  { label: `2mL, 2mL, 3mL (3 Vials Total) = 7mL = 140mg`, value: `2mL, 2mL, 3mL (3 Vials Total) = 7mL = 140mg` },
  { label: `2mL, 3mL, 3mL (3 Vials Total) = 8mL = 160mg`, value: `2mL, 3mL, 3mL (3 Vials Total) = 8mL = 160mg` },
  { label: `3mL (3 Vials Total) = 9mL = 180mg`, value: `3mL (3 Vials Total) = 9mL = 180mg` },
  {
    label: `3mL, 3mL, 3mL, 1mL (4 Vials Total) = 10mL = 200mg`,
    value: `3mL, 3mL, 3mL, 1mL (4 Vials Total) = 10mL = 200mg`,
  },
];

export const FIRST_CHOICE_QUANTITY_OPTIONS_SEMAGLUTIDE: OptionsOrGroups<unknown, GroupBase<unknown>> = [
  { label: `1mL (1 Vial Total) = 1mL = 2.5mg`, value: `1mL (1 Vial Total) = 1mL = 2.5mg` },
  { label: `2mL (1 Vial Total) = 2mL = 5mg`, value: `2mL (1 Vial Total) = 2mL = 5mg` },
  { label: `3mL (1 Vial Total) = 3mL = 7.5mg`, value: `3mL (1 Vial Total) = 3mL = 7.5mg` },
  { label: `(2x 1ml) = 2mL = 5mg`, value: `(2x 1ml) = 2mL = 5mg` },
  { label: `(1mL, 2mL) = 3mL = 7.5mg`, value: `(1mL, 2mL) = 3mL = 7.5mg` },
  { label: `(2x 2ml) = 4mL = 10mg`, value: `(2x 2ml) = 4mL = 10mg` },
  { label: `(2mL, 3mL) = 5mL = 12.5mg`, value: `(2mL, 3mL) = 5mL = 12.5mg` },
  { label: `(2x 3ml) = 6mL = 15mg`, value: `(2x 3ml) = 6mL = 15mg` },
  { label: `1mL, 1mL, 2mL (3 Vials Total) = 4mL = 10mg`, value: `1mL, 1mL, 2mL (3 Vials Total) = 4mL = 10mg` },
  { label: `1mL, 2mL, 3mL (3 Vials Total) = 6mL = 15mg`, value: `1mL, 2mL, 3mL (3 Vials Total) = 6mL = 15mg` },
  { label: `2mL, 3mL, 4mL (3 Vials Total) = 9mL = 22.5mg`, value: `2mL, 3mL, 4mL (3 Vials Total) = 9mL = 22.5mg` },
  { label: `3mL, 4mL, 4mL (3 Vials Total) = 11mL = 27.5mg`, value: `3mL, 4mL, 4mL (3 Vials Total) = 11mL = 27.5mg` },
  { label: `4mL, 4mL, 4mL (3 Vials Total) = 12mL = 30mg`, value: `4mL, 4mL, 4mL (3 Vials Total) = 12mL = 30mg` },
];
