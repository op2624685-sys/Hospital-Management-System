import React from 'react'
import Header from '../components/Header'

const Services = () => {
  const services = [
    {
        id:1,
      title: "24/7 Emergency Care",
      description:
        "Our Emergency Department provides immediate medical attention for critical and urgent health conditions.",
      details: [
        "Available 24 hours a day",
        "Advanced Life Support (ALS)",
        "Average response time: 15 mins",
      ],
    },
    {
        id:2,
      title: "Inpatient Services",
      description:
        "We offer comfortable and fully equipped inpatient facilities.",
      details: [
        "150 total hospital beds",
        "ICU 24/7 nursing supervision",
        "Daily specialist rounds",
      ],
    },
    {
        id:3,
      title: "Outpatient Services",
      description:
        "We provide a wide range of outpatient services, including consultations, examinations, and treatments.",
      details: [
        "Specialist consultations",
        "Diagnostic tests",
        "Therapeutic procedures",
      ],
    },
    {
        id:4,
      title: "Diagnostic Services",
      description:
        "We offer advanced diagnostic services, including advanced imaging, laboratory tests, and medical imaging.",
      details: [
        "CT scans",
        "MRI scans",
        "Ultrasound",
        "PET scans",
      ],
    },
    {
        id:5,
      title: "Medical Services",
      description:
        "We offer a wide range of medical services, including general medicine, internal medicine, and specialty care.",
      details: [
        "General medicine",
        "Internal medicine",
        "Cardiology",
        "Neurology",
      ],
    },
    {
        id:6,
      title: "Pharmacy Services",
      description:
        "We offer a wide range of pharmacy services, including prescription medication, over-the-counter medications, and herbal remedies.",
      details: [
        "Prescription medication",
        "Over-the-counter medications",
        "Herbal remedies",
      ],
    },
  ];

  return (
    <div className='mt-20 px-20 py-5'>
      <Header />

      <div className='text-center m-10'>
        <h2 className='text-8xl font-bold'>Our Hospital Services</h2>
      </div>

      <div className='grid md:grid-cols-3 gap-8'>
        {services.map((service, id) => (
          <div key={id} className='service-card p-5 shadow-md rounded'>
            <h3 className='text-xl font-semibold'>{service.title}</h3>
            <p className='my-3'>{service.description}</p>

            <ul className='list-disc pl-5'>
              {service.details.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Services