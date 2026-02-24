import './styles.css';

export default function AboutUs() {
  return (
    <div className='py-5'>
      <section className='container pt-3 position-relative pb-1' id='about_section'>
        <div className='col-12 mb-5'>
          <p id='about_title' className='m-0'>
            About LumiMeds
          </p>
        </div>
        <div className='d-flex flex-column mt-3'>
          <div id='about_content' className='col-12 col-lg-9 d-flex flex-column column-gap-4'>
            <div id='company' className='py-3'>
              <p className='fw-bold fs-3'>Company</p>
              <p className='fs-6'>
                LumiMeds is a telehealth platform whose mission is to help patients who seek long-term, affordable
                health care treatments. We recognize that each patient has unique circumstances and connect you with
                licensed medical providers that carefully design treatment plans tailored to your specific needs. We
                believe in forming a long-term connection with our customers to help meaningfully improve their quality
                of life. When we see patients experience those quality of life improvements - that makes all the
                difference to us.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
