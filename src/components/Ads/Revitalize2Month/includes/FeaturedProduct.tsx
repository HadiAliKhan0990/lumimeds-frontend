"use client";

import type { ProductType } from '@/store/slices/productTypeSlice';
import PlanCard from './PlanCard';

interface Props {
  product?: ProductType | null;
}

export default function FeaturedProduct({ product }: Readonly<Props>) {
  if (!product) return null;
  return (
    <section className="container py-5 rev1-featured">
      <div className="row g-4 align-items-center">
        <div className="col-12 col-lg-7">
          <div className="d-flex align-items-center gap-2 mb-3">
            <span className="rev1-dot-glow" />
            <span className="fw-semibold text-secondary">Featured Product</span>
          </div>
          <h2 className="rev1-featured-title fw-normal">
            Discover the <span className="rev1-featured-title-span">transformative power</span> of weight loss, whether you&apos;re just starting your journey or already making progress toward your goals.
          </h2>
          <p className="rev1-disclaimer small text-secondary mt-3">
            Prescription medication is available only after an online evaluation with a healthcare provider. Physicians can prescribe compounded medications to meet patient needs or address drug shortages. The FDA does not review or approve compounded medications for safety or effectiveness. Results may vary.
          </p>
        </div>
        <div className="col-12 col-lg-5">
          <PlanCard product={product} />
        </div>
      </div>
    </section>
  );
}


