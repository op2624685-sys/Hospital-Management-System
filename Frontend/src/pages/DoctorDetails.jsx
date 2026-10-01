import React, { useMemo } from "react";
import { ArrowLeft, Building2, CalendarDays, Mail, Stethoscope, Wallet, MessageSquare, Star, Award, Users, Clock } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import API from "../api/api";
import PageLoader from "../components/PageLoader";
import reviewsAPI from "../api/reviews";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

/* ─── Star bar (read-only filled stars) ──── */
const StarBar = ({ rating }) => (
  <div style={{ display: "flex", gap: 3 }}>
    {[1, 2, 3, 4, 5].map((n) => (
      <svg key={n} width={16} height={16} viewBox="0 0 24 24"
        fill={n <= Math.round(rating) ? "#f59e0b" : "var(--border)"}
        style={{ flexShrink: 0 }}
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ))}
  </div>
);

/* ─── Single review card ──── */
const ReviewCard = ({ review }) => {
  const date = review.updatedAt || review.createdAt;
  const formatted = date
    ? new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "";
  const initials = (review.patientName || "?")
    .split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div style={{
      background: "var(--card)", border: "1px solid var(--border)",
      borderRadius: 20, padding: "20px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
      transition: "transform .2s, border-color .2s",
      marginBottom: "16px"
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.borderColor = "var(--primary)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "var(--border)"; }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
            background: "linear-gradient(135deg, var(--primary), var(--chart-5))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 800, color: "#fff",
            boxShadow: "0 4px 10px color-mix(in srgb, var(--primary) 30%, transparent)",
          }}>
            {initials}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "var(--foreground)" }}>
              {review.patientName || "Anonymous"}
            </div>
            <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 2 }}>{formatted}</div>
          </div>
        </div>
        <StarBar rating={review.rating} />
      </div>
      {review.comment && (
        <p style={{
          marginTop: 16, fontSize: 14, lineHeight: 1.6,
          color: "var(--foreground)", borderLeft: "4px solid var(--primary)",
          padding: "12px 16px", background: "var(--background)",
          borderRadius: "0 12px 12px 0", fontStyle: "italic"
        }}>
          "{review.comment}"
        </p>
      )}
    </div>
  );
};

/* ─── Main component ──── */
const DoctorDetails = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();

  const REVIEW_SIZE = 5;

  const {
    data: doctor = null,
    isLoading: loading,
    error: doctorError,
  } = useQuery({
    queryKey: ["doctor-details", doctorId],
    queryFn: async () => {
      const res = await API.get(`/public/doctors/${doctorId}`);
      return res.data || null;
    },
    enabled: Boolean(doctorId),
  });

  const {
    data: reviewsData,
    isFetching: reviewsLoading,
    isFetchingNextPage,
    hasNextPage: hasMoreReviews,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["doctor-reviews", doctorId, REVIEW_SIZE],
    queryFn: async ({ pageParam }) => {
      const res = await reviewsAPI.getReviews(doctorId, pageParam, REVIEW_SIZE);
      const content = res.data?.content || res.data || [];
      return Array.isArray(content) ? content : [];
    },
    enabled: Boolean(doctorId),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === REVIEW_SIZE ? allPages.length : undefined,
  });

  const reviews = useMemo(() => reviewsData?.pages?.flat() || [], [reviewsData]);

  const departments = useMemo(() => {
    if (!doctor?.departments) return [];
    return Array.isArray(doctor.departments) ? doctor.departments : Array.from(doctor.departments);
  }, [doctor]);

  const initials = useMemo(() => {
    const name = doctor?.name || "NA";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  }, [doctor]);

  const handleBookAppointment = () => {
    if (!doctor) return;
    navigate("/appointment", {
      state: {
        doctorId: doctor.id,
        doctorName: doctor.name,
        speciality: doctor.specialization || "",
        department: departments[0]?.name || "",
        branchId: doctor?.branch?.id || null,
        branchName: doctor?.branch?.name || "",
        departments,
      },
    });
  };

  if (loading) return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Header />
      <div className="max-w-5xl mx-auto px-6 pt-28 pb-16">
        <PageLoader fullPage={false} size="md" message="Loading doctor profile..." bg="var(--card)" />
      </div>
    </div>
  );

  if (doctorError || !doctor) return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Header />
      <div className="max-w-5xl mx-auto px-6 pt-28 pb-16">
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8 text-center">
          <p className="text-lg font-semibold">Doctor not found</p>
          <Link to="/doctors" className="inline-flex items-center gap-2 mt-4 text-[var(--primary)] font-medium">
            <ArrowLeft size={16} /> Back to doctors
          </Link>
        </div>
      </div>
    </div>
  );

  const summary = doctor?.ratingSummary;
  const avg = summary?.averageRating ?? 0;
  const totalReviews = summary?.totalReviews ?? 0;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Header />

      <style>{`
        .dd-hero-gradient {
          background: linear-gradient(to bottom, color-mix(in srgb, var(--primary) 15%, transparent), var(--background));
          border-radius: 0 0 40px 40px;
          padding: 40px 0;
          margin-bottom: -40px;
        }
        .dd-stat-tile {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: transform .2s;
        }
        .dd-stat-tile:hover { transform: translateY(-3px); }
        .dd-stat-icon {
          width: 40px; height: 40px; border-radius: 12px;
          background: color-mix(in srgb, var(--primary) 10%, transparent);
          display: flex; align-items: center; justify-content: center;
          color: var(--primary);
        }
        .dd-section-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 24px;
          padding: 24px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.02);
        }
        .dd-load-more {
          display: block; width: 100%; margin-top: 24px; padding: 14px;
          background: var(--secondary); border: 1px solid var(--border); border-radius: 16px;
          font-size: 14px; font-weight: 700; color: var(--primary); cursor: pointer;
          transition: all .2s;
          font-family: 'Outfit', sans-serif;
        }
        .dd-load-more:hover:not(:disabled) { background: color-mix(in srgb, var(--primary) 10%, transparent); transform: translateY(-2px); }
        .dd-load-more:disabled { opacity: 0.5; cursor: not-allowed; }

        @media (max-width: 768px) {
          .dd-hero-container { flex-direction: column !important; text-align: center !important; }
          .dd-hero-avatar { margin: 0 auto !important; }
          .dd-hero-actions { width: 100% !important; justify-content: center !important; }
          .dd-main-grid { grid-template-columns: 1fr !important; }
          .dd-hero-gradient { border-radius: 0 0 24px 24px; }
          .dd-stats-row {
            display: grid !important;
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 8px !important;
          }
          .dd-stat-tile {
            padding: 10px 4px !important;
            flex-direction: column !important;
            justify-content: center !important;
            text-align: center !important;
            gap: 6px !important;
          }
          .dd-stat-icon {
            width: 32px !important;
            height: 32px !important;
          }
          .dd-stat-tile div:first-child {
            font-size: 14px !important;
          }
          .dd-stat-tile div:last-child {
            font-size: 10px !important;
            line-height: 1 !important;
          }
        }
      `}</style>

      <div className="dd-hero-gradient" style={{ paddingTop: "80px" }}>
        <div className="max-w-5xl mx-auto px-6">
          <Link to="/doctors" className="inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] mb-6 hover:text-[var(--primary)] transition-colors">
            <ArrowLeft size={16} /> Back to doctors
          </Link>

          <div className="dd-hero-container" style={{ display: "flex", alignItems: "center", gap: 32 }}>
            <div className="dd-hero-avatar" style={{
              width: 120, height: 120, borderRadius: 30, flexShrink: 0,
              background: "linear-gradient(135deg, var(--primary), var(--chart-5))",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 40, fontWeight: 800, color: "#fff",
              boxShadow: "0 10px 25px color-mix(in srgb, var(--primary) 40%, transparent)",
            }}>
              {initials}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 999,
                border: "1px solid var(--border)", background: "var(--secondary)",
                padding: "4px 12px", fontSize: 11, fontWeight: 700,
                letterSpacing: ".1em", textTransform: "uppercase", color: "var(--primary)", marginBottom: 12,
              }}>
                <Stethoscope size={11} /> Specialist Profile
              </div>
              <h1 style={{ margin: 0, fontSize: "clamp(2rem, 4vw, 2.8rem)", fontWeight: 800, color: "var(--foreground)", lineHeight: 1.1 }}>
                Dr. {doctor.name}
              </h1>
              <p style={{ margin: "8px 0 0", color: "var(--muted-foreground)", fontSize: "clamp(1rem, 2vw, 1.2rem)", fontWeight: 500 }}>
                {doctor.specialization || "General Physician"}
              </p>
            </div>

            <div className="dd-hero-actions" style={{ display: "flex", gap: 12 }}>
              <button
                onClick={handleBookAppointment}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: "var(--primary)", color: "var(--primary-foreground)",
                  border: "none", borderRadius: 16, padding: "14px 28px",
                  fontSize: 15, fontWeight: 700, cursor: "pointer",
                  boxShadow: "0 8px 24px color-mix(in srgb, var(--primary) 30%, transparent)",
                  transition: "all .2s",
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.02)"; e.currentTarget.style.opacity = ".9"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.opacity = "1"; }}
              >
                <CalendarDays size={18} /> Book Appointment
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pt-16 pb-16" style={{ display: "flex", flexDirection: "column", gap: 32 }}>

        {/* ── Quick Stats Strip ── */}
        <div className="dd-stats-row" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
          <div className="dd-stat-tile">
            <div className="dd-stat-icon"><Star size={20} /></div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "var(--foreground)" }}>{avg.toFixed(1)} / 5.0</div>
              <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Ratings</div>
            </div>
          </div>
          <div className="dd-stat-tile">
            <div className="dd-stat-icon"><Users size={20} /></div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "var(--foreground)" }}>{totalReviews}</div>
              <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Reviews</div>
            </div>
          </div>
          <div className="dd-stat-tile">
            <div className="dd-stat-icon"><Award size={20} /></div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "var(--foreground)" }}>{doctor.isHead ? "Dept Head" : "Consultant"}</div>
              <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>Rank</div>
            </div>
          </div>
        </div>

        <div className="dd-main-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 32 }}>

          {/* Left Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>

            {/* About & Departments */}
            <div className="dd-section-card">
              <h2 style={{ margin: "0 0 20px", fontSize: "1.25rem", fontWeight: 700, display: "flex", alignItems: "center", gap: 10 }}>
                <Stethoscope size={20} style={{ color: "var(--primary)" }} /> Professional Details
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 12 }}>Specializations & Departments</h3>
                  {departments.length === 0
                    ? <p style={{ fontSize: 14, color: "var(--muted-foreground)" }}>No departments listed.</p>
                    : (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                        {departments.map((dept) => (
                          <span key={dept.id || dept.name} style={{
                            display: "inline-flex", alignItems: "center",
                            borderRadius: 12, border: "1px solid var(--border)",
                            background: "var(--secondary)", padding: "6px 16px",
                            fontSize: 13, fontWeight: 600, color: "var(--foreground)",
                          }}>
                            {dept.name}
                          </span>
                        ))}
                      </div>
                    )
                  }
                </div>

                <div style={{ padding: "20px", background: "var(--background)", borderRadius: 16, border: "1px dashed var(--border)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                    <Clock size={18} style={{ color: "var(--primary)" }} />
                    <span style={{ fontWeight: 700, fontSize: 14 }}>Appointment Availability</span>
                  </div>
                  <p style={{ fontSize: 13, color: "var(--muted-foreground)", margin: 0 }}>
                    Appointments are available based on the doctor's current schedule. Please use the booking system to check real-time slots.
                  </p>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="dd-section-card">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700, display: "flex", alignItems: "center", gap: 10 }}>
                  <MessageSquare size={20} style={{ color: "var(--primary)" }} /> Patient Testimonials
                </h2>
                <div style={{ display: "flex", alignItems: "center", gap: 6, background: "var(--secondary)", padding: "4px 12px", borderRadius: 999 }}>
                  <Star size={14} style={{ color: "#f59e0b" }} />
                  <span style={{ fontWeight: 800, fontSize: 14 }}>{avg.toFixed(1)}</span>
                </div>
              </div>

              {reviewsLoading && reviews.length === 0 && (
                <PageLoader fullPage={false} size="sm" message="Loading reviews..." bg="transparent" />
              )}

              {!reviewsLoading && reviews.length === 0 && (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <p style={{ fontSize: 14, color: "var(--muted-foreground)", fontStyle: "italic" }}>
                    No reviews submitted yet. Be the first to share your experience!
                  </p>
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {reviews.map((r) => <ReviewCard key={r.id} review={r} />)}
              </div>

              {hasMoreReviews && reviews.length > 0 && (
                <button
                  className="dd-load-more"
                  disabled={isFetchingNextPage}
                  onClick={() => fetchNextPage()}
                >
                  {isFetchingNextPage ? "Loading…" : "View More Testimonials"}
                </button>
              )}
            </div>
          </div>

          {/* Right Column / Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>

            {/* Contact Card */}
            <div className="dd-section-card" style={{ position: "sticky", top: "100px" }}>
              <h2 style={{ margin: "0 0 20px", fontSize: "1.1rem", fontWeight: 700 }}>Contact Info</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 20, fontSize: 14 }}>
                {[
                  { Icon: Mail,      text: doctor.email || "N/A", label: "Email" },
                  { Icon: Building2, text: doctor?.branch?.name || "Branch N/A", label: "Branch" },
                  { Icon: Wallet,    text: doctor.consultationFee != null ? `INR ${doctor.consultationFee}` : "Not specified", label: "Fee" },
                ].map(({ Icon, text, label }, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, background: "var(--secondary)",
                      display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)"
                    }}>
                      {React.createElement(Icon, { size: 16 })}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontSize: 11, color: "var(--muted-foreground)", fontWeight: 600, textTransform: "uppercase" }}>{label}</span>
                      <span style={{ color: "var(--foreground)", fontWeight: 500 }}>{text}</span>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleBookAppointment}
                style={{
                  width: "100%", marginTop: 32, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
                  background: "var(--primary)", color: "var(--primary-foreground)",
                  border: "none", borderRadius: 16, padding: "14px",
                  fontSize: 14, fontWeight: 700, cursor: "pointer",
                  transition: "all .2s",
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = ".9"}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}
              >
                <CalendarDays size={18} /> Book Now
              </button>
            </div>

            {/* Trust Signal Card */}
            <div className="dd-section-card" style={{ background: "linear-gradient(135deg, var(--primary), var(--chart-5))", color: "#fff", border: "none" }}>
              <Award size={32} style={{ marginBottom: 16, color: "rgba(255,255,255,0.8)" }} />
              <h3 style={{ margin: "0 0 8px", fontSize: "1.1rem", fontWeight: 700 }}>Verified Expert</h3>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, opacity: 0.9 }}>
                Dr. {doctor.name} is a certified specialist providing top-tier healthcare services with a focus on patient-centric care.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDetails;
