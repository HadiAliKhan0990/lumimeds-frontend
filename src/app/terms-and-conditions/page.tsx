import React from 'react';
import './styles.css';
import Link from 'next/link';
import Certification from '@/components/Certification';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Terms and Conditions | LumiMeds',
    description:
      'Understand the terms and conditions applicable to the services provided by LumiMeds. By using our platform, you agree to these terms.',
    robots:
      process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true'
        ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
        : 'noindex, nofollow',
    alternates: {
      canonical: 'https://www.lumimeds.com/terms-and-conditions',
    },
    openGraph: {
      title: 'Terms and Conditions | LumiMeds',
      description:
        'Understand the terms and conditions applicable to the services provided by LumiMeds. By using our platform, you agree to these terms.',
      type: 'website',
      url: 'https://www.lumimeds.com/terms-and-conditions',
    },
  };
}

const MemberTermsPage = () => {
  return (
    <div className='container' style={{ color: 'black', paddingTop: '128px' }}>
      <p
        style={{
          marginTop: '0pt',
          marginBottom: '8pt',
          textAlign: 'center',
          lineHeight: '108%',
          fontSize: '12pt',
        }}
      >
        <strong>
          <h1 className='tw-text-xl tw-font-serif tw-uppercase'>
            LUMIMEDS MEMBERSHIP TERMS AND CONDITIONS
          </h1>
        </strong>
      </p>
      <p style={{ marginTop: '14pt', marginBottom: '14pt', fontSize: '12pt' }}>
        <strong>
          <span style={{ fontFamily: '"Times New Roman"' }}>
            PLEASE READ THESE MEMBERSHIP TERMS AND CONDITIONS (&quot;MEMBERSHIP TERMS&quot;) CAREFULLY BEFORE ENROLLING
            IN ANY MEMBERSHIP PLAN OFFERED BY LUMINATE VENTURES LLC d/b/a LUMIMEDS (&quot;LUMIMEDS&quot;).
          </span>
        </strong>
      </p>
      <p style={{ marginTop: '14pt', marginBottom: '14pt', fontSize: '12pt' }}>
        <span style={{ fontFamily: '"Times New Roman"' }}>
          These Membership Terms govern your enrollment in and use of any fixed-duration or subscription-based
          membership plan (the &quot;Membership&quot;) provided by Lumimeds through its proprietary platform (the
          &quot;Platform&quot;). By enrolling in a Membership, you affirm that you have read, understood, and agree to
          be bound by these Membership Terms, along with Lumimeds&#39;{' '}
          <Link href='/privacypolicy' style={{ color: 'blue', textDecoration: 'underline' }}>
            Privacy Policy
          </Link>{' '}
          and{' '}
          <Link href='/termsofuse' style={{ color: 'blue', textDecoration: 'underline' }}>
            Terms of Use
          </Link>
          , which are incorporated herein by reference.
        </span>
      </p>
      <ol type='I' style={{ margin: '0pt', paddingLeft: '0pt' }}>
        <li
          style={{
            marginTop: '12pt',
            marginLeft: '32pt',
            marginBottom: '12pt',
            textAlign: 'justify',
            paddingLeft: '4pt',
            fontFamily: '"Times New Roman"',
            fontSize: '12pt',
            fontWeight: 'bold',
          }}
        >
          SCOPE OF MEMBERSHIP SERVICES
        </li>
      </ol>
      <p style={{ marginTop: '14pt', marginBottom: '14pt', fontSize: '12pt' }}>
        <span style={{ fontFamily: '"Times New Roman"' }}>
          Enrollment in a Lumimeds Membership entitles you to non-transferable access to certain non-clinical
          administrative and support services offered through the Platform. These may include:
        </span>
      </p>
      <ul style={{ margin: '0pt', paddingLeft: '0pt', listStyle: 'disc' }}>
        <li
          style={{
            marginTop: '14pt',
            marginLeft: '27.6pt',
            paddingLeft: '8.4pt',
            fontFamily: 'serif',
            fontSize: '10pt',
          }}
        >
          <span style={{ fontFamily: '"Times New Roman"', fontSize: '12pt' }}>
            Facilitated access to affiliated, independent licensed healthcare providers;
          </span>
        </li>
        <li
          style={{
            marginLeft: '27.6pt',
            paddingLeft: '8.4pt',
            fontFamily: 'serif',
            fontSize: '10pt',
          }}
        >
          <span style={{ fontFamily: '"Times New Roman"', fontSize: '12pt' }}>
            Coordination of prescription fulfillment through third-party pharmacy partners;
          </span>
        </li>
        <li
          style={{
            marginLeft: '27.6pt',
            paddingLeft: '8.4pt',
            fontFamily: 'serif',
            fontSize: '10pt',
          }}
        >
          <span style={{ fontFamily: '"Times New Roman"', fontSize: '12pt' }}>
            Health tracking and communication tools;
          </span>
        </li>
        <li
          style={{
            marginLeft: '27.6pt',
            marginBottom: '14pt',
            paddingLeft: '8.4pt',
            fontFamily: 'serif',
            fontSize: '10pt',
          }}
        >
          <span style={{ fontFamily: '"Times New Roman"', fontSize: '12pt' }}>
            Refill notifications and continued service access throughout the Membership term.
          </span>
        </li>
      </ul>
      <p
        style={{
          marginTop: '12pt',
          marginBottom: '12pt',
          textAlign: 'justify',
          fontSize: '12pt',
        }}
      >
        <span style={{ fontFamily: '"Times New Roman"' }}>
          All clinical services facilitated via the Platform are rendered exclusively by independent medical providers,
          subject to their independent professional judgment. Lumimeds does not itself provide medical care or clinical
          services and makes no guarantees regarding the outcome of any clinical evaluation or treatment recommendation
        </span>
      </p>
      <ol start={2} type='I' style={{ margin: '0pt', paddingLeft: '0pt' }}>
        <li
          style={{
            marginTop: '12pt',
            marginLeft: '32pt',
            marginBottom: '12pt',
            textAlign: 'justify',
            paddingLeft: '4pt',
            fontFamily: '"Times New Roman"',
            fontSize: '12pt',
            fontWeight: 'bold',
          }}
        >
          ELIGIBILITY REQUIREMENTS
        </li>
      </ol>
      <p style={{ marginTop: '14pt', marginBottom: '14pt', fontSize: '12pt' }}>
        <span style={{ fontFamily: '"Times New Roman"' }}>
          To be eligible to enroll in a Lumimeds Membership, you represent and warrant that:
        </span>
      </p>
      <ul className='awlist1' style={{ margin: '0pt', paddingLeft: '0pt', listStyle: 'disc' }}>
        <li
          style={{
            marginTop: '14pt',
            marginLeft: '36pt',
            textIndent: '-18pt',
            fontFamily: 'Symbol',
            fontSize: '10pt',
          }}
        >
          <span
            style={{
              width: '13.4pt',
              font: '7pt "Times New Roman"',
              display: 'inline-block',
            }}
          >
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </span>
          <span style={{ fontFamily: '"Times New Roman"', fontSize: '12pt' }}>
            You are at least eighteen (18) years of age or legally emancipated;
          </span>
        </li>
        <li
          style={{
            marginLeft: '36pt',
            textIndent: '-18pt',
            fontFamily: 'Symbol',
            fontSize: '10pt',
          }}
        >
          <span
            style={{
              width: '13.4pt',
              font: '7pt "Times New Roman"',
              display: 'inline-block',
            }}
          >
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </span>
          <span style={{ fontFamily: '"Times New Roman"', fontSize: '12pt' }}>
            You reside in a U.S. state in which Lumimeds offers services;
          </span>
        </li>
        <li
          style={{
            marginLeft: '36pt',
            textIndent: '-18pt',
            fontFamily: 'Symbol',
            fontSize: '10pt',
          }}
        >
          <span
            style={{
              width: '13.4pt',
              font: '7pt "Times New Roman"',
              display: 'inline-block',
            }}
          >
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </span>
          <span style={{ fontFamily: '"Times New Roman"', fontSize: '12pt' }}>
            You have an active Lumimeds account in good standing; and
          </span>
        </li>
        <li
          style={{
            marginLeft: '36pt',
            marginBottom: '14pt',
            textIndent: '-18pt',
            fontFamily: 'Symbol',
            fontSize: '10pt',
          }}
        >
          <span
            style={{
              width: '13.4pt',
              font: '7pt "Times New Roman"',
              display: 'inline-block',
            }}
          >
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </span>
          <span style={{ fontFamily: '"Times New Roman"', fontSize: '12pt' }}>
            You have reviewed, understood, and accepted these Membership Terms, the{' '}
            <Link href='/privacypolicy' style={{ color: 'blue', textDecoration: 'underline' }}>
              Privacy Policy
            </Link>
            , and the{' '}
            <Link href='/termsofuse' style={{ color: 'blue', textDecoration: 'underline' }}>
              Terms of Use
            </Link>
            .
          </span>
        </li>
      </ul>
      <p
        style={{
          marginTop: '12pt',
          marginBottom: '12pt',
          textAlign: 'justify',
          fontSize: '12pt',
        }}
      >
        <strong>
          <span style={{ fontFamily: '"Times New Roman"' }}>&nbsp;</span>
        </strong>
      </p>
      <ol start={3} type='I' style={{ margin: '0pt', paddingLeft: '0pt' }}>
        <li
          style={{
            marginTop: '12pt',
            marginLeft: '32pt',
            marginBottom: '12pt',
            textAlign: 'justify',
            paddingLeft: '4pt',
            fontFamily: '"Times New Roman"',
            fontSize: '12pt',
            fontWeight: 'bold',
          }}
        >
          PAYMENT TERMS AND BILLING AUTHORIZATION
        </li>
      </ol>
      <p
        style={{
          marginTop: '12pt',
          marginBottom: '12pt',
          textAlign: 'justify',
          fontSize: '12pt',
        }}
      >
        <span style={{ fontFamily: '"Times New Roman"' }}>
          By enrolling in a Membership, you authorize Lumimeds or its designated payment processor to charge your
          selected payment method in accordance with the billing cycle applicable to your chosen plan (e.g., monthly
          installments, full-term prepayment, or otherwise, as disclosed at the time of purchase).
        </span>
      </p>
      <ol type='a' className='awlist2' style={{ margin: '0pt', paddingLeft: '0pt' }}>
        <li
          style={{
            marginTop: '12pt',
            marginLeft: '36pt',
            textIndent: '-18pt',
            textAlign: 'justify',
            fontFamily: '"Times New Roman"',
            fontSize: '12pt',
          }}
        >
          <span
            style={{
              width: '8.68pt',
              font: '7pt "Times New Roman"',
              display: 'inline-block',
            }}
          >
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </span>
          <strong>Commitment Term and Financial Obligation</strong>
        </li>
      </ol>
      <p
        style={{
          marginTop: '0pt',
          marginLeft: '36pt',
          marginBottom: '0pt',
          textAlign: 'justify',
          fontSize: '12pt',
        }}
      >
        <span style={{ fontFamily: '"Times New Roman"' }}>
          Each Membership plan requires a fixed-term financial commitment. Payment for the Membership may be collected
          in full at the time of enrollment or in scheduled installments, as specified at the time of purchase.
          Regardless of the selected payment method or frequency, you are financially obligated to pay the full amount
          due for the entire Membership term.
        </span>
      </p>
      <p
        style={{
          marginTop: '0pt',
          marginLeft: '36pt',
          marginBottom: '0pt',
          textAlign: 'justify',
          fontSize: '12pt',
        }}
      >
        <span style={{ fontFamily: '"Times New Roman"' }}>&nbsp;</span>
      </p>
      <p
        style={{
          marginTop: '0pt',
          marginLeft: '36pt',
          marginBottom: '0pt',
          textAlign: 'justify',
          fontSize: '12pt',
        }}
      >
        <span style={{ fontFamily: '"Times New Roman"' }}>
          No cancellations, early terminations, refunds, or proration of fees shall be permitted under any circumstances
          once a Membership term has commenced.
        </span>
      </p>
      <ol start={2} type='a' className='awlist3' style={{ margin: '0pt', paddingLeft: '0pt' }}>
        <li
          style={{
            marginLeft: '36pt',
            textIndent: '-18pt',
            textAlign: 'justify',
            fontFamily: '"Times New Roman"',
            fontSize: '12pt',
          }}
        >
          <span
            style={{
              width: '8pt',
              font: '7pt "Times New Roman"',
              display: 'inline-block',
            }}
          >
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </span>
          <strong>Delinquent Payments</strong>
        </li>
      </ol>
      <p
        style={{
          marginTop: '0pt',
          marginLeft: '36pt',
          marginBottom: '0pt',
          textAlign: 'justify',
          fontSize: '12pt',
        }}
      >
        <span style={{ fontFamily: '"Times New Roman"' }}>
          Failure to remit payment in accordance with your plan&#39;s billing cycle may result in immediate suspension
          of access to the Platform and services. Lumimeds reserves the right to pursue all lawful remedies to recover
          any outstanding amounts, including third-party collections or legal action.
        </span>
      </p>
      <ol start={3} type='a' className='awlist4' style={{ margin: '0pt', paddingLeft: '0pt' }}>
        <li
          style={{
            marginLeft: '36pt',
            textIndent: '-18pt',
            textAlign: 'justify',
            fontFamily: '"Times New Roman"',
            fontSize: '12pt',
          }}
        >
          <span
            style={{
              width: '8.68pt',
              font: '7pt "Times New Roman"',
              display: 'inline-block',
            }}
          >
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </span>
          <strong>Pricing Adjustments</strong>
        </li>
      </ol>
      <p
        style={{
          marginTop: '0pt',
          marginLeft: '36pt',
          marginBottom: '14pt',
          fontSize: '12pt',
        }}
      >
        <span style={{ fontFamily: '"Times New Roman"' }}>
          Lumimeds reserves the right to modify Membership pricing at its sole discretion. Any such changes will be
          communicated to you at least twenty-eight (28) days in advance of the effective date. Continued use of the
          Membership after such notice constitutes your acceptance of the revised pricing.
        </span>
      </p>
      <p
        style={{
          marginTop: '12pt',
          marginBottom: '12pt',
          textAlign: 'justify',
          fontSize: '12pt',
        }}
      >
        <span style={{ fontFamily: '"Times New Roman"' }}>
          Membership plans are non-cancelable and non-refundable. You may not terminate your Membership mid-term for any
          reason, including but not limited to dissatisfaction, changes in personal health status, relocation, or
          failure to engage with the services. All outstanding payments for the remainder of the commitment term shall
          remain due and payable.
        </span>
      </p>
      <ol start={4} type='I' style={{ margin: '0pt', paddingLeft: '0pt' }}>
        <li
          style={{
            marginTop: '14pt',
            marginLeft: '59pt',
            paddingLeft: '13pt',
            fontFamily: '"Times New Roman"',
            fontSize: '12pt',
            fontWeight: 'bold',
          }}
        >
          CANCELLATION AND TERMINATION
        </li>
      </ol>
      <p
        style={{
          marginTop: '0pt',
          marginLeft: '72pt',
          marginBottom: '0pt',
          fontSize: '12pt',
        }}
      >
        <span style={{ fontFamily: '"Times New Roman"' }}>&nbsp;</span>
      </p>
      <ol type='a' className='awlist5' style={{ margin: '0pt', paddingLeft: '0pt' }}>
        <li
          style={{
            marginLeft: '72pt',
            marginBottom: '14pt',
            textIndent: '-18pt',
            fontFamily: '"Times New Roman"',
            fontSize: '12pt',
          }}
        >
          <span
            style={{
              width: '8.68pt',
              font: '7pt "Times New Roman"',
              display: 'inline-block',
            }}
          >
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </span>
          <strong>&nbsp;Cancellation by the Member</strong>
        </li>
      </ol>
      <p style={{ marginTop: '14pt', marginBottom: '14pt', fontSize: '12pt' }}>
        <span style={{ fontFamily: '"Times New Roman"' }}>
          Participants may submit a request to withdraw from the Program before the end of their scheduled term;
          however, they will still be obligated to complete all payments due for the full duration of their commitment.
          This includes any outstanding subscription fees scheduled through the remainder of the agreed term.
        </span>
      </p>
      <ol start={2} type='a' className='awlist6' style={{ margin: '0pt', paddingLeft: '0pt' }}>
        <li
          style={{
            marginTop: '14pt',
            marginLeft: '72pt',
            marginBottom: '14pt',
            textIndent: '-18pt',
            fontFamily: '"Times New Roman"',
            fontSize: '12pt',
          }}
        >
          <span
            style={{
              width: '8pt',
              font: '7pt "Times New Roman"',
              display: 'inline-block',
            }}
          >
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </span>
          <strong>&nbsp;Termination by Lumimeds</strong>
        </li>
      </ol>
      <p style={{ marginTop: '14pt', marginBottom: '14pt', fontSize: '12pt' }}>
        <span style={{ fontFamily: '"Times New Roman"' }}>
          Lumimeds reserves the right to suspend or terminate your Membership, with or without prior notice, in the
          event of:
        </span>
      </p>
      <ul style={{ margin: '0pt', paddingLeft: '0pt', listStyle: 'disc' }}>
        <li
          style={{
            marginTop: '14pt',
            marginLeft: '27.6pt',
            paddingLeft: '8.4pt',
            fontFamily: 'serif',
            fontSize: '10pt',
          }}
        >
          <span style={{ fontFamily: '"Times New Roman"', fontSize: '12pt' }}>
            Non-compliance with clinical recommendations or Platform policies;
          </span>
        </li>
        <li
          style={{
            marginLeft: '27.6pt',
            paddingLeft: '8.4pt',
            fontFamily: 'serif',
            fontSize: '10pt',
          }}
        >
          <span style={{ fontFamily: '"Times New Roman"', fontSize: '12pt' }}>
            Abuse, harassment, or misuse of Lumimeds personnel, providers, or services;
          </span>
        </li>
        <li
          style={{
            marginLeft: '27.6pt',
            marginBottom: '14pt',
            paddingLeft: '8.4pt',
            fontFamily: 'serif',
            fontSize: '10pt',
          }}
        >
          <span style={{ fontFamily: '"Times New Roman"', fontSize: '12pt' }}>
            Failure to maintain valid payment credentials or fulfill payment obligations.
          </span>
        </li>
      </ul>
      <p style={{ marginTop: '14pt', marginBottom: '14pt', fontSize: '12pt' }}>
        <span style={{ fontFamily: '"Times New Roman"' }}>&nbsp;</span>
      </p>
      <p style={{ marginTop: '14pt', marginBottom: '14pt', fontSize: '12pt' }}>
        <span style={{ fontFamily: '"Times New Roman"' }}>
          Termination under this section shall not relieve you of your financial responsibility for the full term of
          your Membership.
        </span>
      </p>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', fontSize: '12pt' }}>
        <span style={{ fontFamily: '"Times New Roman"' }}>&nbsp;</span>
      </p>
      <ol start={5} type='I' style={{ margin: '0pt', paddingLeft: '0pt' }}>
        <li
          style={{
            marginTop: '14pt',
            marginLeft: '59pt',
            marginBottom: '14pt',
            paddingLeft: '13pt',
            fontFamily: '"Times New Roman"',
            fontSize: '12pt',
            fontWeight: 'bold',
          }}
        >
          &nbsp;GENERAL PROVISIONS
        </li>
      </ol>
      <p style={{ marginTop: '14pt', marginBottom: '14pt', fontSize: '12pt' }}>
        <span style={{ fontFamily: '"Times New Roman"' }}>&nbsp;</span>
      </p>
      <ol type='a' className='awlist7' style={{ margin: '0pt', paddingLeft: '0pt' }}>
        <li
          style={{
            marginTop: '14pt',
            marginLeft: '36pt',
            marginBottom: '14pt',
            textIndent: '-18pt',
            fontFamily: '"Times New Roman"',
            fontSize: '12pt',
            fontWeight: 'bold',
          }}
        >
          <span
            style={{
              width: '8pt',
              font: '7pt "Times New Roman"',
              display: 'inline-block',
            }}
          >
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </span>{' '}
          No Insurance Coverage
        </li>
      </ol>
      <p style={{ marginTop: '14pt', marginBottom: '14pt', fontSize: '12pt' }}>
        <span style={{ fontFamily: '"Times New Roman"' }}>
          The Membership is not health insurance and is not intended to replace comprehensive medical coverage. Lumimeds
          does not submit claims to any insurance provider on your behalf, nor does it guarantee that any portion of the
          services provided will be reimbursed by a third-party payer.
        </span>
      </p>
      <p style={{ marginTop: '14pt', marginBottom: '14pt', fontSize: '12pt' }}>
        <span style={{ fontFamily: '"Times New Roman"' }}>&nbsp;</span>
      </p>
      <ol start={2} type='a' className='awlist8' style={{ margin: '0pt', paddingLeft: '0pt' }}>
        <li
          style={{
            marginTop: '14pt',
            marginLeft: '36pt',
            marginBottom: '14pt',
            textIndent: '-18pt',
            fontFamily: '"Times New Roman"',
            fontSize: '12pt',
            fontWeight: 'bold',
          }}
        >
          <span
            style={{
              width: '7.33pt',
              font: '7pt "Times New Roman"',
              display: 'inline-block',
            }}
          >
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </span>{' '}
          Entire Agreement
        </li>
      </ol>
      <p style={{ marginTop: '14pt', marginBottom: '14pt', fontSize: '12pt' }}>
        <span style={{ fontFamily: '"Times New Roman"' }}>
          These Membership Terms, together with Lumimeds&#39;{' '}
          <Link href='/termsofuse' style={{ color: 'blue', textDecoration: 'underline' }}>
            Terms of Use
          </Link>{' '}
          and{' '}
          <Link href='/privacypolicy' style={{ color: 'blue', textDecoration: 'underline' }}>
            Privacy Policy
          </Link>
          , constitute the entire agreement between you and Lumimeds regarding the Membership and supersede any prior
          agreements or understandings, whether written or oral, relating to the subject matter herein.
        </span>
      </p>
      <p style={{ marginTop: '14pt', marginBottom: '14pt', fontSize: '12pt' }}>
        <span style={{ fontFamily: '"Times New Roman"' }}>&nbsp;</span>
      </p>
      <ol start={3} type='a' className='awlist9' style={{ margin: '0pt', paddingLeft: '0pt' }}>
        <li
          style={{
            marginTop: '14pt',
            marginLeft: '36pt',
            marginBottom: '14pt',
            textIndent: '-18pt',
            fontFamily: '"Times New Roman"',
            fontSize: '12pt',
            fontWeight: 'bold',
          }}
        >
          <span
            style={{
              width: '8.68pt',
              font: '7pt "Times New Roman"',
              display: 'inline-block',
            }}
          >
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </span>{' '}
          Amendments
        </li>
      </ol>
      <p style={{ marginTop: '14pt', marginBottom: '14pt', fontSize: '12pt' }}>
        <span style={{ fontFamily: '"Times New Roman"' }}>
          Lumimeds may update or amend these Membership Terms at any time. Material changes will be communicated in
          advance and become effective as of the date stated in the notice. Your continued participation in the
          Membership after the effective date constitutes your acceptance of the amended Membership Terms.
        </span>
      </p>
      <p style={{ marginTop: '14pt', marginBottom: '14pt', fontSize: '12pt' }}>
        <span style={{ fontFamily: '"Times New Roman"' }}>&nbsp;</span>
      </p>
      <ol start={4} type='a' className='awlist10' style={{ margin: '0pt', paddingLeft: '0pt' }}>
        <li
          style={{
            marginTop: '14pt',
            marginLeft: '36pt',
            marginBottom: '14pt',
            textIndent: '-18pt',
            fontFamily: '"Times New Roman"',
            fontSize: '12pt',
            fontWeight: 'bold',
          }}
        >
          <span
            style={{
              width: '7.33pt',
              font: '7pt "Times New Roman"',
              display: 'inline-block',
            }}
          >
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </span>{' '}
          Governing Law
        </li>
      </ol>
      <p style={{ marginTop: '14pt', marginBottom: '14pt', fontSize: '12pt' }}>
        <span style={{ fontFamily: '"Times New Roman"' }}>
          These Membership Terms shall be governed by and construed in accordance with the laws of the State of Nevada,
          without regard to conflict of law principles.
        </span>
      </p>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', fontSize: '12pt' }}>
        <span style={{ fontFamily: '"Times New Roman"' }}>&nbsp;</span>
      </p>
      <ol start={6} type='I' style={{ margin: '0pt', paddingLeft: '0pt' }}>
        <li
          style={{
            marginTop: '14pt',
            marginLeft: '59pt',
            marginBottom: '14pt',
            paddingLeft: '13pt',
            fontFamily: '"Times New Roman"',
            fontSize: '12pt',
            fontWeight: 'bold',
          }}
        >
          &nbsp;CONTACT INFORMATION
        </li>
      </ol>
      <p style={{ marginTop: '14pt', marginBottom: '14pt', fontSize: '12pt' }}>
        <span style={{ fontFamily: '"Times New Roman"' }}>&nbsp;</span>
      </p>
      <p style={{ marginTop: '14pt', marginBottom: '14pt', fontSize: '12pt' }}>
        <span style={{ fontFamily: '"Times New Roman"' }}>
          For questions or concerns regarding these Membership Terms or your Membership, please contact:
        </span>
      </p>
      <p style={{ marginTop: '14pt', marginBottom: '14pt', fontSize: '12pt' }}>
        <span style={{ fontFamily: '"Times New Roman"' }}>&nbsp;</span>
      </p>
      <p style={{ marginTop: '14pt', marginBottom: '14pt', fontSize: '12pt' }}>
        <span style={{ fontFamily: '"Times New Roman"' }}>Luminate Ventures LLC d/b/a Lumimeds</span>
      </p>
      <p style={{ marginTop: '14pt', marginBottom: '14pt', fontSize: '12pt' }}>
        <span style={{ fontFamily: '"Times New Roman"' }}>1810 E Sahara Ave. Ste 215</span>
      </p>
      <p style={{ marginTop: '14pt', marginBottom: '14pt', fontSize: '12pt' }}>
        <span style={{ fontFamily: '"Times New Roman"' }}>Las Vegas, NV 89104</span>
      </p>
      <p style={{ marginTop: '14pt', marginBottom: '14pt', fontSize: '12pt' }}>
        <span style={{ fontFamily: '"Times New Roman"' }}>help@lumimeds.com</span>
      </p>
      <p
        style={{
          marginTop: '12pt',
          marginBottom: '12pt',
          textIndent: '36pt',
          fontSize: '12pt',
        }}
      >
        <span style={{ fontFamily: '"Times New Roman"' }}>&nbsp;</span>
      </p>
      <p
        style={{
          marginTop: '12pt',
          marginBottom: '12pt',
          textAlign: 'justify',
          fontSize: '12pt',
        }}
      >
        <strong>
          <span style={{ fontFamily: '"Times New Roman"' }}>Last Modified: April 11, 2025</span>
        </strong>
      </p>
      <p
        style={{
          marginTop: '12pt',
          marginBottom: '12pt',
          textAlign: 'justify',
          fontSize: '12pt',
        }}
      >
        <span style={{ fontFamily: '"Times New Roman"' }}>&nbsp;</span>
      </p>

      {/* LegitScript Certification Section */}
      <Certification />
    </div>
  );
};

export default MemberTermsPage;
