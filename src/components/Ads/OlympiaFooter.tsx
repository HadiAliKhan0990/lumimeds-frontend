export default function OlympiaFooter() {
  return (
    <section className='container footer-503b olympia-footer'>
      <p className='display-4 display-lg-3 text-center fst-italic olympia-footer-title'>
        Confidently Reach Your Weight Goals with Lumimeds
      </p>
      <p className='h2 h1-lg text-center fst-italic olympia-footer-subtitle'>
        Simple pricing. Expert care. Always online.
      </p>
      <div className='d-flex flex-column flex-lg-row justify-content-around olympia-footer-content'>
        <div className='d-flex flex-column olympia-footer-item'>
          <p className='mb-0 olympia-dollar-sign'>$</p>
          <p className='h4 mb-2 fw-bold olympia-footer-item-title'>
            Straightforward <br />
            Pricing-No Surprises
          </p>
          <p className='olympia-footer-item-description'>
            No hidden fees. Your monthly payment covers everything: provider consultations, medications (if prescribed),
            medical supplies, and delivery.
          </p>
        </div>
        <div className='d-flex flex-column olympia-footer-item'>
          <div className='mb-5 mb-lg-3 olympia-footer-icon'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='olympia-star-icon'
              width={54}
              height={51}
              viewBox='0 0 54 51'
              fill='none'
            >
              <path
                d='M27 0L33.2864 19.3475H53.6296L37.1716 31.305L43.458 50.6525L27 38.695L10.542 50.6525L16.8284 31.305L0.370417 19.3475H20.7136L27 0Z'
                fill='#F1EDE2'
              />
            </svg>
          </div>
          <p className='h4 mb-2 fw-bold olympia-footer-item-title'>
            Always-On Support, <br />
            100% Online
          </p>
          <p className='olympia-footer-item-description'>
            {`Your journey doesn't end at checkout. Enjoy regular check-ins, personalized adjustments, and provider access—all from the comfort of home.`}
          </p>
        </div>
        <div className='d-flex flex-column olympia-footer-item'>
          <div className='mb-5 mb-lg-3 olympia-footer-icon'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='olympia-check-icon'
              width={46}
              height={46}
              viewBox='0 0 46 46'
              fill='none'
            >
              <rect x={29} width={46} height={12} transform='rotate(90 29 0)' fill='#F1EDE2' />
              <rect x={46} y={29} width={46} height={12} transform='rotate(-180 46 29)' fill='#F1EDE2' />
            </svg>
          </div>
          <p className='h4 mb-2 fw-bold olympia-footer-item-title'>
            Expert-Led <br /> Medical Care
          </p>
          <p className='olympia-footer-item-description'>
            Every plan is built by licensed professionals experienced in medical weight management. Get 1:1 support,
            tailored to your unique goals.
          </p>
        </div>
      </div>
    </section>
  );
}
