'use client';

import toast from 'react-hot-toast';
import { Error as ErrorType, MetaPayload } from '@/lib/types';
import { Agent, AgentSortQueryParams, useLazyGetAgentsQuery } from '@/store/slices/agentApiSlice';
import { isAxiosError } from 'axios';
import { usePathname } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { ClassNamesConfig, GroupBase, SingleValue, StylesConfig } from 'react-select';
import { AsyncPaginate, LoadOptions } from 'react-select-async-paginate';

interface AgentOption {
  value: string;
  label: string;
  agent?: Agent;
  isEmptyOption?: boolean;
}

interface Additional {
  page: number;
}

interface Props {
  selectedAgent?: Agent | null;
  onAgentChange?: (agent: Agent | null) => Promise<void> | void;
  disabled?: boolean;
  placeholder?: string;
  classNames?: ClassNamesConfig<AgentOption, false, GroupBase<AgentOption>>;
  styles?: StylesConfig<AgentOption, false, GroupBase<AgentOption>>;
  isClearable?: boolean;
  getAgents?: ReturnType<typeof useLazyGetAgentsQuery>[0];
  isLoading?: boolean;
  defaultAgentOptions?: AgentOption[];
  defaultAgentOptionsMeta?: MetaPayload['meta'];
}

export const AgentsSelect = ({
  selectedAgent,
  onAgentChange,
  disabled = false,
  placeholder = '',
  classNames,
  styles,
  isClearable = false,
  getAgents: getAgentsProp,
  isLoading: isLoadingProp,
  defaultAgentOptions,
  defaultAgentOptionsMeta,
  ...rest
}: Readonly<Props>) => {
  const pathname = usePathname();
  const isAdmin = pathname.includes('/admin');

  const [state, setState] = useState({
    isViewingAgentsSelect: false,
    isTyping: false,
    isHovering: false,
  });

  const { isTyping, isHovering } = state;
  const { totalPages: defaultAgentTotalPages = 1, page: defaultAgentPage = 1 } = defaultAgentOptionsMeta || {};

  const [getAgentsDefault, { isFetching }] = useLazyGetAgentsQuery();

  // Use provided getAgents or fallback to local hook
  const getAgents = getAgentsProp || getAgentsDefault;
  const isLoadingAgents = isLoadingProp !== undefined ? isLoadingProp : isFetching;

  // Use stable cache key so all instances share the same cache and don't invalidate on options load
  const cacheKey = 'agents-select';
  // Transform selected agent to option format
  const selectedOption: AgentOption | null = selectedAgent
    ? {
        value: selectedAgent.id,
        label: `${selectedAgent.name}`,
        agent: selectedAgent,
      }
    : null;

  const {
    control = () => '',
    indicatorSeparator = () => '',
    menu = () => '',
    placeholder: placeholderClassNames = () => '',
    singleValue = () => '',
    option = () => '',
    noOptionsMessage = () => '',
    ...restClassNames
  } = classNames || {};

  const { control: controlStyles, placeholder: placeholderStyles, ...restStyles } = styles || {};

  // Empty label option at the top
  const emptyOption: AgentOption = {
    value: 'empty-agent',
    label: '',
    isEmptyOption: true,
  };

  // Helper function to check if an option is an empty option
  const isEmptyOption = (option: AgentOption) => {
    return option.isEmptyOption === true || option.value === 'empty-agent' || option.label === '';
  };

  // Helper function to ensure exactly one empty option exists (removes duplicates first)
  const ensureSingleEmptyOption = (options: AgentOption[]): AgentOption[] => {
    if (!isAdmin) {
      return options;
    }

    // First, filter out all empty options
    const nonEmptyOptions = options.filter((option) => !isEmptyOption(option));

    // Then add exactly one empty option at the beginning
    return [emptyOption, ...nonEmptyOptions];
  };

  // Load function for AsyncPaginate
  const loadAgents = useCallback<LoadOptions<AgentOption, GroupBase<AgentOption>, Additional>>(
    async (search, _loadedOptions, { page = 1 }: Additional = { page: 1 }) => {
      try {
        const limit = 50; // Same limit used by parent component

        // If we have defaultAgentOptions, use them for page 1 without API call
        // Only make API request for page 2+ or when searching
        // Note: defaultOptions prop already includes these, so we return empty array to avoid duplication
        if (!search && page === 1 && defaultAgentOptions && defaultAgentOptions.length > 0) {
          const hasMore = defaultAgentPage < defaultAgentTotalPages; // If we got full limit, there might be more pages

          return {
            options: [], // Return empty array since defaultOptions already has these
            hasMore,
            additional: {
              page: 2, // Next page will be 2, which will trigger API call
            },
          };
        }

        // For page 2+ or when searching, make API request
        const params: AgentSortQueryParams = {
          page: search ? 1 : page, // Reset to page 1 when searching
          limit,
          search: search || undefined,
          isActive: true,
          sortBy: 'name',
          sortOrder: 'ASC',
        };

        const response = await getAgents(params).unwrap();
        const { agents = [], meta: responseMeta } = response || {};
        const { page: resPage = 1, totalPages = 1 } = responseMeta || {};

        // Transform agents
        const options: AgentOption[] = agents.map((agent) => ({
          value: agent.id,
          label: `${agent.name}`,
          agent,
        }));

        // For admin users:
        // - When searching: add empty option to search results (searches replace all options)
        // - When not searching: don't add empty option here as it's already in defaultOptions
        //   (defaultOptions always has the empty option for admin users)
        // Note: ensureSingleEmptyOption will remove any existing empty options before adding one
        const finalOptions = isAdmin && search ? ensureSingleEmptyOption(options) : options;

        // Use API response metadata for pagination
        const result = {
          options: finalOptions,
          hasMore: resPage < totalPages,
          additional: {
            page: resPage + 1, // Next page from API response
          },
        };

        return result;
      } catch (error) {
        console.error('Failed to load agents:', error);

        return {
          options: [],
          hasMore: false,
          additional: {
            page: 1,
          },
        };
      }
    },
    [
      getAgents,
      defaultAgentOptions,
      defaultAgentOptionsMeta,
      defaultAgentPage,
      defaultAgentTotalPages,
      ensureSingleEmptyOption,
      isAdmin,
    ]
  );

  const handleAgentChange = async (selectedOption: SingleValue<AgentOption>) => {
    if (onAgentChange) {
      try {
        if (selectedOption?.isEmptyOption) {
          await onAgentChange(null);
        } else {
          await onAgentChange(selectedOption?.agent || null);
        }
      } catch (error) {
        toast.error(
          isAxiosError(error)
            ? error.response?.data?.message
            : (error as ErrorType).data?.message || 'Failed to change agent'
        );
      }
    }
  };

  const isEmpty = selectedAgent?.name?.trim() === '';

  const shouldShowTooltip = isTyping || isEmpty ? false : isHovering ? true : false;

  const defaultOptions = useMemo(() => {
    if (isAdmin) {
      if (defaultAgentOptions && defaultAgentOptions.length > 0) {
        // Clean up any empty options that might already be in defaultAgentOptions
        return ensureSingleEmptyOption(defaultAgentOptions);
      } else {
        return [emptyOption];
      }
    } else {
      return defaultAgentOptions || [];
    }
  }, [defaultAgentOptions, isAdmin, emptyOption, ensureSingleEmptyOption]);

  return (
    <OverlayTrigger
      show={shouldShowTooltip}
      placement='top'
      overlay={<Tooltip id='agents-tooltip'>{selectedAgent?.name || 'N/A'}</Tooltip>}
    >
      <div
        onMouseEnter={() => setState((prev) => ({ ...prev, isHovering: true }))}
        onMouseLeave={() => setState((prev) => ({ ...prev, isHovering: false }))}
        onClick={(event) => event.stopPropagation()}
      >
        <AsyncPaginate
          {...rest}
          // className='min-w-160px'
          isClearable={isClearable}
          value={selectedOption}
          loadOptions={loadAgents}
          onChange={handleAgentChange}
          isLoading={isLoadingAgents}
          isDisabled={disabled || isLoadingAgents}
          placeholder={placeholder}
          isSearchable={true}
          debounceTimeout={750}
          additional={{ page: 1 }}
          noOptionsMessage={({ inputValue }) =>
            inputValue ? `No agents found for "${inputValue}"` : 'No agents available'
          }
          loadingMessage={() => 'Loading agents...'}
          formatOptionLabel={(option, { context }) => {
            if (context === 'menu') {
              return (
                <div className='d-flex flex-column align-items-start'>
                  <span className='fw-medium text-break text-capitalize'>
                    {option.isEmptyOption ? '\u00A0' : option.agent?.name || option.label}
                  </span>
                </div>
              );
            }

            return option.isEmptyOption ? '\u00A0' : option.label;
          }}
          styles={{
            control: (baseStyles, state) => ({
              ...baseStyles,
              opacity: disabled ? 0.5 : 1,
              ...controlStyles?.(baseStyles, state),
            }),
            menu: (baseStyles) => ({
              ...baseStyles,
              minWidth: '100%',
              width: '100%',
              maxWidth: '100%',
            }),
            menuList: (baseStyles) => ({
              ...baseStyles,
              maxHeight: '200px',
            }),
            placeholder: (baseStyles, state) => ({
              ...baseStyles,
              ...(placeholderStyles?.(baseStyles, state) || {}),
            }),
            ...restStyles,
          }}
          classNames={{
            control: (state) => `w-100  rounded-1  text-dark ${control(state)}`,
            indicatorSeparator: (state) => ` d-none ${indicatorSeparator(state)}`,
            menu: (state) => `shadow-sm border-0 text-dark ${menu(state)}`,
            placeholder: (state) => `text-dark font-size-base  ${placeholderClassNames(state)}`,
            singleValue: (state) => ` text-dark font-size-base ${singleValue(state)}`,
            option: (state) => ` text-break  text-wrap text-start ${option(state)}`,
            noOptionsMessage: (state) => `text-break  text-wrap text-center ${noOptionsMessage(state)}`,
            ...restClassNames,
          }}
          defaultOptions={defaultOptions}
          loadOptionsOnMenuOpen
          cacheUniqs={[cacheKey]}
        />
      </div>
    </OverlayTrigger>
  );
};
