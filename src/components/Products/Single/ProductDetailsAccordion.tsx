'use client';

import Accordion from 'react-bootstrap/Accordion';
import '@/styles/faqs/styles.css';
import { ReactNode } from 'react';

export interface AccordionItem {
  header: ReactNode;
  body: ReactNode;
}

interface ProductDetailsAccordionProps {
  data: AccordionItem[];
}

export default function ProductDetailsAccordion({ data = [] }: Readonly<ProductDetailsAccordionProps>) {
  return (
    <div className='faqs-section pt-0' style={{ background: '#FFFDF6' }}>
      <Accordion className='accordionjs'>
        {data.map((item, index) => (
          <Accordion.Item eventKey={`${item.header}${index}`} className='medication-detail' key={index}>
            <Accordion.Header className='accordion_title'>{item.header}</Accordion.Header>
            <Accordion.Body>{item.body}</Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  );
}
