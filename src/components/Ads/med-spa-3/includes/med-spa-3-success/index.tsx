interface MedSpa3SuccessProps {
  readonly backgroundColor: string;
  readonly color: string;
  readonly t?: (key: string) => string;
}

export default function MedSpa3Success({ backgroundColor, color, t }: Readonly<MedSpa3SuccessProps>) {
  return (
    <div className='tw-text-white tw-p-8 md:tw-p-16 lg:tw-p-32' style={{ background: backgroundColor }}>
      <div className='container tw-flex tw-flex-col md:tw-flex-row tw-justify-around md:tw-items-center tw-gap-6 md:tw-gap-4'>
        <div className='tw-text-center md:tw-text-left'>
          <h2 className='tw-text-4xl md:tw-text-5xl lg:tw-text-7xl tw-font-bold' style={{ color: color }}>
            92%
          </h2>
          <p className='tw-text-lg md:tw-text-2xl' style={{ color: color }}>
            {t ? t('success') : 'Success'}
          </p>
        </div>
        <div className='tw-text-center md:tw-text-left'>
          <h2 className='tw-text-4xl md:tw-text-5xl lg:tw-text-7xl tw-font-bold' style={{ color: color }}>
            10K+
          </h2>
          <p className='tw-text-lg md:tw-text-2xl' style={{ color: color }}>
            {t ? t('journeys') : 'Journeys'}
          </p>
        </div>
        <div className='tw-text-center md:tw-text-left'>
          <h2 className='tw-text-4xl md:tw-text-5xl lg:tw-text-7xl tw-font-bold' style={{ color: color }}>
            100%
          </h2>
          <p className='tw-text-lg md:tw-text-2xl' style={{ color: color }}>
            {t ? t('online') : 'Online'}
          </p>
        </div>
      </div>
    </div>
  );
}
