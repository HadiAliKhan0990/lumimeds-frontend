import BenefitsImg1 from '@/assets/benefits-1-test.jpg';
import BenefitsImg2 from '@/assets/benefits-2-test.jpg';
import BenefitsImg3 from '@/assets/benefits-3-test.jpg';

export const BENEFITS = [
  {
    img: BenefitsImg1,
    title: (
      <p>
        {' '}
        <span
          style={{
            textDecoration: 'underline',
            textDecorationColor: '#3060FE',
            color: '#3060FE',
            textUnderlineOffset: '25%',
            marginRight: '8px',
            fontWeight: '500',
          }}
        >
          Sustainable
        </span>
        <span style={{ fontFamily: "'Instrument Serif', serif" }}>Weight Loss</span>
      </p>
    ),
    description:
      'Studies show that prescription weight loss medications like GLP-1s and GIPs, in conjunction with changes in diet and exercise, lead to significant weight loss.',
  },
  {
    img: BenefitsImg2,
    title: (
      <p>
        {' '}
        <span
          style={{
            textDecoration: 'underline',
            textDecorationStyle: 'dotted',
            textDecorationColor: '#3060FE',
            color: '#3060FE',
            textUnderlineOffset: '25%',
            marginRight: '8px',
            fontWeight: '500',
          }}
        >
          Reduced
        </span>
        <span style={{ fontFamily: "'Instrument Serif', serif" }}>Appetite</span>
      </p>
    ),
    description:
      'GLP-1 and GIP medications help slow gastric emptying, which may lead you to experience a longer feeling of fullness and help manage appetite.',
  },
  {
    img: BenefitsImg3,
    title: (
      <p>
        {' '}
        <span
          style={{
            textDecoration: 'underline',
            textDecorationStyle: 'wavy',
            color: '#3060FE',
            textUnderlineOffset: '25%',
            textDecorationColor: '#3060FE',
            marginRight: '8px',
            fontWeight: '500',
          }}
        >
          Long-Term
        </span>
        <span style={{ fontFamily: "'Instrument Serif', serif" }}>Health</span>
      </p>
    ),
    description:
      'In addition to improved energy levels, mood, and sleep quality, weight loss reduces the risk of heart disease and helps improve diabetes management.',
  },
];
