import { Table } from 'react-bootstrap';

export const PharmacySkeletonLoading = () => {
  return (
    <>
      {/* React Select Skeleton */}
      <div className='mb-4'>
        <div className='placeholder-glow'>
          <span className='placeholder col-4 py-3' />
        </div>
      </div>

      {/* FilterGroup Placeholder */}
      <div className='row align-items-center my-4'>
        <div className='col-lg-4 col-xl-6 mb-2'>
          <div className='placeholder-glow'>
            <span className='placeholder col-6 py-3' />
          </div>
        </div>
        <div className='col-lg-8 col-xl-6 text-end d-flex gap-2 justify-content-end'>
          <div className='placeholder-glow col-4'>
            <span className='placeholder col-12 py-3' />
          </div>
          <div className='placeholder-glow col-4'>
            <span className='placeholder col-12 py-3' />
          </div>
        </div>
      </div>
      {/* Table Placeholder */}
      <Table className='table table-centered table-borderless text-center c_datatable'>
        <thead>
          <tr>
            {Array.from({ length: 7 }, (_, idx) => (
              <th key={`skeleton-th-${idx}`}>
                <div className='placeholder-glow w-100'>
                  <span className='col-12 placeholder py-12 h-100' />
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={7} className='py-5 text-center'>
              <div className='py-5'>Loading...</div>
            </td>
          </tr>
        </tbody>
      </Table>
    </>
  );
};
