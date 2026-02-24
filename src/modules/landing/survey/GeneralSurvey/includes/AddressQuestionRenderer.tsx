import { AddressForm } from '@/components/PatientSurvey/AddressForm';
import { AddressData } from '@/types/generalSurvey';
import { FaRegCheckCircle } from 'react-icons/fa';
import { FaRegCircle } from 'react-icons/fa6';

interface AddressQuestionRendererProps {
  addressData: AddressData;
  setAddressData: (ag: AddressData) => void;
}

/**
 * Renders address question with Yes/No radio buttons and conditional address form.
 *
 * When "Yes" is selected:
 * - Creates address data structure (prefilled from orderAddress if available)
 * - Stores address object in answers state
 * - Renders AddressForm component
 *
 * When "No" is selected:
 * - Sets answer to 'No' string
 * - Marks as valid
 *
 * @see docs/ADDRESS_QUESTION_IMPLEMENTATION.md for architecture details
 */

export function AddressQuestionRenderer({ addressData, setAddressData }: Readonly<AddressQuestionRendererProps>) {
  const { selectedOption } = addressData;

  const addressOptions = ['Yes', 'No'] as const;

  const handleAddressOptionChange = (option: string) => {
    setAddressData({
      ...addressData,
      selectedOption: option,
    });

    // const _answers = answers.map((answer) => {
    //   if (answer.questionId !== question.id) return answer;

    //   if (option === 'Yes') {
    //     // Initialize address data if orderAddress is available
    //     const addressData = orderAddress
    //       ? {
    //           billingAddress: {
    //             firstName: orderAddress.billingAddress?.firstName || '',
    //             lastName: orderAddress.billingAddress?.lastName || '',
    //             street: orderAddress.billingAddress?.street || '',
    //             street2: orderAddress.billingAddress?.street2 || '',
    //             city: orderAddress.billingAddress?.city || '',
    //             region: orderAddress.billingAddress?.region || 'United States',
    //             state: orderAddress.billingAddress?.state || '',
    //             zip: orderAddress.billingAddress?.zip || '',
    //           },
    //           shippingAddress: {
    //             firstName: orderAddress.shippingAddress?.firstName || '',
    //             lastName: orderAddress.shippingAddress?.lastName || '',
    //             street: orderAddress.shippingAddress?.street || '',
    //             street2: orderAddress.shippingAddress?.street2 || '',
    //             city: orderAddress.shippingAddress?.city || '',
    //             region: orderAddress.shippingAddress?.region || 'United States',
    //             state: orderAddress.shippingAddress?.state || '',
    //             zip: orderAddress.shippingAddress?.zip || '',
    //           },
    //           sameAsBilling: false,
    //         }
    //       : {
    //           billingAddress: {
    //             firstName: '',
    //             lastName: '',
    //             street: '',
    //             street2: '',
    //             city: '',
    //             region: 'United States',
    //             state: '',
    //             zip: '',
    //           },
    //           shippingAddress: {
    //             firstName: '',
    //             lastName: '',
    //             street: '',
    //             street2: '',
    //             city: '',
    //             region: 'United States',
    //             state: '',
    //             zip: '',
    //           },
    //           sameAsBilling: false,
    //         };

    //     return {
    //       ...answer,
    //       answer: addressData as any, // Address object stored temporarily, will be stringified on submit
    //       isValid: false, // Will be validated by AddressForm
    //     };
    //   } else {
    //     // "No" selected
    //     return {
    //       ...answer,
    //       answer: 'No',
    //       isValid: true,
    //     };
    //   }
    // });

    // setAnswers(_answers);
  };

  return (
    <div className='tw-space-y-6 tw-animate-fade-in'>
      {/* Custom Radio Buttons for Yes/No */}
      <div>
        <div className='tw-space-y-3'>
          {addressOptions.map((option: string) => {
            const isSelected = selectedOption === option;
            return (
              <button
                key={option}
                type='button'
                onClick={() => handleAddressOptionChange(option)}
                className={
                  'tw-w-full tw-rounded border tw-cursor-pointer tw-px-3 tw-py-2 md:tw-p-4 tw-text-sm md:tw-text-base tw-flex tw-select-none tw-items-center tw-justify-start tw-gap-x-4' +
                  (isSelected ? ' tw-border-primary tw-text-white tw-bg-primary' : ' tw-bg-white')
                }
              >
                {isSelected ? (
                  <FaRegCheckCircle className='flex-shrink-0' color={isSelected ? 'white' : undefined} />
                ) : (
                  <FaRegCircle className='flex-shrink-0' />
                )}
                <span>{option}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Show AddressForm when "Yes" is selected */}
      {selectedOption === 'Yes' && <AddressForm addressData={addressData} setAddressData={setAddressData} />}
    </div>
  );
}
