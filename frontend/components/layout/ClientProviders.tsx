"use client";

import { SpeakFlowProvider } from "@/context/SpeakFlowContext";

/**
 * Thin client-boundary wrapper so layout.tsx (a Server Component) can
 * safely include context providers that use browser-only APIs.
 */
export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return <SpeakFlowProvider>{children}</SpeakFlowProvider>;
}
