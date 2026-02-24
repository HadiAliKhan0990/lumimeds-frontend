'use client';

import InfiniteScroll from 'react-infinite-scroll-component';
import { Column, Table } from '@/components/Dashboard/Table';
import { MobileCard } from '@/components/Dashboard/MobileCard';
import { IApprovedRxInfo } from '@/types/approved';
import { Spinner } from 'react-bootstrap';
import { abbreviateLocationState } from '@/helpers/stateHelpers';
import { formatUSDateTime } from '@/helpers/dateFormatter';
import { ORDER_STATUSES_ADMIN } from '@/constants';

interface ApprovedTableProps {
  data: IApprovedRxInfo[];
  onViewButtonClick: (row: IApprovedRxInfo) => void;
  onChangeButtonClick: (row: IApprovedRxInfo) => void;
  onTriageButtonClick: (row: IApprovedRxInfo) => void;
  checkedRxMap: Record<string, string>;
  setCheckedRxMap: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  isFetching?: boolean;
  hasMore?: boolean;
  fetchMore?: () => void;
}

export const ApprovedTable: React.FC<ApprovedTableProps> = ({
  data,
  onViewButtonClick,
  onChangeButtonClick,
  onTriageButtonClick,
  isFetching = false,
  hasMore = false,
  fetchMore = () => {},
}) => {
  const getStatusLabel = (status: string) => {
    // Map backend's custom status names to constant values
    const backendToConstantMap: Record<string, string> = {
      Place: 'Sent_To_Pharmacy', // Backend sends "Place" for Sent_To_Pharmacy
      Not_Paid: 'Drafted', // Backend sends "Not_Paid" for Drafted
    };

    const constantValue = backendToConstantMap[status] || status;
    const statusMapping = ORDER_STATUSES_ADMIN.find((s) => s.value.toLowerCase() === constantValue.toLowerCase());
    return statusMapping?.label || status.split('_').join(' ');
  };

  const columns: Column<IApprovedRxInfo>[] = [
    {
      header: 'ORDER ID',
      accessor: 'uniqueOrderId',
    },
    {
      header: 'PRESCRIBED',
      renderCell: (row) => {
        return (
          <div className='d-flex flex-column tw-max-w-80'>
            <span className='fw-semibold text-dark tw-line-clamp-2 sm:tw-line-clamp-none'>
              {row.prescribed.primary}
            </span>
            <div className='mt-1 d-flex justify-content-start flex-wrap gap-1'>
              <span className='text-muted small flex-shrink-0'>TREATMENT:</span>
              {row.prescribed.treatments.map((treatment, index) => (
                <div key={index} className='text-muted small text-break tw-line-clamp-2 sm:tw-line-clamp-none'>
                  {treatment}
                </div>
              ))}
            </div>
          </div>
        );
      },
    },
    {
      header: 'PATIENT DETAILS',
      renderCell: (row) => {
        return (
          <div className='d-flex flex-column align-items-start'>
            <span className='fw-semibold text-dark'>{row.patientDetails.name}</span>
            {/* <span className='text-muted small'>PID: {row.patientDetails.pid}</span> */}
            <span className='text-muted small'>
              {Math.floor(parseFloat(row.patientDetails.age))}Y,{' '}
              {row.patientDetails.gender
                ? row.patientDetails.gender.charAt(0).toUpperCase() + row.patientDetails.gender.slice(1).toLowerCase()
                : 'N/A'}
            </span>
            <div className='d-flex flex-wrap gap-2 mt-1'>
              <div className='d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-1 mt-1'>
                <span className='rounded px-2 text-xs flex-shrink-0 tw-bg-amber-50 tw-text-amber-800 tw-border tw-border-amber-200'>
                  {row.patientDetails.weight}
                </span>
                <span className='rounded px-2 text-xs flex-shrink-0 tw-bg-amber-50 tw-text-amber-800 tw-border tw-border-amber-200'>
                  {row.patientDetails.bmi}
                </span>
              </div>
            </div>
            <span className='text-muted small'>{abbreviateLocationState(row.patientDetails.location)}</span>
          </div>
        );
      },
    },
    {
      header: 'ASSIGNED AT',
      renderCell: (row) => {
        const formatAssignedDate = (dateString: string) => {
          // Extract time directly from the ISO string and convert to 12-hour format with AM/PM
          const timeMatch = dateString.match(/T(\d{2}):(\d{2})/);
          let time = '12:00 AM';

          if (timeMatch) {
            const hours = parseInt(timeMatch[1]);
            const minutes = timeMatch[2];
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const displayHours = hours % 12 || 12; // Convert 0 to 12, 13 to 1, etc.
            time = `${displayHours}:${minutes} ${ampm}`;
          }

          const date = new Date(dateString);
          const formattedDate = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });

          return { formattedDate, formattedTime: time };
        };

        const { formattedDate, formattedTime } = formatAssignedDate(row.assignedAt);

        return (
          <div className='tw-flex tw-flex-col tw-gap-1 tw-items-start'>
            <span className='text-dark'>{formattedDate}</span>
            <span className='rounded px-2 py-1 text-xs mt-1 tw-bg-gray-100 tw-text-gray-500 tw-text-[11px]'>
              {formattedTime}
            </span>
          </div>
        );
      },
    },
    {
      header: 'RX STATUS',
      renderCell: (row) => {
        const status = row.rxStatus?.status || '';
        const cssStatus = status.toLowerCase().replace(/ /g, '_');

        return (
          <div className='d-flex flex-column'>
            <span
              className={`w-fit text-xs fw-normal badge rounded text-dark px-2 py-1 custom-badge custom-badge-${cssStatus}`}
            >
              {getStatusLabel(status)}
            </span>
            <span className='text-muted small mt-1 text-capitalize'>By {row.rxStatus.approvedBy}</span>
          </div>
        );
      },
    },
    {
      header: 'APPROVAL DATE',
      renderCell: (row) => {
        const formatApprovalDate = (dateString: string) => {
          const date = new Date(dateString);
          const now = new Date();
          const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

          // Format date with formatUSDateTime helper
          const formattedDate = formatUSDateTime(dateString);

          // Format time ago
          let timeAgo = '';
          if (diffInMinutes < 1) {
            timeAgo = 'Just now';
          } else if (diffInMinutes < 60) {
            timeAgo = `${diffInMinutes} mins ago`;
          } else if (diffInMinutes < 1440) {
            const hours = Math.floor(diffInMinutes / 60);
            timeAgo = `${hours} hour${hours > 1 ? 's' : ''} ago`;
          } else {
            const days = Math.floor(diffInMinutes / 1440);
            timeAgo = `${days} day${days > 1 ? 's' : ''} ago`;
          }

          return { formattedDate, timeAgo };
        };

        const { formattedDate, timeAgo } = formatApprovalDate(row.approvalDate);

        return (
          <div className='tw-flex tw-flex-col tw-gap-1 tw-items-start'>
            <span className='text-dark'>{formattedDate}</span>
            <span className='rounded px-2 py-1 text-xs tw-bg-gray-100 tw-text-gray-500 tw-text-[11px]'>{timeAgo}</span>
          </div>
        );
      },
    },
    {
      header: 'ACTIONS',
      renderCell: (row) => {
        const status = row.rxStatus.status;
        // Backend sends "Place" for orders sent to pharmacy
        const isSentToPharmacy =
          status === 'Place' || status.toLowerCase() === 'sent_to_pharmacy' || status === 'Shipped';

        return (
          <div className='d-flex gap-1 flex-wrap'>
            <button
              className='btn btn-primary btn-sm text-white tw-w-[92px]'
              onClick={(e) => {
                e.stopPropagation();
                onViewButtonClick(row);
              }}
            >
              View
            </button>
            <button
              className='btn btn-sm btn-outline-primary tw-w-[92px]'
              onClick={(e) => {
                e.stopPropagation();
                onChangeButtonClick(row);
              }}
              disabled={isSentToPharmacy}
            >
              Change
            </button>
            <button
              className='btn btn-sm btn-outline-danger tw-w-[92px]'
              onClick={(e) => {
                e.stopPropagation();
                onTriageButtonClick(row);
              }}
              disabled={isSentToPharmacy}
            >
              Triage
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <div className='d-lg-none'>
        <InfiniteScroll
          dataLength={data.length}
          next={fetchMore}
          hasMore={hasMore}
          loader={
            <div className='d-flex justify-content-center py-4'>
              <Spinner size='sm' />
            </div>
          }
          height={`calc(100vh - 350px)`}
        >
          <MobileCard loading={isFetching && data.length === 0} data={data} columns={columns} />
        </InfiniteScroll>
      </div>
      <div className='d-none d-lg-block'>
        <InfiniteScroll
          dataLength={data.length}
          next={fetchMore}
          hasMore={hasMore}
          loader={
            <div className='d-flex justify-content-center py-4'>
              <Spinner size='sm' />
            </div>
          }
          height={'calc(100vh - 272px)'}
        >
          <div className='font-inter' id='invoice-table-top' />
          <Table data={data} columns={columns} isFetching={isFetching && data.length === 0} disableAlignMiddle={true} />
        </InfiniteScroll>
      </div>
    </>
  );
};
