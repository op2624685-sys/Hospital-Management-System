import React from 'react'

const EmergencyDepartment = () => {
  return (
      <div className='flex justify-center items-center mt-20 px-5'>
        <div className='section-1 flex flex-col w-2/3 m-10 py-2 px-4 h-full bg-transparent border-2 border-black rounded-2xl'>
          <h2 className='text-7xl font-bold w-full mt-2 mb-4'>Emergency Department (ED)</h2>
          <p className='text-xl font-semibold px-2'>Provides immediate medcial care for acute illnesses, injuries, and life-threatening conditions. Operates 24/7 with physician, nurses, and trauma specialists trained in rapid assessment and stablization.</p>
          <div className='text-md flex flex-row flex-wrap m-2 p-3 bg-amber-50'>
            <div className='w-1/2'>
              <h3 className='font-medium my-2.5'>Services Offered :- </h3>
              <ul className='p-2'>Rapid triage and patient assessment, Advanced cardiac life support (ACLS), Trauma care and resuscitation, Emergency minor & major procedures, Suturing and wound management, Emergency intubation and ventilation, Emergency obstetric care, Pediatric emergency care</ul>
            </div>
            <div className='w-1/2'>
              <h3 className='font-medium my-2.5'>Conditions We Treat :-</h3>
              <ul className='p-2'>Chest pain & heart attack, Stroke symptoms, Severe breathing difficulties, Trauma & accidents, Fractures & dislocations, Severe bleeding, Burns, Poisoning & drug overdose, High fever with complications, Seizures</ul>
            </div>
            <div className='w-1/2'>
              <h3 className='font-medium my-2.5'>Facilities & Equipment :- </h3>
              <ul className='p-2'>Fully equipped resuscitation bays, Cardiac monitors & defibrillators, Ventilators, Portable X-ray & ultrasound, CT scan access, Minor procedure room, Emergency pharmacy support, Dedicated trauma beds</ul>
            </div>
            <div className='w-1/2'>
              <h3 className='font-medium my-2.5'>Emergency Team :- </h3>
              <ul className='p-2'>Emergency Medicine Specialists, Trained Emergency Nurses, Trauma Surgeons (on-call), Anesthesiologists (on-call), Critical Care Specialists, Paramedical & Ambulance Team</ul>
            </div>
            <div className='w-1/2'>
              <h3 className='font-medium my-2.5'>Ambulance Services :- </h3>
              <ul className='p-2'>24/7 ambulance availability, Basic & Advanced Life Support (BLS & ALS) ambulances, GPS-enabled rapid response</ul>
            </div>
            <div className='w-1/2'>
              <h3 className='font-medium my-2.5'>Patient Support :- </h3>
              <ul className='p-2'>Immediate admission to ICU if required, Coordination with specialty departments, Family counseling and updates, Insurance and billing assistance</ul>
            </div>
          </div>
        </div>

        <div className='section-2 flex h-full w-1/3 bg-transparent rounded-2xl border border-black'>
          <div className='h-full w-1/2 flex justify-center items-center '>
            <img className='rounded-4xl m-3 px-4' src="https://images.unsplash.com/photo-1712215544003-af10130f8eb3?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" />
          </div>
          <div className='h-full w-1/2 flex flex-col justify-center items-center m-2 py-4 px-2'>
            <h5 className='text-md font-medium'>Department Head :- <span className='font-light'>Dr. John Doe</span></h5>
            <p className=' font-medium'>Department members :- <span className='font-light'>10</span></p>
          </div>
        </div>
      </div>
  )
}

export default EmergencyDepartment
