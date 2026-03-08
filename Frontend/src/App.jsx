import React from "react";
import "./index.css";
import Login from "./pages/AuthPages/Login";
import Signup from "./pages/AuthPages/Signup";
import ForgotPassword from "./pages/AuthPages/ForgotPassword";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import AppointmentDetails from "./pages/AppointmentDetails";
import Appointment from "./pages/Appointment";
import Doctor from "./pages/Doctor";
import Branch from "./pages/Branch";
import Department from "./pages/Department";
import Services from "./pages/Services";
import About from "./pages/About";
import Contact from "./pages/Contact";
import EmergencyDepartment from "./components/EmergencyDepartment";
import Cardiology from "./components/Cardiology";
import Neurology from "./components/Neurology";
import Orthopedics from "./components/Orthopedics";
import Pediatrics from "./components/Pediatrics";
import Radiology from "./components/Radiology";
import CheckAppointments from "./pages/CheckAppointments";
import AdminPanel from "./pages/AdminPanel";
import HeadAdminPanel from "./pages/HeadAdminPanel";
import ProtectedRoute from "./components/ProtectedRoute";
import DoctorBookedDetails from "./pages/DoctorBookedDetails";
import MyAppointments from "./pages/MyAppointments";
import RoleBlockedRoute from "./components/RoleBlockedRoute";
import GlobalBackground from "./components/GlobalBackground";

const App = () => {
  return (
    <div>
      <GlobalBackground />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/appointment" element={
          <RoleBlockedRoute blockedRoles={["DOCTOR", "ADMIN", "HEADADMIN"]}>
            <Appointment />
          </RoleBlockedRoute>
        } />
        <Route path="/appointment/check" element={
          <RoleBlockedRoute blockedRoles={["DOCTOR", "ADMIN", "HEADADMIN"]}>
            <CheckAppointments />
          </RoleBlockedRoute>
        } />
        <Route path="/appointment/:appointmentId" element={
          <RoleBlockedRoute blockedRoles={["DOCTOR", "ADMIN", "HEADADMIN"]}>
            <AppointmentDetails />
          </RoleBlockedRoute>
        } />
        <Route path="/doctors" element={<Doctor />} />
        <Route path="/branches" element={<Branch />} />
        <Route path="/services" element={
          <RoleBlockedRoute blockedRoles={["DOCTOR", "ADMIN", "HEADADMIN"]}>
            <Services />
          </RoleBlockedRoute>
        } />
        <Route path="/about" element={
          <RoleBlockedRoute blockedRoles={["DOCTOR", "ADMIN", "HEADADMIN"]}>
            <About />
          </RoleBlockedRoute>
        } />
        <Route path="/contact" element={<Contact />} />

        <Route path="/departments" element={<Department />} />
        <Route path="/departments/emergency" element={<EmergencyDepartment />} />
        <Route path="/departments/cardiology" element={<Cardiology />} />
        <Route path="/departments/neurology" element={<Neurology />} />
        <Route path="/departments/orthopedics" element={<Orthopedics />} />
        <Route path="/departments/pediatrics" element={<Pediatrics />} />
        <Route path="/departments/radiology" element={<Radiology />} />

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login/forgotpassword" element={<ForgotPassword />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute role="ADMIN">
              <AdminPanel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/head-admin"
          element={
            <ProtectedRoute role="HEADADMIN">
              <HeadAdminPanel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/booked-details"
          element={
            <ProtectedRoute role="DOCTOR">
              <DoctorBookedDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor/appointments"
          element={
            <ProtectedRoute role="DOCTOR">
              <DoctorBookedDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-appointments"
          element={
            <ProtectedRoute role="PATIENT" redirectTo="/">
              <MyAppointments />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
};

export default App;
