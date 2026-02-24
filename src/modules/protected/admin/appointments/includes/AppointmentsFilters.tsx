import Search from '@/components/Dashboard/Search';
import { Form } from 'react-bootstrap';
import { Appointment, StatusLabel } from '@/types/appointment';
import { ReactDatePicker } from '@/components/elements';
import { parse } from 'date-fns';
import { formatDateToUsRangeString } from '@/helpers/datePresets';

interface Props {
  search: string;
  setSearch: (v: string) => void;
  startDate?: string;
  setStartDate: (v?: string) => void;
  status?: Appointment['status'];
  setStatus: (v?: Appointment['status'] | string) => void;
  sortOrder: 'ASC' | 'DESC' | '';
  setSortOrder: (o: 'ASC' | 'DESC' | '') => void;
  statusLabel: StatusLabel;
}

export default function AppointmentsFilters({
  search,
  setSearch,
  startDate,
  setStartDate,
  status,
  setStatus,
  sortOrder,
  setSortOrder,
  statusLabel,
}: Readonly<Props>) {
  return (
    <div className='row g-2'>
      <div className='col-md-3'>
        <Search placeholder='Search' value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className='col-md-3'>
        <ReactDatePicker
          isClearable
          selected={startDate ? parse(startDate, 'yyyy-MM-dd', new Date()) : null}
          onChange={(d) => setStartDate(d ? formatDateToUsRangeString(d) : undefined)}
          placeholderText='Date'
          dateFormat='MM/dd/yyyy'
          popperClassName='react-datepicker-popper'
          popperContainer={({ children }) => <div style={{ zIndex: 9999, position: 'relative' }}>{children}</div>}
        />
      </div>

      <div className='col-md-3'>
        <Form.Select value={status ?? ''} onChange={(e) => setStatus(e.target.value || undefined)}>
          <option value=''>All Status</option>
          {Object.entries(statusLabel)
            .sort((a, b) => a[1].localeCompare(b[1]))
            .map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
        </Form.Select>
      </div>

      <div className='col-md-3'>
        <Form.Select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as 'ASC' | 'DESC' | '')}>
          <option value=''>Sort By</option>
          <option value='ASC'>ASC</option>
          <option value='DESC'>Sort by Date Newest</option>
        </Form.Select>
      </div>
    </div>
  );
}
