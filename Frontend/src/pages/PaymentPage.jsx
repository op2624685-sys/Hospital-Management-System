import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { appointmentApi } from "../api/appointments";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "../components/Header";
import {
  CreditCard,
  Lock,
  Smartphone,
  QrCode,
  User,
  Activity,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
const PAYMENT_CONTEXT_KEY = "hms_pending_payment_context";

const PAYMENT_METHODS = [
  {
    id: "credit_card",
    label: "Credit Card",
    backendValue: "CREDIT_CARD",
    description: "Pay using your credit card.",
    icon: CreditCard,
  },
  {
    id: "debit_card",
    label: "Debit Card",
    backendValue: "DEBIT_CARD",
    description: "Pay using your debit card.",
    icon: CreditCard,
  },
  {
    id: "upi",
    label: "UPI",
    backendValue: "UPI",
    description: "Pay instantly with UPI.",
    icon: Smartphone,
  },
];

const getSelectedMethodConfig = (methodId) =>
  PAYMENT_METHODS.find((method) => method.id === methodId) ?? PAYMENT_METHODS[0];

const buildUpiUri = ({ upiVpa, payeeName, amount, note }) => {
  const params = new URLSearchParams({
    pa: upiVpa,
    pn: payeeName,
    am: String(amount),
    cu: "INR",
    tn: note || "HMS Appointment",
  });
  return `upi://pay?${params.toString()}`;
};

const CheckoutForm = ({
  bookingPayload,
  doctorId,
  clientSecret,
  appointmentId,
  selectedMethod,
  upiInitData,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [upiOption, setUpiOption] = useState("upi_id");
  const [upiId, setUpiId] = useState("");
  const [upiTransactionId, setUpiTransactionId] = useState("");
  const isCardFlow = selectedMethod.id === "credit_card" || selectedMethod.id === "debit_card";
  const isUpiFlow = selectedMethod.id === "upi";
  const upiUri = isUpiFlow && upiInitData ? (upiInitData.upiUri || buildUpiUri(upiInitData)) : "";
  const upiQrUrl = upiUri
    ? `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(upiUri)}`
    : "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isUpiFlow && (!stripe || !elements)) return;
    setIsProcessing(true);

    try {
      const finalPayload = { ...bookingPayload, appointmentId };
      if (isUpiFlow) {
        if (!upiTransactionId.trim()) {
          toast.error("Please enter UPI transaction reference (UTR).");
          setIsProcessing(false);
          return;
        }
        await appointmentApi.confirmUpiAndBook(
          { ...finalPayload, paymentMethod: "UPI" },
          upiTransactionId.trim()
        );
        sessionStorage.removeItem(PAYMENT_CONTEXT_KEY);
        toast.success("UPI payment confirmed! Your appointment is now booked.");
        navigate("/my-appointments", { replace: true });
        return;
      }

      sessionStorage.setItem(
        PAYMENT_CONTEXT_KEY,
        JSON.stringify({
          bookingPayload: finalPayload,
          doctorId,
          selectedMethodId: selectedMethod.id,
        })
      );

      let paymentResult;
      if (isCardFlow) {
        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
          toast.error("Card details are required.");
          setIsProcessing(false);
          return;
        }
        paymentResult = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
          },
        });
      } else {
        setIsProcessing(false);
        return;
      }

      const { error, paymentIntent } = paymentResult;

      if (error) {
        toast.error(error.message);
        setIsProcessing(false);
      } else if (paymentIntent.status === "succeeded") {
        await appointmentApi.confirmAndBook(finalPayload, paymentIntent.id);
        sessionStorage.removeItem(PAYMENT_CONTEXT_KEY);
        toast.success("Payment successful! Your appointment is now confirmed.");
        navigate("/my-appointments", { replace: true });
      } else {
        toast.info("Payment is processing. Please wait a moment and try again.");
        setIsProcessing(false);
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred during booking: " + (err.response?.data?.message || err.message || "Unknown error"));
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 bg-[var(--sidebar)] rounded-xl border border-[var(--border)]">
        <label className="text-sm font-medium text-[var(--foreground)] mb-2 block">
          {selectedMethod.label} Details
        </label>
        {isCardFlow ? (
          <div className="p-3 bg-[var(--card)] rounded-lg border border-[var(--input)] shadow-sm focus-within:ring-2 focus-within:ring-[var(--ring)] transition-all">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: "16px",
                    color: "var(--foreground)",
                    "::placeholder": { color: "var(--muted-foreground)" },
                  },
                },
              }}
            />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setUpiOption("upi_id")}
                className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                  upiOption === "upi_id" 
                  ? "border-[var(--primary)] bg-[var(--secondary)] text-[var(--secondary-foreground)] shadow-sm scale-[1.02]" 
                  : "border-[var(--border)] text-[var(--muted-foreground)]"
                }`}
              >
                Enter UPI ID
              </button>
              <button
                type="button"
                onClick={() => setUpiOption("qr")}
                className={`rounded-lg border px-3 py-2 text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                  upiOption === "qr" 
                  ? "border-[var(--primary)] bg-[var(--secondary)] text-[var(--secondary-foreground)] shadow-sm scale-[1.02]" 
                  : "border-[var(--border)] text-[var(--muted-foreground)]"
                }`}
              >
                <QrCode size={14} />
                Scan QR
              </button>
            </div>
            <div className="p-2 rounded-lg bg-[var(--secondary)] border border-[var(--primary)]/20 text-xs text-[var(--secondary-foreground)]">
              {upiOption === "upi_id"
                ? "Use your UPI app and approve using UPI ID flow."
                : "Open your UPI app and scan the generated QR to complete payment."}
            </div>
            <div className="p-3 bg-[var(--card)] rounded-lg border border-[var(--border)]">
              <p className="text-xs text-[var(--muted-foreground)] mb-2">Pay To UPI ID</p>
              <p className="text-sm font-semibold text-[var(--foreground)]">{upiInitData?.upiVpa || "UPI VPA not configured"}</p>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">Amount: ₹{upiInitData?.amount ?? "-"}</p>
            </div>
            {upiOption === "upi_id" ? (
              <div className="p-3 bg-[var(--card)] rounded-lg border border-[var(--border)] space-y-2">
                <label className="text-xs text-[var(--muted-foreground)]">Your UPI ID (optional)</label>
                <input
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="example@oksbi"
                  className="w-full border border-[var(--input)] rounded-lg px-3 py-2 text-sm bg-[var(--background)] text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--ring)]/20"
                />
                {upiUri && (
                  <a
                    href={upiUri}
                    className="inline-flex items-center rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] px-3 py-2 text-sm font-medium hover:opacity-90 transition-all"
                  >
                    Open UPI App
                  </a>
                )}
              </div>
            ) : (
              <div className="p-3 bg-[var(--card)] rounded-lg border border-[var(--border)]">
                {upiQrUrl ? (
                  <div className="bg-white p-2 rounded-lg inline-block mx-auto">
                    <img src={upiQrUrl} alt="UPI Payment QR" className="w-[220px] h-[220px]" />
                  </div>
                ) : (
                  <p className="text-sm text-[var(--destructive)]">UPI QR is unavailable. UPI configuration is missing.</p>
                )}
              </div>
            )}
            <div className="p-3 bg-[var(--card)] rounded-lg border border-[var(--border)] space-y-2">
              <label className="text-xs text-[var(--muted-foreground)]">UPI Transaction Reference (UTR)</label>
              <input
                value={upiTransactionId}
                onChange={(e) => setUpiTransactionId(e.target.value)}
                placeholder="Enter UTR after payment"
                className="w-full border border-[var(--input)] rounded-lg px-3 py-2 text-sm bg-[var(--background)] text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--ring)]/20"
              />
              <p className="text-xs text-[var(--muted-foreground)]">After paying by UPI ID or QR, enter UTR and confirm booking.</p>
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)] justify-center">
        <Lock size={12} />
        <span>
          {isUpiFlow
            ? `UPI checkout (${upiOption === "upi_id" ? "UPI ID" : "QR"})`
            : `Secure encrypted payment processed by Stripe (${selectedMethod.label})`}
        </span>
      </div>
      <button
        type="submit"
        disabled={(!isUpiFlow && !stripe) || isProcessing}
        className="w-full bg-[var(--primary)] hover:opacity-90 disabled:opacity-50 text-[var(--primary-foreground)] font-semibold py-4 rounded-xl shadow-lg transform transition-all active:scale-[0.98] flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <CheckCircle2 size={20} />
        )}
        {isProcessing ? "Processing..." : isUpiFlow ? "Confirm UPI Payment & Book" : "Pay & Confirm Appointment"}
      </button>
    </form>
  );
};

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
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
  const [clientSecret, setClientSecret] = useState(null);
  const [appointmentId, setAppointmentId] = useState(null);
  const [upiInitData, setUpiInitData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUpiAutoChecking, setIsUpiAutoChecking] = useState(false);
  const [selectedMethodId, setSelectedMethodId] = useState(cachedContext?.selectedMethodId ?? PAYMENT_METHODS[0].id);
  const selectedMethod = getSelectedMethodConfig(selectedMethodId);

  useEffect(() => {
    if (selectedMethod.id === "upi") return;
    const paymentIntentId = new URLSearchParams(location.search).get("payment_intent");
    if (!paymentIntentId || !bookingPayload) return;

    const finalizeRedirectPayment = async () => {
      setLoading(true);
      try {
        await appointmentApi.confirmAndBook(bookingPayload, paymentIntentId);
        sessionStorage.removeItem(PAYMENT_CONTEXT_KEY);
        toast.success("Payment successful! Your appointment is now confirmed.");
        navigate("/my-appointments", { replace: true });
      } catch (err) {
        console.error(err);
        toast.error("Payment was not completed: " + (err.response?.data?.message || err.message || "Unknown error"));
      } finally {
        setLoading(false);
      }
    };

    finalizeRedirectPayment();
  }, [bookingPayload, location.search, navigate, selectedMethod.id]);

  useEffect(() => {
    if (selectedMethod.id !== "upi" || !upiInitData?.orderId) return;

    let cancelled = false;
    setIsUpiAutoChecking(true);
    const intervalId = setInterval(async () => {
      try {
        const statusResponse = await appointmentApi.getUpiOrderStatus(upiInitData.orderId);
        const orderStatus = statusResponse.data?.status;
        if (!cancelled && orderStatus === "PAID") {
          sessionStorage.removeItem(PAYMENT_CONTEXT_KEY);
          toast.success("UPI payment received via webhook. Appointment confirmed.");
          navigate("/my-appointments", { replace: true });
        }
      } catch {
        // Keep polling; webhook may still be in progress.
      }
    }, 5000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
      setIsUpiAutoChecking(false);
    };
  }, [navigate, selectedMethod.id, upiInitData?.orderId]);

  useEffect(() => {
    const hasRedirectPaymentIntent = new URLSearchParams(location.search).has("payment_intent");
    if (hasRedirectPaymentIntent) return;

    if (!bookingPayload || !doctorId) {
      toast.error("No booking information found.");
      navigate("/appointment");
      return;
    }
    const initPayment = async () => {
      setLoading(true);
      try {
        let response;
        if (selectedMethod.id === "upi") {
          response = await appointmentApi.initiateUpiPaymentForDoctor(doctorId, {
            ...bookingPayload,
            paymentMethod: "UPI",
          });
          setUpiInitData(response.data);
        } else {
          response = await appointmentApi.createPaymentIntentForDoctor(doctorId, {
            ...bookingPayload,
            paymentMethod: selectedMethod.backendValue,
          });
          setUpiInitData(null);
          setClientSecret(response.data.clientSecret);
        }

        const payloadWithAppointmentId = {
          ...bookingPayload,
          appointmentId: response.data.appointmentId,
        };
        sessionStorage.setItem(
          PAYMENT_CONTEXT_KEY,
          JSON.stringify({
            bookingPayload: payloadWithAppointmentId,
            doctorId,
            selectedMethodId,
          })
        );
        setAppointmentId(response.data.appointmentId);
      } catch (err) {
        console.error(err);
        toast.error("Failed to initialize payment.");
        setClientSecret(null);
        setAppointmentId(null);
        setUpiInitData(null);
      } finally {
        setLoading(false);
      }
    };
    initPayment();
  }, [bookingPayload, doctorId, navigate, selectedMethod.backendValue]);

  if (!bookingPayload) return null;

  return (
    <div className="min-h-screen bg-[var(--background)] pt-24 pb-12 px-4">
      <Header />
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8">
        <div className="flex-1 space-y-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[var(--muted-foreground)] hover:text-[var(--primary)] mb-4 group transition-colors">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Go Back</span>
          </button>
          
          <div className="bg-[var(--card)] rounded-3xl p-8 shadow-xl border border-[var(--border)] overflow-hidden relative">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[var(--primary)]/10 to-transparent blur-3xl -translate-y-32 translate-x-32" />
            
            <h1 className="text-3xl font-bold text-[var(--foreground)] mb-8 flex items-center gap-3 relative z-10">
              <Activity className="text-[var(--primary)]" size={32} />
              Appointment Payment
            </h1>
            <div className="space-y-6 relative z-10">
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-[var(--secondary)] border border-[var(--primary)]/10">
                <div className="w-12 h-12 rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center shrink-0 shadow-lg shadow-[var(--primary)]/20">
                  <User size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--muted-foreground)] uppercase tracking-wider">Booking for Slot</p>
                  <p className="text-xl font-bold text-[var(--foreground)]">
                    {new Date(bookingPayload.appointmentTime).toLocaleString("en-IN", {
                      dateStyle: "long",
                      timeStyle: "short",
                    })}
                  </p>
                  <p className="text-[var(--primary)] font-medium mt-1">Please review details before payment</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--sidebar)]">
                <div className="flex items-center gap-3 text-[var(--muted-foreground)] mb-1">
                  <AlertCircle size={18} />
                  <span className="text-sm font-medium">Status</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shadow-glow shadow-amber-500/50" />
                  <p className="font-bold text-[var(--foreground)]">Awaiting Payment</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="md:w-100 shrink-0">
          <div className="sticky top-24">
            <div className="bg-[var(--card)] rounded-3xl p-8 shadow-2xl border border-[var(--border)]">
              <div className="flex items-center gap-3 mb-8">
                <CreditCard size={20} className="text-[var(--primary)]" />
                <h2 className="text-xl font-bold text-[var(--foreground)]">Select Method</h2>
              </div>
              <div className="grid grid-cols-1 gap-3 mb-6">
                {PAYMENT_METHODS.map((method) => {
                  const MethodIcon = method.icon;
                  const isActive = selectedMethodId === method.id;
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setSelectedMethodId(method.id)}
                      className={`rounded-xl border p-4 text-left transition-all group ${
                        isActive
                          ? "border-[var(--primary)] bg-[var(--secondary)] shadow-sm scale-[1.02]"
                          : "border-[var(--border)] hover:border-[var(--ring)] bg-[var(--background)]"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-1">
                        <div className={`p-2 rounded-lg transition-colors ${isActive ? "bg-[var(--primary)] text-[var(--primary-foreground)]" : "bg-[var(--sidebar)] text-[var(--muted-foreground)]"}`}>
                          <MethodIcon size={18} />
                        </div>
                        <p className={`font-semibold ${isActive ? "text-[var(--secondary-foreground)]" : "text-[var(--foreground)]"}`}>{method.label}</p>
                      </div>
                      <p className={`text-xs ${isActive ? "text-[var(--secondary-foreground)]/70" : "text-[var(--muted-foreground)]"}`}>{method.description}</p>
                    </button>
                  );
                })}
              </div>
              
              {selectedMethod.id === "upi" && upiInitData?.orderId && (
                <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                  <p className="text-xs text-emerald-800">
                    Order ID: <span className="font-semibold">{upiInitData.orderId}</span>
                  </p>
                  <p className="text-xs text-emerald-700 mt-1">
                    {isUpiAutoChecking
                      ? "Auto-checking status via webhook..."
                      : "Webhook ready."}
                  </p>
                </div>
              )}
              
              {loading ? (
                <div className="flex flex-col items-center py-12 space-y-4">
                  <div className="w-12 h-12 border-4 border-[var(--primary)]/20 border-t-[var(--primary)] rounded-full animate-spin" />
                  <p className="text-[var(--muted-foreground)] font-medium">Securing connection...</p>
                </div>
              ) : selectedMethod.id === "upi" || clientSecret ? (
                <Elements
                  key={`${selectedMethodId}-${clientSecret}`}
                  stripe={stripePromise}
                  options={clientSecret ? { clientSecret } : {}}
                >
                  <CheckoutForm
                    bookingPayload={bookingPayload}
                    doctorId={doctorId}
                    clientSecret={clientSecret}
                    appointmentId={appointmentId}
                    selectedMethod={selectedMethod}
                    upiInitData={upiInitData}
                  />
                </Elements>
              ) : (
                <p className="text-center text-[var(--destructive)]">Initialization failed.</p>
              )}
            </div>
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={2500} />
      <style>{`
        .shadow-glow {
          box-shadow: 0 0 10px var(--tw-shadow-color);
        }
      `}</style>
    </div>
  );
};

export default PaymentPage;
