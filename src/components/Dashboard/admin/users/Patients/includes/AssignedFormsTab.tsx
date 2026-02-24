'use client';

import { useGetPatientAssignedFormsQuery, useRemoveAssignedFormMutation, AssignedForm } from '@/store/slices/patientApiSlice';
import { useState } from 'react';
import { Spinner } from 'react-bootstrap';
import { formatUSDateTime } from '@/helpers/dateFormatter';
import { FaTrash } from 'react-icons/fa';
import { RemoveFormModal } from './RemoveFormModal';
import { SendIntakForm } from './SendIntakForm';
import toast from 'react-hot-toast';

interface AssignedFormsTabProps {
  patientId: string;
  patientName: string;
}

export function AssignedFormsTab({ patientId, patientName }: AssignedFormsTabProps) {
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedForm, setSelectedForm] = useState<AssignedForm | null>(null);
  const [showSendFormModal, setShowSendFormModal] = useState(false);

  const { data: assignedForms = [], isLoading, refetch } = useGetPatientAssignedFormsQuery(patientId);
  const [removeForm, { isLoading: isRemoving }] = useRemoveAssignedFormMutation();

  const handleRemoveClick = (form: AssignedForm) => {
    setSelectedForm(form);
    setShowRemoveModal(true);
  };

  const handleConfirmRemove = async () => {
    if (!selectedForm) return;

    try {
      await removeForm({
        patientId,
        submissionId: selectedForm.id,
      }).unwrap();
      
      toast.success(`Form "${selectedForm.surveyName}" removed successfully from ${patientName}`);
      setShowRemoveModal(false);
      setSelectedForm(null);
      refetch();
    } catch (error: unknown) {
      const errorMessage = error && typeof error === 'object' && 'data' in error && 
        error.data && typeof error.data === 'object' && 'message' in error.data
        ? String(error.data.message)
        : 'Failed to remove form';
      toast.error(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <>
      {assignedForms.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <p>No assigned forms</p>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowSendFormModal(true)}
          >
            Send Form
          </button>
        </div>
      ) : (
        <div className="table-responsive" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table className="table table-hover" style={{ minWidth: '600px', width: '100%' }}>
            <thead>
              <tr>
                <th style={{ whiteSpace: 'nowrap' }}>Form Name</th>
                <th style={{ whiteSpace: 'nowrap' }}>Assigned Date</th>
                <th style={{ whiteSpace: 'nowrap' }}>Form Type</th>
                <th className="d-none d-sm-table-cell" style={{ whiteSpace: 'nowrap' }}>Status</th>
                <th style={{ whiteSpace: 'nowrap' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignedForms.map((form) => (
                <tr key={form.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>{form.surveyName}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {formatUSDateTime(form.assignedDate)}
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {form.surveyType}
                  </td>
                  <td className="d-none d-sm-table-cell" style={{ whiteSpace: 'nowrap' }}>
                    <span className="badge bg-warning text-dark">Pending</span>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleRemoveClick(form)}
                      disabled={isRemoving}
                      title="Remove form"
                    >
                      <FaTrash size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedForm && (
        <RemoveFormModal
          isOpen={showRemoveModal}
          onClose={() => {
            setShowRemoveModal(false);
            setSelectedForm(null);
          }}
          onConfirm={handleConfirmRemove}
          formName={selectedForm.surveyName}
          patientName={patientName}
          isLoading={isRemoving}
        />
      )}

      <SendIntakForm
        isOpen={showSendFormModal}
        onClose={() => {
          setShowSendFormModal(false);
        }}
        onFormSent={() => {
          refetch();
        }}
        patientInfo={{
          id: patientId,
          firstName: patientName.split(' ')[0] || '',
          lastName: patientName.split(' ').slice(1).join(' ') || '',
        }}
      />
    </>
  );
}

