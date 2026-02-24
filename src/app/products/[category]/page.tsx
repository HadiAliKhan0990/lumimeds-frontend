import Image from 'next/image';
import Link from 'next/link';
import GLP1 from '@/assets/glp-1.jpg';
import ImgComparisonSlider from '@/components/Products/Single/ImgComparisonSlider';
import TrustpilotReviews from '@/components/Home/TrustpilotReviews';
import ProductDetailsAccordion from '@/components/Products/Single/ProductDetailsAccordion';
import ProductOptions from '@/components/Products/Single/ProductOptions';
import { redirect } from 'next/navigation';
import { GLP1_ACCORDION, GLP1_GIP_ACCORDION } from '@/components/Products/Single/ConstantsSingle';
import { getRoundedPrice } from '@/helpers/products';
import { fetchProducts } from '@/services/products';
import { ProductCategory, ProductCategoryKey } from '@/types/products';
import { PlanType } from '@/types/medications';
import { FaCheck } from 'react-icons/fa6';
import './styles.css';
import 'swiper/css';
import 'swiper/css/navigation';

export const revalidate = 0;

interface Props {
  params: Promise<{ category: string }>;
}

// Valid product category slugs (normalized to underscore format)
const VALID_CATEGORIES = ['glp_1_plans', 'glp_1_gip_plans'];

export default async function Page({ params }: Readonly<Props>) {
  const { category } = await params;

  // Normalize category (convert hyphens to underscores to match internal format)
  const normalizedCategory = category.replace(/-/g, '_');

  // Check if category is valid (only allow glp-1-plans and glp-1-gip-plans)
  if (!VALID_CATEGORIES.includes(normalizedCategory)) {
    redirect('/');
  }

  const name = normalizedCategory as ProductCategoryKey;

  const categories: ProductCategory[] = [];

  if (name === 'glp_1_plans') {
    categories.push('weight_loss_glp_1_injection_recurring');
  } else if (name === 'glp_1_gip_plans') {
    categories.push('weight_loss_glp_1_gip_injection_recurring');
    categories.push('weight_loss_glp_1_gip_injection_one_time');
  }

  const products = await fetchProducts({
    keys: [{ name, categories, planTypeSort: PlanType.RECURRING }],
  });

  const product = products[name];

  // If product doesn't exist, show 404
  if (!product) {
    redirect('/');
  }

  let accordionData = GLP1_ACCORDION;
  let accordionTitle = 'GLP-1 Injections';

  if (name === 'glp_1_gip_plans') {
    accordionData = GLP1_GIP_ACCORDION;
    accordionTitle = 'GLP-1/GIP Injections';
  }

  return (
    <>
      <section className='pt-0' id='product-details'>
        <div id='sgltContent' className='row text-white pt-128'>
          <div className='col-12 col-lg-6 d-flex align-items-center justify-content-center py-5 bg-cddfff'>
            <Image
              width={210}
              height={350}
              src={product?.image || ''}
              alt={product?.summaryText || 'Product Image'}
              className='rotate-m20 h-350px w-210px max-w-full object-fit-contain'
            />
          </div>
          <div className='col-12 col-lg-6 d-flex flex-column row-gap-24 bg-3060fe p-32'>
            <div>
              <p className='text-4xl fw-bold text-capitalize m-0'>
                {product?.categoryName} {product?.categoryDosageType}s
              </p>
              {/* <p
								className="d-none"
								style={{ fontSize: 18, lineHeight: 30, margin: 0 }}
							>
								Active Ingredient in Ozempic® and Wegovy®
							</p> */}
            </div>
            {/* <div class="d-flex align-items-center" style="column-gap: 16px;">
              <div class="d-flex" style="column-gap: 6px;">
                  <i class="fa-solid fa-star" style="column-gap: 7px; color: rgba(254, 183, 1, 1);"></i>
                  <i class="fa-solid fa-star" style="column-gap: 7px; color: rgba(254, 183, 1, 1);"></i>
                  <i class="fa-solid fa-star" style="column-gap: 7px; color: rgba(254, 183, 1, 1);"></i>
                  <i class="fa-solid fa-star" style="column-gap: 7px; color: rgba(254, 183, 1, 1);"></i>
                  <i class="fa-solid fa-star" style="column-gap: 7px; color: rgba(254, 183, 1, 1);"></i>
              </div>
              <p style="margin:0; font-size:12px;">142 Ratings</p>
          </div> */}
            <div>
              <span className='text-xs fw-bold'>AS LOW AS</span>
              <div className='d-flex align-items-center text-white fw-semibold text-base column-gap-12'>
                <span>$</span>
                <span className='fs-58'>{getRoundedPrice(product?.startingAmount || 0)}</span>
                <span>/month</span>
              </div>
            </div>
            <div className='d-flex column-gap-12 d-none'>
              {/* <a href="/take-the-quiz" style="width:50%">
                  <button class="btn-outline" style="width: 100%;">Take the Quiz</button>
              </a> */}
            </div>
            <div className='d-flex flex-column row-gap-8' id='product-benefits'>
              <p className='m-0 text-xl fw-bold'>Benefits</p>
              {name === 'glp_1_gip_plans' ? (
                <>
                  <div className='d-flex align-items-center column-gap-14'>
                    <FaCheck className='text-white' />
                    <p className='m-0'>Reduces appetite and hunger</p>
                  </div>
                  <div className='d-flex align-items-center column-gap-14'>
                    <FaCheck className='text-white' />
                    <p className='m-0'>Slows stomach emptying and helps you feel fuller, longer</p>
                  </div>
                  <div className='d-flex align-items-center column-gap-14'>
                    <FaCheck className='text-white' />
                    <p className='m-0'>Helps control blood sugars</p>
                  </div>
                </>
              ) : (
                <>
                  <div className='d-flex align-items-center column-gap-14'>
                    <FaCheck className='text-white' />
                    <p className='m-0'>Improves your energy, mood, and sleep</p>
                  </div>
                  <div className='d-flex align-items-center column-gap-14'>
                    <FaCheck className='text-white' />
                    <p className='m-0'>Helps you feel fuller for longer by reducing appetite and hunger</p>
                  </div>
                  <div className='d-flex align-items-center column-gap-14'>
                    <FaCheck className='text-white' />
                    <p className='m-0'>Reduces weight-related diseases </p>
                  </div>
                </>
              )}
            </div>
            {/* <p style="font-weight:700; font-size:21px; margin:0;">Select Treatment</p> */}
            {/* <div class="d-flex" style="column-gap: 16px;">
              <button disabled class="d-flex flex-column product_button product_button_active" style="border: 1px solid #AEAEAE">
                  <div class="d-flex align-items-center" style="column-gap:12px;">
                      <span style="font-weight: 700; font-size:42px;">$179</span>
                      <span style="font-size:20px; color:#D7D7D7; text-decoration: line-through; -webkit-text-decoration: line-through 2px #D7D7D7; -moz-text-decoration: line-through 2px #D7D7D7;">$259</span>
                  </div>
                  <span style="text-decoration: none !important; font-size:12px;">*First month only with selected promo code</span>
              </button> */}
            {/* <button class="d-flex flex-column product_button" style="border: 1px solid #AEAEAE">
                  <span>3 Months</span>
                  <span>$119.00</span>
                  <span>$249.00</span>
              </button> */}
            {/* </div> */}
            <p className='m-0 text-xl fw-bold'>Program Summary</p>
            <div id='program-summary'>
              <div className='d-flex align-items-center column-gap-12'>
                <svg width={18} height={13} viewBox='0 0 18 13' fill='none' xmlns='http://www.w3.org/2000/svg'>
                  <path
                    d='M16.4988 10.4492H13.4988V5.19916H16.4988M17.2488 3.69916H12.7488C12.5499 3.69916 12.3591 3.77818 12.2184 3.91883C12.0778 4.05948 11.9988 4.25025 11.9988 4.44916V11.9492C11.9988 12.1481 12.0778 12.3388 12.2184 12.4795C12.3591 12.6201 12.5499 12.6992 12.7488 12.6992H17.2488C17.4477 12.6992 17.6385 12.6201 17.7791 12.4795C17.9198 12.3388 17.9988 12.1481 17.9988 11.9492V4.44916C17.9988 4.25025 17.9198 4.05948 17.7791 3.91883C17.6385 3.77818 17.4477 3.69916 17.2488 3.69916ZM2.99878 2.19916H16.4988V0.699158H2.99878C2.60095 0.699158 2.21942 0.857193 1.93812 1.1385C1.65681 1.4198 1.49878 1.80133 1.49878 2.19916V10.4492H-0.0012207V12.6992H10.4988V10.4492H2.99878V2.19916Z'
                    fill='white'
                  />
                </svg>
                <span>Initial Telehealth Consult</span>
              </div>
              <div className='d-flex align-items-center column-gap-12'>
                <svg width={18} height={18} viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
                  <path
                    d='M11.4991 2.03248V7.86581H3.30744L2.33244 8.84081V2.03248H11.4991ZM12.3324 0.365814H1.4991C1.27809 0.365814 1.06613 0.453612 0.909849 0.609892C0.753569 0.766172 0.665771 0.978134 0.665771 1.19915V12.8658L3.9991 9.53248H12.3324C12.5535 9.53248 12.7654 9.44468 12.9217 9.2884C13.078 9.13212 13.1658 8.92016 13.1658 8.69915V1.19915C13.1658 0.978134 13.078 0.766172 12.9217 0.609892C12.7654 0.453612 12.5535 0.365814 12.3324 0.365814ZM16.4991 3.69915H14.8324V11.1991H3.9991V12.8658C3.9991 13.0868 4.0869 13.2988 4.24318 13.4551C4.39946 13.6114 4.61142 13.6991 4.83244 13.6991H13.9991L17.3324 17.0325V4.53248C17.3324 4.31147 17.2446 4.09951 17.0884 3.94323C16.9321 3.78695 16.7201 3.69915 16.4991 3.69915Z'
                    fill='white'
                  />
                </svg>
                <span>Real-Time Physician Support</span>
              </div>
              <div className='d-flex align-items-center column-gap-12'>
                <svg width={18} height={16} viewBox='0 0 12 16' fill='none' xmlns='http://www.w3.org/2000/svg'>
                  <path
                    d='M4.7491 10.1992H2.66577V7.69916H4.7491V5.61582H7.2491V7.69916H9.33244V10.1992H7.2491V12.2825H4.7491V10.1992ZM11.8324 4.36582V13.5325C11.8324 14.4492 11.0824 15.1992 10.1658 15.1992H1.83244C0.915771 15.1992 0.165771 14.4492 0.165771 13.5325V4.36582C0.165771 3.44916 0.915771 2.69916 1.83244 2.69916H10.1658C11.0824 2.69916 11.8324 3.44916 11.8324 4.36582ZM10.1658 4.36582H1.83244V13.5325H10.1658V4.36582ZM10.9991 0.199158H0.999105V1.86582H10.9991V0.199158Z'
                    fill='white'
                  />
                </svg>
                <span>Prescription + Medication</span>
              </div>
              <div className='d-flex align-items-center column-gap-12'>
                <svg width={20} height={19} viewBox='0 0 20 19' fill='none' xmlns='http://www.w3.org/2000/svg'>
                  <path
                    d='M17.4985 13.8658V6.36583H5.83179V13.8658H17.4985ZM17.4985 2.19917C17.9405 2.19917 18.3644 2.37476 18.677 2.68732C18.9895 2.99988 19.1651 3.42381 19.1651 3.86583V13.8658C19.1651 14.3079 18.9895 14.7318 18.677 15.0443C18.3644 15.3569 17.9405 15.5325 17.4985 15.5325H5.83179C4.90679 15.5325 4.16512 14.7825 4.16512 13.8658V3.86583C4.16512 3.42381 4.34072 2.99988 4.65328 2.68732C4.96584 2.37476 5.38976 2.19917 5.83179 2.19917H6.66512V0.532501H8.33179V2.19917H14.9985V0.532501H16.6651V2.19917H17.4985ZM14.6068 8.91584L10.9068 12.6158L8.67345 10.3825L9.55679 9.49917L10.9068 10.8492L13.7235 8.0325L14.6068 8.91584ZM2.49845 17.1992H14.1651V18.8658H2.49845C1.57345 18.8658 0.831787 18.1158 0.831787 17.1992V7.19917H2.49845V17.1992Z'
                    fill='white'
                  />
                </svg>
                <span>Remote Monthly Check-Ins</span>
              </div>
            </div>
            {/* <div class="hr" style="border: 1px solid #483CFF; background:#483CFF"></div> */}
            {/* <a id="product-checkout-button" href="/products/sglt/summary">

          </a> */}
            {/* <p style="text-align: center;">Cancel Anytime</p> */}
          </div>
        </div>
        <ProductOptions product={product} />
      </section>

      <section className='py-0'>
        <div className='container'>
          <div className='row bg-3060fe-radius-24'>
            <div className='col-12 col-lg-6 d-flex align-items-center'>
              <Image src={GLP1} alt='' className='object-cover radius-12 aspect-1-1' />
            </div>
            <div
              className='col-12 col-lg-6 d-flex flex-column justify-content-center mt-5 mt-lg-0 text-white'
              id='glp-1-section'
            >
              <p className='font-weight-500' id='glp-1-subtext'>
                {name === 'glp_1_gip_plans' ? 'HOW DO GLP-1/GIP MEDICATIONS WORK?' : "HOW DO GLP 1's WORK?"}
              </p>
              <p className='font-weight-600' id='glp-1-title'>
                {name === 'glp_1_gip_plans' ? (
                  <>
                    The science behind GLP-1 <br /> /GIP Medications
                  </>
                ) : (
                  'The science behind GLP-1 Medications'
                )}
              </p>

              {name === 'glp_1_gip_plans' ? (
                <>
                  {/* <p id='glp-1-description'>
                    GLP-1/GIP medications combine two powerful hormones that work together to support weight management.
                    GLP-1 (glucagon-like peptide-1) is naturally released when you eat and helps regulate blood sugar by
                    stimulating insulin production. GIP (glucose-dependent insulinotropic polypeptide) works alongside
                    GLP-1 to enhance insulin sensitivity and glucose metabolism.
                  </p> */}
                  <p id='glp-1-description'>
                    GLP-1/GIP medications mimic the GLP-1/GIP hormones the body produces immediately after food intake.
                    When you eat, your digestive system releases this hormone to stimulate insulin production and
                    balance blood sugar levels. GLP-1/GIP medications mirror the effects of the naturally occurring
                    hormones, which also reduce appetite and promote feelings of fullness. These effects work together
                    to help patients lose weight.
                  </p>
                </>
              ) : (
                <>
                  {/* <p id='glp-1-description'>
                    When you eat, your digestive system releases the GLP-1 hormone. One of its jobs is to tell your body
                    to produce insulin, which reduces your blood sugar levels. High levels of GLP-1 reduces your
                    appetite and makes you feel full.
                  </p> */}
                  <p id='glp-1-description'>
                    GLP-1 medications mimic the GLP-1 hormone the body produces immediately after food intake. When you
                    eat, your digestive system releases this hormone to stimulate insulin production and balance blood
                    sugar levels. GLP-1 medications mirror the effects of the naturally occurring hormone, which also
                    reduces appetite and promotes feelings of fullness. These effects work together to help patients
                    lose weight.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
      <section className='pb-0'>
        <div className='container'>
          <div className='row'>
            <div className='col-12 align-items-center'>
              <p className='accordion_header text-center'>
                What You Need To Know About <br />
                <span className='font-instrument-serif fw-400'>{accordionTitle}</span>
              </p>
            </div>
            <div className='col-12'>
              <ProductDetailsAccordion data={accordionData} />
            </div>
          </div>
        </div>
      </section>
      <section id='cta' className='container py-0 margin-64-auto'>
        <div className='fs-18 color-312316'>
          <p className='mb-5'>Have Questions?</p>
          <p className='text-center'>Book a free appointment with one<br className='d-md-none' /> of our experts.</p>
          {/* <link href='https://assets.calendly.com/assets/external/widget.css' rel='stylesheet' /> */}
          <Link
            href='https://calendly.com/lumimeds/15min'
            target='_blank'
            rel='noopener noreferrer'
            className='btn btn-primary rounded-pill text-lg px-4 py-12 fw-medium text-decoration-none'
          >
            Book An Appointment
          </Link>
        </div>
      </section>

      <ImgComparisonSlider />

      <div className='single_product'>
        <section id='testimonials' className='testimonials_sec'>
          <p className='testimonial_title'>
            Customer <span className='fw-normal font-instrument-serif fst-italic'>Reviews</span>
          </p>
          <TrustpilotReviews className='trustpilot-testimonials-light' theme='light' />
        </section>
      </div>
    </>
  );
}
