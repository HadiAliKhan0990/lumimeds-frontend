// OrderStepper.tsx
import React from 'react';
import { CiPill } from 'react-icons/ci';
import { FaDollarSign, FaTruck } from 'react-icons/fa';
import { MdOutlineFileOpen, MdOutlineSupportAgent } from 'react-icons/md';

type StepData = {
  title: string;
  icon: React.ReactNode;
  // timestamp: string;
};

const steps: StepData[] = [
  { title: 'Order placed', icon: <FaDollarSign /> },
  { title: 'Intake Complete', icon: <MdOutlineFileOpen /> },
  { title: 'Provider Review', icon: <MdOutlineSupportAgent /> },
  { title: 'Sent to Pharmacy', icon: <CiPill /> },
  { title: 'Order Shipped', icon: <FaTruck /> },
];

interface OrderStepperProps {
  currentStep: number;
}

const OrderStepper: React.FC<OrderStepperProps> = ({ currentStep }) => {
  return (
    <div className='order-stepper-container'>
      <div className='stepper-wrapper'>
        <div className='connecting-lines-container'>
          <div className='connecting-lines-flex'>
            {steps.map((_, index) => {
              if (index === steps.length - 1) return null;

              const isCompleted = index < currentStep;
              const lineClass = `connecting-line ${isCompleted ? 'completed' : 'pending'} ${
                index === 0 ? 'first-line' : ''
              } ${index === steps.length - 2 ? 'last-line' : ''}`;

              return <div key={index} className={lineClass} />;
            })}
          </div>
        </div>

        <div className='steps-container'>
          {steps.map((step, index) => {
            const isActive = index === currentStep;
            const isComplete = index < currentStep;

            const stepClass = `step-item ${isActive ? 'active' : ''} ${isComplete ? 'completed' : ''} ${
              !isActive && !isComplete ? 'pending' : ''
            }`;

            return (
              <div key={index} className={stepClass}>
                <div className='step-circle'>{step.icon}</div>
                <div className='step-content'>
                  <div className='step-title steps-font'>{step.title}</div>
                  {/* {step.timestamp && <div className='step-timestamp'>{step.timestamp}</div>} */}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OrderStepper;
