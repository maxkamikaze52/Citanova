import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Practice sign in",
  description: "Sign in to see the appointments your AI assistant booked.",
  alternates: { canonical: "/login" },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
