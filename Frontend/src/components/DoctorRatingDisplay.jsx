import React, { useEffect, useState } from "react";
import reviewsAPI from "../api/reviews";

/**
 * DoctorRatingDisplay — read-only star badge.
 * Can either accept a pre-fetched `summary` prop, or auto-fetch by `doctorId`.
 *
 * Props:
 *   doctorId  {number}  — fetches from API if summary not provided
 *   summary   {object}  — { averageRating, totalReviews } — skips fetch if supplied
 *   size      "sm"|"md" — visual size preset (default "sm")
 *   showCount {boolean} — show review count (default true)
 */
const DoctorRatingDisplay = ({ doctorId, summary: initialSummary, size = "sm", showCount = true }) => {
  const [summary, setSummary] = useState(initialSummary || null);

  useEffect(() => {
    if (initialSummary) { setSummary(initialSummary); return; }
    if (!doctorId) return;
    reviewsAPI
      .getRatingSummary(doctorId)
      .then((res) => setSummary(res.data))
      .catch(() => {/* silently ignore — ratings are non-critical */});
  }, [doctorId, initialSummary]);

  if (!summary || summary.totalReviews === 0) {
    return (
      <span style={tagStyle(size)}>
        <StarIcon size={size} /> No reviews yet
      </span>
    );
  }

  const avg = typeof summary.averageRating === "number"
    ? summary.averageRating.toFixed(1)
    : "—";

  return (
    <span style={tagStyle(size)}>
      <StarIcon size={size} />
      <strong style={{ color: "#f59e0b", fontWeight: 800 }}>{avg}</strong>
      {showCount && (
        <span style={{ color: "var(--muted-foreground)", fontWeight: 500 }}>
          ({summary.totalReviews})
        </span>
      )}
    </span>
  );
};

/* ─── sub-components ─────────────────────────────────────────────────────────── */
const StarIcon = ({ size }) => (
  <svg
    width={size === "md" ? 16 : 13}
    height={size === "md" ? 16 : 13}
    viewBox="0 0 24 24"
    fill="#f59e0b"
    style={{ flexShrink: 0 }}
  >
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const tagStyle = (size) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: size === "md" ? 5 : 4,
  fontSize: size === "md" ? 14 : 12,
  fontWeight: 600,
  fontFamily: "'Outfit', sans-serif",
  whiteSpace: "nowrap",
  color: "var(--foreground)",
});

export default DoctorRatingDisplay;
