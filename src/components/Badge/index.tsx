'use client';

import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { useUpdateProviderStatusMutation } from '@/store/slices/providersApiSlice';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/lib/errors';
import { FaChevronDown } from 'react-icons/fa6';

interface StatusDropdownProps {
  providerId: string;
  status: string;
}

const allStatuses = ['pending', 'approved', 'rejected'];

export const ProviderStatusDropdown: React.FC<StatusDropdownProps> = ({ providerId, status }) => {
  const [updateProvider, { isLoading }] = useUpdateProviderStatusMutation();
  const normalizedStatus = status.toLowerCase();

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === normalizedStatus) return;
    try {
      await updateProvider({
        id: providerId,
        status: newStatus,
      });
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <Dropdown onClick={(e) => e.stopPropagation()}>
      <Dropdown.Toggle
        variant='light'
        className={`status-badge no-toggle-style ${normalizedStatus}`}
        disabled={isLoading}
        size='sm'
      >
        {normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1)}
        <FaChevronDown className='ms-2' size={10} />
      </Dropdown.Toggle>

      <Dropdown.Menu>
        {allStatuses
          .filter((s) => s !== normalizedStatus)
          .map((s) => (
            <Dropdown.Item key={s} onClick={() => handleStatusChange(s)}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </Dropdown.Item>
          ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};
