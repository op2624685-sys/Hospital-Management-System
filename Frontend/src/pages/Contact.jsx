import React, { useState } from "react";
import Header from "../components/Header";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Message Submitted Successfully!");
    setFormData({ name: "", email: "", phone: "", message: "" });
  };

  return (
    <div className="mt-20 px-6 md:px-20">
      <Header />

      <div className="text-center my-10">
        <h1 className="text-8xl font-bold text-black">Contact Us</h1>
        <p className="mt-4 text-gray-600">
          Get in touch with us for appointments, queries, or emergencies.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-10 my-16">
        {/* Contact Info */}
        <div className="bg-blue-50 p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold text-black mb-6">
            Contact Information
          </h2>
          <p className="mt-4 text-gray-600">
            📍 123 Health Street, Delhi, India
          </p>
          <p className="mt-2 text-gray-600">
            📞 +91 98765 43210
          </p>
          <p className="mt-2 text-gray-600">
            📧 info@hospital.com
          </p>
          <p className="mt-2 text-gray-600">
            🕒 Open 24/7
          </p>

          <div className="mt-6 bg-red-100 p-4 rounded">
            <p className="text-red-600 font-semibold">
              🚨 Emergency? Call Now: +91 98765 43210
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-lg shadow"
        >
          <h2 className="text-2xl font-semibold text-black mb-6">
            Send Us a Message
          </h2>

          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full mb-4 p-3 border rounded"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            className="w-full mb-4 p-3 border rounded"
            required
          />

          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            className="w-full mb-4 p-3 border rounded"
          />

          <textarea
            name="message"
            placeholder="Your Message"
            value={formData.message}
            onChange={handleChange}
            className="w-full mb-4 p-3 border rounded"
            rows="4"
            required
          ></textarea>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition"
          >
            Submit Message
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;