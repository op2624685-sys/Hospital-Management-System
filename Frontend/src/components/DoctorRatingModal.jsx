import React, { useState } from "react";
import reviewsAPI from "../api/reviews";
import { toast } from "react-toastify";

/* ─── Star selector ─────────────────────────────────────────────────────────── */
const StarSelector = ({ value, onChange }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 2,
            fontSize: 32,
            lineHeight: 1,
            color: n <= (hovered || value) ? "#f59e0b" : "var(--border)",
            transform: n <= (hovered || value) ? "scale(1.2)" : "scale(1)",
            transition: "color 0.15s, transform 0.15s",
            filter:
              n <= (hovered || value)
                ? "drop-shadow(0 0 6px rgba(245,158,11,0.5))"
                : "none",
          }}
          aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
        >
          ★
        </button>
      ))}
    </div>
  );
};

/* ─── Modal ─────────────────────────────────────────────────────────────────── */
const DoctorRatingModal = ({ doctorId, doctorName, onClose, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.warning("Please select a star rating.");
      return;
    }
    setSubmitting(true);
    try {
      await reviewsAPI.submitReview(doctorId, { rating, comment });
      toast.success("Review submitted! Rating will update shortly.");
      onSuccess?.();
      onClose();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        "Failed to submit review.";
      toast.error(typeof msg === "string" ? msg : "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  const LABELS = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9998,
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(4px)",
          animation: "rmFadeIn 0.2s ease",
        }}
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="rm-title"
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 9999,
          width: "min(520px, 94vw)",
          background: "var(--card)",
          borderRadius: 24,
          border: "1px solid var(--border)",
          boxShadow:
            "0 32px 80px rgba(0,0,0,0.25), 0 0 0 1px color-mix(in srgb, var(--primary) 10%, transparent)",
          padding: "32px 32px 28px",
          animation: "rmSlideUp 0.25s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        <style>{`
          @keyframes rmFadeIn { from { opacity: 0 } to { opacity: 1 } }
          @keyframes rmSlideUp { from { opacity:0; transform:translate(-50%,-46%) scale(0.97) } to { opacity:1; transform:translate(-50%,-50%) scale(1) } }
          .rm-textarea {
            width: 100%; min-height: 100px; resize: vertical;
            background: var(--background); color: var(--foreground);
            border: 1.5px solid var(--border); border-radius: 12px;
            padding: 12px 14px; font-family: 'Outfit', sans-serif;
            font-size: 14px; outline: none; transition: border-color .2s, box-shadow .2s;
            line-height: 1.6;
          }
          .rm-textarea:focus {
            border-color: var(--primary);
            box-shadow: 0 0 0 4px color-mix(in srgb, var(--primary) 10%, transparent);
          }
          .rm-submit {
            width: 100%; padding: 13px; border-radius: 14px; border: none;
            background: var(--primary); color: var(--primary-foreground);
            font-family: 'Outfit', sans-serif; font-size: 15px; font-weight: 700;
            cursor: pointer; transition: opacity .2s, transform .15s;
            box-shadow: 0 6px 20px color-mix(in srgb, var(--primary) 35%, transparent);
          }
          .rm-submit:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
          .rm-submit:disabled { opacity: 0.6; cursor: not-allowed; }
          .rm-label { font-size: 13px; font-weight: 600; color: var(--muted-foreground); margin-bottom: 8px; display: block; }
        `}</style>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <div
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "color-mix(in srgb, var(--primary) 10%, transparent)",
                border: "1px solid color-mix(in srgb, var(--primary) 20%, transparent)",
                borderRadius: 999, padding: "4px 12px",
                fontSize: 11, fontWeight: 700, letterSpacing: ".1em",
                textTransform: "uppercase", color: "var(--primary)", marginBottom: 10,
              }}
            >
              ✦ Rate Your Experience
            </div>
            <h2
              id="rm-title"
              style={{ margin: 0, fontSize: "1.4rem", fontWeight: 800, color: "var(--foreground)", fontFamily: "'Outfit', sans-serif" }}
            >
              Dr. {doctorName}
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--muted-foreground)" }}>
              Your feedback helps others make informed decisions.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "var(--secondary)", border: "1px solid var(--border)",
              borderRadius: 10, width: 34, height: 34, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--muted-foreground)", fontSize: 18, flexShrink: 0,
              transition: "background .2s, color .2s",
            }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Star rating */}
          <div style={{ marginBottom: 24 }}>
            <span className="rm-label">Your Rating</span>
            <StarSelector value={rating} onChange={setRating} />
            {rating > 0 && (
              <div style={{ marginTop: 8, fontSize: 13, fontWeight: 600, color: "#f59e0b" }}>
                {LABELS[rating]}
              </div>
            )}
          </div>

          {/* Comment */}
          <div style={{ marginBottom: 24 }}>
            <label className="rm-label" htmlFor="rm-comment">
              Comment <span style={{ color: "var(--muted-foreground)", fontWeight: 400 }}>(optional, max 1000 chars)</span>
            </label>
            <textarea
              id="rm-comment"
              className="rm-textarea"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={1000}
              placeholder="Share your experience with this doctor…"
            />
            <div style={{ textAlign: "right", fontSize: 11, color: "var(--muted-foreground)", marginTop: 4 }}>
              {comment.length}/1000
            </div>
          </div>

          <button type="submit" className="rm-submit" disabled={submitting || rating === 0}>
            {submitting ? "Submitting…" : "Submit Review"}
          </button>
        </form>
      </div>
    </>
  );
};

export default DoctorRatingModal;
