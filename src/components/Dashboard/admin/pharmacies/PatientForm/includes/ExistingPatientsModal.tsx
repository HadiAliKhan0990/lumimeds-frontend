'use client';

import ConfirmationModal from '@/components/ConfirmationModal';
import InfiniteScroll from 'react-infinite-scroll-component';
import toast from 'react-hot-toast';
import Search from '@/components/Dashboard/Search';
import { debounce } from 'lodash';
import { Payload } from '@/store/slices/chatApiSlice';
import { SortState } from '@/store/slices/sortSlice';
import { Spinner, Form } from 'react-bootstrap';
import { useEffect, useMemo, useState } from 'react';
import { ExistingUser, useLazyGetExistingPatientsQuery } from '@/store/slices/usersApiSlice';
import { PatientOrder, useLazyGetOrdersByPatientIdQuery } from '@/store/slices/ordersApiSlice';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants';

interface Props {
  show: boolean;
  setShow: (ag: boolean) => void;
  users: ExistingUser[];
  setUsers: (ag: ExistingUser[]) => void;
  usersMeta: SortState['meta'];
  setUsersMeta: (ag: SortState['meta']) => void;
  onSelect: (ag: ExistingUser) => void;
  pharmacyId?: string;
}

export const ExistingPatientsModal = ({
  show,
  setShow,
  setUsers,
  setUsersMeta,
  users,
  usersMeta,
  onSelect,
  pharmacyId,
}: Readonly<Props>) => {
  const router = useRouter();

  const { page = 1, totalPages = 1 } = usersMeta || {};

  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<ExistingUser>();
  const [selectedOrder, setSelectedOrder] = useState<PatientOrder | null>(null);

  const [triggerGetExistingPatients, { isFetching }] = useLazyGetExistingPatientsQuery();

  const [triggerGetOrdersByPatientId, { isFetching: isFetchingOrders, data: selectedPatientOrdersData }] =
    useLazyGetOrdersByPatientIdQuery();

  const selectedPatientOrders = selectedPatientOrdersData?.orders ?? [];

  const selectePatientHandler = (patient: ExistingUser) => {
    if (selectedUser?.id !== patient.id) {
      triggerGetOrdersByPatientId(patient.id).unwrap();
      setSelectedOrder(null);
    }
    setSelectedUser(patient);
  };

  async function handleClickSelectPatient({ page, search }: Payload) {
    if (!show || isFetching) return;

    try {
      const {
        page: currentPage,
        limit,
        total,
        totalPages,
        patient,
      } = await triggerGetExistingPatients({
        page: page || 1,
        limit: 30,
        search,
      }).unwrap();

      setUsersMeta({ page: currentPage, limit, total, totalPages });

      if (page === 1) {
        setUsers(patient || []);
      } else {
        setUsers([...users, ...(patient || [])]);
      }
    } catch (error) {
      console.log(error);
    }
  }

  function fetchMore() {
    if (page < totalPages && !isFetching) {
      handleClickSelectPatient({ page: page + 1, search } as Payload);
    }
  }

  const onOrderSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const orderId = event.target.value;
    if (!orderId) {
      setSelectedOrder(null);
      return;
    }

    const order = selectedPatientOrders.find((order) => order.id === orderId);

    if (order) {
      const { address, requestedProductName, id } = order;
      const { billingAddress, shippingAddress } = address || {};

      setSelectedOrder({ address, id, requestedProductName });

      setSelectedUser((prev) =>
        prev
          ? {
            ...prev,
            address: {
              billingAddress: { ...prev?.address?.billingAddress, ...billingAddress },
              shippingAddress: { ...prev?.address?.shippingAddress, ...shippingAddress },
            },
          }
          : undefined
      );
    }
  };

  const onClose = () => {
    setShow(false);
    setSearch('');
    setUsers([]);
    setUsersMeta({ page: 1, limit: 30, total: 0, totalPages: 1 });
    setSelectedUser(undefined);
    setSelectedOrder(null);
  };

  const onConfirm = () => {
    const hasSelectedUser = !!selectedUser;
    const hasSelectedOrder = !!selectedOrder;
    const hasSelectedUserOrders = !!selectedPatientOrders.length;

    if (!hasSelectedUser) {
      toast.error('Please select a patient');
      return;
    }

    if (hasSelectedUser && hasSelectedUserOrders && !hasSelectedOrder) {
      toast.error('Please select an order');
      return;
    }

    onSelect(selectedUser);

    onClose();

    if (selectedOrder) {
      router.replace(
        `${ROUTES.ADMIN_PHARMACY_FORWARD_PRESCRIPTION}?pharmacyId=${encodeURIComponent(
          pharmacyId ?? ''
        )}&orderId=${encodeURIComponent(selectedOrder.id)}&showExistingPatientsModal=${encodeURIComponent(true)}`
      );
    }
  };

  const getOrderName = (order: PatientOrder) => {
    if (order.requestedProductName) {
      return order.requestedProductName.length > 20
        ? order.requestedProductName.substring(0, 50) + '...'
        : order.requestedProductName;
    }
    return `Order #${order.id.substring(0, 6)}`;
  };

  const getFullOrderName = (order: PatientOrder) => {
    return order.requestedProductName || `Order ${order.id}`;
  };

  const allOrdersLoaded = useMemo(() => {
    return page >= totalPages;
  }, [usersMeta]);

  // Create the debounced search function
  const debouncedSearch = useMemo(
    () =>
      debounce((searchValue: string) => {
        handleClickSelectPatient({ page: 1, search: searchValue } as Payload);
      }, 500),
    [show, isFetching]
  );

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  return (
    <ConfirmationModal
      show={show}
      onHide={onClose}
      cancelButtonDisabled={isFetching}
      confirmButtonDisabled={
        isFetching ||
        !selectedUser ||
        selectedPatientOrders.length === 0 ||
        (!selectedOrder && selectedPatientOrders.length > 0)
      }
      onConfirm={onConfirm}
      title='Select Existing Patient'
      confirmLabel='Add'
      cancelLabel='Discard'
      message={
        <div>
          <label className='form-label text-start'>Search by Name</label>
          <Search
            isLoading={isFetching}
            value={search}
            onChange={(e) => {
              const value = e.target.value;
              setSearch(value);
              setUsersMeta({ page: 1, limit: 30 });

              if (value) {
                // Use debounced search
                debouncedSearch(value);
              } else {
                // If search is cleared, immediately fetch all patients
                handleClickSelectPatient({ page: 1 } as Payload);
              }
            }}
            className='mb-3'
            placeholder='Enter name...'
          />

          <InfiniteScroll
            dataLength={users.length}
            next={fetchMore}
            hasMore={!allOrdersLoaded}
            loader={
              <div className='d-flex justify-content-center py-4'>
                <Spinner size='sm' className='border-2' />
              </div>
            }
            height={'300px'}
          >
            {users && users.length > 0 ? (
              users.map((user) => (
                <div key={user.id} className='d-flex gap-2 flex-column'>
                  <button
                    key={user.id}
                    className={
                      'd-flex align-items-center border-0 w-100 text-start py-2 px-3 ' +
                      (selectedUser?.id === user.id ? 'bg-primary text-white' : 'btn-transparent')
                    }
                    onClick={() => selectePatientHandler(user)}
                  >
                    <div className='mr-4 bg-secondary-subtle rounded-circle p-3' />
                    <span className='text-sm text-capitalize'>
                      {user.firstName} {user.lastName}
                    </span>
                  </button>
                </div>
              ))
            ) : (
              <div className='text-center p-4 text-muted text-sm'>
                No matching users found. Check spelling or try searching by email.
              </div>
            )}
          </InfiniteScroll>

          {selectedUser && (
            <>
              {isFetchingOrders ? (
                <div className='d-flex justify-content-center mt-3'>
                  <Spinner size='sm' />
                </div>
              ) : selectedPatientOrders.length > 0 ? (
                <div className='mt-3'>
                  <h6 className='fw-semibold mb-2'>Select Order:</h6>
                  <Form.Select
                    value={selectedOrder?.id || ''}
                    onChange={onOrderSelect}
                    className='shadow-none'
                    required
                  >
                    <option value=''>Select an order</option>
                    {selectedPatientOrders.map((order) => (
                      <option
                        key={order.id}
                        value={order.id}
                        title={getFullOrderName(order)} // This adds the tooltip
                      >
                        {getOrderName(order)}
                      </option>
                    ))}
                  </Form.Select>
                </div>
              ) : (
                <div className='text-center mt-3 p-2 text-muted text-sm'>No orders found for this patient.</div>
              )}
            </>
          )}
        </div>
      }
    />
  );
};
