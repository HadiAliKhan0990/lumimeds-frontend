import './styles.css';
import { SurveyGetStartedButton } from '@/components/SurveyGetStartedButton';

export default function CTA() {
  return (
    <section id='cta' className='container py-5 mb-5'>
      <div style={{ fontSize: '18px' }}>
        <p className='mb-4 pb-3'>
          <span
            style={{
              textDecoration: 'line-through',
              textDecorationColor: '#3060FE',
            }}
          >
            No insurance
          </span>{' '}
          required
        </p>
        <p className='text-center mb-4'>
          Get started with our program quickly and easily — <br className='d-md-none' />
          <span style={{ textDecoration: 'underline wavy black' }}>no insurance necessary</span>. Consult directly with
          our medical providers online.
        </p>
        <SurveyGetStartedButton className='btn-primary btn-lg rounded-pill px-4 tw-mx-auto'>
          See if You Qualify
        </SurveyGetStartedButton>
      </div>
    </section>
  );
}
