import AppointmentsRow from './AppointmentsRow';
import { Spinner, Form } from 'react-bootstrap';
import { Appointment, StatusLabel } from '@/types/appointment';

interface Props {
  rows: Appointment[];
  loading: boolean;
  statusLabel: StatusLabel;
}

export default function AppointmentsList({ rows, loading, statusLabel }: Props) {
  return (
    <div className='table-responsive'>
      <table className='table c_datatable mb-0'>
        <thead>
          <tr>
            <th style={{ width: 36 }}>
              <Form.Check type='checkbox' className='c_checkbox' />
            </th>
            <th>PATIENT</th>
            <th>EMAIL</th>
            <th>PHONE NO.</th>
            <th>SCHEDULE</th>
            <th>STATE</th>
            <th>ASSIGN TO</th>
            <th>STATUS</th>
          </tr>
        </thead>
        <tbody className='c_table_body'>
          {loading && (
            <tr>
              <td colSpan={8} className='text-center py-5'>
                <Spinner animation='border' />
              </td>
            </tr>
          )}
          {!loading && rows.length === 0 && (
            <tr>
              <td colSpan={8} className='text-center py-5 text-muted'>
                No appointments found
              </td>
            </tr>
          )}
          {!loading &&
            rows.map((a: Appointment) => <AppointmentsRow key={a.id} appointment={a} statusLabel={statusLabel} />)}
        </tbody>
      </table>
    </div>
  );
}
