import React, { useEffect, useMemo, useState, useCallback } from "react";
import { ArrowLeft, Building2, CalendarDays, Mail, Stethoscope, Wallet, MessageSquare, Star } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import API from "../api/api";
import PageLoader from "../components/PageLoader";
import reviewsAPI from "../api/reviews";

/* ─── Star bar (read-only filled stars) ──── */
const StarBar = ({ rating }) => (
  <div style={{ display: "flex", gap: 3 }}>
    {[1, 2, 3, 4, 5].map((n) => (
      <svg key={n} width={15} height={15} viewBox="0 0 24 24"
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
      borderRadius: 16, padding: "18px 20px",
      boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
      transition: "transform .2s, border-color .2s",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = "color-mix(in srgb, var(--primary) 35%, transparent)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "var(--border)"; }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Avatar */}
          <div style={{
            width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
            background: "linear-gradient(135deg, var(--primary), var(--chart-5))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 800, color: "#fff",
          }}>
            {initials}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "var(--foreground)" }}>
              {review.patientName || "Anonymous"}
            </div>
            <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 2 }}>{formatted}</div>
          </div>
        </div>
        <StarBar rating={review.rating} />
      </div>
      {review.comment && (
        <p style={{
          marginTop: 14, fontSize: 13.5, lineHeight: 1.65,
          color: "var(--foreground)", borderLeft: "3px solid var(--primary)",
          paddingLeft: 12, background: "var(--background)",
          borderRadius: "0 8px 8px 0", padding: "10px 12px",
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

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Rating state
  const [summary, setSummary] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewPage, setReviewPage] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [hasMoreReviews, setHasMoreReviews] = useState(true);
  const REVIEW_SIZE = 5;

  /* ── Fetch doctor ── */
  useEffect(() => {
    const fetchDoctor = async () => {
      setLoading(true); setError("");
      try {
        const res = await API.get(`/public/doctors/${doctorId}`);
        setDoctor(res.data || null);
      } catch {
        setDoctor(null);
        setError("Doctor not found");
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [doctorId]);

  /* ── Fetch rating summary ── */
  useEffect(() => {
    if (!doctorId) return;
    reviewsAPI.getRatingSummary(doctorId)
      .then((res) => setSummary(res.data))
      .catch(() => setSummary({ averageRating: 0, totalReviews: 0 }));
  }, [doctorId]);

  /* ── Fetch reviews (paginated) ── */
  const fetchReviews = useCallback(async (page) => {
    setReviewsLoading(true);
    try {
      const res = await reviewsAPI.getReviews(doctorId, page, REVIEW_SIZE);
      const content = res.data?.content || res.data || [];
      setReviews((prev) => page === 0 ? content : [...prev, ...content]);
      setHasMoreReviews(content.length === REVIEW_SIZE);
    } catch {
      /* silently ignore */
    } finally {
      setReviewsLoading(false);
    }
  }, [doctorId]);

  useEffect(() => { fetchReviews(0); }, [fetchReviews]);

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
      },
    });
  };

  /* ── Loaders / Errors ── */
  if (loading) return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Header />
      <div className="max-w-5xl mx-auto px-6 pt-28 pb-16">
        <PageLoader fullPage={false} size="md" message="Loading doctor profile..." bg="var(--card)" />
      </div>
    </div>
  );

  if (error || !doctor) return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Header />
      <div className="max-w-5xl mx-auto px-6 pt-28 pb-16">
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8">
          <p className="text-lg font-semibold">{error || "Doctor not found"}</p>
          <Link to="/doctors" className="inline-flex items-center gap-2 mt-4 text-[var(--primary)]">
            <ArrowLeft size={16} /> Back to doctors
          </Link>
        </div>
      </div>
    </div>
  );

  const avg = summary?.averageRating ?? 0;
  const totalReviews = summary?.totalReviews ?? 0;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Header />

      <style>{`
        .dd-section { background: var(--card); border: 1px solid var(--border); border-radius: 24px; padding: 24px; }
        .dd-load-more {
          display: block; width: 100%; margin-top: 16px; padding: 12px;
          background: var(--secondary); border: 1px solid var(--border); border-radius: 14px;
          font-size: 14px; font-weight: 700; color: var(--primary); cursor: pointer;
          transition: background .2s, transform .15s;
          font-family: 'Outfit', sans-serif;
        }
        .dd-load-more:hover:not(:disabled) { background: color-mix(in srgb, var(--primary) 8%, transparent); transform: translateY(-1px); }
        .dd-load-more:disabled { opacity: 0.5; cursor: not-allowed; }
        .dd-avg-ring {
          width: 90px; height: 90px; border-radius: 50%;
          background: conic-gradient(#f59e0b calc(var(--pct) * 1%), var(--border) 0%);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
          position: relative;
        }
        .dd-avg-inner {
          width: 70px; height: 70px; border-radius: 50%;
          background: var(--card);
          display: flex; align-items: center; justify-content: center;
          flex-direction: column;
        }
      `}</style>

      <div className="max-w-5xl mx-auto px-6 pt-28 pb-16" style={{ display: "flex", flexDirection: "column", gap: 24 }}>

        <Link to="/doctors" className="inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
          <ArrowLeft size={16} /> Back to doctors
        </Link>

        {/* ── Hero card ── */}
        <div className="dd-section">
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 20 }}>
            <div style={{
              width: 80, height: 80, borderRadius: 20, flexShrink: 0,
              background: "linear-gradient(135deg, var(--primary), var(--chart-5))",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 28, fontWeight: 800, color: "#fff",
            }}>
              {initials}
            </div>
            <div style={{ flex: 1, minWidth: 160 }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 999,
                border: "1px solid var(--border)", background: "var(--secondary)",
                padding: "4px 12px", fontSize: 11, fontWeight: 700,
                letterSpacing: ".1em", textTransform: "uppercase", color: "var(--primary)", marginBottom: 8,
              }}>
                <Stethoscope size={11} /> Doctor Profile
              </div>
              <h1 style={{ margin: 0, fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 800, color: "var(--foreground)" }}>
                Dr. {doctor.name}
              </h1>
              <p style={{ margin: "4px 0 0", color: "var(--muted-foreground)", fontSize: 14 }}>
                {doctor.specialization || "General Physician"}
              </p>
            </div>
            <button
              onClick={handleBookAppointment}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "var(--primary)", color: "var(--primary-foreground)",
                border: "none", borderRadius: 16, padding: "12px 22px",
                fontSize: 14, fontWeight: 700, cursor: "pointer",
                boxShadow: "0 6px 20px color-mix(in srgb, var(--primary) 30%, transparent)",
                transition: "opacity .2s, transform .15s",
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = ".9"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}
            >
              <CalendarDays size={16} /> Book Appointment
            </button>
          </div>
        </div>

        {/* ── Info grid ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
          {/* Contact */}
          <div className="dd-section">
            <h2 style={{ margin: "0 0 16px", fontSize: "1rem", fontWeight: 700 }}>Contact & Branch</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, fontSize: 14 }}>
              {[
                { Icon: Mail,      text: doctor.email || "N/A" },
                { Icon: Building2, text: doctor?.branch?.name || "Branch N/A" },
                { Icon: Wallet,    text: doctor.consultationFee != null ? `INR ${doctor.consultationFee}` : "Not specified", label: "Consultation Fee: " },
              ].map(({ Icon, text, label = "" }) => (
                <div key={text} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <Icon size={16} style={{ color: "var(--primary)", marginTop: 2, flexShrink: 0 }} />
                  <span style={{ color: "var(--foreground)" }}>{label}{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Departments */}
          <div className="dd-section">
            <h2 style={{ margin: "0 0 16px", fontSize: "1rem", fontWeight: 700 }}>Departments</h2>
            {departments.length === 0
              ? <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>No departments listed.</p>
              : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {departments.map((dept) => (
                    <span key={dept.id || dept.name} style={{
                      display: "inline-flex", alignItems: "center",
                      borderRadius: 999, border: "1px solid var(--border)",
                      background: "var(--secondary)", padding: "5px 14px",
                      fontSize: 12, fontWeight: 600, color: "var(--foreground)",
                    }}>
                      {dept.name}
                    </span>
                  ))}
                </div>
              )
            }
            <p style={{ marginTop: 12, fontSize: 12, color: "var(--muted-foreground)" }}>
              {doctor.isHead ? "Department Head" : "Consultant"}
            </p>
          </div>
        </div>

        {/* ── Rating summary ── */}
        <div className="dd-section">
          <h2 style={{ margin: "0 0 20px", fontSize: "1rem", fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
            <Star size={16} style={{ color: "#f59e0b" }} /> Patient Ratings
          </h2>

          {totalReviews === 0 ? (
            <p style={{ fontSize: 14, color: "var(--muted-foreground)" }}>No reviews yet. Be the first!</p>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 32, flexWrap: "wrap" }}>
              {/* Circular score */}
              <div
                className="dd-avg-ring"
                style={{ "--pct": (avg / 5) * 100 }}
              >
                <div className="dd-avg-inner">
                  <span style={{ fontSize: "1.5rem", fontWeight: 900, color: "#f59e0b", lineHeight: 1 }}>
                    {avg.toFixed(1)}
                  </span>
                  <span style={{ fontSize: 10, color: "var(--muted-foreground)", marginTop: 2 }}>/ 5.0</span>
                </div>
              </div>

              {/* Stars + count */}
              <div>
                <StarBar rating={avg} />
                <p style={{ margin: "8px 0 4px", fontSize: 20, fontWeight: 800, color: "var(--foreground)" }}>
                  {avg.toFixed(1)} <span style={{ fontSize: 13, fontWeight: 500, color: "var(--muted-foreground)" }}>out of 5</span>
                </p>
                <p style={{ margin: 0, fontSize: 13, color: "var(--muted-foreground)" }}>
                  Based on <strong style={{ color: "var(--foreground)" }}>{totalReviews}</strong> verified patient review{totalReviews !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Review list ── */}
        <div className="dd-section">
          <h2 style={{ margin: "0 0 20px", fontSize: "1rem", fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
            <MessageSquare size={16} style={{ color: "var(--primary)" }} /> Patient Reviews
          </h2>

          {reviewsLoading && reviews.length === 0 && (
            <PageLoader fullPage={false} size="sm" message="Loading reviews..." bg="transparent" />
          )}

          {!reviewsLoading && reviews.length === 0 && (
            <p style={{ fontSize: 14, color: "var(--muted-foreground)", fontStyle: "italic" }}>
              No reviews submitted yet.
            </p>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {reviews.map((r) => <ReviewCard key={r.id} review={r} />)}
          </div>

          {hasMoreReviews && reviews.length > 0 && (
            <button
              className="dd-load-more"
              disabled={reviewsLoading}
              onClick={() => {
                const next = reviewPage + 1;
                setReviewPage(next);
                fetchReviews(next);
              }}
            >
              {reviewsLoading ? "Loading…" : "Load More Reviews"}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default DoctorDetails;
