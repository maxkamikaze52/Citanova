import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Set up your assistant",
  description: "Create your practice, get your assistant and paste one line into your website. It takes a few minutes.",
  alternates: { canonical: "/signup" },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
