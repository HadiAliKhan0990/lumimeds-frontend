import Select from '@/components/Dashboard/Select';
import React from 'react';
import { RiDeleteBin5Line } from 'react-icons/ri';

const VisitsPage = () => {
  return (
    <div
      style={{
        background: 'white',
        border: '1px solid #EAEAEA',
        padding: '0 24px',
        display: 'flex',
        height: '100%',
      }}
    >
      <div
        style={{
          width: '40%',
          paddingRight: '24px',
          paddingBottom: '24px',
          paddingTop: '24px',
          borderRight: '1px solid #EAEAEA',
          display: 'flex',
          flexDirection: 'column',
          rowGap: '12px',
        }}
      >
        <h4 className='m-0' style={{ fontWeight: '500', fontSize: '32px' }}>
          Visits
        </h4>
        <Select
          style={{
            border: '1px solid #D6E4FF',
            borderRadius: '6px',
            width: '100%',
          }}
        >
          <option value='Me'>Assigned to Me (3)</option>
          <option value='Me'>Assigned to Me (3)</option>
          <option value='Me'>Assigned to Me (3)</option>
        </Select>
        <div
          style={{
            flexGrow: 1,
            height: '500px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            rowGap: '12px',
          }}
        >
          <div
            style={{
              borderRadius: '12px',
              padding: '12px',
              background: 'black',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: 'white',
            }}
          >
            <div>
              <p className='m-0'>
                <b>Yanina Katsov, </b>
                NY
              </p>
              <span>Program Description placeholder...</span>
            </div>
            <div>
              <p className='m-0'>12:30 PM</p>
              <p className='m-0' style={{ color: 'yellow' }}>
                New
              </p>
            </div>
          </div>
          <div
            style={{
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid #EAEAEA',
            }}
          >
            <div>
              <p className='m-0'>
                <b>Yanina Katsov, </b>
                NY
              </p>
              <span style={{ color: '#838383' }}>Program Description placeholder...</span>
            </div>
            <div>
              <p className='m-0' style={{ color: '#838383' }}>
                12:30 PM
              </p>
              <p className='m-0' style={{ color: '#3060FE' }}>
                New
              </p>
            </div>
          </div>
        </div>
      </div>
      <div
        style={{
          width: '60%',
          paddingLeft: '24px',
          paddingRight: '24px',
          paddingBottom: '24px',
          paddingTop: '24px',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '32px',
          }}
        >
          <div>
            <p className='m-0' style={{ fontSize: '24px', fontWeight: 500 }}>
              Yanina Katsov
            </p>
            <span style={{ fontWeight: '500', color: '#7E7E7E', fontSize: '12px' }}>Semaglutide 2.5mg/ml</span>
          </div>
          <div style={{ display: 'flex', columnGap: '12px' }}>
            <button className='btn-outline'>Chat</button>
            <button className='btn-outline'>Actions</button>
          </div>
        </div>
        <div
          style={{
            height: '600px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            rowGap: '12px',
          }}
        >
          <div
            style={{
              padding: '12px',
              border: '1px solid #EAEAEA',
              borderRadius: '6px',
            }}
          >
            <p style={{ fontWeight: '500' }}>General</p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                rowGap: '12px',
              }}
            >
              <div style={{ fontSize: '12px' }}>
                <p className='m-0' style={{ color: '#7E7E7E' }}>
                  First Name
                </p>
                <p className='m-0'>Yanina</p>
              </div>
              <div style={{ fontSize: '12px' }}>
                <p className='m-0' style={{ color: '#7E7E7E' }}>
                  Diagnosis{' '}
                </p>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <p className='m-0' style={{ color: '#3060FE' }}>
                    [N5J78] Polycystic Ovary Syndrome (PCOS)
                  </p>
                  <RiDeleteBin5Line color={'red'} />
                </div>
              </div>
              <div style={{ fontSize: '12px' }}>
                <p className='m-0' style={{ color: '#7E7E7E' }}>
                  Last Name
                </p>
                <p className='m-0'>Katsov</p>
              </div>
              <div style={{ fontSize: '12px' }}>
                <p className='m-0' style={{ color: '#7E7E7E' }}>
                  State
                </p>
                <p className='m-0'>IL</p>
              </div>
              <div style={{ fontSize: '12px' }}>
                <p className='m-0' style={{ color: '#7E7E7E' }}>
                  Gender
                </p>
                <p className='m-0'>Female</p>
              </div>
              <div style={{ fontSize: '12px' }}>
                <p className='m-0' style={{ color: '#7E7E7E' }}>
                  Req. Treatment
                </p>
                <p className='m-0'>Sildenafil 40mg, Tadalafil 10mg...</p>
              </div>
              <div style={{ fontSize: '12px' }}>
                <p className='m-0' style={{ color: '#7E7E7E' }}>
                  Age
                </p>
                <p className='m-0'>24</p>
              </div>
              <div style={{ fontSize: '12px' }}>
                <p className='m-0' style={{ color: '#7E7E7E' }}>
                  Physician
                </p>
                <p className='m-0'>Johann Stark</p>
              </div>
            </div>
          </div>
        </div>
        <div
          style={{
            position: 'absolute',
            display: 'flex',
            columnGap: '12px',
            bottom: 0,
            width: '100%',
            padding: '12px',
            borderTop: '1px solid #EAEAEA',
            marginLeft: '-12px',
          }}
        >
          <button style={{ flexGrow: 1 }} className='btn-outline'>
            Reject
          </button>
          <button style={{ flexGrow: 1 }} className='btn-primary'>
            Approve
          </button>
        </div>
      </div>
    </div>
  );
};

export default VisitsPage;
