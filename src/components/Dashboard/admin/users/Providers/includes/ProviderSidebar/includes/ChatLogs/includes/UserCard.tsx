import { ProviderChatLogsPatient } from '@/types/users';

interface Props {
  isSelected: boolean;
  patient: ProviderChatLogsPatient;
  onSelect: (patient: ProviderChatLogsPatient) => void;
}

export const UserCard = ({ isSelected, patient, onSelect }: Readonly<Props>) => {
  const fullName = [patient.firstName, patient.lastName].filter(Boolean).join(' ');

  return (
    <button
      type='button'
      onClick={() => onSelect(patient)}
      className={`tw-text-left tw-px-3 md:tw-px-4 tw-py-2 md:tw-py-3 tw-border md:tw-border-0 md:tw-border-b tw-border-gray-200 md:tw-border-gray-100 tw-rounded md:tw-rounded-none tw-transition-all md:tw-w-full tw-flex tw-flex-col tw-items-start tw-gap-0.5 ${
        isSelected ? 'tw-bg-blue-50 tw-border-blue-300 md:tw-border-l-4 md:tw-border-l-blue-500' : 'hover:tw-bg-gray-50'
      }`}
    >
      <span className='tw-capitalize tw-font-medium tw-text-sm tw-text-gray-900 tw-truncate tw-w-full'>{fullName}</span>
      {patient.email && (
        <span className='tw-text-xs tw-text-gray-500 tw-truncate tw-w-full' title={patient.email}>
          {patient.email}
        </span>
      )}
    </button>
  );
};
