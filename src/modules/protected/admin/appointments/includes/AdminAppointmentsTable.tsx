'use client';

import { useStates } from '@/hooks/useStates';
import { Column, Table } from '@/components/Dashboard/Table';
import { Appointment, StatusLabel } from '@/types/appointment';
import { formatUSDateTime } from '@/helpers/dateFormatter';
import { MobileCard } from '@/components/Dashboard/MobileCard';
import { formatProviderName } from '@/lib/utils/providerName';

interface Props {
  data: Appointment[];
  loading?: boolean;
  statusLabel?: StatusLabel;
  selectedRows: Set<string>;
  onRowSelect: (rowId: string, checked: boolean) => void;
  onDecline?: (appointment: Appointment) => void;
  onReschedule?: (appointment: Appointment) => void;
}

export default function AdminAppointmentsTable({ data, loading = false, statusLabel }: Readonly<Props>) {
  const { nameToCode } = useStates();
  const columns: Column<Appointment>[] = [
    // {
    //   header: '',
    //   className: 'text-center w-5',
    //   renderCell: (row) => {
    //     const isDisabled = row.status === 'completed';

    //     if (isDisabled) {
    //       return <></>;
    //     }

    //     return (
    //       <input
    //         type='checkbox'
    //         id={`select-${row.id}`}
    //         checked={selectedRows.has(row.id)}
    //         onChange={(e) => onRowSelect(row.id, e.target.checked)}
    //         className='mt-1 text-muted me-0 c_checkbox'
    //         style={{ transform: 'scale(1.3)' }}
    //       />
    //     );
    //   },
    // },
    {
      header: 'PATIENT',
      renderCell: (row) => {
        const patientName =
          [row.patient?.firstName, row.patient?.lastName].filter(Boolean).join(' ').trim() || row.inviteeName || '—';
        return (
          <span className='text-small text-muted' style={{ whiteSpace: 'nowrap' }}>
            {patientName}
          </span>
        );
      },
    },
    {
      header: 'EMAIL',
      renderCell: (row) => (
        <span className='text-small text-muted' style={{ whiteSpace: 'nowrap' }}>
          {row.patient?.email || row.inviteeEmail || '—'}
        </span>
      ),
    },
    {
      header: 'STATE',
      renderCell: (row) => {
        const stateName = row?.shipping_state;

        if (!stateName)
          return (
            <span className='text-small text-muted' style={{ whiteSpace: 'nowrap' }}>
              —
            </span>
          );

        const stateCode = nameToCode[stateName] ?? '';

        const fullStateName = `${stateName} ${stateCode ? `, ${stateCode}` : ''}`;

        return (
          <span className='text-small text-muted' style={{ whiteSpace: 'nowrap' }}>
            {fullStateName}
          </span>
        );
      },
    },
    {
      header: 'SCHEDULE',
      renderCell: (row) => {
        return <span className='tw-text-sm tw-text-nowrap'>{formatUSDateTime(row.scheduledAt)}</span>;
      },
    },
    {
      header: 'Created At',
      renderCell: (row) => {
        return <span className='tw-text-sm tw-text-nowrap'>{formatUSDateTime(row.createdAt)}</span>;
      },
    },
    {
      header: 'ASSIGN TO',
      renderCell: (row) => {
        const providerName = row.provider
          ? formatProviderName(row.provider.firstName, row.provider.lastName)
          : 'Select Provider';
        return (
          <span className='text-small px-2 py-1 rounded' style={{ backgroundColor: '#F5F5F5', whiteSpace: 'nowrap' }}>
            {providerName}
          </span>
        );
      },
    },
    {
      header: 'STATUS',
      renderCell: (row) => {
        return (
          <span
            className={`text-xs fw-normal  rounded px-2 py-1 custom-badge custom-badge-${row?.status?.toLowerCase()}`}
            style={{
              whiteSpace: 'nowrap',
            }}
          >
            {statusLabel?.[row.status] || row.status?.split('_')?.join(' ')}
          </span>
        );
      },
    },
    {
      header: 'ACTIONS',
      renderCell: (row) => {
        const showActions = row.status === 'completed';
        if (showActions) {
          return <span>-</span>;
        }

        const showReschedule = !!row.rescheduleUrl;

        const showDecline = !!row.cancelUrl;

        return showReschedule || showDecline ? (
          <div className='d-flex flex-wrap gap-1 align-items-center'>
            {/* {showVisit && (
              <button
                className='btn btn-sm  btn-outline-primary no-wrap'
                onClick={(event) => {
                  event.stopPropagation();

                  window.open(row.scheduledEventUri ?? '', '_blank');
                }}
              >
                Visit
              </button>
            )} */}
            {showReschedule && (
              <button
                className='btn btn-outline-primary btn-sm no-wrap'
                onClick={() => window.open(row.rescheduleUrl ?? '', '_blank')}
              >
                Reschedule
              </button>
            )}
            {showDecline && (
              <button
                className='btn btn-outline-danger btn-sm no-wrap'
                onClick={() => window.open(row.cancelUrl ?? '', '_blank')}
              >
                Decline
              </button>
            )}
          </div>
        ) : (
          <span>-</span>
        );
      },
    },
  ];

  return (
    <>
      <div className='d-none d-lg-block'>
        <Table data={data} columns={columns} isFetching={loading && data.length === 0} />
      </div>

      <div className='d-lg-none'>
        <MobileCard loading={loading && data.length === 0} data={data} columns={columns} />
      </div>
    </>
  );
}
