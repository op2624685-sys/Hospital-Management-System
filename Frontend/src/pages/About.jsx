import React from "react";
import Header from "../components/Header";

const About = () => {
  const doctors = [
    {
      id: 1,
      name: "Dr. Rajesh Sharma",
      specialization: "Cardiologist",
      experience: "15 Years Experience",
    },
    {
      id: 2,
      name: "Dr. Priya Mehta",
      specialization: "Neurologist",
      experience: "12 Years Experience",
    },
    {
      id: 3,
      name: "Dr. Amit Verma",
      specialization: "Orthopedic Surgeon",
      experience: "10 Years Experience",
    },
  ];

  return (
    <div className="mt-20 px-6 md:px-20">
      <Header />

      {/* Hero Section */}
      <div className="text-center my-10">
        <h1 className="text-4xl font-bold text-blue-700">
          About Our Hospital
        </h1>
        <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
          Established in 2005, our hospital is committed to providing
          world-class healthcare services with compassion, innovation, and
          excellence.
        </p>
      </div>

      {/* Mission & Vision */}
      <div className="grid md:grid-cols-2 gap-10 my-16">
        <div className="bg-blue-50 p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold text-blue-600">Our Mission</h2>
          <p className="mt-3 text-gray-600">
            To provide high-quality, affordable healthcare services with a
            patient-centered approach and advanced medical technology.
          </p>
        </div>

        <div className="bg-green-50 p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold text-green-600">
            Our Vision
          </h2>
          <p className="mt-3 text-gray-600">
            To become a leading multi-specialty hospital known for excellence,
            innovation, and compassionate care.
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid md:grid-cols-4 gap-6 text-center my-16">
        <div className="bg-white shadow p-6 rounded">
          <h3 className="text-3xl font-bold text-blue-600">10,000+</h3>
          <p className="text-gray-600">Patients Treated</p>
        </div>
        <div className="bg-white shadow p-6 rounded">
          <h3 className="text-3xl font-bold text-blue-600">50+</h3>
          <p className="text-gray-600">Expert Doctors</p>
        </div>
        <div className="bg-white shadow p-6 rounded">
          <h3 className="text-3xl font-bold text-blue-600">150</h3>
          <p className="text-gray-600">Hospital Beds</p>
        </div>
        <div className="bg-white shadow p-6 rounded">
          <h3 className="text-3xl font-bold text-blue-600">24/7</h3>
          <p className="text-gray-600">Emergency Service</p>
        </div>
      </div>

      {/* Doctors Section */}
      <div className="my-16">
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-10">
          Our Expert Doctors
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {doctors.map((doctor) => (
            <div
              key={doctor.id}
              className="bg-white shadow-lg rounded-lg p-6 text-center"
            >
              <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold">{doctor.name}</h3>
              <p className="text-blue-600">{doctor.specialization}</p>
              <p className="text-gray-500 text-sm mt-2">
                {doctor.experience}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;