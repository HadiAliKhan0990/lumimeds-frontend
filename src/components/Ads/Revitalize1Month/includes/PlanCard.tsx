"use client";

import Image from 'next/image';
import Link from 'next/link';
import type { ProductType } from '@/store/slices/productTypeSlice';

interface Props {
  product?: ProductType | null;
}

export default function PlanCard({ product }: Readonly<Props>) {
  if (!product) return null;
  const isInStock = true;
  return (
    <div className="rev1-plan card shadow-sm border-0">
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <span className="badge badge-weight">Weight Loss</span>
          <span className="badge badge-status">{isInStock ? 'In stock' : 'Unavailable'}</span>
        </div>
        <h3 className="h3 mb-1">503-B</h3>
        <div className="text-secondary mb-4">GLP-1 Injection</div>

        <div className="text-center my-4">
          <Image
            src={product.image || '/vial_olympia.png'}
            alt={product.name || 'vial'}
            width={180}
            height={260}
            style={{ height: 'auto', width: 'auto', maxHeight: 260 }}
          />
        </div>

        <div className="d-flex flex-column flex-md-row gap-3 justify-content-between rev1-cta-row">
          <Link href="/products/summary" className="btn rev1-btn-dark w-100 d-flex justify-content-center align-items-center">Get Started</Link>
          <Link href="/products" className="btn rev1-btn-light w-100 d-flex justify-content-center align-items-center">Learn More</Link>
        </div>
      </div>
    </div>
  );
}
