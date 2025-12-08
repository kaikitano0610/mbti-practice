import React, { Suspense } from "react";
import { TranscriptProvider } from "@/app/contexts/TranscriptContext";
import App from "./App";
import Top from "./Top";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TranscriptProvider>
        <Top />
      </TranscriptProvider>
    </Suspense>
  );
}