'use client';

import { patientSchema, PatientSchema } from '@/lib/schema/patient';
import { useFormik } from 'formik';
import React from 'react';

export default function AdminAddPatientPage() {
  const formik = useFormik<PatientSchema>({
    initialValues: {
      firstName: '',
      middleInitial: '',
      lastName: '',
      email: '',
      phone: '',
      address: {
        city: '',
        street: '',
        unitAdd: '',
        zip: '',
      },
    },
    validationSchema: patientSchema,
    onSubmit: () => {
      // ignore
    },
  });

  const handleReset = () => {
    formik.resetForm();
  };

  return (
    <form onSubmit={formik.handleSubmit} className='bg-white rounded-12 p-4'>
      <div className='d-flex align-items-center justify-content-between'>
        <h1 className='m-0 fw-medium fs-4'>Add New Patient</h1>
        <div className='d-flex gap-3 py-4'>
          <button type='button' className='btn btn-outline-primary' onClick={handleReset}>
            Discard
          </button>
          <button type='submit' className='btn btn-primary'>
            Add Patient
          </button>
        </div>
      </div>

      {/* Patient Information */}
      <div className='mb-4'>
        <b className='mb-2 d-block'>Patient Information</b>
        <div className='row g-3'>
          <div className='col-md-4'>
            <label htmlFor='firstName' className='form-label'>
              First Name
            </label>
            <input
              type='text'
              id='firstName'
              name='firstName'
              className={`form-control ${formik.touched.firstName && formik.errors.firstName ? 'is-invalid' : ''}`}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.firstName}
            />
            {formik.touched.firstName && formik.errors.firstName && (
              <div className='invalid-feedback'>{formik.errors.firstName}</div>
            )}
          </div>
          <div className='col-md-4'>
            <label htmlFor='middleInitial' className='form-label'>
              Middle Initial
            </label>
            <input
              type='text'
              id='middleInitial'
              name='middleInitial'
              className={`form-control ${
                formik.touched.middleInitial && formik.errors.middleInitial ? 'is-invalid' : ''
              }`}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.middleInitial}
            />
            {formik.touched.middleInitial && formik.errors.middleInitial && (
              <div className='invalid-feedback'>{formik.errors.middleInitial}</div>
            )}
          </div>
          <div className='col-md-4'>
            <label htmlFor='lastName' className='form-label'>
              Last Name
            </label>
            <input
              type='text'
              id='lastName'
              name='lastName'
              className={`form-control ${formik.touched.lastName && formik.errors.lastName ? 'is-invalid' : ''}`}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.lastName}
            />
            {formik.touched.lastName && formik.errors.lastName && (
              <div className='invalid-feedback'>{formik.errors.lastName}</div>
            )}
          </div>
        </div>
      </div>

      {/* Address */}
      <div className='mb-4'>
        <b className='mb-2 d-block'>Address</b>
        <div className='row g-3'>
          <div className='col-md-6'>
            <label htmlFor='address.street' className='form-label'>
              Street Address
            </label>
            <input
              type='text'
              id='address.street'
              name='address.street'
              className={`form-control ${
                formik.touched.address?.street && formik.errors.address?.street ? 'is-invalid' : ''
              }`}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.address.street}
            />
            {formik.touched.address?.street && formik.errors.address?.street && (
              <div className='invalid-feedback'>{formik.errors.address.street}</div>
            )}
          </div>
          <div className='col-md-6'>
            <label htmlFor='address.unitAdd' className='form-label'>
              Apartment Number, Suite, etc.
            </label>
            <input
              type='text'
              id='address.unitAdd'
              name='address.unitAdd'
              className={`form-control ${
                formik.touched.address?.unitAdd && formik.errors.address?.unitAdd ? 'is-invalid' : ''
              }`}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.address.unitAdd}
            />
            {formik.touched.address?.unitAdd && formik.errors.address?.unitAdd && (
              <div className='invalid-feedback'>{formik.errors.address.unitAdd}</div>
            )}
          </div>
          <div className='col-md-3'>
            <label htmlFor='address.city' className='form-label'>
              City
            </label>
            <input
              type='text'
              id='address.city'
              name='address.city'
              className={`form-control ${
                formik.touched.address?.city && formik.errors.address?.city ? 'is-invalid' : ''
              }`}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.address.city}
            />
            {formik.touched.address?.city && formik.errors.address?.city && (
              <div className='invalid-feedback'>{formik.errors.address.city}</div>
            )}
          </div>
          <div className='col-md-3'>
            <label htmlFor='address.zip' className='form-label'>
              Zip Code
            </label>
            <input
              type='text'
              id='address.zip'
              name='address.zip'
              className={`form-control ${
                formik.touched.address?.zip && formik.errors.address?.zip ? 'is-invalid' : ''
              }`}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.address.zip}
            />
            {formik.touched.address?.zip && formik.errors.address?.zip && (
              <div className='invalid-feedback'>{formik.errors.address.zip}</div>
            )}
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className='mb-4'>
        <b className='mb-2 d-block'>Contact Information</b>
        <div className='row g-3'>
          <div className='col-md-6'>
            <label htmlFor='email' className='form-label'>
              Email
            </label>
            <input
              type='email'
              id='email'
              name='email'
              className={`form-control ${formik.touched.email && formik.errors.email ? 'is-invalid' : ''}`}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
            />
            {formik.touched.email && formik.errors.email && (
              <div className='invalid-feedback'>{formik.errors.email}</div>
            )}
          </div>
          <div className='col-md-6'>
            <label htmlFor='phone' className='form-label'>
              Phone No:
            </label>
            <input
              type='tel'
              id='phone'
              name='phone'
              className={`form-control ${formik.touched.phone && formik.errors.phone ? 'is-invalid' : ''}`}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.phone}
            />
            {formik.touched.phone && formik.errors.phone && (
              <div className='invalid-feedback'>{formik.errors.phone}</div>
            )}
          </div>
        </div>
      </div>

      {/* Medical History */}
      <div className='mb-4'>
        <b className='mb-2 d-block'>Medical History</b>
        <div className='row g-3 mb-3'>
          <div className='col-md-6'>
            <label htmlFor='allergies' className='form-label'>
              Allergies
            </label>
            <select name='allergies' className='form-select'>
              <option value='Lisinopril'>Lisinopril</option>
            </select>
          </div>
          <div className='col-md-6'>
            <label htmlFor='medications' className='form-label'>
              Medications
            </label>
            <select name='medications' className='form-select'>
              <option value='Vitamin C'>Vitamin C</option>
            </select>
          </div>
        </div>
        <div className='d-flex gap-3 align-items-center'>
          <label htmlFor='conditions1' className='form-label'>
            Conditions
          </label>
          <input type='text' className='form-control w-auto' name='conditions1' />
          <input type='text' className='form-control w-auto' name='conditions2' />
          <input type='text' className='form-control w-auto' name='conditions3' />
          <button type='button' className='btn btn-outline-primary'>
            + Add Condition
          </button>
        </div>
      </div>

      {/* Body Metrics */}
      <div className='mb-4'>
        <b className='mb-2 d-block'>Body Metrics</b>
        <div className='row g-3'>
          <div className='col-md-4'>
            <label htmlFor='height' className='form-label'>
              Height (inches)
            </label>
            <input type='number' className='form-control' step='0.01' inputMode='decimal' name='height' />
          </div>
          <div className='col-md-4'>
            <label htmlFor='weight' className='form-label'>
              Weight (lbs)
            </label>
            <input type='number' className='form-control' step='0.01' inputMode='decimal' name='weight' />
          </div>
          <div className='col-md-4 d-flex align-items-end'>
            <button type='button' className='btn btn-outline-primary'>
              Calculate BMI
            </button>
          </div>
        </div>
      </div>

      {/* Treatment */}
      <div className='mb-4'>
        <label htmlFor='treatment' className='form-label'>
          Treatment
        </label>
        <select className='form-select'>
          <option value='Assign Doctor'>Assign Doctor</option>
        </select>
      </div>

      {/* Forms */}
      <div className='mb-4 d-flex gap-3 align-items-center'>
        <label htmlFor='forms' className='fw-bold'>
          Forms
        </label>
        <input type='text' className='form-control w-25' name='forms' placeholder='Enter Form Code' />
        <button type='button' className='btn btn-outline-primary'>
          Generate Form Code +
        </button>
      </div>

      {/* Documents */}
      <div className='mb-4 d-flex gap-3 align-items-center'>
        <label htmlFor='documents' className='fw-bold'>
          Documents
        </label>
        <button type='button' className='btn btn-outline-primary'>
          Upload Documents +
        </button>
      </div>
    </form>
  );
}
