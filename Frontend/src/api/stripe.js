import { loadStripe } from "@stripe/stripe-js";

export const stripePromise = loadStripe("${STRIPE_PUBLIC_KEY}"); // publishable key