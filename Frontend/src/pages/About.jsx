import React from "react";
import Header from "../components/Header";
import AboutHero from "../components/About/AboutHero";
import StatsSection from "../components/About/StatsSection";
import MissionVision from "../components/About/MissionVision";
import ValuesSection from "../components/About/ValuesSection";
import DoctorsSection from "../components/About/DoctorsSection";
import StorySection from "../components/About/StorySection";

const About = () => {
  return (
    <div className='min-h-screen overflow-x-hidden relative'>

      <Header />

      {/* ── Modular Page Sections ── */}
      <AboutHero />
      <StatsSection />
      <MissionVision />
      <ValuesSection />
      <DoctorsSection />
      <StorySection />

      {/* Footer */}
      <div className='text-center pb-10'>
        <p className='text-xs text-gray-600'>© 2026 DELTACARE Hospital · All rights reserved</p>
      </div>
    </div>
  );
};

export default About;