import { useState } from 'react';
import GLP1Medications from './GLP1Medications';
import GLP1GIPMedications from './GLP1GIPMedications';
import Medications503B from './Medications503B';
import { ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';
import { GLP1_PRODUCT_NAME, GLP1_LABEL, GLP1_GIP_PRODUCT_NAME, GLP1_GIP_LABEL } from '@/constants/factory';

interface Props {
  data: ProductTypesResponseData;
}

export default function FeaturedMedications({ data }: Readonly<Props>) {
  // Check which product categories have available products
  const hasGLP1Products = data.glp_1_plans?.products && data.glp_1_plans.products.length > 0;
  const hasGLP1GIPProducts = data.glp_1_gip_plans?.products && data.glp_1_gip_plans.products.length > 0;
  const has503BProducts = data.olympiaPlans?.products && data.olympiaPlans.products.length > 0;

  // Build tabs array based on available products
  const availableTabs: string[] = [];
  if (hasGLP1Products) availableTabs.push(`${GLP1_PRODUCT_NAME} ${GLP1_LABEL} Injections`);
  if (hasGLP1GIPProducts) availableTabs.push(`${GLP1_GIP_PRODUCT_NAME} ${GLP1_GIP_LABEL} Injections`);
  if (has503BProducts) availableTabs.push('503-B');

  // Set initial active tab to the first available tab
  const [activeTab, setActiveTab] = useState(availableTabs[0] || `${GLP1_PRODUCT_NAME} ${GLP1_LABEL} Injections`);

  return (
    <section className='featured-medications-section py-5'>
      <div className='container'>
        {/* Header */}
        <div className='text-center mb-5'>
          <h2 className='featured-title mb-3'>Featured Medications</h2>
          <p className='featured-subtitle mb-4'>Select a plan that fits your journey</p>

          {/* Tabs */}
          <div className='row mb-5'>
            {availableTabs.map((tab) => (
              <div className='col-md-6 col-12' key={tab}>
                <button
                  key={tab}
                  className={`tab-button ${activeTab === tab ? 'active' : ''}`}
                  style={{
                    fontWeight: activeTab === tab ? 700 : 'normal',
                    fontSize: 'clamp(0.75rem, 2.0vw, 1.5rem)',
                  }}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Content based on active tab */}
        <div className='medication-content'>
          {activeTab === `${GLP1_PRODUCT_NAME} ${GLP1_LABEL} Injections` && hasGLP1Products && (
            <GLP1Medications data={data.glp_1_plans?.products ?? []} />
          )}
          {activeTab === `${GLP1_GIP_PRODUCT_NAME} ${GLP1_GIP_LABEL} Injections` && hasGLP1GIPProducts && (
            <GLP1GIPMedications data={data.glp_1_gip_plans?.products ?? []} />
          )}
          {activeTab === '503-B' && has503BProducts && <Medications503B data={data.olympiaPlans?.products ?? []} />}
        </div>
      </div>
    </section>
  );
}
