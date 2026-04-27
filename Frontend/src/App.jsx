import React, { Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleBlockedRoute from "./components/RoleBlockedRoute";
import GlobalBackground from "./components/GlobalBackground";
import PageLoader from "./components/PageLoader";

// ── Eagerly loaded (lightweight, always needed) ─────────────────────────────
import Home from "./pages/Home";
import Login from "./pages/AuthPages/Login";
import Signup from "./pages/AuthPages/Signup";
import SignupComplete from "./pages/AuthPages/SignupComplete";
import ForgotPassword from "./pages/AuthPages/ForgotPassword";
import OAuth2Callback from "./pages/OAuth2Callback";

// ── Lazy loaded (heavy / role-gated pages) ──────────────────────────────────
const AdminPanel = React.lazy(() => import("./pages/AdminPanel"));
const HeadAdminPanel = React.lazy(() => import("./pages/HeadAdminPanel"));
const DoctorAppointments = React.lazy(() => import("./pages/DoctorAppointments"));
const DoctorDepartment = React.lazy(() => import("./pages/DoctorDepartment"));
const DepartmentControl = React.lazy(() => import("./pages/Departmentcontrol"));
const Doctor = React.lazy(() => import("./pages/Doctor"));
const DoctorDetails = React.lazy(() => import("./pages/DoctorDetails"));
const Profile = React.lazy(() => import("./pages/Profile"));
const MyAppointments = React.lazy(() => import("./pages/MyAppointments"));
const CheckAppointments = React.lazy(() => import("./pages/CheckAppointments"));
const AppointmentDetails = React.lazy(() => import("./pages/AppointmentDetails"));
const Appointment = React.lazy(() => import("./pages/Appointment"));
const PaymentPage = React.lazy(() => import("./pages/PaymentPage"));
const PatientRegister = React.lazy(() => import("./pages/PatientRegister"));
const Branch = React.lazy(() => import("./pages/Branch"));
const BranchDetails = React.lazy(() => import("./pages/BranchDetails"));
const Department = React.lazy(() => import("./pages/Department"));
const Services = React.lazy(() => import("./pages/Services"));
const About = React.lazy(() => import("./pages/About"));
const Contact = React.lazy(() => import("./pages/Contact"));
const EmergencyDepartment = React.lazy(() => import("./components/EmergencyDepartment"));
const Cardiology = React.lazy(() => import("./components/Cardiology"));
const Neurology = React.lazy(() => import("./components/Neurology"));
const Orthopedics = React.lazy(() => import("./components/Orthopedics"));
const Pediatrics = React.lazy(() => import("./components/Pediatrics"));
const Radiology = React.lazy(() => import("./components/Radiology"));
const DoctorBookedDetails = React.lazy(() => import("./pages/DoctorBookedDetails"));

const App = () => {
  return (
    <div>
      <GlobalBackground />
      <Suspense fallback={<PageLoader message="Loading..." />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/appointment" element={<Appointment />} />
          <Route path="/appointment/check" element={
            <ProtectedRoute role="PATIENT" redirectTo="/profile">
              <CheckAppointments />
            </ProtectedRoute>
          } />
          <Route path="/appointment/:appointmentId" element={
            <ProtectedRoute role="PATIENT" redirectTo="/profile">
              <AppointmentDetails />
            </ProtectedRoute>
          } />
          <Route path="/payment" element={
            <ProtectedRoute role="PATIENT" redirectTo="/profile">
              <PaymentPage />
            </ProtectedRoute>
          } />
          <Route path="/doctors" element={<Doctor />} />
          <Route path="/doctors/:doctorId" element={<DoctorDetails />} />
          <Route path="/branches" element={<Branch />} />
          <Route path="/branches/:branchId" element={<BranchDetails />} />
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
          <Route path="/signup/complete" element={<SignupComplete />} />
          <Route path="/patient/register" element={
            <ProtectedRoute redirectTo="/login">
              <PatientRegister />
            </ProtectedRoute>
          } />
          <Route path="/login/forgotpassword" element={<ForgotPassword />} />
          <Route path="/oauth2/callback" element={<OAuth2Callback />} />

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
                <DoctorAppointments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/appointments"
            element={
              <ProtectedRoute role="DOCTOR">
                <DoctorAppointments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/my-department"
            element={
              <ProtectedRoute role="DOCTOR">
                <DoctorDepartment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/department-head"
            element={
              <ProtectedRoute role="DOCTOR">
                <DepartmentControl />
              </ProtectedRoute>
            }
          />
          <Route
            path="/department/:departmentId"
            element={
              <ProtectedRoute role="DOCTOR">
                <DoctorDepartment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/department/:departmentId/control"
            element={
              <ProtectedRoute role="DOCTOR">
                <DepartmentControl />
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
          <Route
            path="/profile"
            element={
              <ProtectedRoute redirectTo="/login">
                <Profile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </div>
  );
};

export default App;
