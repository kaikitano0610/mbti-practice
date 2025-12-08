import React, { Suspense } from "react";
import { TranscriptProvider } from "@/app/contexts/TranscriptContext";
import App from "./App";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TranscriptProvider>
        <App />
      </TranscriptProvider>
    </Suspense>
  );
}