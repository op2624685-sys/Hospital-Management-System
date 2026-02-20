import React from 'react'

const Radiology = () => {
  return (
    <div className='px-20 py-5'>
      <div className='flex justify-center items-center mt-20 px-5'>
        <div className='section-1 flex flex-col w-2/3 m-10 py-2 px-4 h-full bg-transparent border-2 border-black rounded-2xl'>
          <h2 className='text-7xl font-bold w-full mt-2 mb-4'>Radiology Department</h2>
          <p className='text-xl font-semibold px-2'>Provides advanced medical imaging services essential for accurate diagnosis and guided treatment. Our board-certified radiologists and technologists operate state-of-the-art imaging equipment to deliver fast, precise, and reliable diagnostic results across all specialties.</p>
          <div className='text-md flex flex-row flex-wrap m-2 p-3 bg-amber-50'>
            <div className='w-1/2'>
              <h3 className='font-medium my-2.5'>Services Offered :- </h3>
              <ul className='p-2'>Digital X-ray, CT scan (multi-slice), MRI (1.5T & 3T), Ultrasound & Doppler, PET-CT scan, Mammography, Bone densitometry (DEXA), Interventional radiology, Fluoroscopy, Nuclear medicine imaging</ul>
            </div>
            <div className='w-1/2'>
              <h3 className='font-medium my-2.5'>Conditions We Diagnose :-</h3>
              <ul className='p-2'>Cancer & tumor detection, Fractures & bone injuries, Internal bleeding, Vascular diseases, Liver & kidney disorders, Brain & spinal abnormalities, Lung & chest diseases, Abdominal & pelvic conditions, Thyroid & gland disorders, Joint & soft tissue injuries</ul>
            </div>
            <div className='w-1/2'>
              <h3 className='font-medium my-2.5'>Facilities & Equipment :- </h3>
              <ul className='p-2'>3 Tesla MRI scanner, 128-slice CT scanner, 3D mammography unit, Portable ultrasound & X-ray, Digital subtraction angiography (DSA), PET-CT suite, Nuclear medicine gamma camera, Dedicated pediatric imaging room, PACS digital reporting system</ul>
            </div>
            <div className='w-1/2'>
              <h3 className='font-medium my-2.5'>Our Radiology Team :- </h3>
              <ul className='p-2'>Consultant Radiologists, Interventional Radiologists, Nuclear Medicine Specialists, Radiographers & Technologists, Sonographers, Medical Physicists, Radiology Nurses, Report Coordinators</ul>
            </div>
            <div className='w-1/2'>
              <h3 className='font-medium my-2.5'>Interventional Radiology :- </h3>
              <ul className='p-2'>Image-guided biopsies, Tumor ablation, Angioplasty & embolization, Drainage procedures, Pain management injections, TIPS procedure</ul>
            </div>
            <div className='w-1/2'>
              <h3 className='font-medium my-2.5'>Patient Support :- </h3>
              <ul className='p-2'>Online appointment booking, Same-day emergency reporting, Digital report delivery, Radiation safety protocols, Insurance and billing assistance</ul>
            </div>
          </div>
        </div>

        <div className='section-2 flex h-full w-1/3 bg-transparent rounded-2xl border border-black'>
          <div className='h-full w-1/2 flex justify-center items-center '>
            <img className='rounded-4xl m-3 px-4' src="https://images.unsplash.com/photo-1530497610245-94d3c16cda28?q=80&w=687&auto=format&fit=crop" alt="Radiology Department" />
          </div>
          <div className='h-full w-1/2 flex flex-col justify-center items-center m-2 py-4 px-2'>
            <h5 className='text-md font-medium'>Department Head :- <span className='font-light'>Dr. James Parker</span></h5>
            <p className='font-medium'>Department members :- <span className='font-light'>14</span></p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Radiology