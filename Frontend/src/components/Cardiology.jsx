import React from 'react'

const Cardiology = () => {
  return (
    <div className='px-20 py-5'>
      <div className='flex justify-center items-center mt-20 px-5'>
        <div className='section-1 flex flex-col w-2/3 m-10 py-2 px-4 h-full bg-transparent border-2 border-black rounded-2xl'>
          <h2 className='text-7xl font-bold w-full mt-2 mb-4'>Cardiology Department</h2>
          <p className='text-xl font-semibold px-2'>Specializes in the diagnosis, treatment, and prevention of diseases related to the heart and cardiovascular system. Our team of expert cardiologists and cardiac surgeons provide comprehensive care using state-of-the-art technology and evidence-based treatments.</p>
          <div className='text-md flex flex-row flex-wrap m-2 p-3 bg-amber-50'>
            <div className='w-1/2'>
              <h3 className='font-medium my-2.5'>Services Offered :- </h3>
              <ul className='p-2'>Electrocardiogram (ECG/EKG), Echocardiography, Stress testing, Cardiac catheterization, Angioplasty & stenting, Pacemaker implantation, Holter monitoring, Cardiac rehabilitation, Heart failure management, Preventive cardiology</ul>
            </div>
            <div className='w-1/2'>
              <h3 className='font-medium my-2.5'>Conditions We Treat :-</h3>
              <ul className='p-2'>Coronary artery disease, Heart failure, Arrhythmias, Hypertension, Valvular heart disease, Congenital heart defects, Peripheral arterial disease, Cardiomyopathy, Pericarditis, Aortic aneurysm</ul>
            </div>
            <div className='w-1/2'>
              <h3 className='font-medium my-2.5'>Facilities & Equipment :- </h3>
              <ul className='p-2'>Cardiac catheterization lab, 3D echocardiography, Nuclear cardiology unit, Cardiac MRI & CT scan, Electrophysiology lab, Dedicated cardiac ICU (CICU), Advanced hemodynamic monitoring, Coronary angiography suite</ul>
            </div>
            <div className='w-1/2'>
              <h3 className='font-medium my-2.5'>Our Cardiac Team :- </h3>
              <ul className='p-2'>Interventional Cardiologists, Electrophysiologists, Cardiac Surgeons, Cardiac Nurses & Technicians, Cardiovascular Radiologists, Cardiac Rehabilitation Specialists, Dieticians & Lifestyle Coaches</ul>
            </div>
            <div className='w-1/2'>
              <h3 className='font-medium my-2.5'>Preventive Care :- </h3>
              <ul className='p-2'>Cholesterol & lipid management, Diabetes & cardiac risk counseling, Lifestyle modification programs, Cardiac screening packages, Genetic risk assessment</ul>
            </div>
            <div className='w-1/2'>
              <h3 className='font-medium my-2.5'>Patient Support :- </h3>
              <ul className='p-2'>Dedicated cardiac helpline, Post-procedure follow-up, Remote cardiac monitoring, Patient education programs, Insurance and billing assistance</ul>
            </div>
          </div>
        </div>

        <div className='section-2 flex h-full w-1/3 bg-transparent rounded-2xl border border-black'>
          <div className='h-full w-1/2 flex justify-center items-center '>
            <img className='rounded-4xl m-3 px-4' src="https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?q=80&w=687&auto=format&fit=crop" alt="Cardiology Department" />
          </div>
          <div className='h-full w-1/2 flex flex-col justify-center items-center m-2 py-4 px-2'>
            <h5 className='text-md font-medium'>Department Head :- <span className='font-light'>Dr. Sarah Mitchell</span></h5>
            <p className='font-medium'>Department members :- <span className='font-light'>18</span></p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cardiology