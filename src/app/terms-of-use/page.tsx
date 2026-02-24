import Link from 'next/link';
import React from 'react';
import './styles.css';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Terms of Use | LumiMeds',
    description:
      "Review the terms and conditions governing your use of LumiMeds' telehealth platform and services. Your use signifies acceptance of these terms.",
    robots:
      process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true'
        ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
        : 'noindex, nofollow',
    alternates: {
      canonical: 'https://www.lumimeds.com/terms-of-use',
    },
    openGraph: {
      title: 'Terms of Use | LumiMeds',
      description:
        "Review the terms and conditions governing your use of LumiMeds' telehealth platform and services. Your use signifies acceptance of these terms.",
      type: 'website',
      url: 'https://www.lumimeds.com/terms-of-use',
    },
  };
}

const TermsOfUsePage = () => {
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
          <h1 className='tw-text-xl tw-font-serif tw-uppercase'>LUMIMEDS TERMS OF USE</h1>
        </strong>
      </p>
      <p
        style={{
          marginTop: '0pt',
          marginBottom: '12pt',
          textAlign: 'justify',
          fontSize: '12pt',
        }}
      >
        <strong>
          <span
            style={{
              fontFamily: '"Times New Roman"',
              textTransform: 'uppercase',
            }}
          >
            PLEASE CAREFULLY READ THE LINKED TERMS OF USE (
          </span>
        </strong>
        <strong>
          <span style={{ fontFamily: '"Times New Roman"' }}>the “Terms”</span>
        </strong>
        <strong>
          <span
            style={{
              fontFamily: '"Times New Roman"',
              textTransform: 'uppercase',
            }}
          >
            ) BEFORE USING THE LUMINATE VENTURES LLC WEBSITE (
          </span>
        </strong>
        <strong>
          <span style={{ fontFamily: '"Times New Roman"' }}>the</span>
        </strong>
        <strong>
          <span
            style={{
              fontFamily: '"Times New Roman"',
              textTransform: 'uppercase',
            }}
          >
            {' '}
            “
          </span>
        </strong>
        <strong>
          <span style={{ fontFamily: '"Times New Roman"' }}>Website</span>
        </strong>
        <strong>
          <span
            style={{
              fontFamily: '"Times New Roman"',
              textTransform: 'uppercase',
            }}
          >
            ”) AND THE LUMIMEDS PLATFORM (
          </span>
        </strong>
        <strong>
          <span style={{ fontFamily: '"Times New Roman"' }}>collectively, the</span>
        </strong>
        <strong>
          <span
            style={{
              fontFamily: '"Times New Roman"',
              textTransform: 'uppercase',
            }}
          >
            {' '}
            “
          </span>
        </strong>
        <strong>
          <span style={{ fontFamily: '"Times New Roman"' }}>PLATFORM</span>
        </strong>
        <strong>
          <span
            style={{
              fontFamily: '"Times New Roman"',
              textTransform: 'uppercase',
            }}
          >
            ”).{' '}
          </span>
        </strong>
        <span style={{ fontFamily: '"Times New Roman"' }}>The Website and&nbsp;</span>
        <span style={{ fontFamily: '"Times New Roman"', color: '#222222' }}>Platform</span>
        <span style={{ fontFamily: '"Times New Roman"' }}>, including all relevant&nbsp;</span>
        <u>
          <span style={{ fontFamily: '"Times New Roman"' }}>
            content, products, services, and functionality associated with the Website and&nbsp;
          </span>
          <span style={{ fontFamily: '"Times New Roman"', color: '#222222' }}>
            Platform and any other affiliated software or application owned by Luminate Ventures LLC d/b/a Lumimeds
          </span>
          <span style={{ fontFamily: '"Times New Roman"' }}>, are collectively referred to as the “</span>
          <strong>
            <span style={{ fontFamily: '"Times New Roman"' }}>Services</span>
          </strong>
          <span style={{ fontFamily: '"Times New Roman"' }}>.”</span>
        </u>
      </p>
      <p
        style={{
          marginTop: '0pt',
          marginBottom: '12pt',
          textAlign: 'justify',
          fontSize: '12pt',
        }}
      >
        <strong>
          <span
            style={{
              fontFamily: '"Times New Roman"',
              textTransform: 'uppercase',
            }}
          >
            BY ACCESSING OR USING THE SERVICES, YOU CONSENT TO BE BOUND BY THESE TERMS. IF YOU DO NOT AGREE TO ACCEPT
            THESE TERMS, DO NOT ACCESS OR USE THE SERVICES.
          </span>
        </strong>
      </p>
      <p
        style={{
          marginTop: '0pt',
          marginBottom: '12pt',
          textAlign: 'justify',
          fontSize: '12pt',
        }}
      >
        <span style={{ fontFamily: '"Times New Roman"' }}>Any information that Lumimeds (“</span>
        <strong>
          <span style={{ fontFamily: '"Times New Roman"' }}>Lumimeds</span>
        </strong>
        <span style={{ fontFamily: '"Times New Roman"' }}>”, or “</span>
        <strong>
          <span style={{ fontFamily: '"Times New Roman"' }}>we</span>
        </strong>
        <span style={{ fontFamily: '"Times New Roman"' }}>
          ”) collects through your use of the Services is subject to the Lumimeds{' '}
          <Link href='/privacypolicy' style={{ color: 'blue', textDecoration: 'underline' }}>
            Privacy Policy
          </Link>
          , which is part of these Terms.
        </span>
      </p>
      <p
        style={{
          marginTop: '0pt',
          marginBottom: '12pt',
          textAlign: 'justify',
          fontSize: '12pt',
        }}
      >
        <u>
          <span style={{ fontFamily: '"Times New Roman"' }}>
            By continuing to use the Services, You agree as follows
          </span>
        </u>
        <span style={{ fontFamily: '"Times New Roman"' }}>:</span>
        <a />
        <a />
      </p>
      <ol type={'1'} style={{ margin: '0pt', paddingLeft: '0pt' }}>
        <li
          style={{
            marginLeft: '15.01pt',
            marginBottom: '6pt',
            textAlign: 'justify',
            paddingLeft: '20.99pt',
            fontSize: '12pt',
          }}
        >
          <span style={{ fontFamily: '"Times New Roman"' }}>
            You are at least 18 years old or have been legally emancipated
          </span>
          <a />
          <a />
        </li>
        <li
          style={{
            marginLeft: '15.01pt',
            marginBottom: '6pt',
            textAlign: 'justify',
            paddingLeft: '20.99pt',
            fontSize: '12pt',
          }}
        >
          <span style={{ fontFamily: '"Times New Roman"' }}>
            You understand and agree that these Terms are a legally binding agreement and the equivalent of a signed,
            written contract
          </span>
          <a />
        </li>
        <li
          style={{
            marginLeft: '15.01pt',
            marginBottom: '6pt',
            textAlign: 'justify',
            paddingLeft: '20.99pt',
            fontSize: '12pt',
          }}
        >
          <span style={{ fontFamily: '"Times New Roman"' }}>
            You will use the Services in a manner consistent with applicable laws and regulations and these Terms, as
            they may be amended by Lumimeds from time to time; and
          </span>
          <a />
        </li>
        <li
          style={{
            marginLeft: '15.01pt',
            marginBottom: '6pt',
            textAlign: 'justify',
            paddingLeft: '20.99pt',
            fontSize: '12pt',
          }}
        >
          <span style={{ fontFamily: '"Times New Roman"' }}>
            You understand, accept, and have received these Terms and the Lumimeds{' '}
            <Link href='/privacypolicy' style={{ color: 'blue', textDecoration: 'underline' }}>
              Privacy Policy
            </Link>
            , and acknowledge and demonstrate that You can access these Terms and the Lumimeds{' '}
            <Link href='/privacypolicy' style={{ color: 'blue', textDecoration: 'underline' }}>
              Privacy Policy
            </Link>{' '}
            at will.
          </span>
          <span style={{ fontFamily: '"Times New Roman"' }}>&nbsp;&nbsp;</span>
        </li>
      </ol>
      <p
        style={{
          marginTop: '0pt',
          marginBottom: '12pt',
          textAlign: 'justify',
          fontSize: '12pt',
        }}
      >
        <strong>
          <span style={{ fontFamily: '"Times New Roman"' }}>
            If You do not agree with and accept the Terms, please discontinue all further use of the Services.
          </span>
        </strong>
        <span style={{ fontFamily: '"Times New Roman"' }}>
          &nbsp;Do not log into the Website or Platform and immediately delete all files, if any, of the associated
          Website and Platform from Your device(s).&nbsp;
        </span>
      </p>
      <p
        style={{
          marginTop: '0pt',
          marginBottom: '8pt',
          textAlign: 'justify',
          lineHeight: '108%',
          fontSize: '12pt',
        }}
      >
        <strong>
          <u>
            <span
              style={{
                fontFamily: '"Times New Roman"',
                textTransform: 'uppercase',
              }}
            >
              ARBITRATION NOTICE
            </span>
          </u>
        </strong>
        <strong>
          <span
            style={{
              fontFamily: '"Times New Roman"',
              textTransform: 'uppercase',
            }}
          >
            : EXCEPT IF YOU OPT-OUT AND EXCEPT FOR CERTAIN TYPES OF DISPUTES DESCRIBED IN THE dispute resolution section
            below, YOU AGREE THAT DISPUTES BETWEEN YOU AND Lumimeds WILL BE RESOLVED BY BINDING, INDIVIDUAL ARBITRATION
            and you waive your right TO PARTICIPATE IN A CLASS ACTION LAWSUIT OR CLASS-WIDE ARBITRATION. YOU CAN OPT-OUT
            OF THE ARBITRATION AGREEMENT BY CONTACTING HELP@LUMIMEDS.COM WITHIN 30 DAYS OF ACCEPTING THESE TERMS.
          </span>
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
        <strong>
          <u>
            <span style={{ fontFamily: '"Times New Roman"' }}>TERMS OF USE</span>
          </u>
        </strong>
        <span style={{ fontFamily: '"Times New Roman"' }}>
          &nbsp;THIS SERVICE IS ONLY CONTEMPLATED FOR SPECIFIC NON-EMERGENT MEDICAL CONDITIONS OR CONCERNS. IF YOU ARE
          EXPERIENCING A MEDICAL EMERGENCY, CALL YOUR DOCTOR OR 911 IMMEDIATELY.
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
          PLEASE READ THESE TERMS OF USE CAREFULLY BEFORE USING OUR SERVICES OR OUR WEBSITE.
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
          INTRODUCTION
        </li>
      </ol>
      <p
        style={{
          marginTop: '12pt',
          marginBottom: '12pt',
          textIndent: '36pt',
          textAlign: 'justify',
          fontSize: '12pt',
        }}
      >
        <span style={{ fontFamily: '"Times New Roman"' }}>
          These terms of use (the “Terms”) describe your rights and responsibilities with regard to the Lumimeds
          website&nbsp;
        </span>
        <a href='http://www.lumimeds.com' style={{ textDecoration: 'none' }}>
          <u>
            <span style={{ fontFamily: '"Times New Roman"', color: '#467886' }}>www.lumimeds.com</span>
          </u>
        </a>
        <span style={{ fontFamily: '"Times New Roman"' }}>
          &nbsp;(the “Website”) owned and operated by Luminate Ventures LLC d/b/a Lumimeds. In these Terms, “we”, “our”,
          “us”, and “Lumimeds” collectively refer to Lumimeds, and its subsidiaries. The terms “you” and “yours” refer
          to the person using the Website. Use of the Website is governed by these Terms and our{' '}
          <Link href='/privacypolicy' style={{ color: 'blue', textDecoration: 'underline' }}>
            Privacy Policy
          </Link>
          . By accessing or using the Website, you acknowledge that you have read, understood, and agreed to be legally
          bound by and comply with these Terms and our{' '}
          <Link href='/privacypolicy' style={{ color: 'blue', textDecoration: 'underline' }}>
            Privacy Policy
          </Link>
          .
        </span>
      </p>
      <p
        style={{
          marginTop: '12pt',
          marginBottom: '12pt',
          textIndent: '36pt',
          textAlign: 'justify',
          fontSize: '12pt',
        }}
      >
        <span style={{ fontFamily: '"Times New Roman"' }}>
          Lumimeds is provider of a technology platform that facilitates access to a range of products and services,
          some of which may be provided in conjunction with independent healthcare professionals. These services may
          include wellness tools, education, diagnostic coordination, and delivery logistics. Lumimeds does not itself
          provide medical advice, clinical consultations, diagnosis, or treatment and is not a healthcare provider.
          Lumimeds works with independent, licensed healthcare providers to facilitate your access to a variety of
          health and wellness services, such as weight loss treatment, prescription medication management, or other
          preventive care solutions all via the Lumimeds Website and Platform. Lumimeds provides non-clinical
          administrative and operational services to, and facilitates your connection and communication with, its
          affiliated providers via interactive real-time audio video technology as well as asynchronous communication
          methods, where deemed appropriate.
        </span>
      </p>
      <p
        style={{
          marginTop: '12pt',
          marginBottom: '12pt',
          textIndent: '36pt',
          textAlign: 'justify',
          fontSize: '12pt',
        }}
      >
        <span style={{ fontFamily: '"Times New Roman"' }}>
          Lumimeds affiliated providers may include the following professional entities/individual entities:
        </span>
      </p>
      <ul style={{ margin: '0pt', paddingLeft: '0pt', listStyleType: 'disc' }}>
        <li
          style={{
            marginTop: '12pt',
            marginLeft: '64.52pt',
            marginBottom: '12pt',
            textAlign: 'justify',
            paddingLeft: '7.48pt',
            fontFamily: 'serif',
            fontSize: '12pt',
          }}
        >
          <span style={{ fontFamily: '"Times New Roman"' }}>Telegra MD LLC</span>
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
          IF YOU ARE HAVING A MEDICAL EMERGENCY, OR HAVE OR SUSPECT THAT YOU HAVE AN URGENT MEDICAL PROBLEM OR CONDITION
          CALL 911 IMMEDIATELY. Lumimeds DOES NOT PROVIDE MEDICAL CARE.
        </span>
      </p>
      <p
        style={{
          marginTop: '12pt',
          marginBottom: '12pt',
          textIndent: '36pt',
          textAlign: 'justify',
          fontSize: '12pt',
        }}
      >
        <span style={{ fontFamily: '"Times New Roman"' }}>
          You agree that when you use or enter the Website, you affirmatively consent to conduct business electronically
          with Lumimeds and You agree and consent to Lumimeds, Lumimeds affiliates or certain affiliated professional
          entities sending you disclosures, messages, notices, and other communications to your designated mobile phone
          and email account. You understand that you have a choice to select any health care provider and pharmacy and,
          when you use or enter the Website, you affirmatively choose to use the healthcare providers affiliated with
          Lumimeds. If you do not agree with any of these Terms or our{' '}
          <Link href='/privacypolicy' style={{ color: 'blue', textDecoration: 'underline' }}>
            Privacy Policy
          </Link>
          , you may not use the Website.
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
          MODIFICATION OF THE TERMS
        </li>
      </ol>
      <p
        style={{
          marginTop: '12pt',
          marginBottom: '12pt',
          textIndent: '36pt',
          textAlign: 'justify',
          fontSize: '12pt',
        }}
      >
        <span style={{ fontFamily: '"Times New Roman"' }}>
          We reserve the right, in our sole discretion, to amend these Terms, in whole or in part, at any time and for
          any reason, without penalty or liability to you or any third party. You should check the Terms from time to
          time when you use the Website to determine if any changes have been made. You can determine when the Terms
          were last revised by referring to the “Last Modified” notation above. If you use the Website after the amended
          Terms have been posted, you will be deemed to have agreed to the amended Terms. If any of the provisions of
          these Terms are not acceptable to you, your sole and exclusive remedy is to discontinue your use of the
          Website.
        </span>
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
          DESCRIPTION OF LUMIMEDS
        </li>
      </ol>
      <p
        style={{
          marginTop: '12pt',
          marginBottom: '12pt',
          textIndent: '36pt',
          textAlign: 'justify',
          fontSize: '12pt',
        }}
      >
        <span style={{ fontFamily: '"Times New Roman"' }}>
          You understand and agree that the Website is intended to facilitate the following services (the “Services”):
          the development and gathering of health care records and information with retention of the same for use in
          medical provider encounters and communications; administrative support in connection with scheduling and
          payment for Health Care Services; administrative support in connection with coordinating optional fulfillment
          and payment for diagnostic or public health screening testing, weight loss services, and prescription
          medications ordered or prescribed by medical providers performing Health Care Services; and telecommunications
          and technology support for using the Website as a means of direct access to medical providers provided by
          affiliated professional entities for communication, consultations, assessments, and treatment by such medical
          providers.
        </span>
      </p>
      <p
        style={{
          marginTop: '12pt',
          marginBottom: '12pt',
          textIndent: '36pt',
          textAlign: 'justify',
          fontSize: '12pt',
        }}
      >
        <span style={{ fontFamily: '"Times New Roman"' }}>
          You understand that the Website gathers unique information from you to enable an affiliated medical provider
          through the Health Care Services to determine whether a prescription or a diagnostic test is indicated and
          appropriate for you, including applicable health information (such as your past and present health conditions,
          medications, and blood pressure), diagnostic tests, as applicable, and personal information (such as your
          name, location, and demographic information) (collectively, “Your Information”). You further understand and
          agree that after reviewing Your Information, the medical provider, in his or her independent professional
          judgment, will determine whether to prescribe you medication, other treatment, or, alternatively, recommend
          that you consult with alternative clinical resources (the “Health Care Services”).
        </span>
      </p>
      <p
        style={{
          marginTop: '12pt',
          marginBottom: '12pt',
          textIndent: '36pt',
          textAlign: 'justify',
          fontSize: '12pt',
        }}
      >
        <span style={{ fontFamily: '"Times New Roman"' }}>
          By accepting these Terms, you agree and acknowledge that we do not provide clinical or medical services,
          laboratory or pharmacy services, or supplemental manufacturing services. You give us consent to send and
          disclose to the affiliated professional entities and their medical providers all Your Information so that you
          may receive Health Care Services. Further, you consent to our delivery of Your Information to Lumimeds
          affiliated and unaffiliated pharmacies, laboratories, and other testing companies as part of coordinating
          desired fulfillment and payment for testing, prescription medications, and medical devices recommended as part
          of the Health Care Services.
        </span>
      </p>
      <p
        style={{
          marginTop: '12pt',
          marginBottom: '12pt',
          textIndent: '36pt',
          textAlign: 'justify',
          fontSize: '12pt',
        }}
      >
        <span style={{ fontFamily: '"Times New Roman"' }}>
          All medical providers who deliver Health Care Services through the Website are: (i) independent professionals
          contracted or employed with affiliated professional entities that coordinate with Lumimeds, and (ii) solely
          responsible for such Health Care Services provided to you. Lumimeds does not provide any Health Care Services
          through the Website and is not licensed to practice medicine. Lumimeds does not control or interfere with the
          provision of Health Care Services by the medical providers and affiliated professional entities, each of whom
          is independent and solely responsible for the Health Care Services provided to you. Therefore, you understand
          and agree that Lumimeds is not responsible for Health Care Services, or your use of any Health Care Services,
          provided by a medical provider or affiliated professional entity, including any personal injury or property
          damage. Any medical advice provided by a provider using information from the Services is based on the personal
          health data you provide. If you do not provide complete and accurate personal health information, the medical
          advice you receive may not be accurate or appropriate. Questions and information collected through the
          Services are designed for informational and/or research purposes and to identify potential patterns in
          symptomologies and treatments. The Services and/or any data derived from the Services are in no way intended
          to replace the independent clinical judgment of a qualified healthcare professional.
        </span>
      </p>
      <p
        style={{
          marginTop: '12pt',
          marginBottom: '12pt',
          textIndent: '36pt',
          textAlign: 'justify',
          fontSize: '12pt',
        }}
      >
        <span style={{ fontFamily: '"Times New Roman"' }}>
          YOU AGREE AND ACKNOWLEDGE THAT LUMIMEDS IS IN NO WAY PROVIDING DIAGNOSIS OR TREATMENT TO YOU. YOU FURTHER
          ACKNOWLEDGE AND AGREE THAT THE INFORMATION, PROCESSES, PRODUCTS, AND OTHER ITEMS REFERENCED AS PART OF THE
          SERVICES ARE NOT INTENDED AS A RECOMMENDATION OR ENDORSEMENT OF ANY COURSE OF ACTION, INFORMATION, OR PRODUCT.
          WE EXPLICITLY DISCLAIM THE CREATION OF A PROVIDER-PATIENT RELATIONSHIP WITH YOU.
        </span>
      </p>
      <p
        style={{
          marginTop: '12pt',
          marginBottom: '12pt',
          textIndent: '36pt',
          textAlign: 'justify',
          fontSize: '12pt',
        }}
      >
        <span style={{ fontFamily: '"Times New Roman"' }}>
          THE SERVICES CAN NOT AND ARE NOT DESIGNED, INTENDED, OR APPROPRIATE TO REPLACE THE RELATIONSHIP BETWEEN HEALTH
          CARE PROFESSIONALS AND PATIENTS OR TO ADDRESS SERIOUS, EMERGENT, OR LIFE-THREATENING MEDICAL CONDITIONS AND
          SHOULD NOT BE USED IN THOSE CIRCUMSTANCES. FOR AVOIDANCE OF DOUBT, THE USE OF THE SERVICES DOES NOT GUARANTEE
          ANY MEDICAL DIAGNOSIS INCLUDING ISSUANCE OF A PRESCRIPTION.
        </span>
      </p>
      <p
        style={{
          marginTop: '12pt',
          marginBottom: '12pt',
          textIndent: '36pt',
          textAlign: 'justify',
          fontSize: '12pt',
        }}
      >
        <span style={{ fontFamily: '"Times New Roman"' }}>
          Lumimeds does not provide clinical services. Clinical services are provided by telehealth providers and
          affiliated clinicians, independent entities not affiliated with Lumimeds.&nbsp;
        </span>
        <u>
          <span style={{ fontFamily: '"Times New Roman"' }}>
            By requesting clinical services, you agree that your relationship to the telehealth provider groups is
            independent and governed by these Terms of Use and our telehealth providers’ terms of use.
          </span>
        </u>
        {/* <a href="#_cmnt1" style={{ textDecoration: "none" }}>
						<span style={{ fontFamily: '"Times New Roman"' }}>[A1]</span>
					</a> */}
        <span style={{ fontFamily: '"Times New Roman"' }}>
          &nbsp;If at any time you are concerned about your care or treatment, or You believe or suspect or someone else
          advises you that you have a serious or life-threatening condition, call 9-1-1 in areas where that service is
          available, or go to the nearest emergency room.&nbsp;
        </span>
        <u>
          <span style={{ fontFamily: '"Times New Roman"' }}>
            General information available through the Services about medical conditions, symptomology, available drugs,
            treatment options, and other educational articles and videos is provided for general educational purposes
            only. Never disregard, avoid, or delay obtaining medical advice from a physician or other qualified
            healthcare professional because of something contained in the Services.
          </span>
        </u>
        {/* <a href="#_cmnt2" style={{ textDecoration: "none" }}>
						<span style={{ fontFamily: '"Times New Roman"' }}>[A2]</span>
					</a> */}
      </p>
      <ol start={4} type='I' style={{ margin: '0pt', paddingLeft: '0pt' }}>
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
          ELIGIBILITY
        </li>
      </ol>
      <p
        style={{
          marginTop: '12pt',
          marginBottom: '12pt',
          textIndent: '36pt',
          textAlign: 'justify',
          fontSize: '12pt',
        }}
      >
        <span style={{ fontFamily: '"Times New Roman"' }}>
          To use the Services through the Website, the following must be true: You must be 18 years or older. You live
          in the United States and in a state or territory where the Services are available. You agree to be legally
          bound by and comply with these Terms of Use or. You must have compatible computing and/or mobile devices,
          access to the Internet, and certain necessary software in order to use the Website. Fees and charges may apply
          to your use of the mobile services and to the Internet.
        </span>
      </p>
      <ol start={5} type='I' style={{ margin: '0pt', paddingLeft: '0pt' }}>
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
          AVAILABILITY
        </li>
      </ol>
      <p
        style={{
          marginTop: '12pt',
          marginBottom: '12pt',
          textIndent: '36pt',
          textAlign: 'justify',
          fontSize: '12pt',
        }}
      >
        <span style={{ fontFamily: '"Times New Roman"' }}>
          The Services are currently available to individuals located in certain states and that list is subject to
          change from time to time at the sole discretion of Lumimeds.
        </span>
      </p>
      <ol start={6} type='I' style={{ margin: '0pt', paddingLeft: '0pt' }}>
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
          REGISTRATION, USER ACCOUNTS, AND USER DATA
        </li>
      </ol>
      <p
        style={{
          marginTop: '12pt',
          marginBottom: '12pt',
          textIndent: '36pt',
          textAlign: 'justify',
          fontSize: '12pt',
        }}
      >
        <span style={{ fontFamily: '"Times New Roman"' }}>
          Although certain parts of the Website are accessible by any individual, you are obligated to register with
          Lumimeds in order to access the Services. The Services are available only to users who have registered with
          Lumimeds and to other persons affiliated with Lumimeds who have been granted accounts with usernames and
          passwords. The Website may not be accessible at any time, for any period, or for any reason, and Lumimeds will
          not be liable if for any reason all or any part of the Website is unavailable at any time or for any period.
          Upon registration of an account, the Website may contain forms or fields that allow you to enter, submit or
          transmit to Lumimeds user information or data (“User Data”) on or through the Website. You understand and
          agree that, consistent with applicable law, any User Data provided by you on or through the Website may be
          used, copied or displayed by Lumimeds, Lumimeds may create derivative works of any such data, and Lumimeds may
          provide such data to our service providers, our successors and assigns, and medical providers and their
          affiliated professional entities, in performance of the Services.
        </span>
      </p>
      <ol start={7} type='I' style={{ margin: '0pt', paddingLeft: '0pt' }}>
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
          YOUR RESPONSIBILITIES AND ACKNOWLEDGEMENT
        </li>
      </ol>
      <p
        style={{
          marginTop: '12pt',
          marginBottom: '12pt',
          textIndent: '36pt',
          textAlign: 'justify',
          fontSize: '12pt',
        }}
      >
        <span style={{ fontFamily: '"Times New Roman"' }}>
          As a condition of your use of the Services through the Website, you agree to the following:
        </span>
      </p>
      <p
        style={{
          marginTop: '12pt',
          marginBottom: '12pt',
          textIndent: '36pt',
          textAlign: 'justify',
          fontSize: '12pt',
        }}
      >
        <span style={{ fontFamily: '"Times New Roman"' }}>
          All Your Information provided through the Website is accurate, complete and correct, and you will accurately
          maintain and update any of Your Information that you have provided to Lumimeds.
        </span>
      </p>
      <p
        style={{
          marginTop: '12pt',
          marginBottom: '12pt',
          textIndent: '36pt',
          textAlign: 'justify',
          fontSize: '12pt',
        }}
      >
        <span style={{ fontFamily: '"Times New Roman"' }}>
          Your permission to use the Website is personal to you; the Website will be used only by you, or you are using
          the Website to facilitate the Services on behalf of a minor for whom you have legal authority to act, and your
          identification information is accurate and truthful. You agree to keep confidential your username and password
          and that you will exit from your account at the end of each session. You are responsible for all activities
          that occur under your account and for maintaining the confidentiality of your password. You are responsible
          for changing your password promptly if you think it has been compromised. You may not transfer or share your
          password with anyone, or create more than one account. You may not use anyone else’s account at any time.
        </span>
      </p>
      <p
        style={{
          marginTop: '12pt',
          marginBottom: '12pt',
          textIndent: '36pt',
          textAlign: 'justify',
          fontSize: '12pt',
        }}
      >
        <span style={{ fontFamily: '"Times New Roman"' }}>
          You agree to immediately notify Lumimeds of any unauthorized use of your username, password or any other
          breach of security that you become aware of involving or relating to the Services by emailing Lumimeds at
          help@lumimeds.com.
        </span>
      </p>
      <p
        style={{
          marginTop: '12pt',
          marginBottom: '12pt',
          textIndent: '36pt',
          textAlign: 'justify',
          fontSize: '12pt',
        }}
      >
        <span style={{ fontFamily: '"Times New Roman"' }}>
          You may be asked to provide additional information to Lumimeds, its affiliated professional entities, or
          applicable medical provider(s) for the purpose of providing Health Care Services or fulfilling a prescription.
          You may elect to withhold requested information; however, if you do so, you may not use the Website or any
          other related services.
        </span>
      </p>
      <p
        style={{
          marginTop: '12pt',
          marginBottom: '12pt',
          textIndent: '36pt',
          textAlign: 'justify',
          fontSize: '12pt',
        }}
      >
        <span style={{ fontFamily: '"Times New Roman"' }}>
          You understand and agree that provision of Health Care Services through the Website depends on the
          completeness and accuracy of Your Information. Lumimeds is unable to verify all of Your Information.
          Therefore, Lumimeds is not responsible for any consequences if Your Information is inaccurate or incomplete.
          If Your Information is inaccurate, incomplete, or not maintained, or Lumimeds has reasonable grounds to
          suspect as much, Lumimeds has the right to suspend or terminate your account and your use of the Services. In
          addition, Lumimeds may take any and all actions it deems necessary or reasonable to maintain the security of
          the Website, Services and your account.
        </span>
      </p>
      <ol start={8} type='I' style={{ margin: '0pt', paddingLeft: '0pt' }}>
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
          RESTRICTIONS ON USE
        </li>
      </ol>
      <p
        style={{
          marginTop: '12pt',
          marginBottom: '12pt',
          textIndent: '36pt',
          textAlign: 'justify',
          fontSize: '12pt',
        }}
      >
        <span style={{ fontFamily: '"Times New Roman"' }}>
          You will not use, or encourage or permit others to use, our Website except as expressly permitted in these
          Terms. You will not:&nbsp;
        </span>
      </p>
      <ol type='a' className='awlist1' style={{ margin: '0pt', paddingLeft: '0pt' }}>
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
          Use or attempt to use the Website or the Services for any purpose that infringes, misappropriates, or
          otherwise violates any intellectual property right or other right of any third party, or that violates any
          applicable law or regulation, or is prohibited by these Terms;
        </li>
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
          “Jailbreak” your mobile operating system. The Website is intended for use only on a mobile phone that runs an
          unmodified manufacturer-approved operating system. Using the Website on a mobile phone with a modified
          operating system may undermine security features that are intended to protect your information from
          unauthorized or unintended disclosure. You may compromise your information if you use the Website on a mobile
          phone that has been modified. Use of the Website on a mobile phone with a modified operating system is a
          material breach of these Terms;
        </li>
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
          License, sublicense, sell, resell, transfer, assign, distribute or otherwise commercially exploit or make
          available to any third party the Website or related materials in any way;
        </li>
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
          Use or access the Website to create or develop competing products or services or for any other purpose that is
          to Lumimeds’s detriment or commercial disadvantage;
        </li>
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
          Take any action or use the Website in any manner which could damage, destroy, disrupt, disable, impair,
          overburden, interfere with, or otherwise impede or harm in any manner our Website or any content, in whole or
          in part;
        </li>
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
              width: '10.01pt',
              font: '7pt "Times New Roman"',
              display: 'inline-block',
            }}
          >
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </span>
          Disrupt, interfere with, violate the security of, or attempt to gain unauthorized access to our Website or any
          computer network;
        </li>
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
          Bypass, breach, avoid, remove, deactivate, impair, descramble, or otherwise circumvent any security device,
          protection, or technological measure implemented by Lumimeds or any of our service providers to protect our
          Website;
        </li>
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
          Input, upload, transmit, distribute, or otherwise run or propagate any virus, application, Trojan horse, or
          any other harmful computer code that could damage or alter a computer, portable device, computer network,
          communication network, data, or our Website, or any other system, device, or property;
        </li>
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
              width: '10.67pt',
              font: '7pt "Times New Roman"',
              display: 'inline-block',
            }}
          >
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </span>
          Remove, delete, alter, or obscure any trademarks, specifications, warranties, or disclaimers, or any
          copyright, trademark, patent, or other intellectual property or proprietary rights notices from our Website or
          any content made available to you on or through our Website;
        </li>
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
              width: '10.67pt',
              font: '7pt "Times New Roman"',
              display: 'inline-block',
            }}
          >
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </span>
          Use any manual process or automated device to monitor or copy any content made available on or through our
          Website for any unauthorized purpose except as permitted in Section ‎‎X;
        </li>
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
          Copy, duplicate, download, store in a retrieval system, publish, transmit or otherwise reproduce, transfer,
          distribute, store, disseminate, aggregate, use as a component of or as the basis for a database or otherwise
          use in any form or by any means any data, text, reports, or other materials related to Lumimeds or third-party
          content from the Website; or
        </li>
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
              width: '10.67pt',
              font: '7pt "Times New Roman"',
              display: 'inline-block',
            }}
          >
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </span>
          Encourage or enable any other individual to do any of the foregoing.
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
        <span style={{ fontFamily: '"Times New Roman"' }}>&nbsp;</span>
      </p>
      <ol start={9} type='I' style={{ margin: '0pt', paddingLeft: '0pt' }}>
        <li
          style={{
            marginLeft: '32pt',
            marginBottom: '12pt',
            textAlign: 'justify',
            paddingLeft: '4pt',
            fontFamily: '"Times New Roman"',
            fontSize: '12pt',
            fontWeight: 'bold',
          }}
        >
          LICENSE AND USE
        </li>
      </ol>
      <p
        style={{
          marginTop: '12pt',
          marginBottom: '12pt',
          textIndent: '36pt',
          textAlign: 'justify',
          fontSize: '12pt',
        }}
      >
        <span style={{ fontFamily: '"Times New Roman"' }}>
          Subject to your compliance with these Terms, Lumimeds grants you a personal, limited, revocable, nonexclusive,
          and nontransferable license to view, download, access, and use the Website and its content, solely for your
          personal and non-commercial use. No other right, title, or interest in or to the Website is transferred to
          you, and all rights not expressly granted are reserved by Lumimeds or its licensors. You are not permitted to
          reproduce, publish, transmit, distribute, display, modify, create derivative works from, sell or participate
          in any sale of, or exploit in any way, in whole or in part, any such content for commercial use.
        </span>
      </p>
      <p
        style={{
          marginTop: '12pt',
          marginBottom: '12pt',
          textIndent: '36pt',
          textAlign: 'justify',
          fontSize: '12pt',
        }}
      >
        <span style={{ fontFamily: '"Times New Roman"' }}>
          You grant Lumimeds a non-exclusive, perpetual, royalty-free right to use de-identified or aggregated data
          submitted through your use of the Services to support platform improvements and analytics, in accordance with
          the{' '}
          <Link href='/privacypolicy' style={{ color: 'blue', textDecoration: 'underline' }}>
            Privacy Policy
          </Link>
          . Furthermore, you grant Lumimeds a perpetual, non-exclusive license to use your personal and health-related
          information solely to operate and improve the Services, in accordance with applicable law and our{' '}
          <Link href='/privacypolicy' style={{ color: 'blue', textDecoration: 'underline' }}>
            Privacy Policy
          </Link>
          .
        </span>
      </p>
      <ol start={10} type='I' style={{ margin: '0pt', paddingLeft: '0pt' }}>
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
          DISCLAIMER; LIMITED HEALTH CARE SERVICES
        </li>
      </ol>
      <p
        style={{
          marginTop: '12pt',
          marginBottom: '12pt',
          textIndent: '36pt',
          textAlign: 'justify',
          fontSize: '12pt',
        }}
      >
        <span style={{ fontFamily: '"Times New Roman"' }}>
          The Website is structured for use specific to certain Health Care Services and is not, and should not, be
          considered, or used as comprehensive medical advice, care, diagnosis or treatment.
        </span>
      </p>
      <p
        style={{
          marginTop: '12pt',
          marginBottom: '12pt',
          textIndent: '36pt',
          textAlign: 'justify',
          fontSize: '12pt',
        }}
      >
        <span style={{ fontFamily: '"Times New Roman"' }}>
          Always seek the advice of your physician or other qualified healthcare provider with any questions you may
          have regarding general personal health, medical conditions, or drugs or medications, and before commencing or
          discontinuing any course of treatment, drug or medication.
        </span>
      </p>
      <ol start={11} type='I' style={{ margin: '0pt', paddingLeft: '0pt' }}>
        <li
          style={{
            marginTop: '12pt',
            marginLeft: '32pt',
            textAlign: 'justify',
            paddingLeft: '4pt',
            fontFamily: '"Times New Roman"',
            fontSize: '12pt',
            fontWeight: 'bold',
          }}
        >
          RESERVED.
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
        <strong>
          <span style={{ fontFamily: '"Times New Roman"' }}>&nbsp;</span>
        </strong>
      </p>
      <ol start={12} type='I' style={{ margin: '0pt', paddingLeft: '0pt' }}>
        <li
          style={{
            marginLeft: '32pt',
            marginBottom: '12pt',
            textAlign: 'justify',
            paddingLeft: '4pt',
            fontFamily: '"Times New Roman"',
            fontSize: '12pt',
            fontWeight: 'bold',
          }}
        >
          PHARMACEUTICAL FULFILLMENT &amp; PAYMENT
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
        <p>
          <span style={{ fontFamily: '"Times New Roman"' }}>
            Lumimeds is not a pharmacy and does not itself dispense or ship medications. Medications are fulfilled
            through third-party pharmacy partners, which are independent entities not controlled by Lumimeds. By using
            the Services, you authorize Lumimeds to coordinate with these fulfillment partners on your behalf, including
            for prescription transfer, packaging, and shipment. While we may consider special pharmacy requests, you do
            not have the right to select or dictate a specific pharmacy. Lumimeds reserves the right to determine which
            licensed pharmacy will fulfill your order, subject to applicable law.
          </span>
        </p>
      </p>
      <p
        style={{
          marginTop: '12pt',
          marginBottom: '12pt',
          textAlign: 'justify',
          fontSize: '12pt',
        }}
      >
        <p>
          <strong>
            <span style={{ fontFamily: '"Times New Roman"' }}>SHIPPING NOTE: </span>
          </strong>
          <span style={{ fontFamily: '"Times New Roman"' }}>
            Some medications may require temperature-sensitive packaging. Lumimeds and its fulfillment partners may
            include insulation and cold packs where appropriate, but not all medications require refrigeration. The
            inclusion of cooling materials during shipment is determined solely by the dispensing pharmacy and does not
            imply a specific temperature requirement during transit. This applies even if refrigeration is noted on the
            medication label. Reshipments may be offered at Lumimeds’s discretion in the event of loss or damage. Risk
            of loss passes to you upon delivery to the shipping carrier and any issues with shipment must be resolved
            with the shipping carrier directly. Lumimeds is not responsible for delays or losses caused by incorrect
            shipping addresses provided by you.&nbsp;
          </span>
        </p>
      </p>
      <p style={{ marginTop: '14pt', marginBottom: '14pt', fontSize: '12pt' }}>
        <span style={{ fontFamily: '"Times New Roman"' }}>
          If you experience any problems with your order such as shipping errors, damage upon delivery, or billing
          discrepancies you must contact us within 48 hours of receiving your package. Please include your order number,
          tracking number, and any photos of the damage (if applicable), and the lot number on the packaging.
        </span>
      </p>
      <p style={{ marginTop: '14pt', marginBottom: '14pt', fontSize: '12pt' }}>
        <span style={{ fontFamily: '"Times New Roman"' }}>
          To ensure quality and accuracy, our pharmacy partners maintain visual records of the packing process for all
          outgoing orders. These recordings serve as a verification tool if any concerns arise regarding shipment
          contents. Lumimeds may review this footage when assessing reported issues. Each case is carefully evaluated
          based on available evidence, and refunds or replacements will only be issued if a verified packing error or
          shipment-related damage is confirmed.
        </span>
      </p>
      <p
        style={{
          marginTop: '12pt',
          marginBottom: '0pt',
          textIndent: '36pt',
          textAlign: 'justify',
          fontSize: '12pt',
        }}
      >
        <span style={{ fontFamily: '"Times New Roman"' }}>
          When you submit Your Information for Health Care Services, you agree to pay all fees due. You will see a
          prompt for your payment details, such as your credit card information and any promotional codes you may have.
          By entering your payment information and submitting your request, you authorize us, our affiliates, or our
          third-party payment processors to charge the amount due. If you receive a medical consultation, medical
          consult fees are not subject to or eligible for a refund. We cannot accept returns of prescription products
          for reuse or resale, and all sales are final and non-refundable unless otherwise stated below. However, if you
          believe we have made an error in the filling of your prescription, please message us through your Lumimeds
          account.&nbsp;
        </span>
      </p>
      <p
        style={{
          marginTop: '12pt',
          marginBottom: '0pt',
          textIndent: '36pt',
          textAlign: 'justify',
          fontSize: '12pt',
        }}
      >
        <span style={{ fontFamily: '"Times New Roman"' }}>
          A non-refundable cancellation fee of one hundred dollars ($100.00) shall apply to any cancellation request
          other than non-approval due to medical concern. Orders cannot be canceled once they have been submitted to the
          pharmacy. Lumimeds shall verify, in its sole discretion, whether the affiliated pharmacy has commenced
          processing, filling, or shipping the prescription. No cancellations shall be permitted once pharmacy
          fulfillment has begun. All determinations regarding fulfillment status, cancellations, and associated fees
          shall be final and made exclusively by Lumimeds.
        </span>
      </p>
      <p
        style={{
          marginTop: '12pt',
          marginBottom: '0pt',
          textIndent: '36pt',
          textAlign: 'justify',
          fontSize: '12pt',
        }}
      >
        <span style={{ fontFamily: '"Times New Roman"' }}>
          If a provider visit has occurred and once a prescription has been submitted to a pharmacy, the order is final
          and may not be canceled or refunded.
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
          No refunds will be issued for medications that have already shipped. Approved refunds will be processed within
          ten (10) business days and returned to your original payment method.
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
          You understand and agree that you are responsible for all fees due to receive the Services, including any fees
          charged by the medical providers and affiliated professional entities. Amounts collected by Lumimeds will
          include fees charged by medical providers for Health Care Services. In the event that your credit card expires
          or Lumimeds, our affiliates, or our third-party payment processors are unable to process your payment, you may
          receive notice for you to provide an alternative payment method. Lumimeds and/or the medical provider(s) have
          no obligation to provide any Services unless and until full payment has been received and/or verified.
          Lumimeds reserves the right to suspend or terminate your account if you fail to remit payment to settle any
          account balances. Lumimeds will pursue all available legal recourse if account balances are not settled within
          X days of accrual.
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
        <a />
        <p>
          <span style={{ fontFamily: '"Times New Roman"' }}>
            If you enroll in a recurring subscription, you authorize Lumimeds to charge your payment method on a
            recurring basis until canceled, if allowed by your applicable membership fee terms. To cancel a
            subscription, you must notify us through your online portal or at help@lumimeds.com at least 28 days before
            your next billing date. Failure to cancel within this timeframe may result in continued billing, which you
            agree to accept as a non-refundable charge. Charges for subscriptions are non-refundable once a billing
            cycle has started. Partial refunds will not be issued for unused portions of a subscription period.
          </span>
        </p>
        {/* <a href="#_cmnt3" style={{ textDecoration: "none" }}>
						<span style={{ fontFamily: '"Times New Roman"' }}>[A3]</span>
					</a> */}
        {/* <a href="#_cmnt4" style={{ textDecoration: "none" }}>
						<span style={{ fontFamily: '"Times New Roman"' }}>[AT4]</span>
					</a> */}
      </p>
      <p
        style={{
          marginTop: '12pt',
          marginBottom: '12pt',
          textAlign: 'justify',
          fontSize: '12pt',
        }}
      >
        <a />
        <p>
          <span style={{ fontFamily: '"Times New Roman"' }}>For all transactions</span>
        </p>
        {/* <a href="#_cmnt5" style={{ textDecoration: "none" }}>
						<span style={{ fontFamily: '"Times New Roman"' }}>[A5]</span>
					</a> */}
        {/* <a href="#_cmnt6" style={{ textDecoration: "none" }}>
						<span style={{ fontFamily: '"Times New Roman"' }}>[AT6]</span>
					</a> */}
        <span style={{ fontFamily: '"Times New Roman"' }}>
          , including subscription fees, you agree that chargebacks may only be initiated in the case of actual fraud or
          unauthorized transactions. If a chargeback is filed for a purchase that complies with our posted refund
          policy, Lumimeds reserves the right to dispute the chargeback and provide documentation to the payment
          provider. Meritless or fraudulent chargebacks may result in account suspension or legal action.
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
          Please note that professional services delivered as part of the Health Care Services are not likely to be
          covered by any government health care payors, and, as such, you understand that no such claims will be
          submitted by Lumimeds or our affiliates for coverage of the professional services.
        </span>
      </p>
      <ol start={13} type='I' style={{ margin: '0pt', paddingLeft: '0pt' }}>
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
          PRIVACY
        </li>
      </ol>
      <p
        style={{
          marginTop: '12pt',
          marginBottom: '12pt',
          textIndent: '36pt',
          textAlign: 'justify',
          fontSize: '12pt',
        }}
      >
        <span style={{ fontFamily: '"Times New Roman"' }}>
          Lumimeds understands the importance of confidentiality and privacy regarding Your Information. Please see our{' '}
          <Link href='/privacypolicy' style={{ color: 'blue', textDecoration: 'underline' }}>
            Privacy Policy
          </Link>{' '}
          for a description of how we may collect, use and disclose Your Information in connection with the Website.
        </span>
      </p>
      <ol start={14} type='I' style={{ margin: '0pt', paddingLeft: '0pt' }}>
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
          INTELLECTUAL PROPERTY
        </li>
      </ol>
      <p
        style={{
          marginTop: '12pt',
          marginBottom: '12pt',
          textIndent: '36pt',
          textAlign: 'justify',
          fontSize: '12pt',
        }}
      >
        <span style={{ fontFamily: '"Times New Roman"' }}>
          As between Lumimeds and you, Lumimeds is the sole and exclusive owner of all right, title and interest in and
          to the Website and its content, features and functionality (including, without limitation, all information,
          software, text, displays, images, video, audio, selection, arrangement and look and feel), and all
          intellectual property rights therein, and any suggestions, ideas or other feedback provided by you. Any copy,
          modification, revision, enhancement, adaptation, translation, or derivative work of the Website shall be owned
          solely and exclusively by Lumimeds or its licensors, including all intellectual property rights therein. You
          have permission to use the Website solely for your personal and non-commercial use on the condition that you
          comply with these Terms. No other right, title or interest in or to the Website is transferred to you, and all
          rights not expressly granted are reserved by us or our affiliates.
        </span>
      </p>
      <p
        style={{
          marginTop: '12pt',
          marginBottom: '12pt',
          textIndent: '36pt',
          textAlign: 'justify',
          fontSize: '12pt',
        }}
      >
        <span style={{ fontFamily: '"Times New Roman"' }}>
          Certain names, logos, and other materials displayed in and through the Website may constitute trademarks,
          trade names, services marks or logos (“Trademarks”) of Lumimeds or its affiliates. You are not authorized to
          use any such Trademarks without the express written permission of Lumimeds or its affiliates. Ownership of all
          such Trademarks and the goodwill associated therewith remains with us or our affiliates.
        </span>
      </p>
      <ol start={15} type='I' style={{ margin: '0pt', paddingLeft: '0pt' }}>
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
          LINKS TO THIRD-PARTY HYPERLINKS AND WEBSITES
        </li>
      </ol>
      <p
        style={{
          marginTop: '12pt',
          marginBottom: '12pt',
          textIndent: '36pt',
          textAlign: 'justify',
          fontSize: '12pt',
        }}
      >
        <span style={{ fontFamily: '"Times New Roman"' }}>
          The Website may contain hyperlinks or references to other websites (“Linked Sites”) operated by third parties.
          The Linked Sites may not be under our control; therefore, we are not responsible for the information, products
          or services described thereon, or for the content of any Linked Site, including, without limitation, any link
          contained in a Linked Site, or any changes or updates to a Linked Site. We are providing these Linked Sites to
          you only as a convenience, and the inclusion of any link does not necessarily imply endorsement of the Linked
          Site or any association with its operators. Your use of these Linked Sites is at your own risk, and we are not
          liable to you in any way, either directly or indirectly, for any content, errors, damage or loss caused by or
          in connection with use of or reliance on information contained in or provided to Linked Sites.
        </span>
      </p>
      <p
        style={{
          marginTop: '12pt',
          marginBottom: '12pt',
          textIndent: '36pt',
          textAlign: 'justify',
          fontSize: '12pt',
        }}
      >
        <span style={{ fontFamily: '"Times New Roman"' }}>
          You may have arrived to the Website through a Linked Site, including a Linked Site controlled by a parent,
          subsidiary or affiliate of Lumimeds. You understand and agree that we are not responsible for the information,
          products or services described on those Linked Sites and only these Terms will apply to your use of or access
          to the Website.
        </span>
      </p>
      <ol start={16} type='I' style={{ margin: '0pt', paddingLeft: '0pt' }}>
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
          DISCLAIMER OF WARRANTIES
        </li>
      </ol>
      <p
        style={{
          marginTop: '12pt',
          marginBottom: '12pt',
          textIndent: '36pt',
          textAlign: 'justify',
          fontSize: '12pt',
        }}
      >
        <span style={{ fontFamily: '"Times New Roman"' }}>
          YOU ACKNOWLEDGE AND AGREE THAT THE WEBSITE AND THE SERVICES ARE PROVIDED THROUGH THE WEBSITE ON AN “AS IS” AND
          “AS AVAILABLE” BASIS. YOUR USE OF THE WEBSITE IS AT YOUR SOLE RISK. Lumimeds AND ITS AFFILIATES AND THEIR
          RESPECTIVE OFFICERS, DIRECTORS, MANAGERS, PARTNERS, MEMBERS, EMPLOYEES, AND AGENTS (COLLECTIVELY “RELATED
          PERSONS”) MAKE NO REPRESENTATIONS OR WARRANTIES AND SPECIFICALLY DISCLAIM ANY AND ALL WARRANTIES OF ANY KIND,
          EXPRESS OR IMPLIED, WITH RESPECT TO THE WEBSITE AND THE SERVICES, INCLUDING ANY REPRESENTATIONS OR WARRANTIES
          WITH RESPECT TO MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, NON-INFRINGEMENT, AVAILABILITY,
          SECURITY, ACCURACY, FREEDOM FROM VIRUSES OR MALWARE, COMPLETENESS, TIMELINESS, FUNCTIONALITY, RELIABILITY,
          SEQUENCING OR SPEED OF DELIVERY. WE MAKE NO WARRANTIES OR REPRESENTATIONS THAT YOUR USE OF THE WEBSITE OR THE
          SERVICES WILL NOT INFRINGE THE RIGHTS OF THIRD PARTIES.
        </span>
      </p>
      <p
        style={{
          marginTop: '12pt',
          marginBottom: '12pt',
          textIndent: '36pt',
          textAlign: 'justify',
          fontSize: '12pt',
        }}
      >
        <span style={{ fontFamily: '"Times New Roman"' }}>
          TO THE FULLEST EXTENT OF APPLICABLE LAW, NEITHER LUMIMEDS NOR ITS RELATED PERSONS WILL BE LIABLE FOR ANY LOSS
          OR DAMAGE CAUSED BY YOUR RELIANCE ON INFORMATION OBTAINED THROUGH THE WEBSITE. IT IS YOUR RESPONSIBILITY TO
          EVALUATE THE ACCURACY, COMPLETENESS, TIMELINESS, RELIABILITY OR USEFULNESS OF THE WEBSITE. FURTHERMORE,
          LUMIMEDS DOES NOT GUARANTEE THAT THE WEBSITE WILL BE UNINTERRUPTED, OR FREE FROM ERROR, DEFECT, LOSS, DELAY IN
          OPERATION, CORRUPTION, CYBER ATTACK, VIRUSES, INTERFERENCE, HACKING, MALWARE, OR OTHER SECURITY INTRUSION, AND
          LUMIMEDS DISCLAIMS ANY LIABILITY RELATING THERETO.
        </span>
      </p>
      <p
        style={{
          marginTop: '12pt',
          marginBottom: '12pt',
          textIndent: '36pt',
          textAlign: 'justify',
          fontSize: '12pt',
        }}
      >
        <span style={{ fontFamily: '"Times New Roman"' }}>
          YOU UNDERSTAND AND AGREE THAT ANY CONTENT, MATERIAL AND/OR INFORMATION OBTAINED THROUGH THE USE OF THE WEBSITE
          ARE USED AT YOUR SOLE RISK AND THAT YOU WILL BE SOLELY RESPONSIBLE FOR ANY DAMAGE TO YOUR COMPUTER OR MOBILE
          PHONE OR LOSS OF DATA THAT RESULTS FROM THE DOWNLOAD OF SUCH CONTENT, MATERIAL AND/OR INFORMATION.
        </span>
      </p>
      <ol start={17} type='I' style={{ margin: '0pt', paddingLeft: '0pt' }}>
        <li
          style={{
            marginTop: '12pt',
            marginLeft: '41pt',
            marginBottom: '12pt',
            textAlign: 'justify',
            paddingLeft: '4pt',
            fontFamily: '"Times New Roman"',
            fontSize: '12pt',
            fontWeight: 'bold',
          }}
        >
          LIMITATION OF LIABILITY
        </li>
      </ol>
      <p
        style={{
          marginTop: '12pt',
          marginBottom: '12pt',
          textIndent: '36pt',
          textAlign: 'justify',
          fontSize: '12pt',
        }}
      >
        <span style={{ fontFamily: '"Times New Roman"' }}>
          TO THE FULLEST EXTENT PERMISSIBLE PURSUANT TO APPLICABLE LAW AND EXCEPT AS SET FORTH IN THIS SECTION, NEITHER
          LUMIMEDS NOR ITS RELATED PERSONS OR LICENSORS WILL BE LIABLE TO YOU OR TO ANY PARTY FOR ANY CLAIMS,
          LIABILITIES, LOSSES, COSTS OR DAMAGES UNDER ANY LEGAL OR EQUITABLE THEORY, WHETHER IN TORT (INCLUDING
          NEGLIGENCE), CONTRACT, STRICT LIABILITY OR OTHERWISE, INCLUDING, BUT NOT LIMITED TO, ANY INDIRECT, PUNITIVE,
          SPECIAL, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING LOST PROFITS, LOSS OF DATA OR LOSS OF GOODWILL,
          SERVICE INTERRUPTION, COMPUTER OR MOBILE PHONE DAMAGE, OR SYSTEM FAILURE, OR THE COST OF SUBSTITUTE PRODUCTS
          OR SERVICES, OR FOR ANY DAMAGES FOR PERSONAL OR BODILY INJURY OR EMOTIONAL DISTRESS, INCLUDING DEATH, ARISING
          OUT OF OR IN CONNECTION WITH ANY ACCESS, USE OF (OR INABILITY TO USE) THE WEBSITE OR ANY SERVICES PROVIDED
          THROUGH THE WEBSITE. THIS IS TRUE EVEN IF LUMIMEDS OR RELATED PERSONS HAVE BEEN ADVISED OF THE POSSIBILITY OF
          SUCH DAMAGES OR LOSSES.
        </span>
      </p>
      <p
        style={{
          marginTop: '12pt',
          marginBottom: '12pt',
          textIndent: '36pt',
          textAlign: 'justify',
          fontSize: '12pt',
        }}
      >
        <span style={{ fontFamily: '"Times New Roman"' }}>
          TO THE EXTENT PERMITTED BY LAW AND SUBJECT TO THIS SECTION, THE TOTAL LIABILITY OF LUMIMEDS AND ITS RELATED
          PERSONS FOR ANY CLAIMS UNDER THESE TERMS SHALL NOT EXCEED U.S. ONE HUNDRED DOLLARS ($100.00 USD). NOTE THAT
          SOME JURISDICTIONS DO NOT ALLOW LIMITATIONS OF LIABILITY OR MAY PLACE LIMITATIONS ON OUR ABILITY TO LIMIT OUR
          LIABILITY TO YOU, SO THE FOREGOING LIMITATION MAY NOT APPLY TO YOU.
        </span>
      </p>
      <ol start={18} type='I' style={{ margin: '0pt', paddingLeft: '0pt' }}>
        <li
          style={{
            marginTop: '12pt',
            marginLeft: '39.34pt',
            marginBottom: '12pt',
            textAlign: 'justify',
            paddingLeft: '4pt',
            fontFamily: '"Times New Roman"',
            fontSize: '12pt',
            fontWeight: 'bold',
          }}
        >
          INDEMNIFICATION
        </li>
      </ol>
      <p
        style={{
          marginTop: '12pt',
          marginBottom: '12pt',
          textIndent: '36pt',
          textAlign: 'justify',
          fontSize: '12pt',
        }}
      >
        <span style={{ fontFamily: '"Times New Roman"' }}>
          You agree to indemnify, defend, and hold Lumimeds and any of its Related Persons, licensors, and suppliers
          harmless from and against any and all third-party claims, demands, liabilities, costs or expenses, including
          attorneys’ fees and costs, arising from or related to: (i) any breach by you of these Terms, (ii) your use of
          material or features available on the Website in an unauthorized manner, and/or (iii) a violation by you of
          any and all applicable laws, rules, or regulations.
        </span>
      </p>
      <ol start={19} type='I' style={{ margin: '0pt', paddingLeft: '0pt' }}>
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
          MODIFICATIONS TO THE WEBSITE
        </li>
      </ol>
      <p
        style={{
          marginTop: '12pt',
          marginBottom: '12pt',
          textIndent: '36pt',
          textAlign: 'justify',
          fontSize: '12pt',
        }}
      >
        <span style={{ fontFamily: '"Times New Roman"' }}>
          Lumimeds reserves the right at any time and for any reason to modify, or temporarily or permanently
          discontinue, the Website, or any portion thereof, with or without notice. You agree that Lumimeds shall not be
          liable to you and to any third party for any modification, suspension, or discontinuance of the Website.
        </span>
      </p>
      <ol start={20} type='I' style={{ margin: '0pt', paddingLeft: '0pt' }}>
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
          SUSPENSION AND TERMINATION RIGHTS
        </li>
      </ol>
      <p
        style={{
          marginTop: '12pt',
          marginBottom: '12pt',
          textIndent: '36pt',
          textAlign: 'justify',
          fontSize: '12pt',
        }}
      >
        <span style={{ fontFamily: '"Times New Roman"' }}>
          The Terms will remain in full force and effect as long as you continue to access or use the Website. You may
          terminate the Terms at any time by discontinuing use of the Website. Your permission to use the Website
          automatically terminates if you violate these Terms. We may terminate or suspend any of the rights granted by
          these Terms and your access to our Website with or without prior notice, at any time, and for any reason. The
          following provisions survive the expiration or termination of these Terms for any reason whatsoever:
          Disclaimer of Warranties; Limitation of Liability; Indemnification; Governing Law, Dispute Resolution,
          Arbitration, Class Action Waiver; and Miscellaneous.
        </span>
      </p>
      <p
        style={{
          marginTop: '12pt',
          marginBottom: '12pt',
          textIndent: '36pt',
          textAlign: 'justify',
          fontSize: '12pt',
        }}
      >
        <span style={{ fontFamily: '"Times New Roman"' }}>
          Subject to applicable law, Lumimeds reserves the right to maintain, delete or destroy all communications and
          materials posted or uploaded to the Website pursuant to its internal record retention and/or content
          destruction policies. After any termination, Lumimeds will have no further obligation to provide the Services,
          except to the extent we are obligated to provide you access to your health records or required to provide you
          with continuing care under our applicable legal, ethical and professional obligations to you.
        </span>
      </p>
      <ol start={21} type='I' style={{ margin: '0pt', paddingLeft: '0pt' }}>
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
          GOVERNING LAW; DISPUTE RESOLUTION; ARBITRATION; CLASS ACTION WAIVER
        </li>
      </ol>
      <p
        style={{
          marginTop: '12pt',
          marginBottom: '12pt',
          textIndent: '36pt',
          textAlign: 'justify',
          fontSize: '12pt',
        }}
      >
        <strong>
          <span style={{ fontFamily: '"Times New Roman"' }}>
            **PLEASE READ THIS SECTION CAREFULLY BECAUSE IT REQUIRES YOU AND LUMIMEDS TO RESOLVE ALL DISPUTES BETWEEN US
            THROUGH BINDING INDIVIDUAL ARBITRATION AND LIMITS THE MANNER IN WHICH YOU CAN SEEK RELIEF FROM LUMIMEDS.**
          </span>
        </strong>
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
          <u>Governing Law</u>. The Website is controlled and operated by us from the United States and is not intended
          to subject us to the laws or jurisdiction of any state, country or territory other than that of the United
          States. These Terms will be governed by the laws of the State of [STATE] without regard to conflicts of law
          principles.
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
        <span style={{ fontFamily: '"Times New Roman"' }}>&nbsp;</span>
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
          <u>Arbitration Agreement</u>. You and Lumimeds agree that all claims and disputes relating in any way to your
          use of our Website, or arising out of or in connection with these Terms, shall be resolved by binding
          arbitration, to the fullest extent permitted by applicable law, on an individual basis, except for disputes
          which can be resolved in small claims court or other fee collection disputes, any dispute in which either
          party seeks equitable relief for the alleged unlawful use of copyrights, trademarks, trade names, logos, trade
          secrets, or patents, or any dispute already pending at the time you first agree to these Terms. You also agree
          that any arbitration will take place in [CITY, STATE].
        </li>
      </ol>
      <p
        style={{
          marginTop: '0pt',
          marginLeft: '36pt',
          marginBottom: '0pt',
          textIndent: '36pt',
          fontSize: '12pt',
        }}
      >
        <span style={{ fontFamily: '"Times New Roman"' }}>&nbsp;</span>
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
          <u>Waiver of Jury Trial</u>. IN THE EVENT ARBITRATION IS CONTRARY TO APPLICABLE LAW, YOU AND Lumimeds WAIVE
          ANY CONSTITUTIONAL OR STATUTORY RIGHT TO GO TO COURT AND HAVE A TRIAL IN FRONT OF A JUDGE OR A JURY. You and
          Lumimeds are instead electing to have claims and disputes resolved by arbitration. Arbitration is the referral
          of a claim or dispute to one or more persons charged with reviewing the claim or dispute and making a final
          binding determination to resolve it instead of having it decided by a judge or jury in court. Arbitration
          procedures are typically more limited, more efficient, and less costly than rules applicable in court and are
          subject to very limited review by a court. The arbitrator’s award shall be binding and may be entered as a
          judgment in any court of competent jurisdiction.
        </li>
      </ol>
      <p
        style={{
          marginTop: '0pt',
          marginLeft: '36pt',
          marginBottom: '0pt',
          textIndent: '36pt',
          fontSize: '12pt',
        }}
      >
        <span style={{ fontFamily: '"Times New Roman"' }}>&nbsp;</span>
      </p>
      <ol start={4} type='a' className='awlist5' style={{ margin: '0pt', paddingLeft: '0pt' }}>
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
          <u>No Class Arbitrations, Class Actions, or Representative Actions</u>. YOU AND LUMIMEDS AGREE THAT ALL CLAIMS
          AND DISPUTES WITHIN THE SCOPE OF THIS ARBITRATION AGREEMENT MUST BE ARBITRATED OR LITIGATED ON AN INDIVIDUAL
          BASIS AND NOT ON A CLASS BASIS. CLAIMS AND DISPUTES OF MORE THAN ONE CUSTOMER OR USER CANNOT BE BROUGHT AS A
          CLASS OR OTHER TYPE OF REPRESENTATIVE ACTION, WHETHER WITHIN OR OUTSIDE OF ARBITRATION, OR ON BEHALF OF ANY
          INDIVIDUAL OR OTHER GROUP. UNLESS BOTH YOU AND LUMIMEDS AGREE OTHERWISE, THE ARBITRATOR MAY NOT CONSOLIDATE OR
          JOIN MORE THAN ONE PERSON’S OR PARTY’S CLAIMS AND MAY NOT OTHERWISE PRESIDE OVER ANY FORM OF A CONSOLIDATED,
          REPRESENTATIVE, OR CLASS PROCEEDING. ALSO, THE ARBITRATOR MAY AWARD RELIEF (INCLUDING MONETARY, INJUNCTIVE,
          AND DECLARATORY RELIEF) ONLY IN FAVOR OF THE INDIVIDUAL PARTY SEEKING RELIEF AND ONLY TO THE EXTENT NECESSARY
          TO PROVIDE RELIEF NECESSITATED BY THAT PARTY’S INDIVIDUAL CLAIM(S) OR DISPUTE. ANY RELIEF AWARDED CANNOT
          AFFECT OTHER LUMIMEDS USERS.
        </li>
      </ol>
      <p
        style={{
          marginTop: '0pt',
          marginLeft: '36pt',
          marginBottom: '0pt',
          textIndent: '36pt',
          fontSize: '12pt',
        }}
      >
        <span style={{ fontFamily: '"Times New Roman"' }}>&nbsp;</span>
      </p>
      <ol start={5} type='a' className='awlist6' style={{ margin: '0pt', paddingLeft: '0pt' }}>
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
          <u>Arbitration Rules</u>. The Federal Arbitration Act governs the interpretation and enforcement of this
          dispute resolution provision. Any arbitration between you and Lumimeds will be initiated through the American
          Arbitration Association (“AAA”) and will be governed by the AAA Consumer Arbitration Rules. The AAA Rules and
          filing forms are available at{' '}
          <a href='http://www.adr.org' style={{ textDecoration: 'none' }}>
            <u>
              <span style={{ color: '#467886' }}>www.adr.org</span>
            </u>
          </a>
          .
        </li>
      </ol>
      <p
        style={{
          marginTop: '0pt',
          marginLeft: '36pt',
          marginBottom: '0pt',
          textIndent: '36pt',
          fontSize: '12pt',
        }}
      >
        <span style={{ fontFamily: '"Times New Roman"' }}>&nbsp;</span>
      </p>
      <ol start={6} type='a' className='awlist7' style={{ margin: '0pt', paddingLeft: '0pt' }}>
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
              width: '10.01pt',
              font: '7pt "Times New Roman"',
              display: 'inline-block',
            }}
          >
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </span>
          Opt-out
          <strong>
            <u>
              . You may opt out of this arbitration agreement by emailing help@lumimeds.com within 30 days of accepting
              these Terms, stating your name and intent to opt out
            </u>
          </strong>
          .
        </li>
      </ol>
      <p
        style={{
          marginTop: '0pt',
          marginLeft: '45pt',
          marginBottom: '0pt',
          textAlign: 'justify',
          fontSize: '12pt',
        }}
      >
        <strong>
          <span style={{ fontFamily: '"Times New Roman"' }}>&nbsp;</span>
        </strong>
      </p>
      <ol start={22} type='I' style={{ margin: '0pt', paddingLeft: '0pt' }}>
        <li
          style={{
            marginLeft: '41pt',
            marginBottom: '12pt',
            textAlign: 'justify',
            paddingLeft: '4pt',
            fontFamily: '"Times New Roman"',
            fontSize: '12pt',
            fontWeight: 'bold',
          }}
        >
          MISCELLANEOUS
        </li>
      </ol>
      <p
        style={{
          marginTop: '12pt',
          marginBottom: '12pt',
          textIndent: '36pt',
          textAlign: 'justify',
          fontSize: '12pt',
        }}
      >
        <span style={{ fontFamily: '"Times New Roman"' }}>
          The Terms set forth the entire understanding and agreement between you and us with respect to the subject
          matter hereof. If any provision of the Terms is found by a court of competent jurisdiction to be invalid, the
          parties nevertheless agree that the court should endeavor to give effect to the parties’ intentions as
          reflected in the provision, and the other provisions of the Terms shall remain in full force and effect.
          Headings are for reference only and in no way define, limit, construe, or describe the scope or extent of such
          section. Our failure to act with respect to any failure by you or others to comply with these Terms does not
          waive our right to act with respect to subsequent or similar failures. You may not assign or transfer your
          rights or obligations under these Terms without our prior written consent, and any assignment or transfer in
          violation of this provision shall be null and void.
        </span>
      </p>
      <ol start={23} type='I' style={{ margin: '0pt', paddingLeft: '0pt' }}>
        <li
          style={{
            marginTop: '12pt',
            marginLeft: '41pt',
            marginBottom: '12pt',
            textAlign: 'justify',
            paddingLeft: '4pt',
            fontFamily: '"Times New Roman"',
            fontSize: '12pt',
            fontWeight: 'bold',
          }}
        >
          COPYRIGHT INFRINGEMENT CLAIMS
        </li>
      </ol>
      <p
        style={{
          marginTop: '12pt',
          marginBottom: '12pt',
          textIndent: '36pt',
          textAlign: 'justify',
          fontSize: '12pt',
        }}
      >
        <span style={{ fontFamily: '"Times New Roman"' }}>
          Lumimeds reserves the right to remove any content or any other material or information available on or through
          our Website, at any time, for any reason. Lumimeds otherwise complies with the provisions of the Digital
          Millennium Copyright Act (“DMCA”) applicable to Internet service providers (17 U.S.C. § 512, as amended), and
          responds to clear notices of alleged copyright infringement. This Section&nbsp;
        </span>
        <span style={{ fontFamily: '"Times New Roman"' }}>‎</span>
        <span style={{ fontFamily: '"Times New Roman"' }}>
          XXIV describes the procedure that should be followed to file a notification of alleged copyright infringement
          with Lumimeds.
        </span>
      </p>
      <ol type='a' className='awlist8' style={{ margin: '0pt', paddingLeft: '0pt' }}>
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
          <u>Notification of Claimed Copyright Infringement</u>. If you have objections to copyrighted content or
          material made available on or through our Website, you may submit a notification to our Designated Agent at
          the following address: [EMAIL]. Any notification to Lumimeds under 17 U.S.C. § 512(c) alleging copyright
          infringement must include the following information:
          <ol
            type='i'
            className='awlist9'
            style={{
              marginRight: '0pt',
              marginLeft: '0pt',
              paddingLeft: '0pt',
            }}
          >
            <li style={{ marginLeft: '36pt', textIndent: '-24.33pt' }}>
              <span
                style={{
                  width: '18pt',
                  font: '7pt "Times New Roman"',
                  display: 'inline-block',
                }}
              >
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
              An electronic or physical signature of the person authorized to act on behalf of the owner of the
              exclusive right being infringed;
            </li>
            <li style={{ marginLeft: '36pt', textIndent: '-27.67pt' }}>
              <span
                style={{
                  width: '18pt',
                  font: '7pt "Times New Roman"',
                  display: 'inline-block',
                }}
              >
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
              An identification of the copyrighted work or other intellectual property that you claim has been infringed
              or, if multiple copyrighted works are covered by a single notification, a representative list of such
              works;
            </li>
            <li style={{ marginLeft: '36pt', textIndent: '-31pt' }}>
              <span
                style={{
                  width: '18pt',
                  font: '7pt "Times New Roman"',
                  display: 'inline-block',
                }}
              >
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
              An identification of the content or material that you claim is infringing and where it is located on our
              Website;
            </li>
            <li style={{ marginLeft: '36pt', textIndent: '-30.33pt' }}>
              <span
                style={{
                  width: '18pt',
                  font: '7pt "Times New Roman"',
                  display: 'inline-block',
                }}
              >
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
              Information sufficient for Lumimeds to contact you, such as your address, telephone number, and/or email
              address;
            </li>
            <li style={{ marginLeft: '36pt', textIndent: '-27pt' }}>
              <span
                style={{
                  width: '18pt',
                  font: '7pt "Times New Roman"',
                  display: 'inline-block',
                }}
              >
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
              A statement by you that you have a good-faith belief that the use of the content or material of which you
              are complaining is not authorized by the copyright owner, its agent, or the law; and
            </li>
            <li style={{ marginLeft: '36pt', textIndent: '-30.33pt' }}>
              <span
                style={{
                  width: '18pt',
                  font: '7pt "Times New Roman"',
                  display: 'inline-block',
                }}
              >
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
              A signed statement by you that the above information in your notice is accurate and that, under penalty of
              perjury, you are the copyright owner or authorized to act on the copyright owner’s behalf.
            </li>
          </ol>
        </li>
      </ol>
      <p
        style={{
          marginTop: '0pt',
          marginLeft: '72pt',
          marginBottom: '0pt',
          textAlign: 'justify',
          fontSize: '12pt',
        }}
      >
        <span style={{ fontFamily: '"Times New Roman"' }}>&nbsp;</span>
      </p>
      <ol start={24} type='I' style={{ margin: '0pt', paddingLeft: '0pt' }}>
        <li
          style={{
            marginLeft: '38.67pt',
            marginBottom: '12pt',
            textAlign: 'justify',
            paddingLeft: '4pt',
            fontFamily: '"Times New Roman"',
            fontSize: '12pt',
            fontWeight: 'bold',
          }}
        >
          INSURANCE OR OTHER MEDICAL COVERAGE
        </li>
      </ol>
      <p
        style={{
          marginTop: '12pt',
          marginBottom: '12pt',
          textIndent: '36pt',
          textAlign: 'justify',
          fontSize: '12pt',
        }}
      >
        <span style={{ fontFamily: '"Times New Roman"' }}>
          The provision of Health Care Services by the health professionals and professional entities affiliated with
          Lumimeds are not substitutes for health insurance or other health plan coverage (such as membership in an
          HMO). You acknowledge that you have been advised to obtain or keep in full force your health insurance
          policy(ies) or plans in order to cover you and your family members for other healthcare services and/or costs.
          You acknowledge that neither Lumimeds or the health professionals and professional entities affiliated with
          Lumimeds will bill your insurer for any medical services and that Health Care Services are not intended to be
          covered by your insurer. It is your responsibility to submit any invoices paid for Health Care Services to any
          health insurance or health plan coverage provider. Lumimeds and the health professionals and professional
          entities affiliated with Lumimeds in no way provide any representations to you that any Health Care Services
          will be eligible for coverage under any insurance policy held by you.
        </span>
      </p>
      <ol start={25} type='I' style={{ margin: '0pt', paddingLeft: '0pt' }}>
        <li
          style={{
            marginTop: '12pt',
            marginLeft: '41pt',
            textAlign: 'justify',
            paddingLeft: '4pt',
            fontFamily: '"Times New Roman"',
            fontSize: '12pt',
            fontWeight: 'bold',
          }}
        >
          RESERVED.
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
        <span style={{ fontFamily: '"Times New Roman"' }}>&nbsp;</span>
      </p>
      <ol start={26} type='I' style={{ margin: '0pt', paddingLeft: '0pt' }}>
        <li
          style={{
            marginLeft: '41pt',
            textAlign: 'justify',
            paddingLeft: '4pt',
            fontFamily: '"Times New Roman"',
            fontSize: '12pt',
            fontWeight: 'bold',
          }}
        >
          STATE SPECIFIC NOTIFICATIONS
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
        <span style={{ fontFamily: '"Times New Roman"' }}>&nbsp;</span>
      </p>
      <ol type='a' className='awlist10' style={{ margin: '0pt', paddingLeft: '0pt' }}>
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
          FOR CALIFORNIA RESIDENTS
          <ol
            type='i'
            className='awlist11'
            style={{
              marginRight: '0pt',
              marginLeft: '0pt',
              paddingLeft: '0pt',
            }}
          >
            <li style={{ marginLeft: '36pt', textIndent: '-24.33pt' }}>
              <span
                style={{
                  width: '18pt',
                  font: '7pt "Times New Roman"',
                  display: 'inline-block',
                }}
              >
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
              You or your legal representative retain the option to withhold or withdraw consent to receive health care
              services via the Health Care Services at any time without affecting your right to future care or treatment
              nor risking the loss or withdrawal of any benefits to which you or your legal representative would
              otherwise be entitled.
            </li>
            <li style={{ marginLeft: '36pt', textIndent: '-27.67pt' }}>
              <span
                style={{
                  width: '18pt',
                  font: '7pt "Times New Roman"',
                  display: 'inline-block',
                }}
              >
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
              All existing confidentiality protections apply.
            </li>
            <li style={{ marginLeft: '36pt', textIndent: '-31pt' }}>
              <span
                style={{
                  width: '18pt',
                  font: '7pt "Times New Roman"',
                  display: 'inline-block',
                }}
              >
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
              All existing laws regarding patient access to medical information and copies of medical records apply.
            </li>
            <li style={{ marginLeft: '36pt', textIndent: '-30.33pt' }}>
              <span
                style={{
                  width: '18pt',
                  font: '7pt "Times New Roman"',
                  display: 'inline-block',
                }}
              >
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
              Dissemination of any of your identifiable images or information from the telemedicine interaction to
              researchers or other entities shall not occur without your consent.
            </li>
            <li style={{ marginLeft: '36pt', textIndent: '-27pt' }}>
              <span
                style={{
                  width: '18pt',
                  font: '7pt "Times New Roman"',
                  display: 'inline-block',
                }}
              >
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
              All provisions herein, including your informed consent to receive services via the Website are for the
              benefit of the treating provider as well as for your benefit.
            </li>
            <li style={{ marginLeft: '36pt', textIndent: '-30.33pt' }}>
              <span
                style={{
                  width: '18pt',
                  font: '7pt "Times New Roman"',
                  display: 'inline-block',
                }}
              >
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
              Medical doctors are licensed and regulated by the Medical Board of California. To check up on a license or
              to file a complaint go to www.mbc.ca.gov, email{' '}
              <a href='mailto:licensecheck@mbc.ca.gov' style={{ textDecoration: 'none' }}>
                <u>
                  <span style={{ color: '#467886' }}>licensecheck@mbc.ca.gov</span>
                </u>
              </a>
              , or call (800) 632-2322.
            </li>
            <li style={{ marginLeft: '36pt', textIndent: '-33.67pt' }}>
              <span
                style={{
                  width: '18pt',
                  font: '7pt "Times New Roman"',
                  display: 'inline-block',
                }}
              >
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
              Physician assistants are licensed and regulated by the Physician Assistant Board of California,
              www.pab.ca.gov or (916) 561-8780.
            </li>
            <li style={{ marginLeft: '36pt', textIndent: '-37pt' }}>
              <span
                style={{
                  width: '18pt',
                  font: '7pt "Times New Roman"',
                  display: 'inline-block',
                }}
              >
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
              The Open Payments database is a federal tool used to search payments made by drug and device companies to
              physicians and teaching hospitals. It can be found at https://openpaymentsdata.cms.gov. This link to the
              federal Centers for Medicare and Medicaid Services (CMS) Open Payments web page is provided here for
              informational purposes only. The federal Physician Payments Sunshine Act requires that detailed
              information about payment and other payments of value worth over ten dollars ($10) from manufacturers of
              drugs, medical devices, and biologics to physicians and teaching hospitals be made available to the
              public.
            </li>
          </ol>
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
        <span style={{ fontFamily: '"Times New Roman"' }}>&nbsp;</span>
      </p>
      <ol start={2} type='a' className='awlist12' style={{ margin: '0pt', paddingLeft: '0pt' }}>
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
          FOR CONNECTICUT, OHIO, UTAH, AND TEXAS RESIDENTS
          <ol
            type='i'
            className='awlist11'
            style={{
              marginRight: '0pt',
              marginLeft: '0pt',
              paddingLeft: '0pt',
            }}
          >
            <li style={{ marginLeft: '36pt', textIndent: '-6.33pt' }}>
              If You would like the record of this visit to be forwarded to another provider, please include the name
              and contact information in a message to us.
            </li>
          </ol>
        </li>
      </ol>
      <p
        style={{
          marginTop: '0pt',
          marginLeft: '72pt',
          marginBottom: '0pt',
          textAlign: 'justify',
          fontSize: '12pt',
        }}
      >
        <span style={{ fontFamily: '"Times New Roman"' }}>&nbsp;</span>
      </p>
      <ol start={3} type='a' className='awlist13' style={{ margin: '0pt', paddingLeft: '0pt' }}>
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
          FOR FLORIDA RESIDENTS
          <ol
            type='i'
            className='awlist11'
            style={{
              marginRight: '0pt',
              marginLeft: '0pt',
              paddingLeft: '0pt',
            }}
          >
            <li style={{ marginLeft: '36pt', textIndent: '-24.33pt' }}>
              <span
                style={{
                  width: '18pt',
                  font: '7pt "Times New Roman"',
                  display: 'inline-block',
                }}
              >
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
              Each provider is a physician licensed by the Florida Board of Medicine or the Florida Board of Osteopathic
              Medicine. The provider’s hours are variable and will be posted on the Website.
            </li>
          </ol>
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
        <span style={{ fontFamily: '"Times New Roman"' }}>&nbsp;</span>
      </p>
      <ol start={4} type='a' className='awlist14' style={{ margin: '0pt', paddingLeft: '0pt' }}>
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
          FOR GEORGIA RESIDENTS
          <ol
            type='i'
            className='awlist11'
            style={{
              marginRight: '0pt',
              marginLeft: '0pt',
              paddingLeft: '0pt',
            }}
          >
            <li style={{ marginLeft: '36pt', textIndent: '-24.33pt' }}>
              <span
                style={{
                  width: '18pt',
                  font: '7pt "Times New Roman"',
                  display: 'inline-block',
                }}
              >
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
              The patient has the right to file a grievance with the Georgia Composite Medical Board concerning the
              physician, staff, office, and treatment received. The patient should either call the Board with such a
              complaint or send a written complaint to the Board. The patient should be able to provide the physician or
              practice name, the address, and the specific nature of the complaint. The Georgia Composite Medical Board
              current phone number is (404) 656-3913 and the address is 2 Peachtree Street NW, 6th Floor, Atlanta, GA
              30303-3465.
            </li>
          </ol>
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
        <span style={{ fontFamily: '"Times New Roman"' }}>&nbsp;</span>
      </p>
      <ol start={5} type='a' className='awlist15' style={{ margin: '0pt', paddingLeft: '0pt' }}>
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
          FOR INDIANA RESIDENTS
          <ol
            type='i'
            className='awlist11'
            style={{
              marginRight: '0pt',
              marginLeft: '0pt',
              paddingLeft: '0pt',
            }}
          >
            <li style={{ marginLeft: '36pt', textIndent: '-24.33pt' }}>
              <span
                style={{
                  width: '18pt',
                  font: '7pt "Times New Roman"',
                  display: 'inline-block',
                }}
              >
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
              Unless your provider specifically discloses otherwise, with the exception of charges for services
              delivered to patients, providers do not have any financial interest in any information, products, or
              services offered through the Website.
            </li>
            <li style={{ marginLeft: '36pt', textIndent: '-27.67pt' }}>
              <span
                style={{
                  width: '18pt',
                  font: '7pt "Times New Roman"',
                  display: 'inline-block',
                }}
              >
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
              You may access, supplement and amend your personal health information that you have provided to the health
              care providers affiliated with Lumimeds and you may provide feedback regarding the site and the quality of
              information and services, and you may register complaints, including information regarding filing a
              complaint with the Consumer Protection Division Office of the Attorney General.
            </li>
            <li style={{ marginLeft: '36pt', textIndent: '-31pt' }}>
              <span
                style={{
                  width: '18pt',
                  font: '7pt "Times New Roman"',
                  display: 'inline-block',
                }}
              >
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
              Notice Concerning Complaints: You may either file a complaint online or download the appropriate complaint
              form. If downloading, you must complete, sign, print, and mail it, along with copies of all relevant
              supporting documentation to: Consumer Protection Division Office of the Indiana Attorney General, 302 W.
              Washington St., 5th Floor Indianapolis, IN 46204. You can also request a complaint form by calling (800)
              382-5516 or (317) 232-6330.
            </li>
          </ol>
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
        <span style={{ fontFamily: '"Times New Roman"' }}>&nbsp;</span>
      </p>
      <ol start={6} type='a' className='awlist16' style={{ margin: '0pt', paddingLeft: '0pt' }}>
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
              width: '10.01pt',
              font: '7pt "Times New Roman"',
              display: 'inline-block',
            }}
          >
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </span>
          FOR KANSAS RESIDENTS
          <ol
            type='i'
            className='awlist11'
            style={{
              marginRight: '0pt',
              marginLeft: '0pt',
              paddingLeft: '0pt',
            }}
          >
            <li style={{ marginLeft: '36pt', textIndent: '-24.33pt' }}>
              <span
                style={{
                  width: '18pt',
                  font: '7pt "Times New Roman"',
                  display: 'inline-block',
                }}
              >
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
              Notice to Patients: Required Signage for K.A.R. 100-22-6 Prepared by the State Board of Healing Arts April
              5, 2007.&nbsp; It is unlawful for any person who is not licensed under the Kansas Healing Arts Act to open
              or maintain an office for the practice of the healing arts in Kansas. Services are provided by a person
              who is licensed to practice the healing arts in Kansas.
            </li>
            <li style={{ marginLeft: '36pt', textIndent: '-27.67pt' }}>
              <span
                style={{
                  width: '18pt',
                  font: '7pt "Times New Roman"',
                  display: 'inline-block',
                }}
              >
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
              Questions and concerns regarding this professional practice may be directed to:&nbsp; Kansas State Board
              of Healing Arts, 800 SW Jackson, Lower Level – Suite A, Topeka, Kansas 66612.&nbsp; Phone: (785) 296-7413.
              Toll Free: (888) 886-7205.&nbsp; Fax: (785) 368-7102. Website:{' '}
              <a href='http://www.ksbha.org' style={{ textDecoration: 'none' }}>
                <u>
                  <span style={{ color: '#467886' }}>www.ksbha.org</span>
                </u>
              </a>
              .
            </li>
          </ol>
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
        <span style={{ fontFamily: '"Times New Roman"' }}>&nbsp;</span>
      </p>
      <ol start={7} type='a' className='awlist17' style={{ margin: '0pt', paddingLeft: '0pt' }}>
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
          FOR LOUISIANA RESIDENTS
          <ol
            type='i'
            className='awlist11'
            style={{
              marginRight: '0pt',
              marginLeft: '0pt',
              paddingLeft: '0pt',
            }}
          >
            <li style={{ marginLeft: '36pt', textIndent: '-24.33pt' }}>
              <span
                style={{
                  width: '18pt',
                  font: '7pt "Times New Roman"',
                  display: 'inline-block',
                }}
              >
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
              In addition to any informed consent and right to privacy and confidentiality pursuant to state and federal
              law or regulations, you shall be informed of the relationship between your health care provider, you and
              the respective role of any other health care provider with respect to the management of your care and
              treatment; and you may decline to receive services and may withdraw from such care at any time.
            </li>
          </ol>
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
        <span style={{ fontFamily: '"Times New Roman"' }}>&nbsp;</span>
      </p>
      <ol start={8} type='a' className='awlist18' style={{ margin: '0pt', paddingLeft: '0pt' }}>
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
          FOR MARYLAND RESIDENTS
          <ol
            type='i'
            className='awlist11'
            style={{
              marginRight: '0pt',
              marginLeft: '0pt',
              paddingLeft: '0pt',
            }}
          >
            <li style={{ marginLeft: '36pt', textIndent: '-24.33pt' }}>
              <span
                style={{
                  width: '18pt',
                  font: '7pt "Times New Roman"',
                  display: 'inline-block',
                }}
              >
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
              Lumimeds verifies the identity of the individual transmitting the communication.&nbsp; After the initial
              verification, Lumimeds will verify your identification through the assignment and use of a unique username
              and password combination and a pin number should you choose to use it. When you sign into the Website,
              your username and password (and pin number, as applicable) identify you.
            </li>
            <li style={{ marginLeft: '36pt', textIndent: '-27.67pt' }}>
              <span
                style={{
                  width: '18pt',
                  font: '7pt "Times New Roman"',
                  display: 'inline-block',
                }}
              >
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
              Access to data via the Website is restricted through the use of unique usernames and passwords. The
              username and password assigned to you are personal to you and you must not share them with any other
              individual.
            </li>
            <li style={{ marginLeft: '36pt', textIndent: '-31pt' }}>
              <span
                style={{
                  width: '18pt',
                  font: '7pt "Times New Roman"',
                  display: 'inline-block',
                }}
              >
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
              Provider is hereby providing you with access to provider’s notice of privacy practices. During the
              appointment, the provider will communicate with you and respond to your questions.
            </li>
            <li style={{ marginLeft: '36pt', textIndent: '-30.33pt' }}>
              <span
                style={{
                  width: '18pt',
                  font: '7pt "Times New Roman"',
                  display: 'inline-block',
                }}
              >
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
              A primary difference between telehealth and direct in-person service delivery is the inability to have
              direct physical contact with you.
            </li>
            <li style={{ marginLeft: '36pt', textIndent: '-27pt' }}>
              <span
                style={{
                  width: '18pt',
                  font: '7pt "Times New Roman"',
                  display: 'inline-block',
                }}
              >
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
              The quality of transmitted data may affect the quality of services provided by your health care provider.
            </li>
            <li style={{ marginLeft: '36pt', textIndent: '-30.33pt' }}>
              <span
                style={{
                  width: '18pt',
                  font: '7pt "Times New Roman"',
                  display: 'inline-block',
                }}
              >
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
              Changes in the environment and test conditions could be impossible to make during delivery of the Health
              Care Services.
            </li>
            <li style={{ marginLeft: '36pt', textIndent: '-33.67pt' }}>
              <span
                style={{
                  width: '18pt',
                  font: '7pt "Times New Roman"',
                  display: 'inline-block',
                }}
              >
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
              Health Care Services may not be provided by correspondence only. Health Care Services must be delivered by
              either audio or audio-visual devices.
            </li>
          </ol>
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
        <span style={{ fontFamily: '"Times New Roman"' }}>&nbsp;</span>
      </p>
      <ol start={9} type='a' className='awlist19' style={{ margin: '0pt', paddingLeft: '0pt' }}>
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
              width: '10.67pt',
              font: '7pt "Times New Roman"',
              display: 'inline-block',
            }}
          >
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </span>
          FOR MINNESOTA RESIDENTS
          <ol
            type='i'
            className='awlist11'
            style={{
              marginRight: '0pt',
              marginLeft: '0pt',
              paddingLeft: '0pt',
            }}
          >
            <li style={{ marginLeft: '36pt', textIndent: '-24.33pt' }}>
              <span
                style={{
                  width: '18pt',
                  font: '7pt "Times New Roman"',
                  display: 'inline-block',
                }}
              >
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
              Disclosures of your health records without your written consent shall be made in accordance with state and
              federal law regarding privacy and confidentiality. Examples of such disclosures include, but are not
              limited to, for specific public health activities, for health oversight activities, for judicial and
              administrative proceedings, for specific law enforcement purposes.
            </li>
            <li style={{ marginLeft: '36pt', textIndent: '-27.67pt' }}>
              <span
                style={{
                  width: '18pt',
                  font: '7pt "Times New Roman"',
                  display: 'inline-block',
                }}
              >
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
              You have the right to access and obtain copies of your health records and other information about you that
              is maintained by your health care provider. For more specific information regarding your rights to access
              to health records, please refer to the Minnesota Department of Health Notices Related to Health Records at
              health.state.mn.us/facilities/notices/index.html.&nbsp;
            </li>
          </ol>
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
        <span style={{ fontFamily: '"Times New Roman"' }}>&nbsp;</span>
      </p>
      <ol start={10} type='a' className='awlist20' style={{ margin: '0pt', paddingLeft: '0pt' }}>
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
              width: '10.67pt',
              font: '7pt "Times New Roman"',
              display: 'inline-block',
            }}
          >
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </span>
          FOR OKLAHOMA RESIDENTS
          <ol
            type='i'
            className='awlist11'
            style={{
              marginRight: '0pt',
              marginLeft: '0pt',
              paddingLeft: '0pt',
            }}
          >
            <li style={{ marginLeft: '36pt', textIndent: '-24.33pt' }}>
              <span
                style={{
                  width: '18pt',
                  font: '7pt "Times New Roman"',
                  display: 'inline-block',
                }}
              >
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
              You always retain the option to withhold or withdraw consent from obtaining Health Care Services. If you
              decide that you no longer wish to obtain health care services via the Website, it will not affect your
              right to future care or treatment, nor will you risk the loss or withdrawal of any program benefits to
              which you would otherwise be entitled.
            </li>
            <li style={{ marginLeft: '36pt', textIndent: '-27.67pt' }}>
              <span
                style={{
                  width: '18pt',
                  font: '7pt "Times New Roman"',
                  display: 'inline-block',
                }}
              >
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
              Patient access to all medical information transmitted during a telemedicine interaction is guaranteed by
              Provider and copies of this information are available at stated costs, which shall not exceed the direct
              cost of providing the copies.
            </li>
            <li style={{ marginLeft: '36pt', textIndent: '-31pt' }}>
              <span
                style={{
                  width: '18pt',
                  font: '7pt "Times New Roman"',
                  display: 'inline-block',
                }}
              >
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
              All existing confidentiality protections apply.
            </li>
            <li style={{ marginLeft: '36pt', textIndent: '-30.33pt' }}>
              <span
                style={{
                  width: '18pt',
                  font: '7pt "Times New Roman"',
                  display: 'inline-block',
                }}
              >
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
              Dissemination of any of any of your identifiable images or information from the telemedicine interaction
              to researches or other entities shall not occur without your consent.
            </li>
          </ol>
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
        <span style={{ fontFamily: '"Times New Roman"' }}>&nbsp;</span>
      </p>
      <ol start={11} type='a' className='awlist21' style={{ margin: '0pt', paddingLeft: '0pt' }}>
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
          FOR OREGON RESIDENTS
          <ol
            type='i'
            className='awlist11'
            style={{
              marginRight: '0pt',
              marginLeft: '0pt',
              paddingLeft: '0pt',
            }}
          >
            <li style={{ marginLeft: '36pt', textIndent: '-24.33pt' }}>
              <span
                style={{
                  width: '18pt',
                  font: '7pt "Times New Roman"',
                  display: 'inline-block',
                }}
              >
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
              You have choices with respect to receiving care and treatment from your health care provider. In this
              regard, you have a choice when you are referred to a facility or other health care provider by your health
              care provider for a diagnostic test or health care treatment, and may elect to receive the diagnostic test
              or other health care treatment from a facility or health care provider other than the one recommended by
              the health care providers affiliated with Lumimeds.
            </li>
            <li style={{ marginLeft: '36pt', textIndent: '-27.67pt' }}>
              <span
                style={{
                  width: '18pt',
                  font: '7pt "Times New Roman"',
                  display: 'inline-block',
                }}
              >
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
              If You choose to have the diagnostic test, health care treatment or service at a facility different from
              the one recommended by our affiliated health care providers, you are responsible for determining the
              extent or limitation of coverage for the diagnostic test, health care treatment or service at your chosen
              facility. Online services used by licensees to provide care via telemedicine should provide patients a
              clear mechanism to:
              <ol
                type='A'
                className='awlist22'
                style={{
                  marginRight: '0pt',
                  marginLeft: '0pt',
                  paddingLeft: '0pt',
                }}
              >
                <li style={{ marginLeft: '45pt', textIndent: '-18pt' }}>
                  <span
                    style={{
                      width: '6.33pt',
                      font: '7pt "Times New Roman"',
                      display: 'inline-block',
                    }}
                  >
                    &nbsp;&nbsp;&nbsp;&nbsp;
                  </span>
                  Access, supplement, and amend patient-provided personal health information;
                </li>
                <li style={{ marginLeft: '45pt', textIndent: '-18pt' }}>
                  <span
                    style={{
                      width: '7pt',
                      font: '7pt "Times New Roman"',
                      display: 'inline-block',
                    }}
                  >
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  </span>
                  Provide feedback regarding the site and the quality of information and services; and
                </li>
                <li style={{ marginLeft: '45pt', textIndent: '-18pt' }}>
                  <span
                    style={{
                      width: '7pt',
                      font: '7pt "Times New Roman"',
                      display: 'inline-block',
                    }}
                  >
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  </span>
                  Register complaints, including information regarding filing a complaint with the Oregon Medical Board
                  at{' '}
                  <a href='https://www.oregon.gov/omb/pages/default.aspx' style={{ textDecoration: 'none' }}>
                    <u>
                      <span style={{ color: '#467886' }}>https://www.oregon.gov/omb/pages/default.aspx</span>
                    </u>
                  </a>
                  .&nbsp;
                </li>
              </ol>
            </li>
          </ol>
        </li>
      </ol>
      <p
        style={{
          marginTop: '0pt',
          marginLeft: '72pt',
          marginBottom: '0pt',
          textAlign: 'justify',
          fontSize: '12pt',
        }}
      >
        <span style={{ fontFamily: '"Times New Roman"' }}>&nbsp;</span>
      </p>
      <ol start={12} type='a' className='awlist23' style={{ margin: '0pt', paddingLeft: '0pt' }}>
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
              width: '10.67pt',
              font: '7pt "Times New Roman"',
              display: 'inline-block',
            }}
          >
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </span>
          FOR TEXAS RESIDENTS
          <ol
            type='i'
            className='awlist11'
            style={{
              marginRight: '0pt',
              marginLeft: '0pt',
              paddingLeft: '0pt',
            }}
          >
            <li style={{ marginLeft: '36pt', textIndent: '-24.33pt' }}>
              <span
                style={{
                  width: '18pt',
                  font: '7pt "Times New Roman"',
                  display: 'inline-block',
                }}
              >
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
              An additional in-person medical evaluation may be necessary to meet your needs if the provider is unable
              to gather all the clinical information via the Website to safely treat you.
            </li>
            <li style={{ marginLeft: '36pt', textIndent: '-27.67pt' }}>
              <span
                style={{
                  width: '18pt',
                  font: '7pt "Times New Roman"',
                  display: 'inline-block',
                }}
              >
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
              Unless your provider specifically discloses otherwise, with the exception of charges for Health Care
              Services delivered to patients, providers do not have any financial interest in any information, products,
              or services offered through the Website.
            </li>
            <li style={{ marginLeft: '36pt', textIndent: '-31pt' }}>
              <span
                style={{
                  width: '18pt',
                  font: '7pt "Times New Roman"',
                  display: 'inline-block',
                }}
              >
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
              The response time for emails, electronic messages and other communications can be found on the Website.
            </li>
            <li style={{ marginLeft: '36pt', textIndent: '-30.33pt' }}>
              <span
                style={{
                  width: '18pt',
                  font: '7pt "Times New Roman"',
                  display: 'inline-block',
                }}
              >
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
              NOTICE CONCERNING COMPLAINTS
              <ol
                type='A'
                className='awlist22'
                style={{
                  marginRight: '0pt',
                  marginLeft: '0pt',
                  paddingLeft: '0pt',
                }}
              >
                <li style={{ marginLeft: '45pt', textIndent: '-18pt' }}>
                  <span
                    style={{
                      width: '6.33pt',
                      font: '7pt "Times New Roman"',
                      display: 'inline-block',
                    }}
                  >
                    &nbsp;&nbsp;&nbsp;&nbsp;
                  </span>
                  Complaints about physicians, as well as other licensees and registrants of the Texas Medical Board,
                  including physician assistants, acupuncturists, and surgical assistants may be reported for
                  investigation at the following address: Texas Medical Board Attention: Investigations 333 Guadalupe,
                  Tower 3, Suite 610 P.O. Box 2018, MC- 263 Austin, Texas 78768-2018, Assistance in filing a complaint
                  is available by calling the following telephone number: 1-800-201-9353. For more information please
                  visit the website at{' '}
                  <a href='http://www.tmb.state.tx.us' style={{ textDecoration: 'none' }}>
                    <u>
                      <span style={{ color: '#467886' }}>www.tmb.state.tx.us</span>
                    </u>
                  </a>
                  .
                </li>
              </ol>
            </li>
          </ol>
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
        <span style={{ fontFamily: '"Times New Roman"' }}>&nbsp;</span>
      </p>
      <ol start={13} type='a' className='awlist24' style={{ margin: '0pt', paddingLeft: '0pt' }}>
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
              width: '4.67pt',
              font: '7pt "Times New Roman"',
              display: 'inline-block',
            }}
          >
            &nbsp;&nbsp;&nbsp;
          </span>
          FOR VIRGINIA RESIDENTS
          <ol
            type='i'
            className='awlist11'
            style={{
              marginRight: '0pt',
              marginLeft: '0pt',
              paddingLeft: '0pt',
            }}
          >
            <li style={{ marginLeft: '36pt', textIndent: '-24.33pt' }}>
              <span
                style={{
                  width: '18pt',
                  font: '7pt "Times New Roman"',
                  display: 'inline-block',
                }}
              >
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
              Your health care provider will maintain your records while you are an active patient or will transfer your
              records to another practitioner or health care provider should you wish to seek care elsewhere. Your
              health care provider will maintain your records for a minimum of six (6) years following your last
              encounter with the following exceptions:
              <ol
                type='A'
                className='awlist22'
                style={{
                  marginRight: '0pt',
                  marginLeft: '0pt',
                  paddingLeft: '0pt',
                }}
              >
                <li style={{ marginLeft: '45pt', textIndent: '-18pt' }}>
                  <span
                    style={{
                      width: '6.33pt',
                      font: '7pt "Times New Roman"',
                      display: 'inline-block',
                    }}
                  >
                    &nbsp;&nbsp;&nbsp;&nbsp;
                  </span>
                  Records of a minor child, including immunizations, must be maintained until the child reaches the age
                  of 18 or becomes emancipated, with a minimum time for record retention of six years from the last
                  patient encounter regardless of the age of the child;
                </li>
                <li style={{ marginLeft: '45pt', textIndent: '-18pt' }}>
                  <span
                    style={{
                      width: '7pt',
                      font: '7pt "Times New Roman"',
                      display: 'inline-block',
                    }}
                  >
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  </span>
                  Records that have previously been transferred to another practitioner or health care provider or
                  provided to the patient or his personal representative; or
                </li>
                <li style={{ marginLeft: '45pt', textIndent: '-18pt' }}>
                  <span
                    style={{
                      width: '7pt',
                      font: '7pt "Times New Roman"',
                      display: 'inline-block',
                    }}
                  >
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  </span>
                  Records that are required by contractual obligation or federal law to be maintained for a longer
                  period of time.
                </li>
              </ol>
            </li>
            <li style={{ marginLeft: '36pt', textIndent: '-27.67pt' }}>
              <span
                style={{
                  width: '18pt',
                  font: '7pt "Times New Roman"',
                  display: 'inline-block',
                }}
              >
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
              Patient records will only be destroyed in a manner that protects patient confidentiality.
            </li>
            <li style={{ marginLeft: '36pt', textIndent: '-31pt' }}>
              <span
                style={{
                  width: '18pt',
                  font: '7pt "Times New Roman"',
                  display: 'inline-block',
                }}
              >
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
              For more information from the Virginia Department of Health Professions, go to{' '}
              <a href='http://www.dhp.virginia.gov/Medicine' style={{ textDecoration: 'none' }}>
                <u>
                  <span style={{ color: '#467886' }}>www.dhp.virginia.gov/Medicine</span>
                </u>
              </a>
              .&nbsp;
            </li>
            <li style={{ marginLeft: '36pt', textIndent: '-30.33pt' }}>
              <span
                style={{
                  width: '18pt',
                  font: '7pt "Times New Roman"',
                  display: 'inline-block',
                }}
              >
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
              We will obtain identification information on each patient.
            </li>
            <li style={{ marginLeft: '36pt', textIndent: '-27pt' }}>
              <span
                style={{
                  width: '18pt',
                  font: '7pt "Times New Roman"',
                  display: 'inline-block',
                }}
              >
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
              The Website offers a variety of types of activities using telemedicine services. These include but are not
              limited to: diagnosis and management of both acute and chronic medical conditions, prescriptions, ordering
              of laboratory testing, radiographic studies, and other diagnostic testing, patient education, and
              appointment scheduling.
            </li>
            <li style={{ marginLeft: '36pt', textIndent: '-30.33pt' }}>
              <span
                style={{
                  width: '18pt',
                  font: '7pt "Times New Roman"',
                  display: 'inline-block',
                }}
              >
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
              The patient agrees that it is the role of the physician to determine whether or not the condition being
              diagnosed and/or treated is appropriate for a telemedicine encounter.
            </li>
            <li style={{ marginLeft: '36pt', textIndent: '-33.67pt' }}>
              <span
                style={{
                  width: '18pt',
                  font: '7pt "Times New Roman"',
                  display: 'inline-block',
                }}
              >
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
              We utilize the latest security measures with the use of telemedicine services to ensure each patient’s
              protected health information is secure. Notwithstanding such measures there is still potential risk to
              privacy.
            </li>
            <li style={{ marginLeft: '36pt', textIndent: '-37pt' }}>
              <span
                style={{
                  width: '18pt',
                  font: '7pt "Times New Roman"',
                  display: 'inline-block',
                }}
              >
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
              We will obtain expressed patient consent to forward patient-identifiable information to a third party.
            </li>
          </ol>
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
        <span style={{ fontFamily: '"Times New Roman"' }}>&nbsp;</span>
      </p>
      <ol start={14} type='a' className='awlist25' style={{ margin: '0pt', paddingLeft: '0pt' }}>
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
          FOR WISCONSIN RESIDENTS
          <ol
            type='i'
            className='awlist11'
            style={{
              marginRight: '0pt',
              marginLeft: '0pt',
              paddingLeft: '0pt',
            }}
          >
            <li style={{ marginLeft: '36pt', textIndent: '-24.33pt' }}>
              <span
                style={{
                  width: '18pt',
                  font: '7pt "Times New Roman"',
                  display: 'inline-block',
                }}
              >
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
              You have the right to request and receive information within a reasonable period of time after your
              request the fees charged for a health care service, diagnostic test, or procedure provided by your health
              care provider.
            </li>
          </ol>
        </li>
      </ol>
      <p
        style={{
          marginTop: '0pt',
          marginLeft: '45pt',
          marginBottom: '0pt',
          textAlign: 'justify',
          fontSize: '12pt',
        }}
      >
        <strong>
          <span style={{ fontFamily: '"Times New Roman"' }}>&nbsp;</span>
        </strong>
      </p>
      <ol start={27} type='I' style={{ margin: '0pt', paddingLeft: '0pt' }}>
        <li
          style={{
            marginLeft: '43.34pt',
            marginBottom: '12pt',
            textAlign: 'justify',
            paddingLeft: '4pt',
            fontFamily: '"Times New Roman"',
            fontSize: '12pt',
            fontWeight: 'bold',
          }}
        >
          CONTACT INFORMATION
        </li>
      </ol>
      <p
        style={{
          marginTop: '12pt',
          marginBottom: '12pt',
          textIndent: '36pt',
          textAlign: 'justify',
          fontSize: '12pt',
        }}
      >
        <span style={{ fontFamily: '"Times New Roman"' }}>If you have any questions or concerns, please contact:</span>
      </p>
      <p
        style={{
          marginTop: '0pt',
          marginBottom: '0pt',
          textIndent: '36pt',
          textAlign: 'justify',
          fontSize: '12pt',
        }}
      >
        <span style={{ fontFamily: '"Times New Roman"' }}>Luminate Ventures LLC d/b/a Lumimeds</span>
      </p>
      <p
        style={{
          marginTop: '0pt',
          marginBottom: '0pt',
          textIndent: '36pt',
          textAlign: 'justify',
          fontSize: '12pt',
        }}
      >
        <span style={{ fontFamily: '"Times New Roman"' }}>1810 E Sahara Ave. Ste 215</span>
      </p>
      <p
        style={{
          marginTop: '0pt',
          marginBottom: '0pt',
          textIndent: '36pt',
          textAlign: 'justify',
          fontSize: '12pt',
        }}
      >
        <span style={{ fontFamily: '"Times New Roman"' }}>Las Vegas, NV, 89104, USA</span>
      </p>
      <p
        style={{
          marginTop: '0pt',
          marginBottom: '0pt',
          textIndent: '36pt',
          textAlign: 'justify',
          fontSize: '12pt',
        }}
      >
        <span style={{ fontFamily: '"Times New Roman"' }}>help@lumimeds.com</span>
      </p>
      <p
        style={{
          marginTop: '12pt',
          marginBottom: '12pt',
          textIndent: '36pt',
          textAlign: 'justify',
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
        <span style={{ fontFamily: '"Times New Roman"' }}>Date Modified: January 13, 2026</span>
      </p>
      <p
        style={{
          marginTop: '12pt',
          marginBottom: '12pt',
          textIndent: '36pt',
          textAlign: 'justify',
          fontSize: '12pt',
        }}
      >
        <span style={{ fontFamily: '"Times New Roman"' }}>&nbsp;</span>
      </p>
      <p style={{ marginTop: '12pt', marginBottom: '12pt', fontSize: '12pt' }}>
        <span style={{ fontFamily: '"Times New Roman"' }}>&nbsp;</span>
      </p>
    </div>
  );
};

export default TermsOfUsePage;
