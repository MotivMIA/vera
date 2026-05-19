"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      theme="dark"
      position="top-right"
      toastOptions={{
        style: {
          background: "#0d0f13",
          border: "1px solid rgba(255,255,255,.12)",
          color: "#f6f4ef",
        },
      }}
    />
  );
}
