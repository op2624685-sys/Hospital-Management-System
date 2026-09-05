# HMS Frontend

**Hospital Management System** - A modern web application for appointment booking, doctor consultations, branch management, and prescription handling.

![Tech Stack](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react&logoColor=black)
![Tech Stack](https://img.shields.io/badge/Vite-7.2.4-646CFF?logo=vite&logoColor=white)
![Tech Stack](https://img.shields.io/badge/TailwindCSS-4.1.18-38B2AC?logo=tailwind-css&logoColor=white)
![Tech Stack](https://img.shields.io/badge/TypeScript-Static--typing-3178C6?logo=typescript&logoColor=white)

## 📋 Overview

The HMS Frontend is a responsive, feature-rich web application built with **React 19**, **Vite**, and **Tailwind CSS** that facilitates hospital management operations including appointment booking, doctor browsing, branch/location management, prescription handling, and appointment tracking.

## 🌟 Key Features

### 1. 🏥 Appointment Booking
- Select branch/hospital location with search suggestions
- Browse doctors by specialization and department
- Choose appointment date (up to 30 days advance) and time slots (20-minute intervals)
- Real-time availability checking with booked slot highlighting
- Patient profile validation before booking
- Cloudflare Turnstile CAPTCHA verification
- Secure redirect to payment page upon successful booking

### 2. 📅 Appointment Status Check
- Look up appointments by unique booking ID (no login required)
- Real-time status tracking with live updates
- Visual status indicators with color-coded banners
- Full appointment details including doctor info, timing, and patient details
- Paste appointment ID from clipboard for quick lookup
- Status timeline showing progression through appointment lifecycle

### 3. 👨‍⚕️ Doctor Browse & Details
- Search and filter doctors by name, specialization, or department
- Doctor profile pages with ratings, reviews, and specialization
- View doctor availability and branch locations
- Book appointments directly from doctor details
- Patient review system with verified ratings

### 4. 🏢 Hospital Branch Management
- View all hospital branches with live data from backend
- Branch search by name, address, email, or contact number
- Branch statistics (total branches, 24/7 ready, ICU support)
- Branch detail pages with department snapshots
- Contact information (phone, email, address)
- View directions integration with Google Maps
- Quick appointment booking from branch pages

### 5. 💊 Prescription Management
- Create and edit prescriptions with diagnosis, medicines, and clinical notes
- View prescription status (Draft, Generating, Ready, Failed)
- Download prescription PDFs when ready
- View prescription history from My Appointments
- Rate completed appointments
- Follow-up date and notes tracking

## 📦 Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | React 19, Vite 7, TypeScript |
| **Styling** | Tailwind CSS 4, CSS Modules |
| **UI Components** | Radix UI, Lucide React, React Icons |
| **State Management** | TanStack Query (React Query) |
| **Routing** | React Router DOM |
| **Forms** | React Hook Form (implied) |
| **API Client** | Axios |
| **Notifications** | React Toastify |
| **3D/WebGL** | Three.js, @react-three/fiber, @react-three/drei |
| **Captcha** | Cloudflare Turnstile |
| **Charts** | Chart.js, react-chartjs-2 |
| **Animations** | GSAP, Framer Motion (implied) |

## 🛠️ Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server at `http://localhost:5173` |
| `npm run build` | Build production bundle |
| `npm run lint` | Run ESLint for code quality |
| `npm run preview` | Preview production build locally |

## 📁 Project Structure

```
Frontend/
├── src/
│   ├── api/           # API service endpoints
│   ├── components/    # Reusable UI components
│   │   ├── AppointmentBooking.jsx  # Appointment booking form
│   │   ├── CheckAppointment.jsx    # Check appointment by ID
│   │   ├── DoctorCard.jsx          # Doctor card component
│   │   ├── BranchCard.jsx          # Branch card component
│   │   ├── PrescriptionEditor.jsx  # Prescription editor
│   │   └── ui/                     # UI primitives (label, switch, toggle-theme)
│   ├── pages/         # Page-level components
│   │   ├── Appointment.jsx         # Main appointment booking page
│   │   ├── CheckAppointments.jsx   # Check appointment status
│   │   ├── Doctor.jsx              # Doctors listing page
│   │   ├── DoctorDetails.jsx       # Doctor detail page
│   │   ├── Branch.jsx              # Branches listing page
│   │   ├── BranchDetails.jsx       # Branch detail page
│   │   ├── MyAppointments.jsx      # My appointments history
│   │   ├── PrescriptionEditor.jsx  # Prescription management
│   │   ├── PaymentPage.jsx         # Payment processing
│   │   ├── AdminPanel.jsx          # Admin panel
│   │   └── ...                     # Other pages
│   ├── context/       # React context (Auth, Notifications)
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utility functions
│   ├── pages/         # Page components
│   └── App.jsx        # Main app component with routing
├── index.html         # HTML template
├── package.json       # Dependencies and scripts
├── tailwind.config.js # Tailwind configuration
├── vite.config.js     # Vite configuration
└── tsconfig.json      # TypeScript configuration
```

## 📸 Screenshots

*(Add screenshots of key pages here)*

### Appointment Booking Page
![Appointment Booking](screenshots/appointment-booking.png)

### Check Appointment Status
![Check Appointment](screenshots/check-appointment.png)

### Doctor Details Page
![Doctor Details](screenshots/doctor-details.png)

### Branch Management
![Branch Management](screenshots/branch-management.png)

### Prescription Management
![Prescription Management](screenshots/prescription-management.png)

## 🎥 Video Clips

*(Add video clips demonstrating key features)*

### Appointment Booking Walkthrough
Demonstrates the complete appointment booking flow from branch selection to payment redirect.

### Status Check Demo
Shows how to look up an appointment status using the booking ID.

### Branch Explorer
Navigates through hospital branches and shows department details.

### Prescription Management
Demonstrates creating, saving, and downloading prescriptions.

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 10.0.0 or yarn >= 1.22.0

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/hms-frontend.git
   cd hms-frontend/Frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   Create a `.env` file in the `Frontend` directory:
   ```
   VITE_API_BASE_URL=http://localhost:8080/api
   VITE_CLOUDFLARE_SITE_KEY=your-turnstile-site-key
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The production build will be in the `dist` directory.

## 🔐 Authentication & Roles

The application supports multiple user roles:

- **PATIENT** - Can book appointments, view my appointments, manage prescriptions
- **DOCTOR** - Can view patient appointments, manage prescriptions, rate patients
- **RECEPTIONIST** - Can manage appointments from receptionist panel
- **ADMIN** - Full admin panel access
- **HEADADMIN** - Head administrator access

Protected routes are enforced based on user role via the AuthContext.

## 📱 Responsive Design

The application is fully responsive and works on:
- **Mobile** (320px+): Single-column layout, hamburger menu, touch-friendly
- **Tablet** (768px+): Adaptive grid layouts, optimized touch targets
- **Desktop** (1024px+): Full feature grid, side-by-side layouts

## 🎨 Design System

The UI follows a consistent design system with:
- **Color palette**: Primary (medical accent), secondary, background, card, border themes
- **Typography**: Outfit (sans-serif) for UI, Cormorant Garamond (serif) for headings
- **Components**: Radix UI primitives with custom styling
- **Dark mode support**: Via Tailwind CSS `dark` mode class strategy

## 📦 Dependencies Highlights

Key dependencies used in the project:

```json
{
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "react-router-dom": "^7.13.0",
  "@tanstack/react-query": "^5.99.2",
  "axios": "^1.16.0",
  "tailwindcss": "^4.1.18",
  "lucide-react": "^0.564.0",
  "react-toastify": "^11.0.5",
  "sockjs-client": "^1.6.1",
  "three": "^0.183.2",
  "@stripe/react-stripe-js": "^5.6.1",
  "@stripe/stripe-js": "^8.11.0",
  "@radix-ui/react-label": "^2.1.8",
  "@mswider/react-turnstile": "^1.5.2"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary and confidential. All rights reserved.

## 📞 Support

For support, email support@sarheart.org or visit the documentation at `https://hms-docs.sarheart.org`

---

**Built with ❤️ by the HMS Development Team**

*Last updated: 2026-09-05*