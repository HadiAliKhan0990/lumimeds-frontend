import PaymentAdvertisementImage from '@/assets/ads/easy-weight-loss/payment-advertisement.png';
import Icon from '@/assets/ads/easy-weight-loss/icon.png';
import Image, { StaticImageData } from 'next/image';

interface Props {
  containerClassName?: string;
  font?: string;
  iconImage?: StaticImageData;
}

export default function PaymentAdvertisement({ containerClassName, font, iconImage }: Readonly<Props>) {
  return (
    <section className='tw-py-12'>
      <div className='container'>
        <div
          className={`tw-bg-gradient-to-b tw-from-[#FFFEFE] tw-to-[#FFF2E4] tw-rounded-2xl tw-p-6 md:tw-p-10 tw-flex tw-flex-col lg:tw-flex-row tw-items-center tw-gap-12 ${
            containerClassName || ''
          }`}
        >
          <div className='tw-flex-1'>
            <div className='tw-flex tw-items-center tw-mb-3'>
              <Image
                src={iconImage || Icon}
                width={251}
                height={46}
                alt='AdvertisementSectionIcon'
                className='tw-h-8 md:tw-h-8 tw-w-auto tw-mb-4'
              />
              {/* <span className="tw-inline-block tw-text-[12px] tw-px-1 tw-py-2 tw-rounded-full tw-border tw-border-[#774116] tw-text-[#774116] tw-bg-[#F7EFE9]">FSA/HSA eligible</span> */}
            </div>
            <h3 className={`tw-text-[#2D2D2D] tw-text-2xl md:tw-text-7xl tw-font-bold tw-mb-2 ${font || ''}`}>
              Flexible payments that fit your life
            </h3>
            <p className='tw-text-[#6B6B6B] tw-leading-7'>
              Use Klarna, Affirm, or Afterpay at checkout. <br /> Split your plan into smaller payments — no extra fees.
            </p>
          </div>

          {/* Image placeholder box */}
          <div className='tw-w-full md:tw-w-[440px] lg:tw-w-[420px] xl:tw-w-[520px] tw-h-[200px] md:tw-h-[260px] xl:tw-h-[320px] tw-rounded-xl tw-bg-transparent tw-border tw-border-[#EFE7E0] tw-flex tw-items-center tw-justify-center tw-shrink-0'>
            {/* Replace src when asset is ready */}
            <Image src={PaymentAdvertisementImage} width={537} height={361} alt='Payment Advertisement' />
          </div>
        </div>
      </div>
    </section>
  );
}
