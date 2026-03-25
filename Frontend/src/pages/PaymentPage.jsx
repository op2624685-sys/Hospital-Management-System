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
  Calendar,
  User,
  Activity,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";

const stripePromise = loadStripe("pk_test_51QuHNoF7xZ6nC99F1lZp0r4qW5VjYm6n7jYm6n7jYm6n7jYm6n7jYm6n7jYm6n7jYm6n7jYm6n7j");

const CheckoutForm = ({ bookingPayload, clientSecret, appointmentId }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setIsProcessing(true);

    const cardElement = elements.getElement(CardElement);

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (error) {
        toast.error(error.message);
        setIsProcessing(false);
      } else if (paymentIntent.status === "succeeded") {
        const finalPayload = { ...bookingPayload, appointmentId };
        await appointmentApi.confirmAndBook(finalPayload, paymentIntent.id);
        toast.success("Payment successful! Your appointment is now confirmed.");
        navigate("/my-appointments", { replace: true });
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred during booking: " + (err.response?.data?.message || err.message || "Unknown error"));
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
        <label className="text-sm font-medium text-gray-700 mb-2 block">Card Details</label>
        <div className="p-3 bg-white rounded-lg border border-gray-300 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 transition-all">
          <CardElement options={{ style: { base: { fontSize: "16px", color: "#1e293b", "::placeholder": { color: "#94a3b8" } } } }} />
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-500 justify-center">
        <Lock size={12} />
        <span>Secure encrypted payment processed by Stripe</span>
      </div>
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-4 rounded-xl shadow-lg transform transition-all active:scale-[0.98] flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <CheckCircle2 size={20} />
        )}
        {isProcessing ? "Processing..." : "Pay & Confirm Appointment"}
      </button>
    </form>
  );
};

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingPayload = location.state?.bookingPayload;
  const doctorId = location.state?.doctorId;
  const [clientSecret, setClientSecret] = useState(null);
  const [appointmentId, setAppointmentId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookingPayload || !doctorId) {
      toast.error("No booking information found.");
      navigate("/appointment");
      return;
    }
    const initPayment = async () => {
      try {
        const response = await appointmentApi.createPaymentIntentForDoctor(doctorId, bookingPayload);
        // backend now returns { clientSecret, appointmentId }
        setClientSecret(response.data.clientSecret);
        setAppointmentId(response.data.appointmentId);
        setLoading(false);
      } catch (err) {
        console.error(err);
        toast.error("Failed to initialize payment.");
        setLoading(false);
      }
    };
    initPayment();
  }, [bookingPayload, doctorId, navigate]);

  if (!bookingPayload) return null;

  return (
    <div className="min-h-screen bg-[#f8fafc] pt-24 pb-12 px-4">
      <Header />
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8">
        <div className="flex-1 space-y-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-4 group">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Go Back</span>
          </button>
          
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-200">
            <h1 className="text-3xl font-bold text-slate-900 mb-8 flex items-center gap-3">
              <Activity className="text-blue-600" size={32} />
              Appointment Payment
            </h1>
            <div className="space-y-6">
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-blue-50 border border-blue-100">
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <User size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Booking for Slot</p>
                  <p className="text-xl font-bold text-slate-900">
                    {new Date(bookingPayload.appointmentTime).toLocaleString("en-IN", {
                      dateStyle: "long",
                      timeStyle: "short",
                    })}
                  </p>
                  <p className="text-blue-600 font-medium">Please review details before payment</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50">
                <div className="flex items-center gap-3 text-slate-500 mb-1">
                  <AlertCircle size={18} />
                  <span className="text-sm font-medium">Status</span>
                </div>
                <div className="flex-1 space-y-4 md:w-100">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <p className="font-bold text-slate-900">Awaiting Payment</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="md:w-100 shrink-0">
          <div className="sticky top-24">
            <div className="bg-white rounded-3xl p-8 shadow-2xl border border-slate-200">
              <div className="flex items-center gap-3 mb-8">
                <CreditCard size={20} className="text-blue-600" />
                <h2 className="text-xl font-bold text-slate-900">Payment</h2>
              </div>
              {loading ? (
                <div className="flex flex-col items-center py-12 space-y-4">
                  <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                  <p className="text-slate-500 font-medium">Securing connection...</p>
                </div>
              ) : clientSecret ? (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <CheckoutForm bookingPayload={bookingPayload} clientSecret={clientSecret} appointmentId={appointmentId} />
                </Elements>
              ) : (
                <p className="text-center text-red-500">Initialization failed.</p>
              )}
            </div>
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={2500} />
    </div>
  );
};

export default PaymentPage;