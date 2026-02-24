import { useState, useEffect } from 'react';
import { useGetNotificationsQuery } from '@/store/slices/notificationsApiSlice';
import { Notification } from '@/lib/types';

interface UsePageWiseNotificationsReturn {
  notifications: Notification[];
  isLoading: boolean;
  error: unknown;
  currentPage: number;
  totalPages: number;
  total: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  goToPage: (page: number) => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  refresh: () => void;
}

export const usePageWiseNotifications = (limit: number = 20): UsePageWiseNotificationsReturn => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);

  const {
    data: notificationsData,
    error,
    isLoading,
    refetch,
  } = useGetNotificationsQuery({
    limit,
    offset: (currentPage - 1) * limit,
  });

  // Update pagination info when data changes
  useEffect(() => {
    if (notificationsData?.meta) {
      setTotal(notificationsData.meta.total || 0);
      setTotalPages(notificationsData.meta.totalPages || 0);
    }
  }, [notificationsData]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const refresh = () => {
    refetch();
  };

  return {
    notifications: notificationsData?.notifications || [],
    isLoading,
    error,
    currentPage,
    totalPages,
    total,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    refresh,
  };
};
