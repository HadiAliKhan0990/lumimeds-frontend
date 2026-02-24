import { axiosBaseQuery } from '@/lib/baseQuery';
import { OrderStatus, PatientSingleOrder, SingleOrder } from '@/lib/types';
import { Agent } from '@/store/slices/agentApiSlice';
import { setOrdersData as setPatientOrdersData , setLatestOrdersPerSubscription} from '@/store/slices/patientOrdersSlice';
import { setUpdateOrder } from '@/store/slices/updateOrderSlice';
import { IApprovedRxQueryParams } from '@/types/approved';
import { createApi } from '@reduxjs/toolkit/query/react';
import { Order } from '@/store/slices/orderSlice';
import { setSearchableColumns } from '@/store/slices/sortSlice';
import { setSingleOrder } from '@/store/slices/singleOrderSlice';
import { ProductTypeFilter } from '@/types/approved';


interface Response {
  success: string | null;
  message: string | null;
  statusCode: number;
  data?: unknown;
}

interface AutoAssignAppointmentsResponse extends Response {
  data: {
    success: boolean;
    message: string;
    assignedCount: number;
    totalFound: number;
    requested: number;
    assignedOrders: Array<{
      orderId: string;
      patientId: string;
      patientName: string;
      productName: string;
      state: string;
      success: boolean;
    }>;
    errors?: Array<{
      orderId: string;
      error: string;
      success: boolean;
    }>;
  };
}

export interface OrdersResponse extends Response {
  data: {
    orders: Order[];
    statusCounts: {
      all: number;
      new: number;
      pending: number;
      onHold: number;
      confirmed: number;
      delivered: number;
      cancelled: number;
      completed: number;
      processing: number;
    };
    searchableColumns?: string[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}
export interface PatientOrdersResponse extends Response {
  data: PatientOdersData;
}

export interface PatientOdersData {
  patientDetails: PatientDetails;
  orders: PatientOrder[];
}

export interface PatientDetails {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  allergies?: string;
  medications?: string;
}

export interface PatientOrder {
  id: string;
  address: Address | null;
  requestedProductName: string;
  status?: string;
  visitType?: string;
  providerId?: string | null;
  providerName?: string | null;
  orderUniqueId?: string;
  type?: string;
}

export interface Address {
  billingAddress?: BillingAddress;
  shippingAddress?: ShippingAddress;
}

export interface BillingAddress {
  firstName: string;
  lastName: string;
  street: string;
  street2: string;
  city: string;
  region: string;
  state: string;
  zip: string;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  street: string;
  street2: string;
  city: string;
  region: string;
  state: string;
  zip: string;
}

export interface SingleOrderResponse extends Response {
  data: SingleOrder;
}

export interface SinglePatientOrderResponse extends Response {
  data: PatientSingleOrder;
}

export interface ApprovedRxOrder {
  orderId?: string;
  uniqueOrderId: string;
  prescribed: {
    medication: string;
    treatment: Array<{
      id: number;
      name: string;
      dosage: string;
    }>;
  };
  patientDetails: {
    name: string;
    pid: string;
    age: string;
    gender: string;
    weight: string;
    bmi: number;
    location: string;
  };
  assignedAt: string | null;
  rxStatus: string;
  approvalDate: string;
  approvedBy: string;
}

export interface ApprovedRxOrdersResponse extends Response {
  data: {
    orders: ApprovedRxOrder[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      todayCount?: number;
    };
  };
}

export type OrderStatusType =
  | 'Drafted'
  | 'Pending'
  | 'On_Hold'
  | 'Confirmed'
  | 'Failed'
  | 'Processing'
  | 'Shipped'
  | 'Out_for_Delivery'
  | 'Delivered'
  | 'Cancelled'
  | 'Returned'
  | 'Refunded'
  | 'Not Paid'
  | 'Refill'
  | 'Error'
  | 'Requires_Pending_Intake_Call'
  | 'Pending_Unresponsive';

export enum EncounterSortField {
  ASSIGNED_AT = 'assignedAt',
}

export interface PendingEncountersQueryParams {
  search?: string;
  date?: string;
  status?: OrderStatus;
  sortBy?: EncounterSortField;
  sortOrder?: string;
  page?: number;
  limit?: number;
  productType?: ProductTypeFilter;
}

export interface OrderSortQueryParams {
  search?: string | null;
  sortField?: string;
  sortOrder?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
  sortStatus?: string | null;
  statusArray?: string[];
  agentId?: string;
  pharmacyType?: string;
  type?: string | null;
  intervalCount?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  searchColumn?: string;
  visitType?: 'video' | 'document' | 'both' | null;
  telepath?: boolean | string;
  isRefillReq?: boolean;
  productType?: 'weight_loss' | 'longevity' | null;
}

export type UpdateOrderPayload = {
  productVariationId?: string;
  requestedPharmacyId?: string;
  id: string;
  trackingNumber?: string;
  isQueueEligible?: boolean;
  visitType?: string;
  courierService?: string;
};

export interface TrackingLogInfo {
  id: string;
  change: string;
  updatedAt: string;
}

export type OrderToProviderPayload = { patientId: string; provider: string };

export interface PendingEncounterPatient {
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  id: string;
}

export interface PendingEncounterOrdered {
  products: string[];
  subscription: 'Order' | 'Subscription';
}

export interface PendingEncounter {
  id: string;
  patient: PendingEncounterPatient;
  ordered: PendingEncounterOrdered;
  state: string;
  assignedAt: string;
  rxStatus: string;
  isNew: boolean;
  isExpiring: boolean;
  type?: string;
}

export interface PendingEncounterMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  todayCount?: number;
}

export interface PendingEncountersResponse {
  success: boolean;
  message: string;
  data: {
    encounters: PendingEncounter[];
    meta: PendingEncounterMeta;
  };
  statusCode: number;
}

export interface PrescriptionInstruction {
  medication: string;
  dosage: number;
  route?: string; // IM or SQ for NAD medication
  daysSupply?: number;
  directions?: string;
  notesToPatient?: string;
  notesToStaff?: string;
}

export interface ApprovePrescriptionPayload {
  orderId: string;
  prescriptionInstructions: PrescriptionInstruction[];
}

export interface RejectPrescriptionPayload {
  orderId: string;
  rejectionReason: string;
}

export type RevertOrdersToAdminPayload = {
  orderIds: string[];
  notes: string;
};

export interface OrderRejectionNotesResponse extends Response {
  data: {
    totalOrders: number;
    revertedOrders: number;
    skippedOrders: number;
    message: string;
  } | null;
}

export interface updateOrderResponse extends Response {
  data: {
    order: Order;
  };
}

export interface AssignToPreviousOrderResponse {
  success: string | null;
  message: string | null;
  statusCode: number;
  data: Order['assignedProvider'];
}
export const ordersApi = createApi({
  reducerPath: 'ordersApi',
  baseQuery: axiosBaseQuery(),
  refetchOnFocus: false,
  refetchOnReconnect: false,
  refetchOnMountOrArgChange: false,
  tagTypes: [
    'Order',
    'SingleOrder',
    'PatientOrders',
    'PatientSingleOrder',
    'Pending Orders',
    'Pending Encounters',
    'Appointments Patients',
  ],
  endpoints: (builder) => ({
    getPendingEncounters: builder.query<PendingEncountersResponse['data'], PendingEncountersQueryParams>({
      query: ({ page = 1, limit = 10, ...rest }) => ({
        url: '/orders/pending-encounters',
        params: {
          page,
          limit,
          ...rest,
        },
      }),
      providesTags: ['Order'],
      transformResponse: (res: PendingEncountersResponse) => res.data,
      keepUnusedDataFor: 1,
    }),
    getOrders: builder.query<OrdersResponse['data'], OrderSortQueryParams>({
      query: ({
        search,
        sortOrder,
        meta,
        statusArray,
        sortField,
        agentId,
        pharmacyType,
        type,
        intervalCount,
        startDate,
        endDate,
        searchColumn,
        visitType,
        telepath,
        productType,
      }: OrderSortQueryParams) => ({
        url: `/orders/list`,
        params: {
          page: meta?.page || 1,
          limit: meta?.limit,
          search,
          sortOrder,
          sortField,
          ...(statusArray?.length ? { status: statusArray.join(',') } : {}),
          ...(agentId && { agentId }),
          ...(pharmacyType && { pharmacyType }),
          ...(type && { type }),
          ...(intervalCount !== null && intervalCount !== undefined && { intervalCount }),
          ...(startDate && { startDate }),
          ...(endDate && { endDate }),
          searchColumn,
          ...(visitType && visitType !== 'both' && { visitType }),
          ...(visitType === 'both' && { visitType: 'video,document' }),
          ...(telepath !== undefined && { telepath: typeof telepath === 'string' ? telepath : telepath }),
          ...(productType && { productType }),
        },
      }),
      providesTags: ['Order'],
      transformResponse: (res: OrdersResponse) => res.data,
      keepUnusedDataFor: 1,
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        try {
          const result = await queryFulfilled;
          dispatch(setSearchableColumns(result.data?.searchableColumns ?? []));
        } catch (error) {
          console.log(error);
        }
      },
    }),
    getPendingOrders: builder.query<OrdersResponse['data'], OrderSortQueryParams>({
      query: ({ meta }: OrderSortQueryParams) => ({
        url: `/orders/list`,
        params: {
          page: meta?.page || 1,
          limit: meta?.limit,
          status: 'Pending',
        },
      }),
      providesTags: ['Pending Orders'],
      transformResponse: (res: OrdersResponse) => res.data,
      keepUnusedDataFor: 1,
    }),
    getPatientOrders: builder.query<OrdersResponse['data'], OrderSortQueryParams>({
      query: ({ search, sortOrder, meta, sortStatus, sortField, type, isRefillReq }) => ({
        url: `/orders/patient-list`,
        params: {
          search,
          sortOrder,
          sortField,
          page: meta?.page,
          limit: meta?.limit,
          ...(sortStatus && { status: sortStatus }),
          ...(type && { type }),
          ...(isRefillReq !== undefined && { isRefillReq }),
        },
      }),
      providesTags: ['PatientOrders'],
      transformResponse: (res: OrdersResponse) => res.data,
      onQueryStarted: async (arg, { dispatch, queryFulfilled }) => {
        // Only update Redux store if this is NOT a refill request
        // Refill requests should only affect the modal, not the main page
        if (arg.isRefillReq === true) {
          return;
        }
        try {
          const result = await queryFulfilled;
          const { meta, orders } = result.data || {};
          dispatch(setPatientOrdersData({ meta, data: orders }));
        } catch (error) {
          console.log(error);
        }
      },
      keepUnusedDataFor: 1,
    }),
    getPatientOrdersList: builder.query<OrdersResponse['data'], { userId: string } & OrderSortQueryParams>({
      query: ({ userId, search, sortOrder, meta, sortStatus, type, isRefillReq }) => ({
        url: `/orders/patient-orders/${userId}`,
        params: {
          search,
          sortOrder,
          page: meta?.page,
          limit: meta?.limit,
          ...(sortStatus && { status: sortStatus }),
          ...(type && { type }),
          ...(isRefillReq !== undefined && { isRefillReq }),
        },
      }),
      providesTags: ['PatientOrders'],
      transformResponse: (res: OrdersResponse) => res.data,
      onQueryStarted: async (arg, { dispatch, queryFulfilled }) => {
        // Only update Redux store if this is NOT a refill request
        // Refill requests should only affect the modal, not the main page
        if (arg.isRefillReq === true) {
          return;
        }
        try {
          const result = await queryFulfilled;
          dispatch(setPatientOrdersData({ data: result.data.orders, meta: result.data.meta }));
        } catch (error) {
          console.log(error);
        }
      },
      keepUnusedDataFor: 1,
    }),
    getPatientOrdersLatestPerSubscription: builder.query<OrdersResponse['data'], { userId: string } & OrderSortQueryParams>({
      query: ({ userId, search, sortOrder, meta, sortStatus, type, isRefillReq, startDate, endDate, sortField }) => ({
        url: `/orders/patient-orders/latest-per-subscription/${userId}`,
        params: {
          search,
          sortOrder,
          sortField,
          page: meta?.page,
          limit: meta?.limit,
          ...(sortStatus && { status: sortStatus }),
          ...(type && { type }),
          ...(isRefillReq !== undefined && { isRefillReq }),
          ...(startDate && { startDate }),
          ...(endDate && { endDate }),
        },
      }),
      providesTags: ['PatientOrders'],
      transformResponse: (res: OrdersResponse) => res.data,
      onQueryStarted: async (arg, { dispatch, queryFulfilled }) => {
        // Only update Redux store if this is NOT a refill request
        // Refill requests should only affect the modal, not the main page
        if (arg.isRefillReq === true) {
          return;
        }
        try {
          const result = await queryFulfilled;
          dispatch(setLatestOrdersPerSubscription({ data: result.data.orders, meta: result.data.meta }));
        } catch (error) {
          console.log(error);
        }
      },
      keepUnusedDataFor: 1,
    }),
    getSingleOrder: builder.query<SingleOrder, string>({
      query: (id) => ({ url: `/orders/${id}` }),
      transformResponse: (res: SingleOrderResponse) => res.data,
      providesTags: (_result, _error, id) => [{ type: 'SingleOrder', id }],
      onQueryStarted: async (_arg, { dispatch, queryFulfilled }) => {
        try {
          const result = await queryFulfilled;
          dispatch(setUpdateOrder(result.data.order));
          dispatch(setSingleOrder(result.data));
        } catch (error) {
          console.log(error);
        }
      },
    }),
    getAdminOrder: builder.query<{ order: Order }, string>({
      query: (id) => ({ url: `/orders/admin/${id}` }),
      transformResponse: (res: Response & { data: { order: Order } }) => res.data,
      providesTags: (_result, _error, id) => [{ type: 'Order', id }],
    }),
    getPatientSingleOrder: builder.query<PatientSingleOrder, string>({
      query: (id) => ({ url: `/orders/patient/${id}` }),
      transformResponse: (res: SinglePatientOrderResponse) => res.data,
      providesTags: (_result, _error, id) => [{ type: 'PatientSingleOrder', id }],
    }),
    updateOrderStatus: builder.mutation({
      query: ({
        id,
        status,
        orderHoldReminderDate,
        holdReason,
      }: {
        id: string;
        status: OrderStatus;
        orderHoldReminderDate?: string;
        holdReason?: string;
      }) => {
        const data: { status: OrderStatus; orderHoldReminderDate?: string; holdReason?: string } = {
          status,
        };

        if (orderHoldReminderDate) {
          data.orderHoldReminderDate = orderHoldReminderDate;
        }
        if (holdReason) {
          data.holdReason = holdReason;
        }

        return {
          url: `/orders/${id}`,
          method: 'PATCH',
          data,
        };
      },
      async onQueryStarted({ id, status }, { dispatch, queryFulfilled, getState }) {
        const patchResults: Array<{ undo: () => void }> = [];

        const state = getState();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const queriesData = (state as any).api?.queries;

        if (queriesData) {
          Object.keys(queriesData).forEach((key) => {
            if (key.startsWith('getOrders(')) {
              const patchResult = dispatch(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ordersApi.util.updateQueryData('getOrders', queriesData[key]?.originalArgs as any, (draft) => {
                  const order = draft.orders?.find((o) => o.id === id);
                  if (order) {
                    order.status = status as OrderStatusType;
                  }
                })
              );
              patchResults.push(patchResult);
            }
          });
        }

        const singleOrderPatch = dispatch(
          ordersApi.util.updateQueryData('getSingleOrder', id, (draft: SingleOrder) => {
            if (!draft?.order) return;
            draft.order.status = status as OrderStatusType;
          })
        );
        patchResults.push(singleOrderPatch);

        try {
          await queryFulfilled;
        } catch {
          patchResults.forEach((patchResult) => {
            patchResult.undo();
          });
        }
      },
    }),
    updateOrderAgent: builder.mutation({
      query: ({ id, agentId }: { id: string; agentId: string; agent?: Agent | null }) => ({
        url: `/orders/${id}`,
        method: 'PATCH',
        data: { agentId },
      }),
      // Avoid refetching single order; we update cache optimistically
      async onQueryStarted(
        { id, agentId, agent }: { id: string; agentId: string; agent?: Agent | null },
        { dispatch, queryFulfilled }
      ) {
        const patch = dispatch(
          ordersApi.util.updateQueryData('getSingleOrder', id, (draft: SingleOrder) => {
            if (!draft?.order) return;
            if (agent === null || agentId === null) {
              draft.order.agent = null;
            } else if (agent) {
              draft.order.agent = agent;
            } else if (draft.order.agent && agentId) {
              draft.order.agent.id = agentId;
            } else if (agentId) {
              draft.order.agent = { id: agentId } as Agent;
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),
    sendOrderToProvider: builder.mutation({
      query: (data: OrderToProviderPayload) => ({
        url: `/patients/process-order`,
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Order'],
    }),
    updateOrder: builder.mutation<updateOrderResponse, UpdateOrderPayload>({
      query: ({
        id,
        productVariationId,
        requestedPharmacyId,
        trackingNumber,
        isQueueEligible,
        visitType,
        courierService,
      }) => ({
        url: `/orders/${id}`,
        method: 'PATCH',
        data: {
          ...(productVariationId && { productVariationId }),
          ...(requestedPharmacyId && { requestedPharmacyId }),
          ...(trackingNumber !== undefined && { trackingNumber }),
          ...(courierService !== undefined && { courierService }),
          ...(isQueueEligible !== undefined && { isQueueEligible }),
          ...(visitType !== undefined && { visitType }),
        },
      }),
      // Avoid refetching single order; we update cache optimistically
      async onQueryStarted(
        { id, productVariationId, requestedPharmacyId, trackingNumber, isQueueEligible, courierService },
        { dispatch, queryFulfilled }
      ) {
        const patch = dispatch(
          ordersApi.util.updateQueryData('getSingleOrder', id, (draft: SingleOrder) => {
            if (!draft?.order) return;
            if (productVariationId !== undefined) {
              draft.order.currentProductVariation = productVariationId;
            }
            if (requestedPharmacyId !== undefined) {
              // Note: requestedPharmacyId may need to map to pharmacy field
              // Adjust based on your API response structure
            }
            if (trackingNumber !== undefined) {
              draft.order.trackingNumber = trackingNumber;
            }

            if (courierService !== undefined) {
              draft.order.courierService = courierService;
            }
            if (isQueueEligible !== undefined) {
              draft.order.isQueueEligible = isQueueEligible;
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),
    toggleVisitType: builder.mutation<Response, { orderId: string; visitType: string }>({
      query: ({ orderId, visitType }) => ({
        url: `/orders/${orderId}/toggle-visit-type`,
        method: 'PATCH',
        data: { visitType },
      }),
      invalidatesTags: ['SingleOrder', 'Order'],
    }),
    autoAssignOrders: builder.mutation<Response, void>({
      query: () => ({
        url: '/orders/auto-assign-orders',
        method: 'POST',
      }),
    }),
    autoAssignAppointments: builder.mutation<AutoAssignAppointmentsResponse, { limit?: number }>({
      query: (data) => ({
        url: '/orders/auto-assign-appointments',
        method: 'POST',
        data,
      }),
    }),
    revertOrders: builder.mutation<Response, RevertOrdersToAdminPayload>({
      query: (data) => ({
        url: '/orders/revert-orders',
        method: 'POST',
        data,
      }),
    }),
    revertOrdersToAdmin: builder.mutation<OrderRejectionNotesResponse, RevertOrdersToAdminPayload>({
      query: (data) => ({
        url: '/orders/revert-orders',
        method: 'POST',
        data,
      }),
    }),
    approvePrescription: builder.mutation<Response, ApprovePrescriptionPayload>({
      query: (data) => ({
        url: '/pharmacy/prescriptions/approve',
        method: 'POST',
        data,
      }),
      // Keep pending queue accurate without refetching the single order view
      invalidatesTags: ['Pending Orders'],
    }),
    rejectPrescription: builder.mutation<Response, RejectPrescriptionPayload>({
      query: (data) => ({
        url: '/pharmacy/prescriptions/reject',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Pending Orders'],
    }),
    getApprovedRxOrders: builder.query<ApprovedRxOrdersResponse['data'], IApprovedRxQueryParams>({
      query: ({ search, date, startDate, endDate, statuses, sortBy, sortOrder, page, limit, productType }) => {
        // Filter out empty values to prevent validation errors
        const params: Record<string, string | number | string[] | undefined> = {
          sortBy,
          sortOrder,
          page: page || 1,
          limit: limit || 10,
        };

        // Only include search if it has a valid value
        if (search && search.trim() !== '') {
          params.search = search;
        }

        // Only include date if it has a valid value
        if (date && date.trim() !== '') {
          params.date = date;
        }

        if (startDate && startDate.trim() !== '') {
          params.startDate = startDate;
        }
        if (endDate && endDate.trim() !== '') {
          params.endDate = endDate;
        }

        if (statuses && statuses.length > 0) {
          params.statuses = statuses;
        }

        if (productType) {
          params.productType = productType;
        }

        return {
          url: `/orders/approved-rx`,
          params,
        };
      },
      providesTags: ['Order'],
      transformResponse: (res: ApprovedRxOrdersResponse) => res.data,
      keepUnusedDataFor: 1,
    }),
    assignOrderToDoctor: builder.mutation<Response, { orderId: string; providerId: string; patientId: string }>({
      query: ({ orderId, providerId, patientId }) => ({
        url: `/orders/assign-to-doctor`,
        method: 'POST',
        data: {
          orderId,
          providerId,
          patientId,
        },
      }),
      invalidatesTags: ['SingleOrder', 'Pending Orders'],
    }),
    getOrdersByPatientId: builder.query<PatientOrdersResponse['data'], string>({
      query: (patientId: string) => ({
        url: `orders/patient/${patientId}/orders`,
      }),
      providesTags: ['Order'],
      transformResponse: (res: PatientOrdersResponse) => res.data,
      keepUnusedDataFor: 1,
    }),
    getMyAssignedOrders: builder.query<{ encounters: PendingEncounter[]; appointments: unknown[] }, string>({
      query: (patientId) => ({
        url: `/orders/my-assigned-orders/${patientId}`,
      }),
      providesTags: ['Order'],
      transformResponse: (
        res: Response & {
          data: { encounters: PendingEncounter[]; appointments: unknown[] };
        }
      ) => res.data,
      keepUnusedDataFor: 1,
    }),
    getPullableOrdersByPatientId: builder.query<PatientOrdersResponse['data'], string>({
      query: (patientId: string) => ({
        url: `orders/patient/${patientId}/pullable-orders`,
      }),
      providesTags: (result, error, patientId) => [{ type: 'Order', id: `pullable-${patientId}` }],
      transformResponse: (res: PatientOrdersResponse) => res.data,
      keepUnusedDataFor: 1,
    }),

    getOrderRejectionNotes: builder.query<{ data: string }, { orderId: string }>({
      query: ({ orderId }) => ({
        url: '/orders/order-rejection-notes',
        method: 'POST',
        data: { orderId },
      }),
    }),
    updateOrderAddress: builder.mutation<Response, { orderId: string; address: unknown; isDefault?: boolean }>({
      query: ({ orderId, address, isDefault }) => ({
        url: `/orders/order-address/${orderId}`,
        method: 'PATCH',
        data: {
          address,
          ...(isDefault && { isDefault }),
        },
      }),
      // Update both admin and patient single order caches optimistically
      async onQueryStarted({ orderId, address }, { dispatch, queryFulfilled, getState }) {
        const patches: Array<{ undo: () => void }> = [];

        // Update admin single order cache
        const adminPatch = dispatch(
          ordersApi.util.updateQueryData('getSingleOrder', orderId, (draft: SingleOrder) => {
            if (!draft) return;
            // Update order address which drives Billing and Tracking UI sections
            if (draft.order) {
              draft.order.address = address as typeof draft.order.address;
            }
          })
        );
        patches.push(adminPatch);

        // Update patient single order cache
        const patientPatch = dispatch(
          ordersApi.util.updateQueryData('getPatientSingleOrder', orderId, (draft: PatientSingleOrder) => {
            if (!draft) return;
            // Update order address for patient view
            if (draft.order) {
              draft.order.address = address as typeof draft.order.address;
            }
          })
        );
        patches.push(patientPatch);

        // Also update the Redux slice (patientOrders) since components read from it directly
        // This ensures the modal gets fresh data when opened from the list
        const rootState = getState() as {
          patientOrders?: {
            data?: Order[];
            meta?: { total?: number; page: number; limit?: number; totalPages?: number };
          };
        };
        if (rootState.patientOrders?.data) {
          const updatedOrders = rootState.patientOrders.data.map((order) => {
            if (order.id === orderId) {
              return { ...order, address: address as typeof order.address };
            }
            return order;
          });
          // Only update if meta exists and has required page property
          if (rootState.patientOrders.meta && typeof rootState.patientOrders.meta.page === 'number') {
            dispatch(setPatientOrdersData({ data: updatedOrders, meta: rootState.patientOrders.meta }));
          } else {
            dispatch(setPatientOrdersData({ data: updatedOrders }));
          }
        }

        try {
          await queryFulfilled;
        } catch {
          patches.forEach((patch) => patch.undo());
        }
      },
    }),
    updateOrderRemarks: builder.mutation<Response, { orderId: string; remarks: string }>({
      query: ({ orderId, remarks }) => ({
        url: `/orders/${orderId}`,
        method: 'PATCH',
        data: { reason: remarks },
      }),
      // Avoid refetching single order; we update cache optimistically
      async onQueryStarted({ orderId, remarks }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          ordersApi.util.updateQueryData('getSingleOrder', orderId, (draft: SingleOrder) => {
            if (!draft?.order) return;
            draft.order.reason = remarks;
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),
    updateOrderPatientRemarks: builder.mutation<Response, { orderId: string; patientRemarks: string }>({
      query: ({ orderId, patientRemarks }) => ({
        url: `/orders/${orderId}`,
        method: 'PATCH',
        data: { patientRemarks },
      }),
    }),
    updateOrderTrackingNumber: builder.mutation<
      updateOrderResponse,
      { orderId: string; trackingNumber: string; courierService?: string }
    >({
      query: ({ orderId, trackingNumber, courierService }) => ({
        url: `/orders/${orderId}`,
        method: 'PATCH',
        data: { trackingNumber, ...(courierService !== undefined && { courierService }) },
      }),
      // Avoid refetching single order; we update cache optimistically
      async onQueryStarted({ orderId, trackingNumber, courierService }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          ordersApi.util.updateQueryData('getSingleOrder', orderId, (draft: SingleOrder) => {
            if (!draft?.order) return;
            draft.order.trackingNumber = trackingNumber;
            if (courierService !== undefined) {
              draft.order.courierService = courierService;
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
      invalidatesTags: (_result, _error, { orderId }) => [{ type: 'SingleOrder', id: orderId }],
    }),
    recordVialShipment: builder.mutation<
      Response,
      {
        orderId: string;
        vialsShipped: number;
        nextReminderDate?: string;
        isFinalShipment?: boolean;
        isIncrement?: boolean;
      }
    >({
      query: ({ orderId, vialsShipped, nextReminderDate, isFinalShipment, isIncrement }) => ({
        url: `/orders/${orderId}/vial-shipment`,
        method: 'POST',
        data: {
          shippedVials: vialsShipped,
          ...(nextReminderDate && { nextShipmentReminderDate: nextReminderDate }),
          ...(isFinalShipment !== undefined && { isFinalShipment }),
          ...(isIncrement !== undefined && { isIncrement }),
        },
      }),
      invalidatesTags: ['Order', 'SingleOrder'],
    }),
    getTrackingLogs: builder.query<
      Response & {
        data: {
          trackingLogs: Array<TrackingLogInfo>;
          meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
          };
        };
      },
      { orderId: string; page?: number; limit?: number; sortOrder?: 'ASC' | 'DESC' }
    >({
      query: ({ orderId, page = 1, limit = 10, sortOrder = 'DESC' }) => ({
        url: `/orders/${orderId}/tracking-logs`,
        method: 'GET',
        params: { page, limit, sortOrder },
      }),
      providesTags: (_result, _error, { orderId }) => [{ type: 'SingleOrder', id: orderId }],
      keepUnusedDataFor: 60,
    }),
    pullSelectedOrders: builder.mutation<
      Response & {
        data: {
          success: boolean;
          message: string;
          pulledOrders: number;
          ordersReassigned: number;
          ordersNewlyAssigned: number;
          hasOtherProviders: boolean;
          visitType: string;
        };
      },
      { patientId: string; visitType: 'video' | 'document'; orderIds: string[] }
    >({
      query: ({ patientId, visitType, orderIds }) => ({
        url: `/orders/pull-selected-orders`,
        method: 'POST',
        data: { patientId, visitType, orderIds },
      }),
      invalidatesTags: ['Pending Encounters', 'Appointments Patients', 'Pending Orders'],
    }),
    changeTelepathOrderStatus: builder.mutation<Response, { id: string; status: boolean }>({
      query: ({ id, status }) => ({
        url: '/orders/change-telepath-order-status',
        method: 'POST',
        data: { id, status },
      }),
      invalidatesTags: ['Order', 'SingleOrder'],
    }),
    assignToPreviousOrder: builder.mutation<AssignToPreviousOrderResponse, unknown>({
      query: (orderId) => ({
        url: `/orders/assign-previous-provider/${orderId}`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Order', 'SingleOrder'],
    }),
    sendEmailReminder: builder.mutation<Response, { orderId: string; daysBefore?: number }>({
      query: ({ orderId, daysBefore }) => ({
        url: `/orders/${orderId}/send-email-reminder`,
        method: 'POST',
        data: daysBefore ? { daysBefore } : {},
      }),
    }),
    sendSMSReminder: builder.mutation<Response, { orderId: string; daysBefore?: number }>({
      query: ({ orderId, daysBefore }) => ({
        url: `/orders/${orderId}/send-sms-reminder`,
        method: 'POST',
        data: daysBefore ? { daysBefore } : {},
      }),
    }),
    sendRenewalEmailReminder: builder.mutation<Response, { subscriptionId: string; daysBefore?: number }>({
      query: ({ subscriptionId, daysBefore }) => ({
        url: `/orders/renewals/${subscriptionId}/send-email-reminder`,
        method: 'POST',
        data: daysBefore ? { daysBefore } : {},
      }),
    }),
    sendRenewalSMSReminder: builder.mutation<Response, { subscriptionId: string; daysBefore?: number }>({
      query: ({ subscriptionId, daysBefore }) => ({
        url: `/orders/renewals/${subscriptionId}/send-sms-reminder`,
        method: 'POST',
        data: daysBefore ? { daysBefore } : {},
      }),
    }),
  }),
});

export const {
  useLazyGetOrdersQuery,
  useLazyGetPendingOrdersQuery,
  useUpdateOrderStatusMutation,
  useGetSingleOrderQuery,
  useGetAdminOrderQuery,
  useLazyGetAdminOrderQuery,
  useLazyGetSingleOrderQuery,
  useLazyGetPatientOrdersQuery,
  useGetPatientSingleOrderQuery,
  useSendOrderToProviderMutation,
  useUpdateOrderMutation,
  useLazyGetPatientOrdersListQuery,
  useLazyGetPatientOrdersLatestPerSubscriptionQuery,
  useGetPatientOrdersLatestPerSubscriptionQuery,
  useGetPendingEncountersQuery,
  useLazyGetPendingEncountersQuery,
  useAutoAssignOrdersMutation,
  useAutoAssignAppointmentsMutation,
  useRevertOrdersMutation,
  useRevertOrdersToAdminMutation,
  useApprovePrescriptionMutation,
  useRejectPrescriptionMutation,
  useLazyGetApprovedRxOrdersQuery,
  useAssignOrderToDoctorMutation,
  useGetOrdersByPatientIdQuery,
  useLazyGetOrdersByPatientIdQuery,
  useGetMyAssignedOrdersQuery,
  useLazyGetMyAssignedOrdersQuery,
  useGetPullableOrdersByPatientIdQuery,
  useLazyGetPullableOrdersByPatientIdQuery,
  useLazyGetOrderRejectionNotesQuery,
  useUpdateOrderAddressMutation,
  useUpdateOrderAgentMutation,
  useUpdateOrderRemarksMutation,
  useUpdateOrderPatientRemarksMutation,
  useUpdateOrderTrackingNumberMutation,
  useRecordVialShipmentMutation,
  usePullSelectedOrdersMutation,
  useChangeTelepathOrderStatusMutation,
  useAssignToPreviousOrderMutation,
  useToggleVisitTypeMutation,
  useSendEmailReminderMutation,
  useSendSMSReminderMutation,
  useSendRenewalEmailReminderMutation,
  useSendRenewalSMSReminderMutation,
  useLazyGetTrackingLogsQuery,
} = ordersApi;
