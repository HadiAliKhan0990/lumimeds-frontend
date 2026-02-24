'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { CSSProperties, useEffect, useMemo, Fragment, Suspense } from 'react';
import { CHAT_ROLES } from '@/components/Dashboard/constants';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import {
  setFiltersLoading,
  setProvidersConversationsMeta,
  setProvidersConversations,
  setPatientsConversationsMeta,
  setPatientsConversations,
  setSelectedRole,
  setAdminConversations,
  setAdminConversationsMeta,
  clearMessages,
  setSelectedConversation,
} from '@/store/slices/chatSlice';
import { Role } from '@/services/chat/types';
import { useLazyGetConversationsListQuery } from '@/store/slices/chatApiSlice';
import styles from './styles.module.scss';

const RoleTabsContent = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  const { selectedRole, conversationsMeta, conversationFilter } = useSelector((state: RootState) => state.chat);

  const meta = useMemo(() => {
    return selectedRole === 'patient' ? conversationsMeta.patient : conversationsMeta.provider;
  }, [selectedRole, conversationsMeta]);

  const { page = 1, limit = 30, sortField, sortOrder } = meta || {};

  const [triggerConversationsList] = useLazyGetConversationsListQuery();

  const handleRoleSelection = async (role: Role) => {
    dispatch(setFiltersLoading(true));
    dispatch(setSelectedRole(role));

    dispatch(clearMessages());

    dispatch(setSelectedConversation(null));

    // Update URL to reflect the selected tab
    const url = new URL(window.location.href);
    url.searchParams.set('tab', role);
    window.history.replaceState({}, '', url.toString());

    const filters = {
      ...(conversationFilter === 'Unread' && { unreadOnly: true }),
      ...(conversationFilter === 'Unresolved' && { unresolvedOnly: true }),
      ...(sortOrder && sortField && { sortOrder, sortField }),
    };

    triggerConversationsList({
      page,
      limit,
      role,
      ...(role !== 'admin' && filters),
    })
      .unwrap()
      .then((data) => {
        if (role === 'admin') {
          dispatch(setAdminConversations(data?.conversations));
          dispatch(setAdminConversationsMeta(data?.meta));
        } else if (role === 'patient') {
          dispatch(setPatientsConversations(data?.conversations));
          dispatch(setPatientsConversationsMeta(data?.meta));
        } else {
          dispatch(setProvidersConversations(data?.conversations));
          dispatch(setProvidersConversationsMeta(data?.meta));
        }
      })
      .finally(() => {
        dispatch(setFiltersLoading(false));
      });
  };

  const sidebarItems = useMemo(() => {
    if (pathname.startsWith('/admin')) {
      return CHAT_ROLES.admin;
    } else if (pathname.startsWith('/provider')) {
      return CHAT_ROLES.provider;
    }
    return [];
  }, [pathname]);

  // When navigating between Admin and Provider routes, ensure selectedRole is valid for current sidebar
  useEffect(() => {
    const allowedRoles = sidebarItems.map((t) => t.toLowerCase());
    if (!allowedRoles.includes(selectedRole)) {
      const fallback = (sidebarItems?.[0]?.toLowerCase() || '') as Role;
      if (fallback) dispatch(setSelectedRole(fallback));
    }
  }, [pathname, sidebarItems, selectedRole, dispatch]);

  // Read tab from URL search params and set as selected role if valid
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      const allowedRoles = sidebarItems.map((t) => t.toLowerCase());
      const roleFromUrl = tabParam.toLowerCase() as Role;
      if (allowedRoles.includes(roleFromUrl) && selectedRole !== roleFromUrl) {
        dispatch(setSelectedRole(roleFromUrl));
      }
    }
  }, [searchParams, dispatch, selectedRole, sidebarItems]);

  return (
    <div className='w-100 px-2 mb-4'>
      <div
        className={`${styles.tabContainer} overflow-hidden`}
        style={
          {
            ['--tabs-count']: sidebarItems.length,
            ['--active-index']: Math.max(
              0,
              sidebarItems.findIndex((t) => t.toLowerCase() === selectedRole)
            ),
          } as CSSProperties
        }
      >
        {sidebarItems.map((title, index) => {
          const roleValue = title.toLowerCase() as Role;
          const inputId = `role-tab-${index + 1}`;
          const isChecked = selectedRole === roleValue;
          return (
            <Fragment key={`role-tab-${roleValue}`}>
              <input
                type='radio'
                name='role-tabs'
                id={inputId}
                className={styles.tab}
                checked={isChecked}
                onChange={() => handleRoleSelection(roleValue)}
              />
              <label htmlFor={inputId} className={`${styles.tabLabel} text-capitalize`}>
                {title}s
              </label>
            </Fragment>
          );
        })}
        <div className={styles.indicator} />
      </div>
    </div>
  );
};

const RoleTabsSkeleton = () => {
  return (
    <div className='w-100 px-2 mb-4'>
      <div className='tw-flex tw-gap-2 tw-p-1 tw-bg-gray-100 tw-rounded-lg'>
        <div className='tw-flex-1 tw-h-10 tw-bg-gray-200 tw-rounded-md tw-animate-pulse' />
        <div className='tw-flex-1 tw-h-10 tw-bg-gray-200 tw-rounded-md tw-animate-pulse' />
        <div className='tw-flex-1 tw-h-10 tw-bg-gray-200 tw-rounded-md tw-animate-pulse' />
      </div>
    </div>
  );
};

export const RoleTabs = () => {
  return (
    <Suspense fallback={<RoleTabsSkeleton />}>
      <RoleTabsContent />
    </Suspense>
  );
};
