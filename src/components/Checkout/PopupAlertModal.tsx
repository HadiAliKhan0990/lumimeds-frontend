'use client';

import { Modal } from 'react-bootstrap';
import { IoMdClose } from 'react-icons/io';
import Image, { StaticImageData } from 'next/image';
import AlertIcon from '@/assets/Alert_Icon.png';

interface FooterButton {
  label: string;
  onClick: () => void;
}

interface ModalContent {
  icon?: StaticImageData;
  title: string;
  alertBox: {
    backgroundColor: string;
    title: string;
    description: string;
  };
  footerContent: {
    items?: string[];
    buttons?: FooterButton[];
  };
}

interface PopupAlertModalProps {
  show: boolean;
  onHide: () => void;
  content: ModalContent;
}

export const PopupAlertModal = ({ show, onHide, content }: PopupAlertModalProps) => {
  return (
    <Modal show={show} onHide={onHide} centered className='tw-d-flex tw-align-items-center tw-justify-content-center'>
      <div className='tw-border-0 tw-max-w-lg tw-w-full tw-mr-4'>
        {/* Close Button */}
        <div className='tw-absolute tw-top-3 tw-right-3 tw-z-10'>
          <IoMdClose className='tw-cursor-pointer tw-text-gray-500 hover:tw-text-gray-700' size={24} onClick={onHide} />
        </div>

        {/* Header Section */}
        <div className='tw-flex tw-items-center tw-justify-center tw-gap-3 tw-p-6 tw-pb-4'>
          <div className='tw-flex-shrink-0'>
            <Image src={content.icon || AlertIcon} alt='Alert' width={32} height={32} className='tw-w-8 tw-h-8' />
          </div>
          <h2 className='tw-text-xl md:tw-text-2xl tw-font-bold tw-text-black tw-m-0'>{content.title}</h2>
        </div>

        {/* Main Content Area - Alert Box */}
        <div
          className='tw-mx-6 tw-mb-6 tw-p-4 tw-rounded-xl'
          style={{ backgroundColor: content.alertBox.backgroundColor }}
        >
          <div className='tw-text-white'>
            <h3 className='tw-font-bold tw-text-base md:tw-text-lg tw-mb-2'>{content.alertBox.title}</h3>
            <p
              className='tw-mb-0 tw-text-base md:tw-text-lg'
              dangerouslySetInnerHTML={{ __html: content.alertBox.description }}
            />
          </div>
        </div>

        {/* Footer Section */}
        <div className='tw-px-6 tw-pb-6'>
          {content.footerContent.buttons ? (
            <div className='tw-flex tw-gap-3'>
              {content.footerContent.buttons.map((button, index) => (
                <button
                  key={index}
                  onClick={button.onClick}
                  className={`tw-flex-1 tw-border-2 tw-border-solid tw-border-primary tw-py-2 tw-px-4 tw-rounded-full tw-font-semibold tw-transition-all tw-duration-200 tw-bg-white tw-text-primary hover:tw-bg-primary hover:tw-text-white`}
                >
                  {button.label}
                </button>
              ))}
            </div>
          ) : (
            <div className='tw-space-y-2'>
              {content.footerContent.items?.map((item, index) => (
                <p
                  key={index}
                  className={`tw-text-sm tw-text-black ${
                    index === content.footerContent.items!.length - 1 ? 'tw-mb-0' : 'tw-mb-1'
                  }`}
                >
                  {item}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
