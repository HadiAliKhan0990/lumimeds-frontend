// PAGE TEMPORARILY DISABLED - NOT IN USE
// Redirects to home page

import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants';
import { Metadata } from 'next';

export const metadata: Metadata = {
  robots: 'noindex, nofollow',
};

export default function AffiliateRegisteration() {
  // Redirect to home page
  redirect(ROUTES.HOME);
}

// ORIGINAL CODE COMMENTED OUT BELOW - DO NOT DELETE
// 'use client';
// import React, { useState, useEffect } from 'react';
// import './styles.css';
// import { FaEye, FaEyeSlash } from 'react-icons/fa';

// const AffiliateRegisteration = () => {
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);

//   useEffect(() => {
//     // Set document title
//     document.title = 'Join Our Affiliate Program – Earn with Our Weight Loss Solutions | LumiMeds';

//     // Set meta description
//     const metaDescription = document.querySelector('meta[name="description"]');
//     if (metaDescription) {
//       metaDescription.setAttribute(
//         'content',
//         'Partner with LumiMeds and earn commissions by promoting our GLP-1 and GLP-1/GIP weight loss plans. Register now to start earning!'
//       );
//     } else {
//       const meta = document.createElement('meta');
//       meta.name = 'description';
//       meta.content =
//         'Partner with LumiMeds and earn commissions by promoting our GLP-1 and GLP-1/GIP weight loss plans. Register now to start earning!';
//       document.head.appendChild(meta);
//     }

//     // Set canonical URL
//     const canonical = document.querySelector('link[rel="canonical"]');
//     if (canonical) {
//       canonical.setAttribute('href', 'https://www.lumimeds.com/affiliate-registeration');
//     } else {
//       const link = document.createElement('link');
//       link.rel = 'canonical';
//       link.href = 'https://www.lumimeds.com/affiliate-registeration';
//       document.head.appendChild(link);
//     }

//     // Set OpenGraph meta tags
//     const ogTitle = document.querySelector('meta[property="og:title"]');
//     if (ogTitle) {
//       ogTitle.setAttribute('content', 'Join Our Affiliate Program – Earn with Our Weight Loss Solutions | LumiMeds');
//     } else {
//       const meta = document.createElement('meta');
//       meta.setAttribute('property', 'og:title');
//       meta.content = 'Join Our Affiliate Program – Earn with Our Weight Loss Solutions | LumiMeds';
//       document.head.appendChild(meta);
//     }

//     const ogDescription = document.querySelector('meta[property="og:description"]');
//     if (ogDescription) {
//       ogDescription.setAttribute(
//         'content',
//         'Partner with LumiMeds and earn commissions by promoting our GLP-1 and GLP-1/GIP weight loss plans. Register now to start earning!'
//       );
//     } else {
//       const meta = document.createElement('meta');
//       meta.setAttribute('property', 'og:description');
//       meta.content =
//         'Partner with LumiMeds and earn commissions by promoting our GLP-1 and GLP-1/GIP weight loss plans. Register now to start earning!';
//       document.head.appendChild(meta);
//     }

//     const ogType = document.querySelector('meta[property="og:type"]');
//     if (ogType) {
//       ogType.setAttribute('content', 'website');
//     } else {
//       const meta = document.createElement('meta');
//       meta.setAttribute('property', 'og:type');
//       meta.content = 'website';
//       document.head.appendChild(meta);
//     }

//     const ogUrl = document.querySelector('meta[property="og:url"]');
//     if (ogUrl) {
//       ogUrl.setAttribute('content', 'https://www.lumimeds.com/affiliate-registeration');
//     } else {
//       const meta = document.createElement('meta');
//       meta.setAttribute('property', 'og:url');
//       meta.content = 'https://www.lumimeds.com/affiliate-registeration';
//       document.head.appendChild(meta);
//     }
//   }, []);

//   return (
//     <div className='affiliate-page'>
//       <div className='container'>
//         <h1 className='text-center title mb-4'>Become a LumiMeds Affiliate Partner</h1>
//         <div className='card registration-card mx-auto'>
//           <div className='card-body'>
//             <h2 className='card-title subtitle'>Register New Affiliate Account:</h2>
//             <form autoComplete='off'>
//               <div className='row mb-3'>
//                 <div className='col-md-6'>
//                   <label htmlFor='firstName' className='form-label'>
//                     First Name:<span className='required'>*</span>
//                   </label>
//                   <input type='text' id='firstName' name='firstName' autoComplete='off' className='form-control' />
//                 </div>
//                 <div className='col-md-6'>
//                   <label htmlFor='lastName' className='form-label'>
//                     Last Name:<span className='required'>*</span>
//                   </label>
//                   <input type='text' id='lastName' name='lastName' autoComplete='off' className='form-control' />
//                 </div>
//               </div>

//               <div className='row mb-3'>
//                 <div className='col-md-6'>
//                   <label htmlFor='email' className='form-label'>
//                     Email Address:<span className='required'>*</span>
//                   </label>
//                   <input type='email' id='email' name='email' autoComplete='off' className='form-control' />
//                 </div>
//               </div>

//               <div className='row mb-3'>
//                 <div className='col-md-6 position-relative'>
//                   <label htmlFor='password' className='form-label'>
//                     Password:<span className='required'>*</span>
//                   </label>
//                   <input
//                     type={showPassword ? 'text' : 'password'}
//                     id='password'
//                     name='password'
//                     autoComplete='new-password'
//                     className='form-control'
//                   />
//                   <span
//                     className='password-toggle'
//                     onClick={() => setShowPassword(!showPassword)}
//                     style={{ position: 'absolute', top: '55%', right: '20px', cursor: 'pointer' }}
//                   >
//                     {showPassword ? <FaEyeSlash /> : <FaEye />}
//                   </span>
//                 </div>
//                 <div className='col-md-6 position-relative'>
//                   <label htmlFor='confirmPassword' className='form-label'>
//                     Confirm Password:<span className='required'>*</span>
//                   </label>
//                   <input
//                     type={showConfirmPassword ? 'text' : 'password'}
//                     id='confirmPassword'
//                     name='confirmPassword'
//                     autoComplete='new-password'
//                     className='form-control'
//                   />
//                   <span
//                     className='password-toggle'
//                     onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                     style={{
//                       position: 'absolute',
//                       top: '55%',
//                       right: '20px',
//                       cursor: 'pointer',
//                     }}
//                   >
//                     {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
//                   </span>
//                 </div>
//               </div>

//               <div className='row mb-4'>
//                 <div className='col-md-6'>
//                   <label htmlFor='coupon' className='form-label'>
//                     Preferred Coupon Code:<span className='required'>*</span>
//                   </label>
//                   <input type='text' id='coupon' name='coupon' autoComplete='off' className='form-control' />
//                 </div>
//               </div>

//               <button type='submit' className='btn btn-primary submit-btn'>
//                 SUBMIT APPLICATION
//               </button>
//             </form>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AffiliateRegisteration;
