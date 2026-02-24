import { Form } from 'react-bootstrap';
import { formatDateTimeNumeric } from '@/lib/dateFormat';
import { Appointment, StatusLabel } from '@/types/appointment';
import { formatProviderName } from '@/lib/utils/providerName';

interface Props {
  appointment: Appointment;
  statusLabel: StatusLabel;
}

export default function AppointmentsRow({ appointment, statusLabel }: Props) {
  const patientName =
    [appointment.patient?.firstName, appointment.patient?.lastName].filter(Boolean).join(' ').trim() ||
    appointment.inviteeName ||
    '—';
  const email = appointment.patient?.email || appointment.inviteeEmail || '—';
  const phone = appointment.inviteePhone || '—';
  const schedule = appointment.scheduledAt
    ? formatDateTimeNumeric(appointment.scheduledAt, { dateTimeSeparator: ' ', use24Hour: false })
    : '—';
  const state = '—';
  const providerName = appointment.provider
    ? formatProviderName(appointment.provider.firstName, appointment.provider.lastName)
    : 'Select Provider';

  return (
    <tr>
      <td>
        <Form.Check type='checkbox' className='c_checkbox' />
      </td>
      <td>{patientName}</td>
      <td>{email}</td>
      <td>{phone}</td>
      <td>{schedule}</td>
      <td>{state}</td>
      <td>
        <span className='badge text-bg-light border text-dark'>{providerName}</span>
      </td>
      <td>
        <span className='badge rounded-pill text-bg-light border'>{statusLabel[appointment.status]}</span>
      </td>
    </tr>
  );
}
