'use client';

import { Offcanvas } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { formatUSPhoneWithoutPlusOne } from '@/lib/helper';
import { formatUSDate } from '@/helpers/dateFormatter';

interface AgentSidebarProps {
  show: boolean;
  onHide: () => void;
}

export const AgentSidebar: React.FC<AgentSidebarProps> = ({ show, onHide }) => {
  const { agent } = useSelector((state: RootState) => state.agent);

  return (
    <Offcanvas show={show} onHide={onHide} placement='end' className='agent-sidebar'>
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Agent Details</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        {agent ? (
          <div className='d-flex flex-column bg-white rounded-2 h-100'>
            {/* Content area */}
            <div className='flex-grow-1 overflow-auto mb-2'>
              <div className='d-flex flex-column align-items-center'>
                <div
                  className='d-flex align-items-center justify-content-center rounded-circle text-white fw-bold bg-secondary text-medium'
                  style={{
                    width: '96px',
                    height: '96px',
                  }}
                >
                  {agent?.name?.charAt(0)?.toUpperCase()}
                </div>
              </div>
              <div className='d-flex flex-column gap-3'>
                <div className='d-flex align-items-center justify-content-between'>
                  <p className='text-sm fw-medium mb-0'>Name:</p>
                  <span className='text-sm'>{agent?.name ?? 'N/A'}</span>
                </div>
                <div className='d-flex align-items-center justify-content-between'>
                  <p className='text-sm fw-medium mb-0'>Email:</p>
                  <span className='text-sm'>{agent?.email ?? 'N/A'}</span>
                </div>
                <div className='d-flex align-items-center justify-content-between'>
                  <p className='text-sm fw-medium mb-0'>Phone No.:</p>
                  <span className='text-sm'>{formatUSPhoneWithoutPlusOne(agent?.info?.phone || '') || 'N/A'}</span>
                </div>
                <div className='d-flex align-items-center justify-content-between'>
                  <p className='text-sm fw-medium mb-0'>Status:</p>
                  <span className={`status-badge ${agent?.isActive ? 'active' : 'rejected'}`}>
                    {agent?.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {agent?.info?.specialty && (
                  <div className='d-flex align-items-center justify-content-between'>
                    <p className='text-sm fw-medium mb-0'>Specialty:</p>
                    <span className='text-sm'>{agent?.info?.specialty ?? 'N/A'}</span>
                  </div>
                )}
                {agent?.info?.department && (
                  <div className='d-flex align-items-center justify-content-between'>
                    <p className='text-sm fw-medium mb-0'>Department:</p>
                    <span className='text-sm'>{agent?.info?.department ?? 'N/A'}</span>
                  </div>
                )}
                {agent?.createdAt && (
                  <div className='d-flex align-items-center justify-content-between'>
                    <p className='text-sm fw-medium mb-0'>Member Since:</p>
                    <span className='text-sm'>{formatUSDate(agent.createdAt)}</span>
                  </div>
                )}
                {agent?.info?.languages && agent.info.languages.length > 0 && (
                  <div className='d-flex align-items-center justify-content-between'>
                    <p className='text-sm fw-medium mb-0'>Languages:</p>
                    <span className='text-sm'>{agent?.info?.languages.join(', ') ?? 'N/A'}</span>
                  </div>
                )}
                {agent?.info?.certifications && agent.info.certifications.length > 0 && (
                  <div className='d-flex align-items-center justify-content-between'>
                    <p className='text-sm fw-medium mb-0'>Certifications:</p>
                    <span className='text-sm'>{agent?.info?.certifications.join(', ') ?? 'N/A'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className='text-center text-muted'>No agent selected</div>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  );
};
