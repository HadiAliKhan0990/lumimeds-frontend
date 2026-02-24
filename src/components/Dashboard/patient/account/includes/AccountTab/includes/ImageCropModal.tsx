'use client';

import { useState, useRef, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import Image from 'next/image';

interface Props {
  show: boolean;
  onHide: () => void;
  imageUrl: string;
  onCropComplete: (croppedImage: Blob) => void;
}

export default function ImageCropModal({ show, onHide, imageUrl, onCropComplete }: Readonly<Props>) {
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 30, // Start with a smaller initial crop size
    height: 30,
    x: 0,
    y: 0,
  });

  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Reset crop when image loads or changes
  useEffect(() => {
    if (imageLoaded && imgRef.current) {
      const { width, height } = imgRef.current;
      const size = Math.min(width, height) * 0.8; // 80% of the smaller dimension
      setCrop({
        unit: 'px',
        width: size,
        height: size,
        x: (width - size) / 2,
        y: (height - size) / 2,
      });
    }
  }, [imageLoaded, imageUrl]);

  const getCroppedImg = async (image: HTMLImageElement, crop: PixelCrop): Promise<Blob> => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Canvas is empty'));
            return;
          }
          resolve(blob);
        },
        'image/jpeg',
        1
      );
    });
  };

  const handleCropComplete = async () => {
    if (!completedCrop || !imgRef.current) return;

    try {
      const croppedImage = await getCroppedImg(imgRef.current, completedCrop);
      onCropComplete(croppedImage);
      onHide();
    } catch (e) {
      console.error('Error cropping image:', e);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size='lg'>
      <Modal.Header className='border-0' closeButton>
        <Modal.Title>Crop Profile Picture</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className='d-flex justify-content-center'>
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={1}
            keepSelection
            circularCrop
            minWidth={100}
            minHeight={100}
          >
            <Image
              ref={imgRef}
              src={imageUrl}
              alt='Crop me'
              width={400}
              height={400}
              style={{ maxHeight: '70vh', maxWidth: '100%', display: imageLoaded ? 'block' : 'none' }}
              onLoad={() => setImageLoaded(true)}
              unoptimized
            />
          </ReactCrop>
          {!imageLoaded && <div style={{ height: '400px', width: '400px' }}>Loading image...</div>}
        </div>
      </Modal.Body>
      <Modal.Footer className='border-0'>
        <Button variant='outline-primary' onClick={onHide}>
          Cancel
        </Button>
        <Button variant='primary' onClick={handleCropComplete} disabled={!completedCrop}>
          Apply
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
