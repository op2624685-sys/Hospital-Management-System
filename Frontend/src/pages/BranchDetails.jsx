import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Mail,
  MapPin,
  Phone,
  User2,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import API from "../api/api";
import { getBranchImage } from "../utils/branchImages";
import PageLoader from "../components/PageLoader";

const BranchDetails = () => {
  const { branchId } = useParams();
  const navigate = useNavigate();
  const [branch, setBranch] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [departmentError, setDepartmentError] = useState("");

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      setError("");
      try {
        const [branchRes, deptRes] = await Promise.allSettled([
          API.get("/public/branches"),
          API.get("/departments"),
        ]);

        if (branchRes.status !== "fulfilled") throw branchRes.reason;

        const allBranches = Array.isArray(branchRes.value.data)
          ? branchRes.value.data
          : [];
        const selected = allBranches.find(
          (b) => String(b.id) === String(branchId)
        );
        if (!selected) {
          setBranch(null);
          setDepartments([]);
          setError("Branch not found");
          return;
        }
        setBranch(selected);

        if (deptRes.status === "fulfilled") {
          const allDepartments = Array.isArray(deptRes.value.data)
            ? deptRes.value.data
            : [];
          const branchDepartments = allDepartments.filter(
            (d) => String(d.branchId) === String(selected.id)
          );
          setDepartments(branchDepartments);
          setDepartmentError("");
        } else {
          console.error("Failed to load department data:", deptRes.reason);
          setDepartments([]);
          setDepartmentError("Department data is temporarily unavailable.");
        }
      } catch (err) {
        console.error("Failed to load branch details:", err);
        setError("Failed to load branch details");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [branchId]);

  const heroImage = useMemo(() => getBranchImage(branch, 0), [branch]);
  const location = useMemo(
    () => branch?.address?.split(",").slice(-1)[0]?.trim() || "N/A",
    [branch]
  );

  const summary = useMemo(() => {
    const deptCount = departments.length;
    const doctorCount = departments.reduce(
      (sum, d) => sum + (d.memberCount || 0),
      0
    );
    const maxMembers = Math.max(
      1,
      ...departments.map((d) => d.memberCount || 0)
    );
    return { deptCount, doctorCount, maxMembers };
  }, [departments]);

  const handleBookAppointment = () => {
    if (!branch) return;
    navigate("/appointment", {
      state: { branchName: branch.name, branchId: branch.id },
    });
  };

  /* ── shared styles ── */
  const styles = {
    page: {
      minHeight: "100vh",
      background: "var(--background)",
      color: "var(--foreground)",
      fontFamily: "'Manrope', 'Segoe UI', sans-serif",
    },
    inner: {
      maxWidth: 960,
      margin: "0 auto",
      padding: "112px 24px 64px",
    },
    backLink: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      fontSize: 13,
      color: "var(--muted-foreground)",
      textDecoration: "none",
      marginBottom: 20,
    },
    // ── Hero ──
    hero: {
      background: "var(--card)",
      border: "1px solid var(--border)",
      borderRadius: 16,
      padding: "28px 28px 28px 28px",
      position: "relative",
      overflow: "hidden",
      marginBottom: 20,
    },
    heroBefore: {
      // Rendered via <div> pseudo-accent at top
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 3,
      background:
        "linear-gradient(90deg, var(--primary), var(--secondary))",
      borderRadius: "16px 16px 0 0",
    },
    heroBadge: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      background: "var(--secondary)",
      color: "var(--secondary-foreground)",
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      padding: "4px 12px",
      borderRadius: 20,
      border: "1px solid rgba(100,74,64,0.25)",
      marginBottom: 14,
    },
    heroH1: {
      fontSize: 28,
      fontWeight: 700,
      lineHeight: 1.2,
      color: "var(--foreground)",
      marginBottom: 6,
    },
    heroAddr: {
      fontSize: 13,
      color: "var(--muted-foreground)",
      marginBottom: 20,
    },
    heroInfoGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 12,
      maxWidth: 480,
    },
    heroInfoCard: {
      background: "var(--background)",
      border: "1px solid var(--border)",
      borderRadius: 10,
      padding: "12px 14px",
    },
    heroInfoLabel: {
      fontSize: 10,
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      color: "var(--muted-foreground)",
      marginBottom: 6,
    },
    heroInfoVal: {
      display: "flex",
      alignItems: "center",
      gap: 7,
      fontSize: 13,
      fontWeight: 500,
      color: "var(--foreground)",
    },
    heroPhoto: {
      position: "absolute",
      top: 24,
      right: 24,
      width: 140,
      height: 100,
      borderRadius: 12,
      border: "1px solid var(--border)",
      overflow: "hidden",
      background: "var(--muted)",
    },
    // ── Main grid ──
    mainGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr 280px",
      gap: 16,
    },
    card: {
      background: "var(--card)",
      border: "1px solid var(--border)",
      borderRadius: 14,
      padding: 20,
    },
    cardTitle: {
      fontSize: 15,
      fontWeight: 700,
      color: "var(--foreground)",
      marginBottom: 4,
    },
    cardSub: {
      fontSize: 12,
      color: "var(--muted-foreground)",
      marginBottom: 16,
    },
    // ── Dept header ──
    deptHeader: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 12,
      marginBottom: 16,
    },
    deptCountBadge: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      background: "var(--background)",
      border: "1px solid var(--border)",
      borderRadius: 10,
      padding: "10px 16px",
      textAlign: "center",
    },
    deptCountLabel: {
      fontSize: 10,
      textTransform: "uppercase",
      letterSpacing: "0.07em",
      color: "var(--muted-foreground)",
    },
    deptCountNum: {
      fontSize: 22,
      fontWeight: 700,
      color: "var(--primary)",
    },
    // ── Dept item ──
    deptItem: {
      background: "var(--background)",
      border: "1px solid var(--border)",
      borderRadius: 10,
      padding: 14,
      marginBottom: 10,
    },
    deptRow: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 8,
      marginBottom: 10,
    },
    deptName: {
      fontSize: 14,
      fontWeight: 600,
      color: "var(--foreground)",
    },
    deptHead: {
      fontSize: 11,
      color: "var(--muted-foreground)",
      marginTop: 2,
    },
    deptCountRight: { textAlign: "right", flexShrink: 0 },
    deptCountRightLabel: {
      fontSize: 10,
      textTransform: "uppercase",
      letterSpacing: "0.07em",
      color: "var(--muted-foreground)",
    },
    deptCountRightNum: {
      fontSize: 16,
      fontWeight: 700,
      color: "var(--primary)",
    },
    barTrack: {
      height: 5,
      background: "var(--border)",
      borderRadius: 3,
      overflow: "hidden",
    },
    deptDesc: {
      fontSize: 12,
      color: "var(--muted-foreground)",
      marginTop: 8,
      lineHeight: 1.5,
    },
    // ── Contact ──
    contactGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 10,
    },
    contactItem: {
      background: "var(--background)",
      border: "1px solid var(--border)",
      borderRadius: 10,
      padding: "12px 14px",
    },
    contactLabel: {
      fontSize: 10,
      textTransform: "uppercase",
      letterSpacing: "0.07em",
      color: "var(--muted-foreground)",
      marginBottom: 6,
    },
    contactVal: {
      display: "flex",
      alignItems: "center",
      gap: 7,
      fontSize: 13,
      color: "var(--foreground)",
    },
    // ── Sidebar ──
    sidebar: {
      display: "flex",
      flexDirection: "column",
      gap: 16,
    },
    btnPrimary: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      width: "100%",
      padding: "11px 16px",
      background: "var(--primary)",
      color: "var(--primary-foreground)",
      border: "none",
      borderRadius: 9,
      fontSize: 13,
      fontWeight: 600,
      cursor: "pointer",
      fontFamily: "inherit",
    },
    btnSecondary: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      width: "100%",
      padding: "10px 16px",
      background: "transparent",
      color: "var(--foreground)",
      border: "1px solid var(--border)",
      borderRadius: 9,
      fontSize: 13,
      fontWeight: 500,
      cursor: "pointer",
      marginTop: 8,
      textDecoration: "none",
      fontFamily: "inherit",
    },
    summaryRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "8px 0",
      borderBottom: "1px solid var(--border)",
      fontSize: 13,
    },
    summaryKey: { color: "var(--muted-foreground)" },
    summaryVal: { fontWeight: 600, color: "var(--foreground)" },
    // ── Error / empty ──
    errorBox: {
      background: "var(--card)",
      border: "1px solid var(--border)",
      borderRadius: 16,
      padding: 40,
    },
    warningBox: {
      borderRadius: 10,
      border: "1px solid rgba(229,77,46,0.3)",
      background: "rgba(229,77,46,0.07)",
      padding: "12px 14px",
      fontSize: 13,
      color: "var(--destructive)",
      marginBottom: 16,
    },
    emptyBox: {
      border: "1.5px dashed var(--border)",
      borderRadius: 10,
      padding: 24,
      color: "var(--muted-foreground)",
      fontSize: 13,
      textAlign: "center",
    },
  };

  const iconColor = "var(--primary)";

  /* ── Loading state ── */
  if (loading) {
    return (
      <div style={styles.page}>
        <Header />
        <div style={styles.inner}>
          <div style={styles.errorBox}>
            <PageLoader
              bg="Transparent"
              fullPage={false}
              size="md"
              message="Loading branch details..."
            />
          </div>
        </div>
      </div>
    );
  }

  /* ── Error state ── */
  if (error || !branch) {
    return (
      <div style={styles.page}>
        <Header />
        <div style={styles.inner}>
          <div style={styles.errorBox}>
            <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>
              {error || "Branch not found"}
            </p>
            <Link to="/branches" style={styles.backLink}>
              <ArrowLeft size={15} /> Back to branches
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ── Main render ── */
  return (
    <div style={styles.page}>
      <Header />

      <style>{`
        .bd-hero-photo { position:absolute; top:24px; right:24px; width:140px; height:100px; border-radius:12px; border:1px solid var(--border); overflow:hidden; background:var(--muted); }
        .bd-hero-photo img { width:100%; height:100%; object-fit:cover; }
        .bd-main-grid { display:grid; grid-template-columns:1fr 1fr 280px; gap:16px; }
        .bd-span2 { grid-column: span 2; }
        .bd-btn-primary:hover { opacity:.87; }
        .bd-btn-secondary:hover { background:var(--accent); }
        @media(max-width:768px){
          .bd-hero-photo { display:none; }
          .bd-main-grid { grid-template-columns:1fr !important; }
          .bd-span2 { grid-column:span 1 !important; }
          .bd-hero-info-grid { grid-template-columns:1fr !important; max-width:100% !important; }
          .bd-contact-grid { grid-template-columns:1fr !important; }
        }
        @media(max-width:480px){
          .bd-hero-info-grid { grid-template-columns:1fr !important; }
        }
      `}</style>

      <div style={styles.inner}>
        {/* Back */}
        <Link to="/branches" style={styles.backLink}>
          <ArrowLeft size={14} style={{ color: "var(--muted-foreground)" }} />
          Back to branches
        </Link>

        {/* ── Hero ── */}
        <div style={styles.hero}>
          {/* Top accent line */}
          <div style={styles.heroBefore} />

          {/* Hero photo */}
          <div className="bd-hero-photo">
            {heroImage && (
              <img src={heroImage} alt={branch.name} />
            )}
          </div>

          <div style={{ maxWidth: 540 }}>
            <div style={styles.heroBadge}>
              <Building2 size={12} color="var(--secondary-foreground)" />
              Branch Profile
            </div>
            <h1 style={styles.heroH1}>{branch.name}</h1>
            <p style={styles.heroAddr}>{branch.address}</p>

            <div
              className="bd-hero-info-grid"
              style={styles.heroInfoGrid}
            >
              <div style={styles.heroInfoCard}>
                <div style={styles.heroInfoLabel}>Branch Head</div>
                <div style={styles.heroInfoVal}>
                  <User2 size={15} color={iconColor} />
                  {branch.admin?.name || "Not Assigned"}
                </div>
              </div>
              <div style={styles.heroInfoCard}>
                <div style={styles.heroInfoLabel}>City</div>
                <div style={styles.heroInfoVal}>
                  <MapPin size={15} color={iconColor} />
                  {location}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Main grid ── */}
        <div className="bd-main-grid">

          {/* Department Snapshot */}
          <div className="bd-span2" style={styles.card}>
            <div style={styles.deptHeader}>
              <div>
                <div style={styles.cardTitle}>Department Snapshot</div>
                <div style={styles.cardSub}>
                  Doctors per department and leadership overview.
                </div>
              </div>
              <div style={styles.deptCountBadge}>
                <span style={styles.deptCountLabel}>Departments</span>
                <span style={styles.deptCountNum}>{summary.deptCount}</span>
              </div>
            </div>

            {departmentError && (
              <div style={styles.warningBox}>{departmentError}</div>
            )}

            {departments.length === 0 ? (
              <div style={styles.emptyBox}>
                No departments are assigned to this branch yet.
              </div>
            ) : (
              departments.map((dept) => {
                const members = dept.memberCount || 0;
                const widthPct = `${Math.round(
                  (members / summary.maxMembers) * 100
                )}%`;
                return (
                  <div key={dept.id} style={styles.deptItem}>
                    <div style={styles.deptRow}>
                      <div>
                        <div style={styles.deptName}>{dept.name}</div>
                        <div style={styles.deptHead}>
                          Head: {dept.headDoctorName || "TBD"}
                        </div>
                      </div>
                      <div style={styles.deptCountRight}>
                        <div style={styles.deptCountRightLabel}>Doctors</div>
                        <div style={styles.deptCountRightNum}>{members}</div>
                      </div>
                    </div>
                    <div style={styles.barTrack}>
                      <div
                        style={{
                          height: "100%",
                          width: widthPct,
                          borderRadius: 3,
                          background:
                            "linear-gradient(90deg, var(--primary), var(--secondary))",
                          transition: "width 0.4s ease",
                        }}
                      />
                    </div>
                    {dept.description && (
                      <p style={styles.deptDesc}>{dept.description}</p>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Sidebar */}
          <div style={styles.sidebar}>
            {/* Quick Actions */}
            <div style={styles.card}>
              <div style={{ ...styles.cardTitle, marginBottom: 14 }}>
                Quick Actions
              </div>
              <button
                className="bd-btn-primary"
                style={styles.btnPrimary}
                onClick={handleBookAppointment}
              >
                <CalendarDays size={14} />
                Book Appointment
              </button>
              <a
                className="bd-btn-secondary"
                style={styles.btnSecondary}
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  branch.address || branch.name
                )}`}
                target="_blank"
                rel="noreferrer"
              >
                <MapPin size={14} />
                View Directions
              </a>
            </div>

            {/* Branch Summary */}
            <div style={styles.card}>
              <div style={{ ...styles.cardTitle, marginBottom: 12 }}>
                Branch Summary
              </div>
              <div style={styles.summaryRow}>
                <span style={styles.summaryKey}>Departments</span>
                <span style={styles.summaryVal}>{summary.deptCount}</span>
              </div>
              <div style={styles.summaryRow}>
                <span style={styles.summaryKey}>Doctors (total)</span>
                <span style={styles.summaryVal}>{summary.doctorCount}</span>
              </div>
              <div style={{ ...styles.summaryRow, borderBottom: "none" }}>
                <span style={styles.summaryKey}>Branch Head</span>
                <span style={{ ...styles.summaryVal, fontSize: 12 }}>
                  {branch.admin?.name || "Not Assigned"}
                </span>
              </div>
            </div>
          </div>

          {/* Branch Contacts */}
          <div className="bd-span2" style={styles.card}>
            <div style={{ ...styles.cardTitle, marginBottom: 14 }}>
              Branch Contacts
            </div>
            <div className="bd-contact-grid" style={styles.contactGrid}>
              <div style={styles.contactItem}>
                <div style={styles.contactLabel}>Phone</div>
                <div style={styles.contactVal}>
                  <Phone size={14} color={iconColor} />
                  {branch.contactNumber || "N/A"}
                </div>
              </div>
              <div style={styles.contactItem}>
                <div style={styles.contactLabel}>Email</div>
                <div style={styles.contactVal}>
                  <Mail size={14} color={iconColor} />
                  {branch.email || "N/A"}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default BranchDetails;