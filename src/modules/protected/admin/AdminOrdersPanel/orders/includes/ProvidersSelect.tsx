'use client';

import { OrderProvider } from '@/store/slices/orderSlice';
import Select, { SingleValue, ClassNamesConfig, GroupBase } from 'react-select';
import { formatProviderNameFromString } from '@/lib/utils/providerName';
import { usePathname } from 'next/navigation';

interface ProviderOption {
  value: string;
  label: string;
  provider?: OrderProvider;
  isEmptyOption?: boolean;
}

interface Props {
  providers: OrderProvider[];
  selectedProviderId?: string | null;
  onProviderChange: (provider: OrderProvider | null) => void;
  onNASelect?: () => void;
  disabled?: boolean;
  placeholder?: string;
  isLoading?: boolean;
  onClick?: () => void;
}

export const ProvidersSelect = ({
  providers,
  selectedProviderId,
  onProviderChange,
  onNASelect,
  disabled = false,
  placeholder = '',
  isLoading = false,
  onClick,
}: Readonly<Props>) => {
  const pathname = usePathname();
  const isAdmin = pathname.includes('/admin');

  const providerOptions: ProviderOption[] = providers.map((provider) => ({
    value: provider.id,
    label: formatProviderNameFromString(provider.name),
    provider,
  }));

  const emptyOption: ProviderOption = {
    value: 'empty-provider',
    label: '',
    isEmptyOption: true,
  };

  const options: ProviderOption[] = isAdmin ? [emptyOption, ...providerOptions] : providerOptions;

  const selectedOption: ProviderOption | null = options.find((opt) => opt.value === selectedProviderId) || null;

  const handleProviderChange = (selectedOption: SingleValue<ProviderOption>) => {
    if (selectedOption?.isEmptyOption) {
      onNASelect?.();
      return;
    }
    onProviderChange(selectedOption?.provider || null);
  };

  const customClassNames: ClassNamesConfig<ProviderOption, false, GroupBase<ProviderOption>> = {
    control: () => 'w-100 rounded-1',
    menu: () => 'shadow-sm border-0 tw-text-capitalize tw-min-w-[160px] tw-text-xs',
    placeholder: () => 'text-dark',
    singleValue: () => 'text-dark text-capitalize',
    noOptionsMessage: () => 'text-break text-wrap text-center',
    indicatorSeparator: () => 'd-none',
  };

  return (
    <div onClick={(event) => {
      event.stopPropagation();
      onClick?.();
    }}>
      <Select
        className='tw-min-w-32 sm:tw-min-w-40'
        value={selectedOption}
        options={options}
        onChange={handleProviderChange}
        isDisabled={disabled}
        isLoading={isLoading}
        placeholder={placeholder}
        noOptionsMessage={() => 'No Providers Found'}
        formatOptionLabel={(option, { context }) => {
          if (context === 'menu') {
            return (
              <div className='tw-min-h-6'>
                <span className='tw-min-h-6 tw-block'>
                  {option.isEmptyOption
                    ? '\u00A0'
                    : option.provider
                    ? formatProviderNameFromString(option.provider.name)
                    : option.label}
                </span>
              </div>
            );
          }
          return option.isEmptyOption ? '\u00A0' : option.label;
        }}
        classNames={customClassNames}
        menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
        menuPosition='fixed'
        isSearchable
      />
    </div>
  );
};
