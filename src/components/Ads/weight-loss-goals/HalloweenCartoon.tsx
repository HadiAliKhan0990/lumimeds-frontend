'use client';

import Image from 'next/image';
import Cartoon1 from '@/assets/weight-loss-goals/Cartoon1.png';
import Cartoon2 from '@/assets/weight-loss-goals/Cartoon2.png';
import { Spinner } from 'react-bootstrap';
import './styles.css';

interface HalloweenCartoonProps {
  onGetStarted: () => void;
  isPending: boolean;
  isLoading: boolean;
}

export default function HalloweenCartoon({ onGetStarted, isPending, isLoading }: HalloweenCartoonProps) {
  return (
    <section className="content-section">
      <div className="container">
        {/* First Speech Bubble - Ghost */}
        <div className="d-flex align-items-center">
          <Image
            src={Cartoon1}
            alt="Ghost Character"
            width={224}
            height={224}
            className="character-image ghost-character"
          />
          <div className="speech-bubble speech-bubble-orange flex-grow-1">
            <p className="speech-bubble-text">
              We don&apos;t believe in one-size-fits-all solutions. Your journey starts with a virtual consultation where
              a licensed provider reviews your medical history, lifestyle, and goals. Then we craft a plan that&apos;s
              built for you.
            </p>
          </div>
        </div>

        {/* Second Speech Bubble - Pumpkin */}
        <div className="d-flex align-items-center  justify-content-end">
          <div className="speech-bubble speech-bubble-yellow flex-grow-1">
            <p className="speech-bubble-text">
              Using clinically guided compounded medications, we aim to support reductions in cravings, longer
              feelings of fullness, and steady, sustainable weight loss. You&apos;ll have ongoing medical support,
              convenient delivery of your medication, and a team that&apos;s with you every step of the way.
            </p>
          </div>
          <Image
            src={Cartoon2}
            alt="Pumpkin Character"
            width={224}
            height={224}
            className="character-image pumpkin-character"
          />
        </div>

        {/* CTA Button */}
        <div className="text-center mt-5">
          <button
            onClick={onGetStarted}
            disabled={isPending || isLoading}
            className="cta-button"
            data-tracking-id="get-started-halloween-button"
          >
            {(isPending || isLoading) && <Spinner className="me-2" size="sm" />}
            Skip the Tricks. Start the Treat.
          </button>
        </div>
      </div>
    </section>
  );
}
