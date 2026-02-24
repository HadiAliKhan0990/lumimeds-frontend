'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setConversationFilter } from '@/store/slices/chatSlice';

export function FilterReset() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setConversationFilter('All'));
  }, [dispatch]);

  return null;
}

