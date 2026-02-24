import { Card } from 'react-bootstrap';
import { Blur } from 'transitions-kit';
import { AsyncImage } from 'loadable-image';

interface Props {
 productImage?: string;
  productName?: string;
}

export const OrderCard: React.FC<Props> = ({ productImage = '', productName = '' }) => {
  return (
    <Card className='rounded-2'>
      <Card.Body>
        <Card.Title className='mb-3'>{productName}</Card.Title>
        <div className='p-2 bg-primary-subtle rounded-3 overflow-hidden'>
          <AsyncImage
            Transition={Blur}
            loader={
              <div className='placeholder-glow w-100 h-100'>
                <span className='placeholder h-100 col-12' />
              </div>
            }
            src={productImage}
            alt={productName}
            className='order_product_image mx-auto'
          />
        </div>
      </Card.Body>
    </Card>
  );
};
