'use client';

import Image from 'next/image';
import HeroBottles from '@/assets/weight-loss-goals/HeroBottles.png';
import { handleVerifyRedirectToCheckout } from '@/helpers/products';
import { AppDispatch, RootState } from '@/store';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import HalloweenCartoon from './HalloweenCartoon';
import './styles.css';

export default function HeroSection() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);

  const selectedProduct = useSelector((state: RootState) => state.productType);
  const checkout = useSelector((state: RootState) => state.checkout);

  const { isSurveyCompleted, checkoutUser } = checkout || {};

  const handleGetStarted = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await handleVerifyRedirectToCheckout({
        selectedProduct,
        product: selectedProduct,
        dispatch,
        startTransition,
        router,
        isSurveyCompleted,
        checkoutUser,
      });
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="w-100">
      {/* Hero Section with Background */}
      <section className="hero-section d-flex flex-column justify-content-between align-items-center">
        {/* Overlay for better text readability */}
        <div className="hero-overlay w-100 h-100"></div>
        
        {/* Hero Content */}
        <div className="hero-content container text-center d-flex flex-column justify-content-center">
          <h1 className="hero-title">
            Don&apos;t Ghost Your Goals
          </h1>
          <p className="hero-subtitle">
            This Halloween season, take a step forward and partner with LumiMeds for your personalized
            weight-management journey.
          </p>
        </div>

        {/* Bottle Image - Overflowing Container */}
        <div className="bottle-overflow-container">
          <Image 
            src={HeroBottles} 
            alt="LumiMeds Weight Loss Bottles" 
            width={300}
            height={200}
            className="bottle-image-overflow" 
            priority 
          />
        </div>
      </section>

      {/* Halloween Cartoon Section */}
      <HalloweenCartoon 
        onGetStarted={handleGetStarted}
        isPending={isPending}
        isLoading={isLoading}
      />
    </div>
  );
}
