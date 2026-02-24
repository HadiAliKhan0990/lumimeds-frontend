import FaceAgent from '@/assets/ads/easy-weight-loss/face-agent.png';
import Sprout from '@/assets/ads/easy-weight-loss/sprout.png';
import Timer from '@/assets/ads/easy-weight-loss/timer-check-outline.png';
import Image from 'next/image';
import { GLP1_GIP_PRODUCT_NAME, GLP1_GIP_LABEL } from '@/constants/factory';

interface Props {
  font?: string;
}

export default function Specialities({ font }: Readonly<Props>) {
  return (
    <section className='tw-py-12'>
      <div className='container'>
        <div className='tw-text-center tw-mb-8'>
          <span className='tw-inline-block tw-text-[12px] tw-px-4 tw-py-2 tw-rounded-full tw-border tw-border-[#774116] tw-text-[#774116] tw-bg-[#F7EFE9]'>
            Why it&#39;s Worth it
          </span>
          <h2 className='tw-text-[28px] md:tw-text-[32px] lg:tw-text-[36px] tw-font-medium tw-text-[#2D2D2D] tw-mt-4'>
            What makes us the best
          </h2>
        </div>

        <div className='row g-4 row-cols-1 row-cols-lg-3'>
          {/* Card 1 */}
          <div className='col'>
            <div className='tw-bg-white tw-rounded-2xl tw-shadow-md tw-border tw-border-[#EFE7E0] tw-p-6 tw-h-full'>
              <div className='tw-w-8 tw-h-8 tw-rounded-full tw-bg-[#FFFFFF] tw-flex tw-items-center tw-justify-center tw-text-[#774116] tw-mb-4'>
                <Image width={42} height={43} src={FaceAgent} alt='Face Agent' />
              </div>
              <h3
                className={`tw-text-[#2D2D2D] tw-text-lg tw-font-semibold tw-mb-2 ${font || 'font-playfair'}`}
              >
                Personalized Care, Just for You
              </h3>
              <p className='tw-text-[#6B6B6B] tw-text-sm tw-leading-6'>
                Every body&apos;s different. Our {GLP1_GIP_PRODUCT_NAME} {GLP1_GIP_LABEL} treatments are tailored to
                your unique needs, ensuring you get a plan that works for your lifestyle and goals.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className='col'>
            <div className='tw-bg-white tw-rounded-2xl tw-shadow-md tw-border tw-border-[#EFE7E0] tw-p-6 tw-h-full'>
              <div className='tw-w-8 tw-h-8 tw-rounded-full tw-bg-[#FFFFFF] tw-flex tw-items-center tw-justify-center tw-text-[#774116] tw-mb-4'>
                <Image src={Sprout} width={43} height={43} alt='Sprout' />
              </div>
              <h3
                className={`tw-text-[#2D2D2D] tw-text-lg tw-font-semibold tw-mb-2 ${font || 'font-playfair'}`}
              >
                Safe, Proven, and Trusted
              </h3>
              <p className='tw-text-[#6B6B6B] tw-text-sm tw-leading-6'>
                All treatments are sourced from licensed pharmacies, giving you peace of mind with medications that meet
                the highest standards of safety and quality.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className='col'>
            <div className='tw-bg-white tw-rounded-2xl tw-shadow-md tw-border tw-border-[#EFE7E0] tw-p-6 tw-h-full'>
              <div className='tw-w-8 tw-h-8 tw-rounded-full tw-bg-[#FFFFFF] tw-flex tw-items-center tw-justify-center tw-text-[#774116] tw-mb-4'>
                <Image src={Timer} width={43} height={43} alt='Timer' />
              </div>
              <h3
                className={`tw-text-[#2D2D2D] tw-text-lg tw-font-semibold tw-mb-2 ${font || 'font-playfair'}`}
              >
                Results That Truly Last
              </h3>
              <p className='tw-text-[#6B6B6B] tw-text-sm tw-leading-6'>
                This isn’t a quick fix—it’s a sustainable path to better health. With the right support, you’ll see real
                progress and lasting change in your weight and wellness.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
