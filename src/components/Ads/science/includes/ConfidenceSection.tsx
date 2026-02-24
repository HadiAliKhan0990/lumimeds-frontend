import Image from 'next/image';
import dollar from '@/assets/svg/dollar.svg';
import star from '@/assets/svg/star.svg';
import plus from '@/assets/svg/plus.svg';

export default function ConfidenceSection() {
  return (
    <div className="confidence container py-4 py-md-5">
      <div className="confidence-card rounded-4 p-4 p-md-5">
        <h2 className="confidence-title text-center mb-3 mb-md-4">
          Confidently Reach Your Weight Goals with Lumimeds
        </h2>
        <p className="confidence-subtitle text-center mb-4 mb-md-5">
          Simple pricing. Expert care. Always online.
        </p>

        <div className="row g-4 g-lg-5">
          <div className="col-12 col-lg-4 px-2">
            <div className="confidence-item">
              <div className="item-icon"><Image src={dollar} alt="" width={38} height={35} /></div>
              <div className="item-title">Straightforward Pricing-No Surprises</div>
              <p className="item-text m-0">
                No hidden fees. Your monthly payment covers everything: provider consultations,
                medications (if prescribed), medical supplies, and delivery.
              </p>
            </div>
          </div>

          <div className="col-12 col-lg-4 px-2">
            <div className="confidence-item">
              <div className="item-icon"><Image src={star} alt="" width={38} height={35} /></div>
              <div className="item-title">Always-On Support, 100% Online</div>
              <p className="item-text m-0">
                Your journey doesn&apos;t end at checkout. Enjoy regular check-ins, personalized
                adjustments, and provider access—all from the comfort of home.
              </p>
            </div>
          </div>

          <div className="col-12 col-lg-4 px-2">
            <div className="confidence-item">
              <div className="item-icon"><Image src={plus} alt="" width={38} height={35} /></div>
              <div className="item-title">Expert-Led Medical Care</div>
              <p className="item-text m-0">
                Every plan is built by licensed professionals experienced in medical weight
                management. Get 1:1 support, tailored to your unique goals.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


