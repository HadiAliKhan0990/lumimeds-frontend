import { useState, useEffect, useCallback } from 'react';
import { useGetNotificationsQuery } from '@/store/slices/notificationsApiSlice';
import { Notification } from '@/lib/types';

interface UsePaginatedNotificationsReturn {
  notifications: Notification[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: unknown;
  loadMore: () => void;
  total: number;
  currentPage: number;
  totalPages: number;
}

export const usePaginatedNotifications = (limit: number = 20): UsePaginatedNotificationsReturn => {
  const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const {
    data: notificationsData,
    error,
    isLoading: queryLoading,
    isFetching,
  } = useGetNotificationsQuery({ limit, offset: (currentPage - 1) * limit });

  // Update notifications when new data arrives
  useEffect(() => {
    if (notificationsData?.notifications && Array.isArray(notificationsData.notifications)) {
      if (currentPage === 1) {
        // First page - replace all notifications
        setAllNotifications(notificationsData.notifications);
      } else {
        // Subsequent pages - append to existing notifications
        setAllNotifications((prev) => [...prev, ...notificationsData.notifications]);
      }

      // Update pagination info
      if (notificationsData.meta) {
        setTotal(notificationsData.meta.total);
        setTotalPages(notificationsData.meta.totalPages);
        setHasMore(currentPage < notificationsData.meta.totalPages);
      }
    }
  }, [notificationsData, currentPage]);

  const loadMore = useCallback(() => {
    if (!isFetching && hasMore) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [isFetching, hasMore]);

  return {
    notifications: allNotifications,
    isLoading: queryLoading && currentPage === 1,
    isLoadingMore: isFetching && currentPage > 1,
    hasMore,
    error,
    loadMore,
    total,
    currentPage,
    totalPages,
  };
};
