import { RootState } from '@/store';
import { setModal } from '@/store/slices/modalSlice';
import { useDeleteProductTypeMutation } from '@/store/slices/productTypesApiSlice';
import { CiCircleMinus } from 'react-icons/ci';
import { useDispatch, useSelector } from 'react-redux';

export function ManageTypes() {
  const dispatch = useDispatch();

  const productTypes = useSelector((state: RootState) => state.productTypes);

  const [deleteProductTypeMutation] = useDeleteProductTypeMutation();

  const handleRemove = (id: string) => {
    deleteProductTypeMutation(id);
  };

  const handleClose = () => {
    dispatch(setModal({ modalType: undefined }));
  };

  return (
    <>
      <p className='fw-bold'>Manage Types</p>
      <div
        style={{
          overflowY: 'auto',
          maxHeight: '300px',
          display: 'flex',
          flexDirection: 'column',
          rowGap: '8px',
          marginBottom: '64px',
          borderBottom: '1px solid #EAEAEA',
        }}
      >
        {productTypes.map((type) => (
          <div
            key={type.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px',
              border: '1px solid #D6E4FF',
              borderRadius: '6px',
            }}
          >
            <p className='m-0' style={{ color: '#7E7E7E', fontSize: '12px' }}>
              {type.name}
            </p>
            <button
              onClick={() => handleRemove(type.id ?? '')}
              style={{
                padding: 0,
                background: 'transparent',
                border: 0,
                color: 'red',
              }}
            >
              <CiCircleMinus />
            </button>
          </div>
        ))}
      </div>
      <button onClick={handleClose} className='btn btn-primary rounded-1 w-100'>
        Close
      </button>
    </>
  );
}
