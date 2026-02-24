import React from 'react';
// import Select from "../Select";
import { useDispatch } from 'react-redux';
// import { RootState } from "@/store";
// import { useForm } from "react-hook-form";
import // medicationBodySchema,
// MedicationBodySchema,
'@/lib/schema/medication';
// import { yupResolver } from "@hookform/resolvers/yup";
import { setModal } from '@/store/slices/modalSlice';
// import { useAddMedicationMutation } from "@/store/slices/medicationsApiSlice";
import Image from 'next/image';
import AvatarSample from '@/assets/female avatar.jpg';
import PasswordInput from '../../PasswordInput';

export const RegisterNewProvider = () => {
  // const productTypes = useSelector((state: RootState) => state.productTypes);
  // const pharmacies = useSelector((state: RootState) => state.pharmacies);
  // const [addMedicationMutation] = useAddMedicationMutation();
  const dispatch = useDispatch();

  // const {
  // 	register,
  // 	handleSubmit,
  // 	reset,
  // 	formState: { errors },
  // } = useForm<MedicationBodySchema>({
  // 	defaultValues: {
  // 		description: "",
  // 		monthlyDosage: 0,
  // 		weeklyDosage: 0,
  // 		pharmacyId: "",
  // 		productTypeId: "",
  // 	},
  // 	mode: "onSubmit",
  // 	resolver: yupResolver(medicationBodySchema),
  // });

  const handleReset = () => {
    // reset();
    dispatch(setModal({ modalType: undefined }));
  };

  // const handleAddNewMedication = (data: MedicationBodySchema) => {
  // 	const { weeklyDosage, monthlyDosage, ...rest } = data;
  // 	addMedicationMutation({
  // 		weeklyDosage: `${weeklyDosage}mg`,
  // 		monthlyDosage: `${monthlyDosage}mg`,
  // 		...rest,
  // 	});
  // 	handleReset();
  // };

  return (
    <>
      <p className='m-0' style={{ fontSize: '16px', fontWeight: '700' }}>
        Register New Provider
      </p>
      <form
        // onSubmit={handleSubmit(handleAddNewMedication)}
        method='POST'
        style={{ display: 'flex', flexDirection: 'column', rowGap: '24px' }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            rowGap: '12px',
            alignItems: 'center',
          }}
        >
          {/* <label htmlFor="productTypeId">Type</label> */}
          <Image
            src={AvatarSample}
            alt='avatar-image'
            width={96}
            height={96}
            style={{ borderRadius: '50%', objectFit: 'cover' }}
          />
          <button className='btn-outline' style={{ width: 'fit-content' }}>
            Upload Photo
          </button>
          {/* {!!errors.productTypeId && (
						<span style={{ color: "red", fontSize: "12px" }}>
							{errors.productTypeId.message}
						</span>
					)} */}
        </div>
        <div style={{ display: 'flex', width: '100%', columnGap: '12px' }}>
          <div style={{ flexGrow: 1 }}>
            <label htmlFor='firstName'>First Name</label>
            <input type='text' style={{ borderRadius: '6px' }} />
          </div>
          <div style={{ flexGrow: 1 }}>
            <label htmlFor='lastName'>Last Name</label>
            <input type='text' style={{ borderRadius: '6px' }} />
          </div>
        </div>
        <div>
          <label htmlFor='email'>Email</label>
          <input type='email' style={{ borderRadius: '6px' }} />
        </div>
        <div>
          <label htmlFor='phoneNo'>Phone No.</label>
          <input type='tel' style={{ borderRadius: '6px' }} />
        </div>
        <div>
          <label htmlFor='password'>Password</label>
          <PasswordInput style={{ borderRadius: '6px' }} />
        </div>
        <div>
          <label htmlFor='confirm_password'>Confirm Password</label>
          <PasswordInput style={{ borderRadius: '6px' }} />
        </div>
        <div style={{ display: 'flex', columnGap: '12px' }}>
          <button onClick={handleReset} className='btn-outline' style={{ flexGrow: 1 }}>
            Discard
          </button>
          <button type='submit' className='btn-primary' style={{ flexGrow: 1 }}>
            Add
          </button>
        </div>
      </form>
    </>
  );
};
