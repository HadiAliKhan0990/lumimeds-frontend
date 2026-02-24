import { OptionValue } from '@/lib/types';

export const dosageTypesOptions: OptionValue[] = [
  { value: 'syrup', label: 'syrup' },
  { value: 'injection', label: 'injection' },
];

export const FORM_FIELDS = [
  { key: 'description', label: 'Product Description', type: 'textarea' },
  { key: 'duration', label: 'Duration (in months)', type: 'number' },
  { key: 'planTier', label: 'Plan Tier', type: 'text' },
  { key: 'tagline', label: 'Tagline', type: 'text' },
  { key: 'openpayProductId', label: 'OpenPay ID', type: 'text' },
  { key: 'telegraId', label: 'TeleGra ID', type: 'text' },
  { key: 'telepathId', label: 'TelePath ID', type: 'text' },
] as const;
