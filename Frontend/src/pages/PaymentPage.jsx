import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { appointmentApi } from "../api/appointments";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "../components/Header";
import {
  CreditCard,
  Lock,
  ArrowLeft,
  Loader,
  CheckCircle2
} from "lucide-react";

const PAYMENT_CONTEXT_KEY = "hms_pending_payment_context";
const PROCESSED_SESSION_KEY = "hms_processed_session_id";

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const processedSessionRef = useRef(null);

  const cachedContext = (() => {
    try {
      const raw = sessionStorage.getItem(PAYMENT_CONTEXT_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  const bookingPayload = location.state?.bookingPayload ?? cachedContext?.bookingPayload;
  const doctorId = location.state?.doctorId ?? cachedContext?.doctorId;

  useEffect(() => {
    const sessionId = new URLSearchParams(location.search).get("session_id");

    if (sessionId && processedSessionRef.current !== sessionId) {
      processedSessionRef.current = sessionId;

      const confirmPayment = async () => {
        try {
          setLoading(true);
          await appointmentApi.confirmStripePayment({
            ...bookingPayload,
            sessionId
          });

          sessionStorage.removeItem(PAYMENT_CONTEXT_KEY);
          sessionStorage.removeItem(PROCESSED_SESSION_KEY);
          toast.success("Payment successful! Your appointment is now confirmed.");
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

  if (loading && location.search.includes("session_id")) {
    return (
      <div className="min-h-screen bg-[var(--background)] pt-24 pb-12 px-4">
        <Header />
        <div className="max-w-md mx-auto">
          <div className="bg-[var(--card)] rounded-2xl p-8 shadow-xl border border-[var(--border)] text-center">
            <div className="w-12 h-12 border-4 border-[var(--primary)]/20 border-t-[var(--primary)] rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[var(--muted-foreground)] font-medium">Confirming your payment...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!bookingPayload) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pt-24 pb-12 px-4">
      <Header />
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[var(--muted-foreground)] hover:text-[var(--primary)] mb-6 group transition-colors"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Go Back</span>
        </button>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-[var(--card)] rounded-2xl p-8 shadow-lg border border-[var(--border)]">
              <h1 className="text-3xl font-bold text-[var(--foreground)] mb-6 flex items-center gap-3">
                <CreditCard className="text-[var(--primary)]" size={32} />
                Appointment Payment
              </h1>

              <div className="bg-[var(--secondary)] border border-[var(--primary)]/20 rounded-xl p-6 mb-8">
                <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Appointment Details</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-[var(--muted-foreground)]">Date & Time:</span>
                    <span className="font-semibold text-[var(--foreground)]">
                      {new Date(bookingPayload.appointmentTime).toLocaleString("en-IN", {
                        dateStyle: "long",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--muted-foreground)]">Reason:</span>
                    <span className="font-semibold text-[var(--foreground)]">{bookingPayload.reason}</span>
                  </div>
                  {bookingPayload.notes && (
                    <div className="flex justify-between">
                      <span className="text-[var(--muted-foreground)]">Notes:</span>
                      <span className="font-semibold text-[var(--foreground)]">{bookingPayload.notes}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Payment Method</h2>
                <div className="p-4 rounded-lg border-2 border-[var(--primary)] bg-[var(--secondary)]">
                  <div className="flex items-center gap-3 mb-2">
                    <CreditCard size={20} className="text-[var(--primary)]" />
                    <span className="font-semibold text-[var(--foreground)]">Card Payment</span>
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)]">Credit/Debit Card</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-4 bg-emerald-50/50 border border-emerald-200/50 rounded-lg">
                <Lock size={16} className="text-emerald-600" />
                <p className="text-sm text-emerald-700">
                  <strong>Secure Payment:</strong> Your payment is processed securely through Stripe with PCI DSS Level 1 compliance.
                </p>
              </div>
            </div>
          </div>

          <div>
            <div className="bg-[var(--card)] rounded-2xl p-6 shadow-lg border border-[var(--border)] sticky top-24">
              <h3 className="text-xl font-bold text-[var(--foreground)] mb-6">Payment Summary</h3>

              <div className="space-y-4 mb-6 pb-6 border-b border-[var(--border)]">
                <div className="flex justify-between">
                  <span className="text-[var(--muted-foreground)]">Consultation Fee</span>
                  <span className="font-semibold text-[var(--foreground)]">Rs 500</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted-foreground)]">Platform Fee</span>
                  <span className="font-semibold text-[var(--foreground)]">Rs 0</span>
                </div>
              </div>

              <div className="flex justify-between mb-8">
                <span className="text-lg font-bold text-[var(--foreground)]">Total Amount</span>
                <span className="text-2xl font-bold text-[var(--primary)]">Rs 500</span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full bg-[var(--primary)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-[var(--primary-foreground)] font-bold py-4 rounded-lg transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg"
              >
                {loading ? (
                  <>
                    <Loader size={20} className="animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={20} />
                    <span>Proceed to Payment</span>
                  </>
                )}
              </button>

              <p className="text-xs text-[var(--muted-foreground)] text-center mt-4">
                You will be redirected to Stripe's secure payment page
              </p>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={2500} />
    </div>
  );
};

export default PaymentPage;
