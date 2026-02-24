import React from 'react';

export const HowBenefits = () => {
  return (
    <section className="container pb-0">
      <div className="row g-5 align-items-lg-center">
        <div className="col-lg-6">
          <h2 className="benefits_title mb-4 fw-normal font-instrument-serif">
            Benefits
          </h2>
          <div className="fw-medium text-xl max-w-468">
            Begin your journey to a healthier life, with personalized support
            and guidance. We are with you every step of the way.
          </div>
        </div>
        <div className="col-lg-6">
          <div className="d-flex flex-column gap-4">
            {BENEFITS.map((item, i) => (
              <div key={i} className={'max-w-477'}>
                <h5 className="text-4xl fw-medium">{item.title}</h5>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const BENEFITS = [
  {
    title: (
      <>
        Sustainable <span className="font-instrument-serif">Weight Loss</span>
      </>
    ),
    desc: 'Convenient once-weekly injections can lead to significant weight loss - up to 21% of your body weight¹',
  },
  {
    title: (
      <>
        Reduce <span className="font-instrument-serif">Appetite</span>
      </>
    ),
    desc: 'Slow gastric emptying leads you to experience a prolonged feeling of fullness, so that you can easily manage your appetite.',
  },
  {
    title: (
      <>
        Feel <span className="font-instrument-serif">attractive</span>
      </>
    ),
    desc: 'Weight loss improves energy levels, mood, and sleep quality, reduces the risk of heart disease, improvements in diabetes, and control blood sugar levels.',
  },
];
