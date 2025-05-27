// app/checkout/CheckoutFormWrapper.tsx
"use client";

import dynamic from "next/dynamic";

const CheckoutForm = dynamic(() => import("./checkout-form").then((mod) => mod.CheckoutForm), {
  ssr: false, // ปิด SSR
});

export default function CheckoutFormWrapper() {
  return <CheckoutForm />;
}