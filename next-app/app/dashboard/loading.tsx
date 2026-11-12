export default function Loading() {
  return (
    <main className="container" style={{ padding: "56px 24px" }} role="status" aria-label="Loading">
      <div className="skeleton" style={{ height: 36, width: "55%", marginBottom: 18 }} />
      <div className="skeleton" style={{ height: 18, width: "80%", marginBottom: 10 }} />
      <div className="skeleton" style={{ height: 18, width: "65%" }} />
    </main>
  );
}
