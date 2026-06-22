import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { appointmentApi } from "../api/appointments";
import API from "../api/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "../components/Header";
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Loader,
  ShieldCheck,
  Stethoscope,
  Wallet,
} from "lucide-react";

const PAYMENT_CONTEXT_KEY = "hms_pending_payment_context";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);

const formatDateTime = (value) => {
  if (!value) return "Not selected";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Not selected";

  return parsed.toLocaleString("en-IN", {
    dateStyle: "long",
    timeStyle: "short",
  });
};

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [resolvedDoctor, setResolvedDoctor] = useState(null);
  const processedSessionRef = useRef(null);

  const cachedContext = useMemo(() => {
    try {
      const raw = sessionStorage.getItem(PAYMENT_CONTEXT_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, [location.key, location.search]);

  const paymentContext = location.state ?? cachedContext ?? {};
  const bookingPayload = paymentContext.bookingPayload;
  const doctorId = paymentContext.doctorId;

  const doctorName = paymentContext.doctorName || resolvedDoctor?.name || "";
  const departmentName =
    paymentContext.departmentName ||
    resolvedDoctor?.departments?.find((dept) => String(dept.id) === String(bookingPayload?.departmentId))?.name ||
    "";
  const doctorSpecialization = paymentContext.doctorSpecialization || resolvedDoctor?.specialization || "";
  const consultationFee = Number(resolvedDoctor?.consultationFee ?? 500);

  useEffect(() => {
    let active = true;

    if (!doctorId) {
      setResolvedDoctor(null);
      return undefined;
    }

    if (paymentContext.doctorName && paymentContext.departmentName && paymentContext.doctorSpecialization) {
      setResolvedDoctor(null);
      return undefined;
    }

    const loadDoctorDetails = async () => {
      try {
        const response = await API.get(`/public/doctors/${doctorId}`);
        if (active) {
          setResolvedDoctor(response.data || null);
        }
      } catch (error) {
        console.error("Failed to resolve doctor details:", error);
        if (active) {
          setResolvedDoctor(null);
        }
      }
    };

    loadDoctorDetails();

    return () => {
      active = false;
    };
  }, [doctorId, paymentContext.doctorName, paymentContext.departmentName, paymentContext.doctorSpecialization]);

  useEffect(() => {
    const sessionId = new URLSearchParams(location.search).get("session_id");

    if (sessionId && processedSessionRef.current !== sessionId) {
      processedSessionRef.current = sessionId;

      const confirmPayment = async () => {
        try {
          setLoading(true);
          await appointmentApi.confirmStripePayment({
            ...bookingPayload,
            sessionId,
          });

          sessionStorage.removeItem(PAYMENT_CONTEXT_KEY);
          toast.success("Payment successful. Your appointment is now confirmed.");
          navigate("/my-appointments", { replace: true });
        } catch (err) {
          console.error("Payment confirmation error:", err);
          processedSessionRef.current = null;

          const errorMessage = err.response?.data?.message || err.message || "Unknown error";
          toast.error("Payment confirmation failed: " + errorMessage);
          setLoading(false);
        }
      };

      confirmPayment();
    }
  }, [location.search, bookingPayload, navigate]);

  useEffect(() => {
    if (!bookingPayload || !doctorId) {
      if (!location.search.includes("session_id")) {
        toast.error("No booking information found.");
        navigate("/appointment");
      }
    }
  }, [bookingPayload, doctorId, navigate, location.search]);

  const handleCheckout = async () => {
    if (!bookingPayload || !doctorId) {
      toast.error("Invalid booking information");
      return;
    }

    setLoading(true);
    try {
      sessionStorage.setItem(
        PAYMENT_CONTEXT_KEY,
        JSON.stringify({
          bookingPayload,
          doctorId,
          doctorName,
          departmentName,
          doctorSpecialization,
        })
      );

      const response = await appointmentApi.createStripeCheckoutSession(doctorId, {
        ...bookingPayload,
        paymentMethod: "CREDIT_CARD",
      });

      if (response.data?.url) {
        window.location.href = response.data.url;
      } else {
        throw new Error("No checkout URL received from server");
      }
    } catch (err) {
      console.error(err);
      toast.error(
        "Failed to create checkout session: " +
          (err.response?.data?.message || err.message || "Unknown error")
      );
      setLoading(false);
    }
  };

  const doctorDisplayName = doctorName
    ? doctorName.startsWith("Dr.")
      ? doctorName
      : `Dr. ${doctorName}`
    : "Assigned doctor";

  const feeLineItems = [
    { label: "Consultation fee", value: formatCurrency(consultationFee) },
    { label: "Platform fee", value: formatCurrency(0) },
  ];

  if (loading && location.search.includes("session_id")) {
    return (
      <div className="min-h-screen bg-[var(--background)] pt-24 pb-12 px-4 relative overflow-hidden">
        <Header />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-[var(--primary)]/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-[var(--chart-5)]/10 blur-3xl" />
        </div>
        <div className="relative max-w-md mx-auto">
          <div className="rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-8 shadow-2xl text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--secondary)] text-[var(--primary)]">
              <Loader size={22} className="animate-spin" />
            </div>
            <h1 className="text-2xl font-black text-[var(--foreground)] mb-2">Confirming payment</h1>
            <p className="text-sm text-[var(--muted-foreground)]">
              Please wait while we verify your Stripe payment and confirm the appointment.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!bookingPayload) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pt-24 pb-12 px-4 relative overflow-hidden text-[var(--foreground)]">
      <Header />

      <style>{`
        .payment-shell {
          position: relative;
          max-width: 1180px;
          margin: 0 auto;
        }

        .payment-shell::before,
        .payment-shell::after {
          content: "";
          position: absolute;
          border-radius: 999px;
          filter: blur(60px);
          pointer-events: none;
          z-index: 0;
        }

        .payment-shell::before {
          width: 260px;
          height: 260px;
          top: -40px;
          right: -40px;
          background: color-mix(in srgb, var(--primary) 14%, transparent);
        }

        .payment-shell::after {
          width: 320px;
          height: 320px;
          left: -80px;
          bottom: -120px;
          background: color-mix(in srgb, var(--chart-5) 10%, transparent);
        }

        .payment-hero {
          position: relative;
          overflow: hidden;
          border: 1px solid color-mix(in srgb, var(--primary) 16%, var(--border));
          background:
            radial-gradient(circle at top right, color-mix(in srgb, var(--primary) 18%, transparent), transparent 34%),
            linear-gradient(135deg, color-mix(in srgb, var(--primary) 10%, var(--card)) 0%, var(--card) 52%, color-mix(in srgb, var(--chart-5) 7%, var(--card)) 100%);
          box-shadow: 0 30px 60px -30px rgba(0, 0, 0, 0.25);
        }

        .payment-card {
          background: var(--card);
          border: 1px solid var(--border);
          box-shadow: 0 24px 70px -42px rgba(0, 0, 0, 0.35);
        }

        .payment-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.45fr) minmax(320px, 0.85fr);
          gap: 24px;
        }

        @media (max-width: 1024px) {
          .payment-grid {
            grid-template-columns: 1fr;
          }
        }

        .detail-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        @media (max-width: 640px) {
          .detail-grid {
            grid-template-columns: 1fr;
          }
        }

        .detail-item {
          padding: 16px;
          border-radius: 18px;
          background: var(--background);
          border: 1px solid var(--border);
        }

        .summary-chip {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 999px;
          border: 1px solid color-mix(in srgb, var(--primary) 18%, var(--border));
          background: color-mix(in srgb, var(--primary) 6%, var(--secondary));
          color: var(--primary);
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
      `}</style>

      <div className="payment-shell">
        <button
          onClick={() => navigate(-1)}
          className="relative z-10 mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--muted-foreground)] transition-colors hover:text-[var(--primary)]"
        >
          <ArrowLeft size={18} />
          Go back
        </button>

        <div className="payment-grid relative z-10">
          <div className="space-y-6">
            <section className="payment-hero rounded-[32px] p-8 lg:p-10">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="summary-chip">
                  <ShieldCheck size={14} />
                  Secure checkout
                </span>
                <span className="summary-chip">
                  <BadgeCheck size={14} />
                  Stripe protected
                </span>
              </div>

              <div className="flex flex-col gap-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary)] text-[var(--primary-foreground)] shadow-lg shadow-black/10">
                    <CreditCard size={26} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold uppercase tracking-[0.22em] text-[var(--primary)]">
                      Appointment payment
                    </p>
                    <h1 className="mt-2 text-3xl font-black leading-tight text-[var(--foreground)] lg:text-4xl">
                      Complete your booking securely
                    </h1>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
                      Review the appointment details below, then proceed to Stripe to complete the transaction.
                    </p>
                  </div>
                </div>

                <div className="detail-grid">
                  <div className="detail-item">
                    <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                      <Stethoscope size={14} />
                      Doctor
                    </div>
                    <div className="text-lg font-extrabold text-[var(--foreground)]">{doctorDisplayName}</div>
                    <div className="mt-1 text-sm text-[var(--muted-foreground)]">
                      {doctorSpecialization || "Specialist consultation"}
                    </div>
                  </div>

                  <div className="detail-item">
                    <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                      <Building2 size={14} />
                      Department
                    </div>
                    <div className="text-lg font-extrabold text-[var(--foreground)]">
                      {departmentName || "Department not selected"}
                    </div>
                    <div className="mt-1 text-sm text-[var(--muted-foreground)]">
                      Assigned from the booked appointment
                    </div>
                  </div>

                  <div className="detail-item">
                    <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                      <CalendarDays size={14} />
                      Appointment time
                    </div>
                    <div className="text-lg font-extrabold text-[var(--foreground)]">
                      {formatDateTime(bookingPayload.appointmentTime)}
                    </div>
                    <div className="mt-1 text-sm text-[var(--muted-foreground)]">
                      {bookingPayload.reason || "No reason provided"}
                    </div>
                  </div>

                  <div className="detail-item">
                    <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                      <Wallet size={14} />
                      Payment method
                    </div>
                    <div className="text-lg font-extrabold text-[var(--foreground)]">Card payment</div>
                    <div className="mt-1 text-sm text-[var(--muted-foreground)]">
                      Credit or debit card via Stripe
                    </div>
                  </div>
                </div>

                {bookingPayload.notes && (
                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                      Notes
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">
                      {bookingPayload.notes}
                    </p>
                  </div>
                )}

                <div className="flex items-start gap-3 rounded-2xl border border-emerald-200/70 bg-emerald-50/70 p-5">
                  <ShieldCheck size={18} className="mt-0.5 text-emerald-600" />
                  <p className="text-sm leading-6 text-emerald-800">
                    Your payment is processed securely through Stripe. Card details are not stored in this app.
                  </p>
                </div>
              </div>
            </section>
          </div>

          <aside className="payment-card rounded-[32px] p-6 lg:sticky lg:top-24 h-fit">
            <div className="mb-6">
              <h2 className="text-xl font-black text-[var(--foreground)]">Payment summary</h2>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                Final review before redirecting to secure payment.
              </p>
            </div>

            <div className="space-y-4 rounded-3xl border border-[var(--border)] bg-[var(--background)] p-5">
              {feeLineItems.map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-4">
                  <span className="text-sm text-[var(--muted-foreground)]">{item.label}</span>
                  <span className="text-sm font-bold text-[var(--foreground)]">{item.value}</span>
                </div>
              ))}

              <div className="border-t border-[var(--border)] pt-4 flex items-center justify-between gap-4">
                <span className="text-base font-bold text-[var(--foreground)]">Total amount</span>
                <span className="text-2xl font-black text-[var(--primary)]">{formatCurrency(consultationFee)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="mt-6 w-full rounded-2xl bg-[var(--primary)] px-5 py-4 font-black text-[var(--primary-foreground)] shadow-lg shadow-black/10 transition-all hover:translate-y-[-1px] hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <Loader size={18} className="animate-spin" />
                  Processing
                </span>
              ) : (
                <span className="inline-flex items-center justify-center gap-2">
                  <CheckCircle2 size={18} />
                  Proceed to payment
                </span>
              )}
            </button>

            <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--secondary)] p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                What happens next
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">
                You will be redirected to Stripe. After payment, the appointment will be confirmed automatically.
              </p>
            </div>
          </aside>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={2500} />
    </div>
  );
};

export default PaymentPage;
