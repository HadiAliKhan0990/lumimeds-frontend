import Image, { StaticImageData } from 'next/image';

interface Props {
  src: StaticImageData;
  content: React.ReactNode;
}

export default function HowItWorksCard({ src, content }: Props) {
  return (
    <div className='how-it-works-content text-white'>
      <div className='row g-4 gx-lg-5'>
        <div className='col-md-7'>
          <Image className='w-100 object-fit-cover' src={src} quality={100} alt='' />
        </div>
        <div className='col-md-5'>{content}</div>
      </div>
    </div>
  );
}
