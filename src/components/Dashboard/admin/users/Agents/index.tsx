'use client';

import InfiniteScroll from 'react-infinite-scroll-component';
import { Agent, useLazyGetAgentsQuery } from '@/store/slices/agentsApiSlice';
import { useEffect, useState } from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useDispatch, useSelector } from 'react-redux';
import { Column, Table } from '@/components/Dashboard/Table';
import { RootState } from '@/store';
import { setModal } from '@/store/slices/modalSlice';
import { setAgents } from '@/store/slices/agentsSlice';
import { UsersMobileCards } from '@/components/Dashboard/admin/users/UsersMobileCards';
import { formatUSPhoneWithoutPlusOne } from '@/lib/helper';
import { FilterGroup } from '@/components/Dashboard/Table/includes/FilterGroup';
import { MetaPayload } from '@/lib/types';
import { AgentSidebar } from '@/components/Dashboard/admin/users/Agents/includes/AgentSidebar';
import { Spinner } from 'react-bootstrap';
import { setSearch, setSearchString } from '@/store/slices/sortSlice';
import { setAgent } from '@/store/slices/agentSlice';

interface Props {
  query?: string;
}

export const Agents = ({ query }: Readonly<Props>) => {
  const dispatch = useDispatch();

  const [open, setOpen] = useState(false);

  const [triggerAgents, { isFetching }] = useLazyGetAgentsQuery();

  // Use Redux state instead of local state
  const agents = useSelector((state: RootState) => state.agents.agents);
  const pagination = useSelector((state: RootState) => state.agents.pagination);

  const { pages: totalPages = 1, page: currentPage = 1 } = pagination || {};

  const userType = useSelector((state: RootState) => state.sort.userType);
  const search = useSelector((state: RootState) => state.sort.search);
  const sortField = useSelector((state: RootState) => state.sort.sortField);
  const sortOrder = useSelector((state: RootState) => state.sort.sortOrder);
  const sortStatus = useSelector((state: RootState) => state.sort.sortStatus);

  async function handleUpdateAgents({ meta, search, sortField, sortOrder, sortStatus }: MetaPayload) {
    try {
      const { data: res } = await triggerAgents({
        search,
        page: meta?.page ?? 1,
        limit: 30,
        sortBy: sortField,
        sortOrder: sortOrder as 'ASC' | 'DESC',
        isActive: sortStatus === 'active' ? true : sortStatus === 'inactive' ? false : undefined,
      });

      if (res?.data) {
        const agentsData = {
          agents: res.data.agents,
          pagination: {
            page: res.data.pagination.page,
            limit: res.data.pagination.limit,
            total: res.data.pagination.total,
            pages: res.data.pagination.pages,
          },
        };
        dispatch(setAgents(agentsData));
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  }

  const fetchMore = () => {
    if (currentPage < totalPages) {
      handleUpdateAgents({
        meta: { page: currentPage + 1, limit: 30 },
        search,
        sortField,
        sortOrder,
        sortStatus,
        append: true,
      });
    }
  };

  const allAgentsLoaded = currentPage >= totalPages;

  const handleRowClick = (agent: Agent) => {
    dispatch(setAgent(agent));
    setOpen(true);
  };

  const handleEditClick = (agent: Agent) => {
    dispatch(setAgent(agent));
    dispatch(setModal({ modalType: 'Edit Agent' }));
  };

  useEffect(() => {
    if (userType === 'Agent') {
      handleUpdateAgents({
        meta: { page: 1, limit: 30 },
        search,
        sortField,
        sortOrder,
        sortStatus,
      });
    }
  }, [userType, search, sortField, sortOrder, sortStatus]);

  useEffect(() => {
    if (query) {
      dispatch(setSearch(query));
      dispatch(setSearchString(query));
    }
  }, [query, dispatch]);

  const columns: Column<Agent>[] = [
    {
      header: 'Name',
      renderCell: (agent) => <div className='text-muted'>{agent?.name}</div>,
      className: 'align-middle',
    },
    {
      header: 'Email',
      renderCell: (agent) => <div className='text-muted'>{agent?.email}</div>,
      className: 'align-middle',
    },
    {
      header: 'Phone',
      renderCell: (agent) => (
        <div className='text-muted'>{formatUSPhoneWithoutPlusOne(agent?.info?.phone ?? '') || 'N/A'}</div>
      ),
      className: 'align-middle',
    },
    {
      header: 'Status',
      renderCell: (agent) => (
        <span className={`status-badge ${agent?.isActive ? 'active' : 'rejected'}`}>
          {agent?.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
      className: 'align-middle',
    },
    {
      header: 'Actions',
      renderCell: (agent) => (
        <button
          className='btn btn-link p-0 text-sm'
          onClick={(e) => {
            e.stopPropagation();
            handleEditClick(agent);
          }}
        >
          Edit
        </button>
      ),
    },
  ];

  // Detect screen size - only render one version
  const isDesktop = useMediaQuery('(min-width: 992px)');

  return (
    <>
      <AgentSidebar show={open} onHide={() => setOpen(false)} />
      
      {/* Mobile version - only renders on mobile */}
      {!isDesktop && (
        <div>
        <div className='d-flex align-items-center justify-content-between flex-wrap gap-2 mb-4'>
          <span className='text-base fw-semibold'>Agents</span>
          <FilterGroup handleChange={handleUpdateAgents} />
        </div>
        <UsersMobileCards data={agents} columns={columns} rowOnClick={handleRowClick} />
      </div>
      )}

      {/* Desktop version - only renders on desktop */}
      {isDesktop && (
        <div>
        <div className='row align-items-center mb-4'>
          <span className='text-lg fw-medium d-none d-md-block col-md-3 col-lg-4 col-xl-6'>Agents</span>
          <div className={`col-lg-8 col-xl-6 col-md-9 text-end`}>
            <div className='row g-2 align-items-center justify-content-end flex-nowrap'>
              <div className='col'>
                <FilterGroup handleChange={handleUpdateAgents} />
              </div>
            </div>
          </div>
        </div>
        <InfiniteScroll
          dataLength={agents.length}
          next={fetchMore}
          hasMore={!allAgentsLoaded}
          loader={
            <div className='d-flex justify-content-center py-4'>
              <Spinner size='sm' />
            </div>
          }
          height={'calc(100vh - 275px)'}
        >
          <div id='agents-table-top' />
          <Table
            data={agents}
            columns={columns}
            isFetching={isFetching && agents.length === 0}
            rowOnClick={handleRowClick}
          />
        </InfiniteScroll>
      </div>
      )}
    </>
  );
};
