import React from 'react'

const Pediatrics = () => {
  return (
    <div className='px-20 py-5'>
      <div className='flex justify-center items-center mt-20 px-5'>
        <div className='section-1 flex flex-col w-2/3 m-10 py-2 px-4 h-full bg-transparent border-2 border-black rounded-2xl'>
          <h2 className='text-7xl font-bold w-full mt-2 mb-4'>Pediatrics Department</h2>
          <p className='text-xl font-semibold px-2'>Provides comprehensive medical care for infants, children, and adolescents from birth to 18 years of age. Our pediatric specialists are trained to address the unique physical, emotional, and developmental needs of young patients in a child-friendly environment.</p>
          <div className='text-md flex flex-row flex-wrap m-2 p-3 bg-amber-50'>
            <div className='w-1/2'>
              <h3 className='font-medium my-2.5'>Services Offered :- </h3>
              <ul className='p-2'>Newborn care & neonatology, Routine well-child check-ups, Vaccination & immunization, Growth & developmental monitoring, Pediatric surgery, Child nutrition counseling, Allergy & asthma management, Pediatric cardiology, Pediatric neurology, Adolescent medicine</ul>
            </div>
            <div className='w-1/2'>
              <h3 className='font-medium my-2.5'>Conditions We Treat :-</h3>
              <ul className='p-2'>Fever & infections, Respiratory illnesses (asthma, bronchiolitis), Diarrhea & dehydration, Malnutrition, Congenital disorders, Childhood diabetes, ADHD & behavioral issues, Developmental delays, Anemia, Ear & throat infections</ul>
            </div>
            <div className='w-1/2'>
              <h3 className='font-medium my-2.5'>Facilities & Equipment :- </h3>
              <ul className='p-2'>Neonatal ICU (NICU), Pediatric ICU (PICU), Child-friendly ward & playroom, Pediatric OT & procedure room, Incubators & warmers, Pediatric ventilators, Dedicated pediatric pharmacy, Growth & nutrition clinic</ul>
            </div>
            <div className='w-1/2'>
              <h3 className='font-medium my-2.5'>Our Pediatric Team :- </h3>
              <ul className='p-2'>Consultant Pediatricians, Neonatologists, Pediatric Surgeons, Pediatric Cardiologists, Pediatric Neurologists, Child Psychologists, Pediatric Nurses, Nutritionists & Dieticians</ul>
            </div>
            <div className='w-1/2'>
              <h3 className='font-medium my-2.5'>Neonatal Care :- </h3>
              <ul className='p-2'>High-dependency NICU for premature babies, Kangaroo mother care support, Newborn screening programs, Phototherapy for jaundice, Breastfeeding support & lactation counseling</ul>
            </div>
            <div className='w-1/2'>
              <h3 className='font-medium my-2.5'>Patient & Family Support :- </h3>
              <ul className='p-2'>Parenting education & counseling, School health programs, Childhood vaccination schedules, 24/7 pediatric helpline, Insurance and billing assistance</ul>
            </div>
          </div>
        </div>

        <div className='section-2 flex h-full w-1/3 bg-transparent rounded-2xl border border-black'>
          <div className='h-full w-1/2 flex justify-center items-center '>
            <img className='rounded-4xl m-3 px-4' src="https://images.unsplash.com/photo-1666214280557-f1b5022eb634?q=80&w=687&auto=format&fit=crop" alt="Pediatrics Department" />
          </div>
          <div className='h-full w-1/2 flex flex-col justify-center items-center m-2 py-4 px-2'>
            <h5 className='text-md font-medium'>Department Head :- <span className='font-light'>Dr. Emily Chen</span></h5>
            <p className='font-medium'>Department members :- <span className='font-light'>20</span></p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Pediatrics