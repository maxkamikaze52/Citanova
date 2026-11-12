import SiteHeader from "./SiteHeader";
import { LEGAL, LEGAL_REVIEWED } from "../../lib/site";

export default function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main id="main" className="narrow prose">
        {!LEGAL_REVIEWED ? (
          <p className="draft-note" role="note">
            <strong>Borrador.</strong> Un abogado todavía no ha revisado esta página. No la publiques tal como está.
          </p>
        ) : null}
        <h1 className="serif">{title}</h1>
        <p className="meta">Última actualización: {LEGAL.lastUpdated}</p>
        {children}
      </main>
    </>
  );
}
