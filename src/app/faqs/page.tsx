import { Metadata } from 'next';
import '@/styles/faqs/styles.css';
import '@/app/style.css';
import { Accordion, AccordionItem, AccordionHeader, AccordionBody } from 'react-bootstrap';
import Certification from '@/components/Certification';
import BookAppointmentCTA from '@/components/Appointment/BookAppointmentCTA';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'FAQs – Your Questions About GLP-1 Weight Loss Plans Answered | LumiMeds',
    description:
      "Find answers to common questions about LumiMeds' GLP-1 and GLP-1/GIP weight loss plans, including eligibility, side effects, and shipping details.",
    robots:
      process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true'
        ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
        : 'noindex, nofollow',
    alternates: {
      canonical: 'https://www.lumimeds.com/faqs',
    },
    openGraph: {
      title: 'FAQs – Your Questions About GLP-1 Weight Loss Plans Answered | LumiMeds',
      description:
        "Find answers to common questions about LumiMeds' GLP-1 and GLP-1/GIP weight loss plans, including eligibility, side effects, and shipping details.",
      type: 'website',
      url: 'https://www.lumimeds.com/faqs',
    },
  };
}

/**
 * Convert strings to sentence case for Accordion headers:
 * - lowercase everything, capitalize only the first character
 * - restore specific acronyms/brand casing from EXCEPTIONS
 * - fix standalone "i" and common contractions (I'm, I've, etc.)
 */
const EXCEPTIONS: Record<string, string> = {
  fsa: 'FSA',
  hsa: 'HSA',
  'u.s.': 'U.S.',
  'u.s': 'U.S.',
  us: 'US',
  'glp-1/gip': 'GLP-1/GIP',
  'glp-1': 'GLP-1',
  gip: 'GIP',
  bmi: 'BMI',
  lumimeds: 'Lumimeds',
  tirzepatide: 'Tirzepatide',
  semaglutide: 'Semaglutide',
  // add more exceptions if needed
};

function sentenceCase(input?: string) {
  if (!input) return '';
  let s = input.trim().replace(/\s+/g, ' ');
  s = s.toLowerCase();
  s = s.charAt(0).toUpperCase() + s.slice(1);

  // fix contractions and standalone i
  s = s.replace(/\bi(['']?(m|ve|ll|d|re))\b/gi, (m) => {
    return m.charAt(0).toUpperCase() + m.slice(1);
  });
  // Capitalize standalone "i" when it's the pronoun "I" (not in words like "is", "it", etc.)
  s = s.replace(/\bi\b(?![a-z])/g, 'I');

  // restore exceptions
  Object.keys(EXCEPTIONS).forEach((key) => {
    const safeKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(safeKey, 'gi');
    s = s.replace(re, EXCEPTIONS[key]);
  });

  return s;
}

/**
 * Wrapper to apply sentenceCase to plain string children for Accordion headers.
 * Leaves JSX children untouched (icons/spans).
 */
function CustomAccordionHeader(props: React.ComponentProps<typeof AccordionHeader>) {
  const { children, ...rest } = props;
  if (typeof children === 'string') {
    return <AccordionHeader {...rest}>{sentenceCase(children)}</AccordionHeader>;
  }
  if (Array.isArray(children)) {
    const newChildren = children.map((c) => (typeof c === 'string' ? sentenceCase(c) : c));
    return <AccordionHeader {...rest}>{newChildren}</AccordionHeader>;
  }
  return <AccordionHeader {...rest}>{children}</AccordionHeader>;
}

export default function FaqsPage() {
  return (
    <>
      <section className='faqs-section pb-0'>
        <div className='container'>
          <div className='section-title text-center'>
            <h1 className='fs-35 lh-42 font-weight-bold margin-60px-bottom letter-spacing-minus-1px tw-text-primary tw-font-primary tw-font-bold'>
              Frequently Asked Questions
            </h1>
          </div>

          <section className='pt-0 tw-pb-7'>
            <h4>Common Questions</h4>

            <Accordion className='accordionjs'>
              <AccordionItem eventKey='0' className='medication-detail'>
                <CustomAccordionHeader className='accordion_title'>
                  How Much Weight Do Lumimeds Members Lose On Average?
                </CustomAccordionHeader>
                <AccordionBody>
                  Weight loss varies per individual. Your starting weight, overall condition, and lifestyle impact how
                  much weight you may lose during the course of your treatment. Continuous treatment, ideally combined
                  with healthy habits, is key to achieving your target weight.
                </AccordionBody>
              </AccordionItem>

              <AccordionItem eventKey='1' className='medication-detail'>
                <CustomAccordionHeader className='accordion_title'>
                  When I Sign Up For The Lumimeds Program, What Can I Eat?
                </CustomAccordionHeader>
                <AccordionBody>
                  While we recommend diets that are beneficial for weight loss, we do not want to set any food
                  restrictions while you are engaged in the Lumimeds program. We work together to develop treatment
                  plans for medication-assisted weight loss and reach your goals.
                </AccordionBody>
              </AccordionItem>

              <AccordionItem eventKey='2' className='medication-detail'>
                <CustomAccordionHeader className='accordion_title'>
                  Do You Accept FSA (Flexible Spending Account) Or HSA (Health Savings Account) Payments?
                </CustomAccordionHeader>
                <AccordionBody>
                  Yes, we accept both FSA and HSA payments for our services and medications. These accounts can
                  typically be used to cover eligible healthcare expenses, including weight loss treatments.
                </AccordionBody>
              </AccordionItem>
              <AccordionItem eventKey='3' className='medication-detail'>
                <CustomAccordionHeader className='accordion_title'>Where do you ship?</CustomAccordionHeader>
                <AccordionBody>
                  We ship medications, including compounded options like GLP-1 Injections and GLP-1/GIP Injections, to
                  most U.S. states. However, state laws vary regarding the shipping of compounded medications. Final
                  eligibility for shipping to your specific address will be confirmed based on your state of residence
                  and the prescribed treatment during your telehealth consultation.
                  <div className='mt-3 w-100 fst-italic text-neutral-gray'>
                    Check Your State&apos;s Eligibility: Shipping for compounded medications is subject to state
                    regulations. Complete our brief intake form or speak with our team to confirm if we can ship to your
                    location.
                  </div>
                </AccordionBody>
              </AccordionItem>
            </Accordion>
          </section>

          <section className='pt-4 tw-pb-7'>
            <h4>Our Programs</h4>

            <Accordion className='accordionjs'>
              <AccordionItem eventKey='0' className='medication-detail'>
                <CustomAccordionHeader className='accordion_title'>What is Lumimeds?</CustomAccordionHeader>
                <AccordionBody>
                  Lumimeds is a platform that links people looking for medication-based weight-reduction treatment. We
                  have board-certified doctors ready to help them find the best treatment alternatives for their goals.
                  Our program is completely virtual, which means you may access our services from anywhere in the United
                  States (all 50 states) and meet with our staff online.
                </AccordionBody>
              </AccordionItem>

              <AccordionItem eventKey='1' className='medication-detail'>
                <CustomAccordionHeader className='accordion_title'>
                  How Long Does It Take To Book An Appointment With A Lumimeds Provider?
                </CustomAccordionHeader>
                <AccordionBody>
                  After you fill out your intake form, we aim to have doctors review within 48 hours, sometimes even
                  earlier.
                </AccordionBody>
              </AccordionItem>

              <AccordionItem eventKey='2' className='medication-detail'>
                <CustomAccordionHeader className='accordion_title'>
                  What Should I Anticipate When I Join Lumimeds?
                </CustomAccordionHeader>
                <AccordionBody>
                  Our approach is broken down into three stages: Phase 1: You will fill out a qualifying form and pick a
                  plan that is suitable for your budget. Phase 2: You will fill out a medical intake form which will be
                  reviewed asynchronously or synchronously depending on your state. Once approved, your medication will
                  be sent to a pharmacy and delivered to your doorstep. Phase 3: You will continue to engage with a care
                  coordinator who will monitor your progress and add any necessary modifications to your treatment plan.
                </AccordionBody>
              </AccordionItem>

              <AccordionItem eventKey='3' className='medication-detail'>
                <CustomAccordionHeader className='accordion_title'>
                What can I expect during my virtual provider visit?
                </CustomAccordionHeader>
                <AccordionBody>
                During your virtual visit, your provider will review your medical intake form either synchronously or asynchronously to determine if the medication is suitable for you in compliance with state and medical board guidelines.
                </AccordionBody>
              </AccordionItem>

              <AccordionItem eventKey='4' className='medication-detail'>
                <CustomAccordionHeader className='accordion_title'>
                  What Distinguishes Lumimeds From Other Diet Plans?
                </CustomAccordionHeader>
                <AccordionBody>
                  Our healthcare professionals at Lumimeds collaborate with you to ascertain your objectives and explore
                  how the program might assist in achieving them. You have a say in your treatment strategy as the
                  patient. Furthermore, Lumimeds is an online treatment plan alternative that allows you to access our
                  services from anywhere in the United States.
                </AccordionBody>
              </AccordionItem>

              <AccordionItem eventKey='5' className='medication-detail'>
                <CustomAccordionHeader className='accordion_title'>
                  I&apos;m Switching From Another Program, Do I Need To Start At The Lowest Dose?
                </CustomAccordionHeader>
                <AccordionBody>You may keep taking the same dosage.</AccordionBody>
              </AccordionItem>
            </Accordion>
          </section>

          <section className='pt-4 tw-pb-7'>
            <h4>Eligibility</h4>
            <Accordion className='accordionjs'>
              <AccordionItem eventKey='0' className='medication-detail'>
                <CustomAccordionHeader className='accordion_title'>
                  Who is eligible to join Lumimeds?
                </CustomAccordionHeader>
                <AccordionBody>
                  Generally, our patients are above 30 BMI or over 27 BMI with weight-related disorders such as high
                  blood pressure. Fill out an eligibility form right now to find out whether you qualify to join
                  Lumimeds!
                </AccordionBody>
              </AccordionItem>

              <AccordionItem eventKey='1' className='medication-detail'>
                <CustomAccordionHeader className='accordion_title'>
                  Can I Join Lumimeds If I Have Pre-Diabetes, Diabetes, Hypertension, Or Other Pre-Existing Conditions?
                </CustomAccordionHeader>
                <AccordionBody>
                  Yes! Before your first virtual appointment with your physician, you will have to complete a number of
                  intake documents. You shall provide all relevant health information, such as whether you have high
                  blood pressure, diabetes, or any other conditions.
                </AccordionBody>
              </AccordionItem>
            </Accordion>
          </section>

          <section className='pt-4 tw-pb-7'>
            <h4>Medication</h4>
            <Accordion className='accordionjs'>
              <AccordionItem eventKey='0' className='medication-detail'>
                <CustomAccordionHeader className='accordion_title'>
                  What Are The Medications That Lumimeds Doctors Prescribe?
                </CustomAccordionHeader>
                <AccordionBody>
                  The doctors at Lumimeds will perform a comprehensive evaluation of your symptoms, previous and present
                  medical treatments, and family and medical histories before recommending the drug that will work best
                  for you on your unique path. Our doctors prescribe personalized GLP-1 or GLP-1/GIP treatment, tailored
                  to your needs and goals.
                </AccordionBody>
              </AccordionItem>

              <AccordionItem eventKey='1' className='medication-detail'>
                <CustomAccordionHeader className='accordion_title'>
                  What Are The Side Effects Of The Medication?
                </CustomAccordionHeader>
                <AccordionBody>
                  The adverse effects of these medications are quite similar, including nausea, vomiting, diarrhea,
                  constipation, and stomach discomfort. More rare adverse effects include pancreatitis, gallstones, and
                  renal issues.
                </AccordionBody>
              </AccordionItem>

              <AccordionItem eventKey='2' className='medication-detail'>
                <CustomAccordionHeader className='accordion_title'>
                  Can The Medications That I Take As Part Of The Lumimeds Program Interfere With The Other Medications I
                  Take For Diabetes, High Blood Pressure, Or Other Health Concerns?
                </CustomAccordionHeader>
                <AccordionBody>
                  You will complete intake paperwork in which you will list all of the drugs you are presently taking.
                  This will assist our experts in selecting the optimum treatment strategy for you and your existing
                  drug regimen. Before you begin, our physicians will assess your medical history and any medicines to
                  ensure there are no interactions.
                </AccordionBody>
              </AccordionItem>
            </Accordion>
          </section>
        </div>
      </section>
      {/* CTA Section extracted to component */}
      <BookAppointmentCTA />
      <Certification />
    </>
  );
}
