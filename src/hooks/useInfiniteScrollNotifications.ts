import { useState, useEffect, useCallback, useMemo } from 'react';
import { useGetNotificationsQuery } from '@/store/slices/notificationsApiSlice';
import { Notification } from '@/lib/types';

interface UseInfiniteScrollNotificationsReturn {
  notifications: Notification[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: unknown;
  loadMore: () => void;
  total: number;
  refresh: () => void;
}

export const useInfiniteScrollNotifications = (limit: number = 20): UseInfiniteScrollNotificationsReturn => {
  const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const {
    data: notificationsData,
    error,
    isLoading: queryLoading,
    isFetching,
    refetch,
  } = useGetNotificationsQuery({
    limit,
    offset: (currentPage - 1) * limit,
  });

  // Update notifications when new data arrives
  useEffect(() => {
    if (notificationsData?.notifications && Array.isArray(notificationsData.notifications)) {
      if (currentPage === 1) {
        // First page - replace all notifications
        setAllNotifications(notificationsData.notifications);
        setIsInitialLoad(false);
      } else {
        // Subsequent pages - append to existing notifications
        setAllNotifications((prev) => {
          const updated = [...prev, ...notificationsData.notifications];
          return updated;
        });
      }

      // Update pagination info
      if (notificationsData.meta) {
        setTotal(notificationsData.meta.total);
        setHasMore(currentPage < notificationsData.meta.totalPages);
      }
    }
  }, [notificationsData, currentPage]);

  // Automatic memory management: Remove old chunks when we have too many notifications
  useEffect(() => {
    const maxNotificationsInMemory = 200; // Keep this as a constant for automatic management

    if (allNotifications.length > maxNotificationsInMemory) {
      const notificationsToKeep = maxNotificationsInMemory;

      // Update notifications array to only keep recent ones
      setAllNotifications((prev) => prev.slice(-notificationsToKeep));
    }
  }, [allNotifications.length, limit]);

  const loadMore = useCallback(() => {
    if (!isFetching && hasMore) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [isFetching, hasMore]);

  const refresh = useCallback(() => {
    setCurrentPage(1);
    setAllNotifications([]);
    setHasMore(true);
    setIsInitialLoad(true);
    refetch();
  }, [refetch]);

  // Memoized values for performance
  const memoizedNotifications = useMemo(() => allNotifications, [allNotifications]);
  const isLoading = queryLoading && isInitialLoad;
  const isLoadingMore = isFetching && currentPage > 1;

  return {
    notifications: memoizedNotifications,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadMore,
    total,
    refresh,
  };
};
