import MedSpa3Products from '../med-spa-3-pro-glp-1';
import { ProductTypesResponseData } from '@/store/slices/productTypesApiSlice';

interface MedSpa3HeroProps {
  readonly data: ProductTypesResponseData;
  readonly t: (key: string) => string;
}

export default function MedSpa3Hero({ data, t }: Readonly<MedSpa3HeroProps>) {
  return (
    <div className='tw-bg-cover tw-bg-center' style={{ backgroundImage: `url(/med-spa-eng-hero.jpg)` }}>
      <div className='tw-backdrop-blur-sm tw-bg-black/40'>
        <div className='container mx-auto tw-py-32 tw-space-y-32'>
          <div className='tw-flex tw-flex-col tw-justify-center tw-items-center tw-text-white'>
            <div className='text-center'>
              <h1 className='tw-text-3xl sm:tw-text-4xl md:tw-text-6xl lg:tw-text-8xl tw-font-extrabold'>
                {t('hero.title.medSpaPrices')} <br />
                {t('hero.title.gotYou')} <span className='tw-italic'>{t('hero.title.stressed')}</span>
              </h1>
            </div>
            <div className='text-center tw-w-full tw-max-w-[700px] tw-px-4'>
              <p className='tw-text-base sm:tw-text-xl md:tw-text-2xl lg:tw-text-3xl'>
                {t('hero.description.line1')} <br />
                {t('hero.description.line2')}
              </p>
            </div>
          </div>
          <div>
            <MedSpa3Products data={data} t={t} />
          </div>
        </div>
      </div>
    </div>
  );
}
