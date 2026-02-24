'use client';

import { Offcanvas, OffcanvasProps } from 'react-bootstrap';
import { usePathname } from 'next/navigation';
import PatientPopupAdmin from '../admin/users/Patients/includes/PatientPopupAdmin';
import PatientPopup from '../admin/users/Patients/includes/PatientPopup';

export interface PatientSideBarProps extends OffcanvasProps {
  onAccept?: () => void;
  onReject?: () => void;
  orderId?: string;
  showAcceptRejectRXForm?: boolean;
  showAcceptRejectRXFormActionButtons?: boolean;
  allowEdit?: boolean;
  hideTriageButton?: boolean;
  disableActionButtons?: boolean;
}

export const PatientSideBar = ({
  onAccept,
  onReject,
  orderId,
  showAcceptRejectRXForm = false,
  showAcceptRejectRXFormActionButtons = true,
  allowEdit = false,
  hideTriageButton = false,
  disableActionButtons = false,
  ...props
}: PatientSideBarProps) => {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  return (
    <Offcanvas {...props} id='patient_popup' className='patient_popup' scroll placement='end'>
      <Offcanvas.Header closeButton className='align-items-start' />
      <Offcanvas.Body className='d-flex flex-column gap-4 pt-2'>
        {isAdmin ? (
          <PatientPopupAdmin
            onAcceptRXForm={onAccept}
            onRejectRXForm={onReject}
            orderId={orderId}
            showAcceptRejectRXForm={showAcceptRejectRXForm}
            showAcceptRejectRXFormActionButtons={showAcceptRejectRXFormActionButtons}
            allowEdit={allowEdit}
          />
        ) : (
          <PatientPopup
            onAcceptRXForm={onAccept}
            onRejectRXForm={onReject}
            onHide={props.onHide}
            orderId={orderId}
            showAcceptRejectRXForm={showAcceptRejectRXForm}
            showAcceptRejectRXFormActionButtons={showAcceptRejectRXFormActionButtons}
            allowEdit={allowEdit}
            hideTriageButton={hideTriageButton}
            disableActionButtons={disableActionButtons}
          />
        )}
      </Offcanvas.Body>
    </Offcanvas>
  );
};