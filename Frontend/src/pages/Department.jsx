import React from 'react'
import Header from '../components/Header'
import Cardiology from '../components/Cardiology'
import Neurology from '../components/Neurology'
import Orthopedics from '../components/Orthopedics'
import Pediatrics from '../components/Pediatrics'
import Radiology from '../components/Radiology'
import EmergencyDepartment from '../components/EmergencyDepartment'

const Department = () => {
  return (
    <div className='px-20 py-5'>
      <Header />
      <EmergencyDepartment />
      <Cardiology />
      <Neurology />
      <Orthopedics />
      <Pediatrics />
      <Radiology />
    </div>
  )
}

export default Department
