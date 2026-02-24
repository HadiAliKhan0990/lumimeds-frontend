import React from 'react';
import './styles.css';
import { Metadata } from 'next';
import Link from 'next/link';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Privacy Policy | LumiMeds',
    description:
      'Learn how LumiMeds collects, uses, and protects your personal information. Your privacy is our priority. Read our full privacy policy here.',
    robots:
      process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true'
        ? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
        : 'noindex, nofollow',
    alternates: {
      canonical: 'https://www.lumimeds.com/privacy-policy',
    },
    openGraph: {
      title: 'Privacy Policy | LumiMeds',
      description:
        'Learn how LumiMeds collects, uses, and protects your personal information. Your privacy is our priority. Read our full privacy policy here.',
      type: 'website',
      url: 'https://www.lumimeds.com/privacy-policy',
    },
  };
}

const PrivacyPolicyPage = () => {
  return (
    <div className='container mb-5' style={{ color: 'black', paddingTop: '128px' }}>
      <div style={{ clear: 'both' }}>
        <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'right' }}>&nbsp;</p>
      </div>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'center' }}>
        <strong>LUMINATE VENTURES LLC</strong>
      </p>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'center' }}>
        <strong>&nbsp;</strong>
      </p>
      <h1 style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'center' }}>
        <strong>LumiMeds Privacy Policy</strong>
      </h1>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'center' }}>
        <strong>&nbsp;</strong>
      </p>
      <p
        style={{
          marginTop: '0pt',
          marginBottom: '0pt',
          textAlign: 'justify',
          lineHeight: '120%',
          verticalAlign: 'middle',
        }}
      >
        <strong>
          <span style={{ verticalAlign: 'middle' }}>Last Updated: </span>
        </strong>
        <span style={{ verticalAlign: 'middle' }}>April 11, 2025</span>
      </p>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'justify' }}>&nbsp;</p>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'justify' }}>
        Please read this Privacy Policy carefully. If you don’t agree with this Privacy Policy, do not use our Website
        or Platform. By accessing or using our Website(s) (www.lumimeds.com) or Platform, you agree that you have read
        this Privacy Policy and you understand, and consent to be bound by, the terms and conditions herein. If you have
        not done so already, please also review our{' '}
        <Link href='/termsofuse' style={{ color: 'blue', textDecoration: 'underline' }}>
          Terms of Use
        </Link>
        . The{' '}
        <Link href='/termsofuse' style={{ color: 'blue', textDecoration: 'underline' }}>
          Terms of Use
        </Link>{' '}
        contain provisions that limit our liability to you. If you are using the Services on behalf of an individual
        other than yourself, you represent that you are authorized by such individual to act on such individual&apos;s
        behalf and that such individual acknowledges and agrees to the terms and conditions herein.
      </p>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'justify' }}>&nbsp;</p>
      <ol type={'1'} className='awlist1' style={{ margin: '0pt', paddingLeft: '0pt' }}>
        <li
          style={{
            marginLeft: '18pt',
            textIndent: '-18pt',
            textAlign: 'justify',
            fontWeight: 'bold',
          }}
        >
          <span
            style={{
              width: '9pt',
              font: '7pt "Times New Roman"',
              display: 'inline-block',
            }}
          >
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </span>
          Please Read Carefully
        </li>
      </ol>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'justify' }}>
        <strong>&nbsp;</strong>
      </p>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'justify' }}>
        This Online Privacy Policy describes the information that Luminate Ventures, LLC d/b/a Lumimeds (“we” or
        “Company”) collects about you though our website(s), mobile application, and any other services we provide
        (collectively, the “Services”), how we use and share that information, and the privacy choices we offer. This
        policy applies to information we collect when you access or use our website(s) and mobile application
        (collectively, the “Platform”), when you use our Services or when you otherwise interact with us.
      </p>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'justify' }}>
        <strong>&nbsp;</strong>
      </p>
      <ol start={2} type={'1'} className='awlist2' style={{ margin: '0pt', paddingLeft: '0pt' }}>
        <li
          style={{
            marginLeft: '18pt',
            textIndent: '-18pt',
            textAlign: 'justify',
            fontWeight: 'bold',
          }}
        >
          <span
            style={{
              width: '9pt',
              font: '7pt "Times New Roman"',
              display: 'inline-block',
            }}
          >
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </span>
          Changes to this Online Privacy Policy
        </li>
      </ol>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'justify' }}>&nbsp;</p>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'justify' }}>
        We may change this Online Privacy Policy from time to time. If we make changes, we will notify you by posting
        the updated policy on our Platform and revising the “Last Updated” date above. We encourage you to review the
        Online Privacy Policy whenever you use our Services to stay informed about our information practices and about
        ways you can help protect your privacy.
      </p>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'justify' }}>
        <strong>&nbsp;</strong>
      </p>
      <ol start={3} type={'1'} className='awlist3' style={{ margin: '0pt', paddingLeft: '0pt' }}>
        <li
          style={{
            marginLeft: '18pt',
            textIndent: '-18pt',
            textAlign: 'justify',
            fontWeight: 'bold',
          }}
        >
          <span
            style={{
              width: '9pt',
              font: '7pt "Times New Roman"',
              display: 'inline-block',
            }}
          >
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </span>
          Confidentiality of Health Information
        </li>
      </ol>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'justify' }}>&nbsp;</p>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'justify' }}>
        Company understands that health information about you and your health is personal.{' '}
        <strong>While Company is not a healthcare provider,&nbsp;</strong>
        we support your privacy and ensure that the transmittal and use of your information complies with applicable
        data privacy laws, unless you have authorized Company to transmit information to you by other means. In this
        regard, where applicable, we comply with the Health Insurance Portability and Accountability Act of 1996
        (“HIPAA”) and the Health Information Technology for Economic and Clinical Health Act (“HITECH Act”), and other
        relevant state laws and regulations by entering into Business Associate Agreements with the treatment providers
        for which we provide services to ensure that your health information is appropriately safeguarded.
        Notwithstanding the foregoing, you are responsible for ensuring the accuracy of any health or personal data
        submitted to Company. We are not liable for consequences resulting from incomplete, inaccurate, or false
        information.
      </p>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'justify' }}>&nbsp;</p>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'justify' }}>&nbsp;</p>
      <ol start={4} type={'1'} className='awlist4' style={{ margin: '0pt', paddingLeft: '0pt' }}>
        <li
          style={{
            marginLeft: '18pt',
            textIndent: '-18pt',
            textAlign: 'justify',
            pageBreakAfter: 'avoid',
            fontWeight: 'bold',
          }}
        >
          <span
            style={{
              width: '9pt',
              font: '7pt "Times New Roman"',
              display: 'inline-block',
            }}
          >
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </span>
          Collection of Information
        </li>
      </ol>
      <p
        style={{
          marginTop: '0pt',
          marginBottom: '0pt',
          textAlign: 'justify',
          pageBreakAfter: 'avoid',
        }}
      >
        &nbsp;
      </p>
      <ol type={'1'} className='awlist5' style={{ margin: '0pt', paddingLeft: '0pt' }}>
        <li
          style={{
            marginLeft: '39.6pt',
            textIndent: '-21.6pt',
            textAlign: 'justify',
            pageBreakAfter: 'avoid',
            fontWeight: 'bold',
          }}
        >
          <span
            style={{
              width: '3.6pt',
              font: '7pt "Times New Roman"',
              display: 'inline-block',
            }}
          >
            &nbsp;&nbsp;
          </span>
          Information You Provide
        </li>
      </ol>
      <p
        style={{
          marginTop: '0pt',
          marginBottom: '0pt',
          textAlign: 'justify',
          pageBreakAfter: 'avoid',
        }}
      >
        &nbsp;
      </p>
      <p
        style={{
          marginTop: '0pt',
          marginBottom: '0pt',
          textAlign: 'justify',
          pageBreakAfter: 'avoid',
        }}
      >
        We collect information you provide, such as when you email us, sign up through our Platform, or submit
        information through our Platform. We may collect, but are not limited to collecting, the following information:
        your name, gender, email address, mailing address, phone number, date of birth, payment and bank information
        provided.
      </p>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'justify' }}>
        <strong>&nbsp;</strong>
      </p>
      <ol start={2} type={'1'} className='awlist6' style={{ margin: '0pt', paddingLeft: '0pt' }}>
        <li
          style={{
            marginLeft: '39.6pt',
            textIndent: '-21.6pt',
            textAlign: 'justify',
            pageBreakAfter: 'avoid',
            fontWeight: 'bold',
          }}
        >
          <span
            style={{
              width: '3.6pt',
              font: '7pt "Times New Roman"',
              display: 'inline-block',
            }}
          >
            &nbsp;&nbsp;
          </span>
          Children
        </li>
      </ol>
      <p
        style={{
          marginTop: '0pt',
          marginBottom: '0pt',
          textAlign: 'justify',
          pageBreakAfter: 'avoid',
        }}
      >
        <strong>&nbsp;</strong>
      </p>
      <p
        style={{
          marginTop: '0pt',
          marginBottom: '0pt',
          textAlign: 'justify',
          pageBreakAfter: 'avoid',
        }}
      >
        Company does not knowingly or intentionally collect or maintain personally identifiable information from persons
        under 18 years of age.&nbsp; If you are under 18 years of age, then please do not use the Services. If Company
        learns that personally identifiable information of persons less than 18 years of age has been collected consent,
        then Company will take the appropriate steps to delete this information. Should you become aware that we have
        collected information from someone under the age of 18, please contact us immediately at help@lumimeds.com.
      </p>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'justify' }}>
        <strong>&nbsp;</strong>
      </p>
      <ol start={3} type={'1'} className='awlist7' style={{ margin: '0pt', paddingLeft: '0pt' }}>
        <li
          style={{
            marginLeft: '39.6pt',
            textIndent: '-21.6pt',
            textAlign: 'justify',
            pageBreakInside: 'avoid',
            pageBreakAfter: 'avoid',
            fontWeight: 'bold',
          }}
        >
          <span
            style={{
              width: '3.6pt',
              font: '7pt "Times New Roman"',
              display: 'inline-block',
            }}
          >
            &nbsp;&nbsp;
          </span>
          Information We Collect from Your Use of the Services
        </li>
      </ol>
      <p
        style={{
          marginTop: '0pt',
          marginBottom: '0pt',
          textAlign: 'justify',
          pageBreakInside: 'avoid',
          pageBreakAfter: 'avoid',
        }}
      >
        &nbsp;
      </p>
      <p
        style={{
          marginTop: '0pt',
          marginBottom: '0pt',
          textAlign: 'justify',
          pageBreakInside: 'avoid',
          pageBreakAfter: 'avoid',
        }}
      >
        We collect information about you when you use our Platform, including, but not limited to the following:
      </p>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'justify' }}>&nbsp;</p>
      <ul style={{ margin: '0pt', paddingLeft: '0pt', listStyle: 'disc' }}>
        <li
          style={{
            marginLeft: '10.52pt',
            textAlign: 'justify',
            paddingLeft: '7.48pt',
            fontFamily: 'serif',
          }}
        >
          <strong>
            <span style={{ fontFamily: '"Times New Roman"' }}>Account Information</span>
          </strong>
          <span style={{ fontFamily: '"Times New Roman"' }}>
            . When you register with us using the Platform to create an account and become a registered user, you will
            need to provide us with certain personally identifiable information to complete the registration, including
            information that can be used to contact or identify you and payment or other billing information in some
            cases.
          </span>
        </li>
      </ul>
      <p
        style={{
          marginTop: '0pt',
          marginLeft: '18pt',
          marginBottom: '0pt',
          textAlign: 'justify',
        }}
      >
        &nbsp;
      </p>
      <ul style={{ margin: '0pt', paddingLeft: '0pt', listStyle: 'disc' }}>
        <li
          style={{
            marginLeft: '10.52pt',
            textAlign: 'justify',
            paddingLeft: '7.48pt',
            fontFamily: 'serif',
          }}
        >
          <strong>
            <span style={{ fontFamily: '"Times New Roman"' }}>Device Information</span>
          </strong>
          <span style={{ fontFamily: '"Times New Roman"' }}>
            . We may automatically collect certain information about the computer or devices (including mobile devices)
            you use to access the Services. For example, we may collect and analyze information such as (a) IP
            addresses, geolocation information (as described in the next section below), unique device identifiers and
            other information about your mobile phone or other mobile device(s), browser types, browser language,
            operating system, the state or country from which you accessed the Services; and (b) information related to
            the ways in which you interact with the Services, such as: referring and exit pages and URLs, platform type,
            the number of clicks, domain names, landing pages, pages and content viewed and the order of those pages,
            the amount of time spent on particular pages, the date and time you used the Services, the frequency of your
            use of the Services, error logs, and other similar information. As described further below, we may use
            third-party analytics providers and technologies, including cookies and similar tools, to assist in
            collecting this information.
          </span>
        </li>
      </ul>
      <p
        style={{
          marginTop: '0pt',
          marginLeft: '18pt',
          marginBottom: '0pt',
          textAlign: 'justify',
        }}
      >
        &nbsp;
      </p>
      <ul style={{ margin: '0pt', paddingLeft: '0pt', listStyle: 'disc' }}>
        <li
          style={{
            marginLeft: '10.52pt',
            textAlign: 'justify',
            paddingLeft: '7.48pt',
            fontFamily: 'serif',
          }}
        >
          <strong>
            <span style={{ fontFamily: '"Times New Roman"' }}>Location Information</span>
          </strong>
          <span style={{ fontFamily: '"Times New Roman"' }}>
            . We may collect different types of information about your location, including general information (e.g., IP
            address, zip code) and more specific information (e.g., GPS-based functionality on mobile devices used to
            access the Services), and may use that information to customize the Services with location-based
            information, advertising, and features. For example, if your IP address indicates an origin in Los Angeles,
            California, the Services may be customized with Los Angeles-specific information and advertisements. In
            order to do this, your location information may be shared with our agents, vendors or advertisers. If you
            access the Services through a mobile device and you do not want your device to provide us with
            location-tracking information, you can disable the GPS or other location-tracking functions on your device,
            provided your device allows you to do this. See your device manufacturer’s instructions for further details.
          </span>
        </li>
      </ul>
      <p
        style={{
          marginTop: '0pt',
          marginLeft: '36pt',
          marginBottom: '0pt',
          textAlign: 'justify',
        }}
      >
        &nbsp;
      </p>
      <ul style={{ margin: '0pt', paddingLeft: '0pt', listStyle: 'disc' }}>
        <li
          style={{
            marginLeft: '10.52pt',
            textAlign: 'justify',
            paddingLeft: '7.48pt',
            fontFamily: 'serif',
          }}
        >
          <a>
            <strong>
              <span style={{ fontFamily: '"Times New Roman"' }}>Cookies and Other Electronic Technologies</span>
            </strong>
          </a>
          <a href='#_cmnt1' style={{ textDecoration: 'none' }}>
            <span style={{ fontFamily: '"Times New Roman"', fontSize: '8pt' }}>[A1]</span>
          </a>
          <span style={{ fontFamily: '"Times New Roman"' }}>
            . We may use the tools outlined below in order to better understand users. As we adopt additional
            technologies, we may also gather additional information through other methods.
          </span>
        </li>
      </ul>
      <p
        style={{
          marginTop: '0pt',
          marginLeft: '36pt',
          marginBottom: '0pt',
          textAlign: 'justify',
        }}
      >
        &nbsp;
      </p>
      <ul style={{ margin: '0pt', paddingLeft: '0pt', listStyle: 'circle' }}>
        <li
          style={{
            marginLeft: '48.2pt',
            textAlign: 'justify',
            paddingLeft: '5.8pt',
            fontFamily: 'serif',
          }}
        >
          <strong>
            <span style={{ fontFamily: '"Times New Roman"' }}>Cookies</span>
          </strong>
          <span style={{ fontFamily: '"Times New Roman"' }}>
            : “Cookies” are small computer files transferred to your computing device that contain information such as
            user ID, user preferences, lists of pages visited and activities conducted while using the Services. We use
            Cookies to help us improve or tailor the Services by tracking your navigation habits, storing your
            authentication status so you do not have to re-enter your credentials each time you use the Services,
            customizing your experience with the Services, and for analytics and fraud prevention.&nbsp;
          </span>
        </li>
      </ul>
      <p
        style={{
          marginTop: '0pt',
          marginLeft: '54pt',
          marginBottom: '0pt',
          textAlign: 'justify',
        }}
      >
        &nbsp;
      </p>
      <p
        style={{
          marginTop: '0pt',
          marginLeft: '54pt',
          marginBottom: '0pt',
          textAlign: 'justify',
        }}
      >
        We may use a type of advertising commonly known as interest-based or online behavioral advertising. This means
        that some of our business partners use Cookies to display Company ads on other websites and services based on
        information about your use of the Services and on your interests (as inferred from your online activity). Other
        Cookies used by our business partners may collect information when you use the Services, such as the IP address,
        mobile device ID, operating system, browser, web page interactions, the geographic location of your internet
        service provider, and demographic information such as sex and age range. These Cookies help Company learn more
        about our users’ demographics and internet behaviors.
      </p>
      <p
        style={{
          marginTop: '0pt',
          marginLeft: '54pt',
          marginBottom: '0pt',
          textAlign: 'justify',
        }}
      >
        &nbsp;
      </p>
      <p
        style={{
          marginTop: '0pt',
          marginLeft: '54pt',
          marginBottom: '0pt',
          textAlign: 'justify',
        }}
      >
        For more information on cookies, visit{' '}
        <a href='http://www.allaboutcookies.org' style={{ textDecoration: 'none' }}>
          <u>
            <span style={{ color: '#000000' }}>http://www.allaboutcookies.org</span>
          </u>
        </a>
        .
      </p>
      <p
        style={{
          marginTop: '0pt',
          marginLeft: '54pt',
          marginBottom: '0pt',
          textAlign: 'justify',
        }}
      >
        &nbsp;
      </p>
      <ul style={{ margin: '0pt', paddingLeft: '0pt', listStyle: 'circle' }}>
        <li
          style={{
            marginLeft: '48.2pt',
            textAlign: 'justify',
            paddingLeft: '5.8pt',
            fontFamily: 'serif',
          }}
        >
          <strong>
            <span style={{ fontFamily: '"Times New Roman"' }}>Web Beacons</span>
          </strong>
          <span style={{ fontFamily: '"Times New Roman"' }}>
            : “Web Beacons” (a.k.a. clear GIFs or pixel tags) are tiny graphic image files imbedded in a web page or
            email that may be used to collect anonymous information about your use of our Services, the websites of
            selected advertisers, and the emails, special promotions or newsletters that we send you. The information
            collected by Web Beacons allows us to analyze how many people are using the Services, using the selected
            advertisers’ websites or opening our emails, and for what purpose, and also allows us to enhance our
            interest-based advertising.
          </span>
        </li>
      </ul>
      <p
        style={{
          marginTop: '0pt',
          marginLeft: '54pt',
          marginBottom: '0pt',
          textAlign: 'justify',
        }}
      >
        &nbsp;
      </p>
      <ul style={{ margin: '0pt', paddingLeft: '0pt', listStyle: 'circle' }}>
        <li
          style={{
            marginLeft: '48.2pt',
            textAlign: 'justify',
            paddingLeft: '5.8pt',
            fontFamily: 'serif',
          }}
        >
          <strong>
            <span style={{ fontFamily: '"Times New Roman"' }}>Platform Analytics</span>
          </strong>
          <span style={{ fontFamily: '"Times New Roman"' }}>
            : We may use third-party analytics services in connection with the Platform, including, for example, to
            register mouse clicks, mouse movements, scrolling activity and text that you type into the Platform. These
            analytics services generally do not collect personal information unless you voluntarily provide it and
            generally do not track your browsing habits across sites which do not use their services. We use the
            information collected from these services to help make the Platform easier to use.
          </span>
        </li>
      </ul>
      <p
        style={{
          marginTop: '0pt',
          marginLeft: '36pt',
          marginBottom: '0pt',
          textAlign: 'justify',
        }}
      >
        &nbsp;
      </p>
      <ul style={{ margin: '0pt', paddingLeft: '0pt', listStyle: 'circle' }}>
        <li
          style={{
            marginLeft: '48.2pt',
            textAlign: 'justify',
            paddingLeft: '5.8pt',
            fontFamily: 'serif',
          }}
        >
          <strong>
            <span style={{ fontFamily: '"Times New Roman"' }}>Mobile Device Identifiers</span>
          </strong>
          <span style={{ fontFamily: '"Times New Roman"' }}>
            : Mobile device identifiers are data stored on your mobile device that may track mobile device and data and
            activities occurring on and through it, as well as the applications installed on it. Mobile device
            identifiers enable collection of personal information (such as media access control, address and location)
            and traffic data. Mobile device identifiers help Company learn more about our users’ demographics and
            internet behaviors.
          </span>
        </li>
      </ul>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'justify' }}>
        <strong>&nbsp;</strong>
      </p>
      <ol start={4} type={'1'} className='awlist8' style={{ margin: '0pt', paddingLeft: '0pt' }}>
        <li
          style={{
            marginLeft: '39.6pt',
            textIndent: '-21.6pt',
            textAlign: 'justify',
            fontWeight: 'bold',
          }}
        >
          <span
            style={{
              width: '3.6pt',
              font: '7pt "Times New Roman"',
              display: 'inline-block',
            }}
          >
            &nbsp;&nbsp;
          </span>
          Information from Third Parties
        </li>
      </ol>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'justify' }}>&nbsp;</p>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'justify' }}>
        We may obtain additional information about you from third parties such as marketers, partners, researchers, and
        others. We may combine information that we collect from you with information about you that we obtain from such
        third parties and information derived from any other subscription, product, or service we provide.
      </p>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'justify' }}>
        <strong>&nbsp;</strong>
      </p>
      <ol start={5} type={'1'} className='awlist9' style={{ margin: '0pt', paddingLeft: '0pt' }}>
        <li
          style={{
            marginLeft: '39.6pt',
            textIndent: '-21.6pt',
            textAlign: 'justify',
            pageBreakAfter: 'avoid',
            fontWeight: 'bold',
          }}
        >
          <span
            style={{
              width: '3.6pt',
              font: '7pt "Times New Roman"',
              display: 'inline-block',
            }}
          >
            &nbsp;&nbsp;
          </span>
          Aggregate or De-identified Data
        </li>
      </ol>
      <p
        style={{
          marginTop: '0pt',
          marginBottom: '0pt',
          textAlign: 'justify',
          pageBreakAfter: 'avoid',
        }}
      >
        <strong>&nbsp;</strong>
      </p>
      <p
        style={{
          marginTop: '0pt',
          marginBottom: '0pt',
          textAlign: 'justify',
          pageBreakAfter: 'avoid',
        }}
      >
        We may aggregate and/or de-identify information collected by the Services or via other means so that the
        information is not intended to identify you. Our use and disclosure of aggregated and/or de-identified
        information is not subject to any restrictions under this Online Privacy Policy, and we may disclose it to
        others without limitation for any purpose, in accordance with applicable laws and regulations.
      </p>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'justify' }}>&nbsp;</p>
      <ol start={5} type={'1'} className='awlist10' style={{ margin: '0pt', paddingLeft: '0pt' }}>
        <li
          style={{
            marginLeft: '18pt',
            textIndent: '-18pt',
            textAlign: 'justify',
            fontWeight: 'bold',
          }}
        >
          <span
            style={{
              width: '9pt',
              font: '7pt "Times New Roman"',
              display: 'inline-block',
            }}
          >
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </span>
          <a>Use of Information</a>
          <a href='#_cmnt2' style={{ textDecoration: 'none' }}>
            {/* <span style={{ fontSize: "8pt", fontWeight: "normal" }}>[A2]</span> */}
          </a>
        </li>
      </ol>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'justify' }}>&nbsp;</p>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'justify' }}>
        We use the information that we collect for the following purposes:
      </p>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'justify' }}>&nbsp;</p>
      <ul style={{ margin: '0pt', paddingLeft: '0pt', listStyle: 'disc' }}>
        <li
          style={{
            marginLeft: '28.52pt',
            textAlign: 'justify',
            paddingLeft: '7.48pt',
            fontFamily: 'serif',
          }}
        >
          <span style={{ fontFamily: '"Times New Roman"' }}>
            For the purposes for which you provided the information.
          </span>
        </li>
        <li
          style={{
            marginLeft: '28.52pt',
            textAlign: 'justify',
            paddingLeft: '7.48pt',
            fontFamily: 'serif',
          }}
        >
          <span style={{ fontFamily: '"Times New Roman"' }}>To contact you when necessary or requested.</span>
        </li>
        <li
          style={{
            marginLeft: '28.52pt',
            textAlign: 'justify',
            paddingLeft: '7.48pt',
            fontFamily: 'serif',
          }}
        >
          <span style={{ fontFamily: '"Times New Roman"' }}>
            To personalize your experience with the Services by informing you of products, programs, events, services,
            and promotions of Company, our affiliates,&nbsp;
          </span>
          {/* <a name="_cmntref3" /> */}
          <a>
            <span style={{ fontFamily: '"Times New Roman"' }}>our partners&nbsp;</span>
          </a>
          <a href='#_cmnt3' style={{ textDecoration: 'none' }}>
            <span style={{ fontFamily: '"Times New Roman"', fontSize: '8pt' }}>[A3]</span>
          </a>
          <a href='#_cmnt4' style={{ textDecoration: 'none' }}>
            <span style={{ fontFamily: '"Times New Roman"', fontSize: '8pt' }}>[AT4]</span>
          </a>
          <span style={{ fontFamily: '"Times New Roman"' }}>
            and/or third parties that we believe may be of interest to you (see the “
          </span>
          <strong>
            <span style={{ fontFamily: '"Times New Roman"' }}>Opt-In Policy</span>
          </strong>
          <span style={{ fontFamily: '"Times New Roman"' }}>” below).</span>
        </li>
        <li
          style={{
            marginLeft: '28.52pt',
            textAlign: 'justify',
            paddingLeft: '7.48pt',
            fontFamily: 'serif',
          }}
        >
          <span style={{ fontFamily: '"Times New Roman"' }}>
            To fulfill your purchase from us, including, to process your payments, communicate with you regarding your
            purchase or provide you with related customer service.
          </span>
        </li>
        <li
          style={{
            marginLeft: '28.52pt',
            textAlign: 'justify',
            paddingLeft: '7.48pt',
            fontFamily: 'serif',
          }}
        >
          <span style={{ fontFamily: '"Times New Roman"' }}>
            To send mobile notifications (you may opt-out of this service).
          </span>
        </li>
        <li
          style={{
            marginLeft: '28.52pt',
            textAlign: 'justify',
            paddingLeft: '7.48pt',
            fontFamily: 'serif',
          }}
        >
          <span style={{ fontFamily: '"Times New Roman"' }}>
            To provide, maintain, administer, improve, or expand the Services, perform business analyses, or for other
            internal purposes to support, improve or enhance our business, the Services, and other products and services
            we offer.
          </span>
        </li>
        <li
          style={{
            marginLeft: '28.52pt',
            textAlign: 'justify',
            paddingLeft: '7.48pt',
            fontFamily: 'serif',
          }}
        >
          <span style={{ fontFamily: '"Times New Roman"' }}>
            To customize and tailor your experience of the Services.
          </span>
        </li>
        <li
          style={{
            marginLeft: '28.52pt',
            textAlign: 'justify',
            paddingLeft: '7.48pt',
            fontFamily: 'serif',
          }}
        >
          <span style={{ fontFamily: '"Times New Roman"' }}>
            To send emails and other communications that display content that we think will interest you and according
            to your preferences.
          </span>
        </li>
        <li
          style={{
            marginLeft: '28.52pt',
            textAlign: 'justify',
            paddingLeft: '7.48pt',
            fontFamily: 'serif',
          }}
        >
          <span style={{ fontFamily: '"Times New Roman"' }}>To send you news and information about our Services.</span>
        </li>
        <li
          style={{
            marginLeft: '28.52pt',
            textAlign: 'justify',
            paddingLeft: '7.48pt',
            fontFamily: 'serif',
          }}
        >
          <span style={{ fontFamily: '"Times New Roman"' }}>
            To track and analyze trends and usage in connection with our Services.
          </span>
        </li>
        <li
          style={{
            marginLeft: '28.52pt',
            textAlign: 'justify',
            paddingLeft: '7.48pt',
            fontFamily: 'serif',
          }}
        >
          <span style={{ fontFamily: '"Times New Roman"' }}>
            To better understand who uses the Services and how we can deliver a better user experience.
          </span>
        </li>
        <li
          style={{
            marginLeft: '28.52pt',
            textAlign: 'justify',
            paddingLeft: '7.48pt',
            fontFamily: 'serif',
          }}
        >
          <span style={{ fontFamily: '"Times New Roman"' }}>
            To combine information received from third parties with the information that we have from or about you and
            use the combined information for any of the purposes described in this Online Privacy Policy.
          </span>
        </li>
        <li
          style={{
            marginLeft: '28.52pt',
            textAlign: 'justify',
            paddingLeft: '7.48pt',
            fontFamily: 'serif',
          }}
        >
          <span style={{ fontFamily: '"Times New Roman"' }}>
            To use statistical information that we collect in any way permitted by law, including from third parties in
            connection with their commercial and marketing efforts.
          </span>
        </li>
        <li
          style={{
            marginLeft: '28.52pt',
            textAlign: 'justify',
            paddingLeft: '7.48pt',
            fontFamily: 'serif',
          }}
        >
          <span style={{ fontFamily: '"Times New Roman"' }}>
            To prevent, detect, and investigate security breaches, fraud (including chargebacks and other unauthorized
            transactions), and other potentially illegal or prohibited activities.
          </span>
        </li>
        <li
          style={{
            marginLeft: '28.52pt',
            textAlign: 'justify',
            paddingLeft: '7.48pt',
            fontFamily: 'serif',
          }}
        >
          <span style={{ fontFamily: '"Times New Roman"' }}>
            To enforce the legal terms that govern your use of the Services.&nbsp;
          </span>
        </li>
        <li
          style={{
            marginLeft: '28.52pt',
            textAlign: 'justify',
            paddingLeft: '7.48pt',
            fontFamily: 'serif',
          }}
        >
          <span style={{ fontFamily: '"Times New Roman"' }}>To protect our rights or property.</span>
        </li>
        <li
          style={{
            marginLeft: '28.52pt',
            textAlign: 'justify',
            paddingLeft: '7.48pt',
            fontFamily: 'serif',
          }}
        >
          <span style={{ fontFamily: '"Times New Roman"' }}>To administer and troubleshoot the Services.</span>
        </li>
        <li
          style={{
            marginLeft: '28.52pt',
            textAlign: 'justify',
            paddingLeft: '7.48pt',
            fontFamily: 'serif',
          }}
        >
          <span style={{ fontFamily: '"Times New Roman"' }}>
            For any other purpose disclosed to you in connection with our Services.&nbsp;
          </span>
        </li>
      </ul>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'justify' }}>&nbsp;</p>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'justify' }}>
        We may use third-party service providers to process and store personal information in the United States and
        other countries.
      </p>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'justify' }}>&nbsp;</p>
      <ol start={6} type={'1'} className='awlist11' style={{ margin: '0pt', paddingLeft: '0pt' }}>
        <li
          style={{
            marginLeft: '18pt',
            textIndent: '-18pt',
            textAlign: 'justify',
            pageBreakInside: 'avoid',
            pageBreakAfter: 'avoid',
            fontWeight: 'bold',
          }}
        >
          <span
            style={{
              width: '9pt',
              font: '7pt "Times New Roman"',
              display: 'inline-block',
            }}
          >
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </span>
          Sharing of Information
        </li>
      </ol>
      <p
        style={{
          marginTop: '0pt',
          marginBottom: '0pt',
          textAlign: 'justify',
          pageBreakInside: 'avoid',
          pageBreakAfter: 'avoid',
        }}
      >
        &nbsp;
      </p>
      <p
        style={{
          marginTop: '0pt',
          marginBottom: '0pt',
          textAlign: 'justify',
          pageBreakInside: 'avoid',
          pageBreakAfter: 'avoid',
        }}
      >
        We may share personal information about you as follows:
      </p>
      <p
        style={{
          marginTop: '0pt',
          marginBottom: '0pt',
          textAlign: 'justify',
          pageBreakInside: 'avoid',
          pageBreakAfter: 'avoid',
        }}
      >
        &nbsp;
      </p>
      <ul style={{ margin: '0pt', paddingLeft: '0pt', listStyle: 'disc' }}>
        <li
          style={{
            marginLeft: '10.52pt',
            textAlign: 'justify',
            pageBreakInside: 'avoid',
            pageBreakAfter: 'avoid',
            paddingLeft: '7.48pt',
            fontFamily: 'serif',
          }}
        >
          <span style={{ fontFamily: '"Times New Roman"' }}>
            With third parties to provide, maintain, and improve our Services, including service providers who access
            information about you to perform services on our behalf.
          </span>
        </li>
      </ul>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'justify' }}>&nbsp;</p>
      <ul style={{ margin: '0pt', paddingLeft: '0pt', listStyle: 'disc' }}>
        <li
          style={{
            marginLeft: '10.52pt',
            textAlign: 'justify',
            paddingLeft: '7.48pt',
            fontFamily: 'serif',
          }}
        >
          <span style={{ fontFamily: '"Times New Roman"' }}>
            With our affiliates and partners so that they may use such information for the purposes described in this
            Online Privacy Policy.
          </span>
        </li>
      </ul>
      <p
        style={{
          marginTop: '0pt',
          marginLeft: '36pt',
          marginBottom: '0pt',
          textAlign: 'justify',
        }}
      >
        &nbsp;
      </p>
      <ul style={{ margin: '0pt', paddingLeft: '0pt', listStyle: 'disc' }}>
        <li
          style={{
            marginLeft: '10.52pt',
            textAlign: 'justify',
            paddingLeft: '7.48pt',
            fontFamily: 'serif',
          }}
        >
          <span style={{ fontFamily: '"Times New Roman"' }}>
            With our affiliates, partners or other third parties to allow them to contact you regarding products,
            programs, services, and promotions that we and/or they believe may be of interest to you (See the “
          </span>
          <strong>
            <span style={{ fontFamily: '"Times New Roman"' }}>Opt-In Policy”</span>
          </strong>
          <span style={{ fontFamily: '"Times New Roman"' }}>&nbsp;below).</span>
        </li>
      </ul>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'justify' }}>&nbsp;</p>
      <ul style={{ margin: '0pt', paddingLeft: '0pt', listStyle: 'disc' }}>
        <li
          style={{
            marginLeft: '10.52pt',
            textAlign: 'justify',
            paddingLeft: '7.48pt',
            fontFamily: 'serif',
          }}
        >
          <span style={{ fontFamily: '"Times New Roman"' }}>
            In connection with, or during the negotiation of, any merger, sale of Company stock or assets, financing,
            acquisition, divestiture or dissolution of all or a portion of our business (but only under non-disclosure
            and confidentiality agreements and protections).
          </span>
        </li>
      </ul>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'justify' }}>&nbsp;</p>
      <ul style={{ margin: '0pt', paddingLeft: '0pt', listStyle: 'disc' }}>
        <li
          style={{
            marginLeft: '10.52pt',
            textAlign: 'justify',
            paddingLeft: '7.48pt',
            fontFamily: 'serif',
          }}
        >
          <span style={{ fontFamily: '"Times New Roman"' }}>
            If we believe that disclosure is reasonably necessary to comply with any applicable law, regulation, legal
            process or governmental request; to enforce applicable user agreements or policies; to protect the security
            or integrity of our Services; and to protect us, our users or the public from harm or illegal activities.
          </span>
        </li>
      </ul>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'justify' }}>&nbsp;</p>
      <ul style={{ margin: '0pt', paddingLeft: '0pt', listStyle: 'disc' }}>
        <li
          style={{
            marginLeft: '10.52pt',
            textAlign: 'justify',
            paddingLeft: '7.48pt',
            fontFamily: 'serif',
          }}
        >
          <span style={{ fontFamily: '"Times New Roman"' }}>With your consent.</span>
        </li>
      </ul>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'justify' }}>&nbsp;</p>
      <p
        style={{
          marginTop: '0pt',
          marginBottom: '14pt',
          textAlign: 'justify',
          backgroundColor: '#ffffff',
        }}
      >
        We may also share aggregated, non-personally identifiable information with third parties. The Services may use
        the following analytics program(s) to collect information about you and your behaviors as a consumer. To learn
        more about the analytics program(s) and how you can opt out of information sharing, see below.
      </p>
      <div style={{ marginLeft: '18pt', backgroundColor: '#ffffff' }}>
        <p
          style={{
            marginTop: '0pt',
            marginLeft: '18pt',
            marginBottom: '0pt',
            textIndent: '-18pt',
            textAlign: 'justify',
          }}
        >
          1.
          <span
            style={{
              width: '9pt',
              font: '7pt "Times New Roman"',
              display: 'inline-block',
            }}
          >
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </span>
          Facebook: (1){' '}
          <a href='https://www.facebook.com/privacy/policy/' style={{ textDecoration: 'none' }}>
            <u>
              <span style={{ color: '#0000ff' }}>Privacy Policy</span>
            </u>
          </a>
          ; (2){' '}
          <a href='https://www.facebook.com/settings' style={{ textDecoration: 'none' }}>
            <u>
              <span style={{ color: '#0000ff' }}>Opt Out Settings</span>
            </u>
          </a>
          .
        </p>
      </div>
      <div
        style={{
          marginLeft: '18pt',
          marginBottom: '14pt',
          backgroundColor: '#ffffff',
        }}
      >
        <p
          style={{
            marginTop: '0pt',
            marginLeft: '18pt',
            marginBottom: '0pt',
            textIndent: '-18pt',
            textAlign: 'justify',
          }}
        >
          2.
          <span
            style={{
              width: '9pt',
              font: '7pt "Times New Roman"',
              display: 'inline-block',
            }}
          >
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </span>
          Google Analytics: (1){' '}
          <a href='https://policies.google.com/technologies/partner-sites' style={{ textDecoration: 'none' }}>
            <u>
              <span style={{ color: '#0000ff' }}>Privacy Policy</span>
            </u>
          </a>
          ; (2){' '}
          <a href='https://tools.google.com/dlpage/gaoptout' style={{ textDecoration: 'none' }}>
            <u>
              <span style={{ color: '#0000ff' }}>Opt Out Settings</span>
            </u>
          </a>
          .
        </p>
      </div>
      <p
        style={{
          marginTop: '0pt',
          marginBottom: '14pt',
          textAlign: 'justify',
          backgroundColor: '#ffffff',
        }}
      >
        You can also use third party opt-out controls such as{' '}
        <a href='https://optout.networkadvertising.org/?c=1' style={{ textDecoration: 'none' }}>
          <u>
            <span style={{ color: '#0000ff' }}>NAI</span>
          </u>
        </a>{' '}
        and{' '}
        <a href='https://optout.aboutads.info/?c=2&lang=EN' style={{ textDecoration: 'none' }}>
          <u>
            <span style={{ color: '#0000ff' }}>DAA</span>
          </u>
        </a>
        . Please see Section 10.3 below for more information on opt-out controls.
      </p>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'justify' }}>&nbsp;</p>
      <ol start={7} type={'1'} className='awlist12' style={{ margin: '0pt', paddingLeft: '0pt' }}>
        <li
          style={{
            marginLeft: '18pt',
            textIndent: '-18pt',
            textAlign: 'justify',
            fontWeight: 'bold',
          }}
        >
          <span
            style={{
              width: '9pt',
              font: '7pt "Times New Roman"',
              display: 'inline-block',
            }}
          >
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </span>
          Opt-In Policy
        </li>
      </ol>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'justify' }}>&nbsp;</p>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'justify' }}>
        When you supply us with personally identifiable information in connection with your use of the Services, you may
        be asked to indicate whether you are interested in receiving information from us about our product and service
        offerings and if you would like us to share personally identifiable information about you with our affiliates,
        partners or other third parties for their marketing purposes. If you do choose to opt-in, you will receive such
        communications and/or we will share your information in accordance with your <strong>“opt-in” consent</strong>.
      </p>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'justify' }}>&nbsp;</p>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'justify' }}>
        You may, of course, choose not to receive additional marketing information from us or choose not to allow our
        sharing of your personally identifiable information as follows:&nbsp;&nbsp; at any time, you can follow a link
        provided in our marketing-related email messages (but excluding e-commerce confirmations and other
        administrative emails) to opt out from receiving such communications; or at any time, you can contact us in
        accordance with the “Contact Us” section below to opt out from receiving such communications.
      </p>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'justify' }}>&nbsp;</p>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'justify' }}>
        If you decide to contact us to change your contact preferences to opt out of receiving communications from us,
        please specify clearly which of the following choices you are opting out of: (a) receiving marketing
        communications from us; (b) allowing us to share personally identifiable information about you with our
        affiliates and partners for their marketing purposes; and/or (c) allowing us to share personally identifiable
        information about you with other third parties for their marketing purposes.
      </p>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'justify' }}>&nbsp;</p>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'justify' }}>
        We will endeavor to implement your requested change as soon as reasonably practicable after receiving your
        request. Please be aware that your requested change will not be effective until we implement such change. Please
        note that if you choose not to allow our sharing of your personally identifiable information, we are not
        responsible for removing your personally identifiable information from the databases of third parties with which
        we have already shared your personally identifiable information as of the date that we implement your request.
        If you wish to cease receiving marketing-related e-mails from these third parties, please contact them directly
        or utilize any opt-out mechanisms in their privacy policies or marketing-related e-mails.
      </p>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'justify' }}>&nbsp;</p>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'justify' }}>
        Please note that if you do opt-out of receiving marketing-related messages from us, we may still send you
        important administrative messages. You cannot opt-out from receiving these administrative messages. We reserve
        the right, from time to time, to contact former customers or users of the Services for administrative purposes
        or in order to comply with applicable laws, rules or regulations.
      </p>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'justify' }}>
        <strong>&nbsp;</strong>
      </p>
      <ol start={8} type={'1'} className='awlist13' style={{ margin: '0pt', paddingLeft: '0pt' }}>
        <li
          style={{
            marginLeft: '18pt',
            textIndent: '-18pt',
            textAlign: 'justify',
            fontWeight: 'bold',
          }}
        >
          <span
            style={{
              width: '9pt',
              font: '7pt "Times New Roman"',
              display: 'inline-block',
            }}
          >
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </span>
          Social Media and Third Party Platforms
        </li>
      </ol>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'justify' }}>
        <strong>&nbsp;</strong>
      </p>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'justify' }}>
        Certain sections or functionalities on our Services may permit you to share information on third party social
        media sites or platforms such as Facebook, Instagram, LinkedIn, Twitter, or other similar sites (collectively,
        “Social Media Sites”). Company does not own or control such Social Media Sites, and posting your information on
        Social Media Sites is subject to the third party’s Online Privacy Policy and other legal terms, which may not
        provide privacy protections with which you agree. Company is not responsible for any act or omission of any
        Social Media Platform, nor are we responsible for the consequences of your choosing to share your information on
        Social Media Sites.
      </p>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'justify' }}>
        <strong>&nbsp;</strong>
      </p>
      <ol start={9} type={'1'} className='awlist14' style={{ margin: '0pt', paddingLeft: '0pt' }}>
        <li
          style={{
            marginLeft: '18pt',
            textIndent: '-18pt',
            textAlign: 'justify',
            fontWeight: 'bold',
          }}
        >
          <span
            style={{
              width: '9pt',
              font: '7pt "Times New Roman"',
              display: 'inline-block',
            }}
          >
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </span>
          Security
        </li>
      </ol>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'justify' }}>&nbsp;</p>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'justify' }}>
        We take reasonable measures, including administrative, technical, and physical safeguards, to help protect
        personal information from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction.
        Unfortunately, no data transmission over the Internet can be guaranteed to be 100% secure. As a result, while we
        strive to protect your personal information, Company cannot ensure or warrant the security of any information
        you transmit to us or from our online products or services, and you do so at your own risk. We are not
        responsible for circumvention of any privacy settings or security measures contained on the Website or Platform,
        or your computer or mobile device.
      </p>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'justify' }}>&nbsp;</p>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'justify' }}>
        We are not responsible for any interception or interruption of any communications through the internet or for
        changes to or losses of data. You are responsible for maintaining the security of any password, user ID or other
        form of authentication involved in obtaining access to password protected or secure areas of our Website or
        Platform. To protect you and your data, we may suspend your use of any of the Website or Platform, without
        notice, pending an investigation, if any breach of security is suspected.
      </p>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'justify' }}>&nbsp;</p>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'justify' }}>
        Please note that we will never send you an email requesting confidential information, such as account numbers,
        usernames, passwords, or Social Security Numbers.
      </p>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'justify' }}>&nbsp;</p>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'justify' }}>
        In the event of a data or security breach, we will take the following actions:
      </p>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'justify' }}>&nbsp;</p>
      <ol type='i' className='awlist15' style={{ margin: '0pt', paddingLeft: '0pt' }}>
        <li
          style={{
            marginLeft: '54pt',
            textIndent: '-36pt',
            textAlign: 'justify',
          }}
        >
          <span
            style={{
              width: '24.67pt',
              font: '7pt "Times New Roman"',
              display: 'inline-block',
            }}
          >
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </span>
          promptly investigate the security incident, validate the root cause, and, where applicable, remediate any
          vulnerabilities within our control which may have given rise to the security incident;
        </li>
        <li
          style={{
            marginLeft: '54pt',
            textIndent: '-36pt',
            textAlign: 'justify',
          }}
        >
          <span
            style={{
              width: '21.34pt',
              font: '7pt "Times New Roman"',
              display: 'inline-block',
            }}
          >
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </span>
          comply with laws and regulations directly applicable to us in connection with such security incident;
        </li>
        <li
          style={{
            marginLeft: '54pt',
            textIndent: '-36pt',
            textAlign: 'justify',
          }}
        >
          <span
            style={{
              width: '18.01pt',
              font: '7pt "Times New Roman"',
              display: 'inline-block',
            }}
          >
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </span>
          as applicable, cooperate with any affected user in accordance with the terms of our contract with such user;
        </li>
        <li
          style={{
            marginLeft: '54pt',
            textIndent: '-36pt',
            textAlign: 'justify',
          }}
        >
          <span
            style={{
              width: '18.67pt',
              font: '7pt "Times New Roman"',
              display: 'inline-block',
            }}
          >
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </span>
          document and record actions taken by us in connection with the security incident; and
        </li>
        <li
          style={{
            marginLeft: '54pt',
            textIndent: '-36pt',
            textAlign: 'justify',
          }}
        >
          <span
            style={{
              width: '22.01pt',
              font: '7pt "Times New Roman"',
              display: 'inline-block',
            }}
          >
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </span>
          conduct a post-incident review of the circumstances related to the incident and actions/recommendations taken
          to prevent similar security incidents in the future. We will notify you of any data or security breaches as
          required by and in accordance with applicable law.
        </li>
      </ol>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'justify' }}>&nbsp;</p>
      <ol start={10} type={'1'} className='awlist16' style={{ margin: '0pt', paddingLeft: '0pt' }}>
        <li
          style={{
            marginLeft: '18pt',
            textIndent: '-18pt',
            textAlign: 'justify',
            pageBreakInside: 'avoid',
            pageBreakAfter: 'avoid',
            fontWeight: 'bold',
          }}
        >
          <span
            style={{
              width: '3pt',
              font: '7pt "Times New Roman"',
              display: 'inline-block',
            }}
          >
            &nbsp;&nbsp;
          </span>
          Your Privacy Choices
        </li>
      </ol>
      <p
        style={{
          marginTop: '0pt',
          marginBottom: '0pt',
          textAlign: 'justify',
          pageBreakInside: 'avoid',
          pageBreakAfter: 'avoid',
        }}
      >
        &nbsp;
      </p>
      <ol type={'1'} className='awlist17' style={{ margin: '0pt', paddingLeft: '0pt' }}>
        <li
          style={{
            marginLeft: '39.6pt',
            textIndent: '-21.6pt',
            textAlign: 'justify',
            pageBreakInside: 'avoid',
            pageBreakAfter: 'avoid',
            fontWeight: 'bold',
            listStylePosition: 'inside',
          }}
        >
          <span
            style={{
              width: '30pt',
              font: '7pt "Times New Roman"',
              display: 'inline-block',
            }}
          >
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </span>
          How You Can Access and Update Your Information and Data Retention
        </li>
      </ol>
      <p
        style={{
          marginTop: '0pt',
          marginBottom: '0pt',
          textAlign: 'justify',
          pageBreakInside: 'avoid',
          pageBreakAfter: 'avoid',
        }}
      >
        &nbsp;
      </p>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'justify' }}>
        You may update or correct information about yourself at any time or by emailing us at help@lumimeds.com. Company
        may retain your personal information for as long as we deem necessary for our business purposes, or as required
        to comply with our legal obligations, resolve disputes, and enforce our agreements. We reserve the right to
        retain and use your information as necessary to provide our Services to you and fulfill our business operations.
        Company may dispose of or delete any such information at our discretion, subject to any other agreement you may
        have with us or as required by applicable law.
      </p>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'justify' }}>&nbsp;</p>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'justify' }}>
        Similarly, healthcare providers who receive your personal information may retain it for periods they deem
        necessary for their operational purposes, to comply with their legal obligations, to resolve disputes, and to
        enforce their agreements. These healthcare providers may dispose of or delete your information in accordance
        with their own retention policies, except as otherwise outlined in any agreements you have with them or as
        required by law.
      </p>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'justify' }}>&nbsp;</p>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'justify' }}>
        Third parties with whom we share your personal information may have their own data retention policies and
        procedures. It is your responsibility to review these policies, as they govern how these third parties handle
        your personal information, including the duration for which it is retained and the conditions under which it may
        be disposed of or deleted.
      </p>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'justify' }}>&nbsp;</p>
      <ol start={2} type={'1'} className='awlist18' style={{ margin: '0pt', paddingLeft: '0pt' }}>
        <li
          style={{
            marginLeft: '39.6pt',
            textIndent: '-21.6pt',
            textAlign: 'justify',
            pageBreakInside: 'avoid',
            pageBreakAfter: 'avoid',
            fontWeight: 'bold',
            listStylePosition: 'inside',
          }}
        >
          <span
            style={{
              width: '30pt',
              font: '7pt "Times New Roman"',
              display: 'inline-block',
            }}
          >
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </span>
          Cookies
        </li>
      </ol>
      <p
        style={{
          marginTop: '0pt',
          marginBottom: '0pt',
          textAlign: 'justify',
          pageBreakInside: 'avoid',
          pageBreakAfter: 'avoid',
        }}
      >
        &nbsp;
      </p>
      <p
        style={{
          marginTop: '0pt',
          marginBottom: '0pt',
          textAlign: 'justify',
          pageBreakInside: 'avoid',
          pageBreakAfter: 'avoid',
        }}
      >
        Most web browsers are set to accept cookies by default. If you prefer, you can usually choose to set your
        browser to remove or reject cookies; however, our Services may not function properly if you do so.
      </p>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'justify' }}>
        <strong>&nbsp;</strong>
      </p>
      <ol start={3} type={'1'} className='awlist19' style={{ margin: '0pt', paddingLeft: '0pt' }}>
        <li
          style={{
            marginLeft: '39.6pt',
            textIndent: '-21.6pt',
            textAlign: 'justify',
            fontWeight: 'bold',
            listStylePosition: 'inside',
          }}
        >
          <span
            style={{
              width: '30pt',
              font: '7pt "Times New Roman"',
              display: 'inline-block',
            }}
          >
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </span>
          Options for Opting out of Cookies and Mobile Device Identifiers
        </li>
      </ol>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'justify' }}>
        <strong>&nbsp;</strong>
      </p>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'justify' }}>
        If you are interested in more information about interest-based advertising and how you can generally control
        cookies from being put on your computer to deliver tailored advertising, you may visit the{' '}
        <a href='http://www.networkadvertising.org/choices/' style={{ textDecoration: 'none' }}>
          <u>
            <span style={{ color: '#000000' }}>Network Advertising Initiative’s Consumer Opt-Out link</span>
          </u>
        </a>
        , the{' '}
        <a href='http://www.aboutads.info/choices/' style={{ textDecoration: 'none' }}>
          <u>
            <span style={{ color: '#000000' }}>Digital Advertising Alliance’s Consumer Opt-Out link</span>
          </u>
        </a>{' '}
        or{' '}
        <a href='http://preferences-mgr.truste.com/' style={{ textDecoration: 'none' }}>
          <u>
            <span style={{ color: '#000000' }}>TRUSTe’s Advertising Choices Page</span>
          </u>
        </a>{' '}
        to opt-out of receiving tailored advertising from companies that participate in those programs.
      </p>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'justify' }}>&nbsp;</p>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'justify' }}>
        Please note that even after opting out of interest-based advertising, you may still see Company’s advertisements
        that are not interest-based (i.e., not targeted toward you). Also, opting out does not mean that Company is no
        longer using its tracking tools—Company still may collect information about your use of the Services even after
        you have opted out of interest-based advertisements and may still serve advertisements to you via the Services
        based on information it collects via the Services.
      </p>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'justify' }}>&nbsp;</p>
      <ol start={4} type={'1'} className='awlist20' style={{ margin: '0pt', paddingLeft: '0pt' }}>
        <li
          style={{
            marginLeft: '39.6pt',
            textIndent: '-21.6pt',
            textAlign: 'justify',
            fontWeight: 'bold',
            listStylePosition: 'inside',
          }}
        >
          <span
            style={{
              width: '30pt',
              font: '7pt "Times New Roman"',
              display: 'inline-block',
            }}
          >
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </span>
          How Company Responds to Browser “Do Not Track” Signals
        </li>
      </ol>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'justify' }}>&nbsp;</p>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'justify' }}>
        We are committed to providing you with meaningful choices about the information collected on our Platform for
        third-party purposes, and that is why we provide above the Network Advertising Initiative’s “Consumer Opt-out”
        link, Digital Advertising Alliance’s Consumer Opt-Out Link, and TRUSTe’s Advertising Choices page. However, we
        do not recognize or respond to browser-initiated Do Not Track signals, as the Internet industry is currently
        still working on Do Not Track standards, implementations and solutions. For more information about DNT signals,
        visit{' '}
        <a href='http://allaboutdnt.com' style={{ textDecoration: 'none' }}>
          <u>
            <span style={{ color: '#000000' }}>http://allaboutdnt.com</span>
          </u>
        </a>
        .
      </p>
      <p
        style={{
          marginTop: '0pt',
          marginBottom: '0pt',
          textAlign: 'justify',
          pageBreakAfter: 'avoid',
        }}
      >
        <strong>&nbsp;</strong>
      </p>
      <ol start={5} type={'1'} className='awlist21' style={{ margin: '0pt', paddingLeft: '0pt' }}>
        <li
          style={{
            marginLeft: '39.6pt',
            textIndent: '-21.6pt',
            textAlign: 'justify',
            fontWeight: 'bold',
            listStylePosition: 'inside',
          }}
        >
          <span
            style={{
              width: '30pt',
              font: '7pt "Times New Roman"',
              display: 'inline-block',
            }}
          >
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </span>
          Links to Other Websites
        </li>
      </ol>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'justify' }}>
        <strong>&nbsp;</strong>
      </p>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'justify' }}>
        Our Services may contain links to other websites and those websites may not follow the same privacy practices as
        Company. We are not responsible for the privacy practices of third party websites. We encourage you to read the
        privacy policies of such third parties to learn more about their privacy practices.
      </p>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'justify' }}>
        <strong>&nbsp;</strong>
      </p>
      <ol start={6} type={'1'} className='awlist22' style={{ margin: '0pt', paddingLeft: '0pt' }}>
        <li
          style={{
            marginLeft: '39.6pt',
            textIndent: '-21.6pt',
            textAlign: 'justify',
            fontWeight: 'bold',
            listStylePosition: 'inside',
          }}
        >
          <span
            style={{
              width: '30pt',
              font: '7pt "Times New Roman"',
              display: 'inline-block',
            }}
          >
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </span>
          No Rights of Third Parties
        </li>
      </ol>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'justify' }}>
        <strong>&nbsp;</strong>
      </p>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'justify' }}>
        This Online Privacy Policy does not create rights enforceable by third parties.
      </p>
      <p style={{ marginTop: '0pt', marginBottom: '0pt', textAlign: 'justify' }}>
        <strong>&nbsp;</strong>
      </p>
      <ol start={7} type={'1'} className='awlist23' style={{ margin: '0pt', paddingLeft: '0pt' }}>
        <li
          style={{
            marginLeft: '39.6pt',
            textIndent: '-21.6pt',
            textAlign: 'justify',
            pageBreakAfter: 'avoid',
            fontWeight: 'bold',
            listStylePosition: 'inside',
          }}
        >
          <span
            style={{
              width: '30pt',
              font: '7pt "Times New Roman"',
              display: 'inline-block',
            }}
          >
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          </span>
          How to Contact Us
        </li>
      </ol>
      <p
        style={{
          marginTop: '0pt',
          marginBottom: '0pt',
          textAlign: 'justify',
          pageBreakAfter: 'avoid',
        }}
      >
        &nbsp;
      </p>
      <p
        style={{
          marginTop: '0pt',
          marginBottom: '0pt',
          textAlign: 'justify',
          pageBreakAfter: 'avoid',
        }}
      >
        Please contact us with any questions or concerns regarding this Online Privacy Policy at help@lumimeds.com.
      </p>
      <p
        style={{
          marginTop: '0pt',
          marginBottom: '0pt',
          textAlign: 'justify',
          pageBreakAfter: 'avoid',
        }}
      >
        &nbsp;
      </p>
      <ol start={11} type={'1'} className='awlist24' style={{ margin: '0pt', paddingLeft: '0pt' }}>
        <li
          style={{
            marginLeft: '18pt',
            textIndent: '-18pt',
            textAlign: 'justify',
            pageBreakAfter: 'avoid',
          }}
        >
          <span
            style={{
              width: '3pt',
              font: '7pt "Times New Roman"',
              display: 'inline-block',
            }}
          >
            &nbsp;&nbsp;
          </span>
          <strong>&nbsp;Reserved.</strong>
        </li>
      </ol>
      <p
        style={{
          marginTop: '0pt',
          marginLeft: '18pt',
          marginBottom: '0pt',
          textAlign: 'justify',
          pageBreakAfter: 'avoid',
        }}
      >
        &nbsp;
      </p>
      <ol start={12} type={'1'} className='awlist25' style={{ margin: '0pt', paddingLeft: '0pt' }}>
        <li
          style={{
            marginLeft: '18pt',
            textIndent: '-18pt',
            textAlign: 'justify',
            pageBreakAfter: 'avoid',
          }}
        >
          <span
            style={{
              width: '3pt',
              font: '7pt "Times New Roman"',
              display: 'inline-block',
            }}
          >
            &nbsp;&nbsp;
          </span>
          <strong>Further Information.</strong> If you would like more information about your privacy rights, please
          contact Company by calling (415) 968-0890 and ask to speak to the Privacy and Security Officer. To the extent
          you are required to send a written request to Company to exercise any right described in this Privacy Policy
          you must submit your request to help@lumieds.com.
        </li>
      </ol>
      {/* <p style="margin-top:0pt; margin-bottom:0pt;">&nbsp;</p>
    <div style="clear:both;">
<div style="float:left;">
  <p style="margin-top:0pt; margin-bottom:0pt;">1</p>
</div>
<p style="margin-top:0pt; margin-bottom:0pt; line-height:10pt;"><a name="_iDocIDField05b98cb3-e6fa-40da-ad32-e5ed"></a></p>
    </div> */}
    </div>
  );
};

export default PrivacyPolicyPage;
