'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import Loading from '@/components/Dashboard/Loading';

interface PatientDetails {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  // Add more patient details as needed
}

const PatientDetailsPage = () => {
  const params = useParams();
  const patientId = params.id as string;
  const [patientDetails, setPatientDetails] = useState<PatientDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const selectedConversation = useSelector((state: RootState) => state.chat.selectedConversation);

  useEffect(() => {
    const fetchPatientDetails = async () => {
      try {
        setLoading(true);
        // For now, we'll use the selected conversation data
        // In a real implementation, you'd fetch patient details from an API
        if (selectedConversation?.otherUser) {
          setPatientDetails({
            id: selectedConversation.otherUser.id || patientId,
            firstName: selectedConversation.otherUser.firstName || '',
            lastName: selectedConversation.otherUser.lastName || '',
            email: selectedConversation.otherUser.email || '',
            phone: '',
          });
        }
      } catch (error) {
        console.error('Error fetching patient details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      fetchPatientDetails();
    }
  }, [patientId, selectedConversation]);

  if (loading) {
    return <Loading />;
  }

  if (!patientDetails) {
    return (
      <div className='container py-4'>
        <div className='alert alert-warning'>Patient not found.</div>
      </div>
    );
  }

  return (
    <div className='container py-4'>
      <div className='row'>
        <div className='col-12'>
          <div className='card'>
            <div className='card-header'>
              <h4 className='mb-0'>Patient Details</h4>
            </div>
            <div className='card-body'>
              <div className='row'>
                <div className='col-md-6'>
                  <h5>Personal Information</h5>
                  <p>
                    <strong>Name:</strong> {patientDetails.firstName} {patientDetails.lastName}
                  </p>
                  <p>
                    <strong>Email:</strong> {patientDetails.email}
                  </p>
                  <p>
                    <strong>Phone:</strong> {patientDetails.phone}
                  </p>
                </div>
                <div className='col-md-6'>
                  <h5>Patient ID</h5>
                  <p>
                    <strong>ID:</strong> {patientDetails.id}
                  </p>
                </div>
              </div>

              <div className='mt-4'>
                <h5>Recent Messages</h5>
                <p className='text-muted'>Message history and other patient information would be displayed here.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetailsPage;
