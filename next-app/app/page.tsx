import Link from "next/link";
export default function Home() {
  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "96px 24px" }}>
      <h1 style={{ fontSize: 48, lineHeight: 1.1 }}>An assistant that books your patients while you work.</h1>
      <p style={{ fontSize: 18, color: "#4b5f5c" }}>Answers questions, books appointments and syncs with your calendar, on your own website.</p>
      <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        <Link href="/pricing" style={{ background: "#0f766e", color: "#fff", padding: "12px 20px", borderRadius: 8, textDecoration: "none" }}>See pricing</Link>
        <Link href="/signup" style={{ background: "#0f766e", color: "#fff", padding: "12px 20px", borderRadius: 8, textDecoration: "none" }}>Set up an assistant</Link>
        <Link href="/login" style={{ color: "#0f766e", textDecoration: "none" }}>Practice sign in →</Link>
      </div>
    </main>
  );
}
