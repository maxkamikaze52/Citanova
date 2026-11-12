"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main id="main" className="narrow" style={{ padding: "80px 24px 0" }}>
      <p className="eyebrow">Something went wrong</p>
      <h1 className="serif" style={{ fontSize: 34, margin: "0 0 12px" }}>We couldn’t load this page.</h1>
      <p role="alert" style={{ color: "var(--muted)", margin: "0 0 24px" }}>
        It’s on our side. Try again, and if it keeps happening, contact us.
      </p>
      <button type="button" className="btn btn-primary" onClick={() => reset()}>Try again</button>
    </main>
  );
}
