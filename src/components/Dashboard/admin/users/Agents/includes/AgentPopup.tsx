'use client';

import { Modal } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { formatUSPhoneWithoutPlusOne } from '@/lib/helper';
import { formatUSDateShort } from '@/helpers/dateFormatter';

interface AgentPopupProps {
  show: boolean;
  onHide: () => void;
}

export const AgentPopup: React.FC<AgentPopupProps> = ({ show, onHide }) => {
  const agent = useSelector((state: RootState) => state.agent.agent);

  return (
    <Modal show={show} onHide={onHide} size='lg' centered>
      <Modal.Header closeButton>
        <Modal.Title>Agent Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {agent ? (
          <div className='d-flex flex-column gap-4'>
            {/* Agent Avatar and Basic Info */}
            <div className='d-flex align-items-center gap-3'>
              <div
                className='d-flex align-items-center justify-content-center rounded-circle text-white fw-bold bg-secondary text-medium'
                style={{
                  width: '80px',
                  height: '80px',
                }}
              >
                {agent?.name?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <h4 className='mb-1'>{agent?.name}</h4>
                <p className='text-muted mb-0'>{agent?.email}</p>
                <span className={`status-badge ${agent?.isActive ? 'active' : 'inactive'}`}>
                  {agent?.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            {/* Contact Information */}
            <div className='row'>
              <div className='col-md-6'>
                <h6 className='fw-semibold mb-3'>Contact Information</h6>
                <div className='d-flex flex-column gap-3'>
                  <div>
                    <span className='text-muted small'>Phone Number</span>
                    <div className='fw-medium'>{formatUSPhoneWithoutPlusOne(agent?.info?.phone ?? '')}</div>
                  </div>
                  <div>
                    <span className='text-muted small'>Email Address</span>
                    <div className='fw-medium'>{agent?.email}</div>
                  </div>
                </div>
              </div>

              <div className='col-md-6'>
                <h6 className='fw-semibold mb-3'>Account Information</h6>
                <div className='d-flex flex-column gap-3'>
                  <div>
                    <span className='text-muted small'>Status</span>
                    <div>
                      <span className={`status-badge ${agent?.isActive ? 'active' : 'inactive'}`}>
                        {agent?.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  {agent?.createdAt && (
                    <div>
                      <span className='text-muted small'>Member Since</span>
                      <div className='fw-medium'>{formatUSDateShort(agent.createdAt)}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className='d-flex gap-2 pt-3 border-top'>
              <button className='btn btn-primary'>Edit Agent</button>
              <button className='btn btn-outline-primary'>Send Message</button>
              <button className='btn btn-outline-danger'>Archive Agent</button>
            </div>
          </div>
        ) : (
          <div className='text-center text-muted'>No agent selected</div>
        )}
      </Modal.Body>
    </Modal>
  );
};
