'use client';

import MedicationPopup from '@/components/Dashboard/admin/Popup/includes/MedicationPopup';
import FormsResponsesPopup from '@/components/Dashboard/admin/Popup/includes/FormResponsesPopup';
import { Offcanvas } from '@/components/elements';
import { RootState } from '@/store';
import { setPopup } from '@/store/slices/popupSlice';
import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ROUTES } from '@/constants';
import { usePathname } from 'next/navigation';
import { setShowResponses } from '@/store/slices/surveyResponsePopupSlice';

export default function Popup() {
  const dispatch = useDispatch();
  const pathname = usePathname();

  const isPopupOpen = useSelector((state: RootState) => state.popup);
  const isModalOpen = useSelector((state: RootState) => state.modal.modalType);
  const isOrderDetailModalOpen = useSelector((state: RootState) => state.modal.isModalOpen);

  const closePopup = () => {
    // Check if any Bootstrap modals are open
    const hasOpenModal = document.querySelector('.modal.show') !== null;

    if (!isModalOpen && !isOrderDetailModalOpen && !hasOpenModal) {
      dispatch(setPopup(false));
      dispatch(setShowResponses(false));
    }
  };

  const offcanvasSize = useMemo(() => {
    switch (pathname) {
      case ROUTES.ADMIN_MEDICATIONS:
        return 'medication';
      case ROUTES.ADMIN_FORMS_SURVEYS:
        return 'survey';
      default:
        return 'popup';
    }
  }, [pathname]);

  return (
    <Offcanvas
      isOpen={isPopupOpen}
      onClose={closePopup}
      position='right'
      size={offcanvasSize}
      showCloseButton={true}
      closeOnBackdropClick={true}
      closeOnEscape={true}
      disabledBodyPadding={false}
      bodyClassName='tw-space-y-4'
    >
      {isPopupOpen && <PopupContent route={pathname} />}
    </Offcanvas>
  );
}

const PopupContent = ({ route }: { route: string }) => {
  switch (route) {
    case ROUTES.ADMIN_FORMS_SURVEYS:
      return <FormsResponsesPopup />;
    case ROUTES.ADMIN_MEDICATIONS:
      return <MedicationPopup />;
  }
};
