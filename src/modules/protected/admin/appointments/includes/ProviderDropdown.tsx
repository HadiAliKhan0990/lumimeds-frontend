'use client';

import { useState, useCallback } from 'react';
import { AsyncPaginate, LoadOptions } from 'react-select-async-paginate';
import { GroupBase } from 'react-select';
import { fetcher } from '@/lib/fetcher';
import { formatProviderName } from '@/lib/utils/providerName';

interface Provider {
  id: string;
  provider?: {
    id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    isPaused?: boolean;
  };
}

interface ProviderListResponse {
  success: boolean;
  message: string;
  data: {
    providers: Provider[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

interface OptionValue {
  label: string;
  value: string;
}

type Additional = { page?: number };

interface Props {
  value?: string;
  onChange: (providerId?: string) => void;
  className?: string;
}

export default function ProviderDropdown({ value, onChange, className }: Props) {
  const [loading, setLoading] = useState(false);
  const [allProviders, setAllProviders] = useState<Provider[]>([]);

  const loadProviders: LoadOptions<OptionValue, GroupBase<OptionValue>, Additional> = useCallback(
    async (_search, _loadedOptions, { page = 1 }: Additional = { page: 1 }) => {
      setLoading(true);
      try {
        const limit = 10;
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });

        const response = await fetcher<ProviderListResponse>(`/providers/list?${params}`);

        if (response?.success) {
          const { page: resPage = 1, totalPages = 1 } = response.data.meta || {};

          const activeProviders = response.data.providers.filter((provider) => provider.provider?.isPaused !== true);

          if (page === 1) {
            setAllProviders(activeProviders);
          } else {
            setAllProviders((prev) => [...prev, ...activeProviders]);
          }

          const options = activeProviders.map((provider) => {
            const name = formatProviderName(provider.provider?.firstName, provider.provider?.lastName);

            const option = {
              value: provider.provider?.id || '',
              label: name,
            };
            return option;
          });

          const hasMore = resPage < totalPages;

          return {
            options,
            hasMore,
            additional: { page: Number(page) + 1 },
          };
        }

        return {
          options: [],
          hasMore: false,
          additional: { page: 1 },
        };
      } catch (error) {
        console.error('Failed to load providers:', error);
        return {
          options: [],
          hasMore: false,
          additional: { page: 1 },
        };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const selectedProvider = allProviders.find((p) => p.provider?.id === value);
  const selectedProviderName = selectedProvider
    ? formatProviderName(selectedProvider.provider?.firstName, selectedProvider.provider?.lastName)
    : 'Selected Provider';

  const selectedOption = value ? { value, label: selectedProviderName } : null;

  return (
    <div style={{ minWidth: '150px' }}>
      <style jsx>{`
        :global(.provider-select__menu-list) {
          scrollbar-width: thin;
          scrollbar-color: #c1c1c1 transparent;
          max-height: 240px;
        }

        :global(.provider-select__menu-list::-webkit-scrollbar) {
          width: 6px;
          height: 6px;
        }
        :global(.provider-select__menu-list::-webkit-scrollbar-track) {
          background: transparent;
          margin-top: 2px;
          margin-bottom: 2px;
        }
        :global(.provider-select__menu-list::-webkit-scrollbar-thumb) {
          background-color: #c1c1c1;
          border-radius: 3px;
        }
        :global(.provider-select__menu-list::-webkit-scrollbar-thumb:hover) {
          background-color: #a8a8a8;
        }
      `}</style>
      <AsyncPaginate
        value={selectedOption}
        loadOptions={loadProviders}
        additional={{ page: 1 }}
        onChange={(option) => {
          onChange(option?.value);
        }}
        isLoading={loading}
        isSearchable={false}
        filterOption={() => true}
        noOptionsMessage={() => 'No providers available'}
        defaultOptions={false}
        inputValue=''
        onInputChange={() => {}}
        placeholder='Select Provider'
        instanceId='provider-dropdown'
        styles={{
          control: (base) => ({
            ...base,
            width: '100%',
            borderRadius: 6,
            backgroundColor: '#f8f9fa',
            borderColor: '#ced4da',
            fontSize: '14px',
          }),
          indicatorSeparator: () => ({ display: 'none' }),
          menuPortal: (base) => ({ ...base, zIndex: 99999 }),
          menu: (base) => ({
            ...base,
            zIndex: 99999,
            minWidth: '200px',
            width: 'max-content',
          }),
          option: (base) => ({
            ...base,
            whiteSpace: 'nowrap',
          }),
        }}
        className={className}
        classNamePrefix='provider-select'
      />
    </div>
  );
}
