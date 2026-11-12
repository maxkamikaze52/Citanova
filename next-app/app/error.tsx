"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main id="main" className="narrow" style={{ padding: "80px 24px 0" }}>
      <p className="eyebrow">Ha fallado algo</p>
      <h1 className="serif" style={{ fontSize: 34, margin: "0 0 12px", color: "var(--ink)" }}>
        No hemos podido cargar esta página.
      </h1>
      <p role="alert" style={{ color: "var(--muted)", margin: "0 0 24px" }}>
        El fallo es nuestro, no tuyo. Vuelve a intentarlo y, si sigue pasando, escríbenos desde la
        página de contacto.
      </p>
      <button type="button" className="btn btn-primary" onClick={() => reset()}>
        Volver a intentarlo
      </button>
    </main>
  );
}
