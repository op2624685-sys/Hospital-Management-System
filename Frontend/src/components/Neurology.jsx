import React from 'react'

const Neurology = () => {
  return (
    <div className='px-20 py-5'>
      <div className='flex justify-center items-center mt-20 px-5'>
        <div className='section-1 flex flex-col w-2/3 m-10 py-2 px-4 h-full bg-transparent border-2 border-black rounded-2xl'>
          <h2 className='text-7xl font-bold w-full mt-2 mb-4'>Neurology Department</h2>
          <p className='text-xl font-semibold px-2'>Dedicated to the diagnosis and treatment of disorders affecting the brain, spinal cord, nerves, and muscles. Our neurologists and neurosurgeons use cutting-edge diagnostic tools and minimally invasive techniques to deliver precise and compassionate neurological care.</p>
          <div className='text-md flex flex-row flex-wrap m-2 p-3 bg-amber-50'>
            <div className='w-1/2'>
              <h3 className='font-medium my-2.5'>Services Offered :- </h3>
              <ul className='p-2'>EEG & nerve conduction studies, Brain MRI & CT imaging, Lumbar puncture, Botox therapy for migraines, Deep brain stimulation, Epilepsy monitoring, Stroke thrombolysis, Memory & cognitive assessments, Sleep studies, Neurovascular intervention</ul>
            </div>
            <div className='w-1/2'>
              <h3 className='font-medium my-2.5'>Conditions We Treat :-</h3>
              <ul className='p-2'>Stroke & TIA, Epilepsy & seizures, Migraine & headache disorders, Parkinson's disease, Multiple sclerosis, Alzheimer's & dementia, Neuropathy, Brain tumors, Meningitis, Movement disorders</ul>
            </div>
            <div className='w-1/2'>
              <h3 className='font-medium my-2.5'>Facilities & Equipment :- </h3>
              <ul className='p-2'>Dedicated Stroke Unit, Advanced EEG lab, High-field MRI (3 Tesla), Intraoperative neuromonitoring, Neurophysiology lab, Video-EEG epilepsy unit, Neurosurgery OT, Neurorehabilitation gym</ul>
            </div>
            <div className='w-1/2'>
              <h3 className='font-medium my-2.5'>Our Neurology Team :- </h3>
              <ul className='p-2'>Consultant Neurologists, Neurosurgeons, Epileptologists, Neuropsychologists, Neuroradiologists, Speech & Language Therapists, Physiotherapists, Occupational Therapists</ul>
            </div>
            <div className='w-1/2'>
              <h3 className='font-medium my-2.5'>Stroke & Emergency Neuro Care :- </h3>
              <ul className='p-2'>24/7 Stroke Response Team, Rapid CT & MRI protocol, IV thrombolysis & thrombectomy, Stroke ICU (NICU), Dedicated stroke helpline</ul>
            </div>
            <div className='w-1/2'>
              <h3 className='font-medium my-2.5'>Patient Support :- </h3>
              <ul className='p-2'>Neurorehabilitation programs, Caregiver counseling & training, Long-term follow-up clinics, Support groups for Parkinson's & MS, Insurance and billing assistance</ul>
            </div>
          </div>
        </div>

        <div className='section-2 flex h-full w-1/3 bg-transparent rounded-2xl border border-black'>
          <div className='h-full w-1/2 flex justify-center items-center '>
            <img className='rounded-4xl m-3 px-4' src="https://images.unsplash.com/photo-1559757175-5700dde675bc?q=80&w=687&auto=format&fit=crop" alt="Neurology Department" />
          </div>
          <div className='h-full w-1/2 flex flex-col justify-center items-center m-2 py-4 px-2'>
            <h5 className='text-md font-medium'>Department Head :- <span className='font-light'>Dr. Alan Foster</span></h5>
            <p className='font-medium'>Department members :- <span className='font-light'>15</span></p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Neurology