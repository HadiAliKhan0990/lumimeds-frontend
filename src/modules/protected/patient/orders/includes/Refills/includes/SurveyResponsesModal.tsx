'use client';

import { Modal } from '@/components/elements';
import { FormattedSurveyResponse } from '@/store/slices/refillsApiSlice';
import { ResponseList } from '@/components/Dashboard/orders/RefillResponses';

interface SurveyResponsesModalProps {
  isOpen: boolean;
  onClose: () => void;
  responses: FormattedSurveyResponse[];
  productName?: string;
}

export default function SurveyResponsesModal({
  isOpen,
  onClose,
  responses,
  productName,
}: Readonly<SurveyResponsesModalProps>) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title='Refill Request Responses' size='xl'>
      <ResponseList responses={responses} productName={productName} variant='patient' />
    </Modal>
  );
}
