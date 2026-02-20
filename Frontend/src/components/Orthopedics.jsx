import React from 'react'

const Orthopedics = () => {
  return (
    <div className='px-20 py-5'>
      <div className='flex justify-center items-center mt-20 px-5'>
        <div className='section-1 flex flex-col w-2/3 m-10 py-2 px-4 h-full bg-transparent border-2 border-black rounded-2xl'>
          <h2 className='text-7xl font-bold w-full mt-2 mb-4'>Orthopedics Department</h2>
          <p className='text-xl font-semibold px-2'>Focuses on the prevention, diagnosis, and treatment of disorders of the bones, joints, ligaments, tendons, and muscles. Our orthopedic surgeons and specialists are dedicated to restoring mobility and improving quality of life through both surgical and non-surgical approaches.</p>
          <div className='text-md flex flex-row flex-wrap m-2 p-3 bg-amber-50'>
            <div className='w-1/2'>
              <h3 className='font-medium my-2.5'>Services Offered :- </h3>
              <ul className='p-2'>Joint replacement surgery (knee, hip, shoulder), Arthroscopic surgery, Spine surgery, Fracture fixation & management, Sports injury treatment, Physiotherapy & rehabilitation, Bone density testing, Platelet-rich plasma (PRP) therapy, Pediatric orthopedics, Limb reconstruction</ul>
            </div>
            <div className='w-1/2'>
              <h3 className='font-medium my-2.5'>Conditions We Treat :-</h3>
              <ul className='p-2'>Osteoarthritis & rheumatoid arthritis, Fractures & dislocations, Ligament & tendon tears (ACL, rotator cuff), Spine disorders (scoliosis, herniated disc), Osteoporosis, Bone tumors, Clubfoot & developmental disorders, Carpal tunnel syndrome, Tendinitis & bursitis, Sports injuries</ul>
            </div>
            <div className='w-1/2'>
              <h3 className='font-medium my-2.5'>Facilities & Equipment :- </h3>
              <ul className='p-2'>Dedicated orthopedic OTs, Arthroscopy suites, Digital X-ray & bone scan, DEXA scan for bone density, 3D gait analysis lab, Physiotherapy & hydrotherapy pool, Sports medicine clinic, Plaster & cast room, Prosthetics & orthotics unit</ul>
            </div>
            <div className='w-1/2'>
              <h3 className='font-medium my-2.5'>Our Orthopedic Team :- </h3>
              <ul className='p-2'>Orthopedic Surgeons, Spine Surgeons, Sports Medicine Specialists, Physiotherapists, Occupational Therapists, Rheumatologists, Prosthetics & Orthotics Specialists, Pain Management Specialists</ul>
            </div>
            <div className='w-1/2'>
              <h3 className='font-medium my-2.5'>Sports Medicine :- </h3>
              <ul className='p-2'>Sports injury assessment & treatment, Performance & fitness evaluation, Return-to-sport programs, Biomechanical analysis, Injury prevention workshops</ul>
            </div>
            <div className='w-1/2'>
              <h3 className='font-medium my-2.5'>Patient Support :- </h3>
              <ul className='p-2'>Pre & post-surgery rehabilitation, Home physiotherapy guidance, Dietary & bone health counseling, Long-term follow-up care, Insurance and billing assistance</ul>
            </div>
          </div>
        </div>

        <div className='section-2 flex h-full w-1/3 bg-transparent rounded-2xl border border-black'>
          <div className='h-full w-1/2 flex justify-center items-center '>
            <img className='rounded-4xl m-3 px-4' src="https://images.unsplash.com/photo-1582750433449-648ed127bb54?q=80&w=687&auto=format&fit=crop" alt="Orthopedics Department" />
          </div>
          <div className='h-full w-1/2 flex flex-col justify-center items-center m-2 py-4 px-2'>
            <h5 className='text-md font-medium'>Department Head :- <span className='font-light'>Dr. Robert King</span></h5>
            <p className='font-medium'>Department members :- <span className='font-light'>12</span></p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Orthopedics