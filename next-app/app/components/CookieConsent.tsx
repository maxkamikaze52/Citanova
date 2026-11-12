"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { SITE } from "../../lib/site";

const KEY = "cookie-consent-v1";
const OPEN_EVENT = "open-cookie-settings";

type Choice = { analytics: boolean };

function readChoice(): Choice | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Choice) : null;
  } catch {
    return null;
  }
}

function clearAnalyticsCookies() {
  for (const part of document.cookie.split(";")) {
    const name = part.split("=")[0].trim();
    if (name === "_ga" || name.startsWith("_ga_")) {
      const host = window.location.hostname.split(".");
      for (let i = 0; i < host.length - 1; i++) {
        const domain = "." + host.slice(i).join(".");
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${domain}`;
      }
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    }
  }
}

/** Footer link that reopens the banner, so consent can be withdrawn as easily as it was given. */
export function CookieSettingsLink() {
  if (!SITE.analyticsId) return null;
  return (
    <button type="button" className="link-button" onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}>
      Ajustes de cookies
    </button>
  );
}

/**
 * Consent banner + consent-gated analytics. Nothing optional loads before the visitor chooses.
 * Accept, Reject and Settings sit on the first layer with identical styling (AEPD guidance).
 * Shown only when NEXT_PUBLIC_GA_ID is set: with no optional cookies there is nothing to ask.
 */
export default function CookieConsent() {
  const [ready, setReady] = useState(false);
  const [choice, setChoice] = useState<Choice | null>(null);
  const [open, setOpen] = useState(false);
  const [panel, setPanel] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    const saved = readChoice();
    setChoice(saved);
    setAnalytics(saved?.analytics ?? false);
    setOpen(saved === null);
    setReady(true);
    const reopen = () => {
      setPanel(true);
      setOpen(true);
    };
    window.addEventListener(OPEN_EVENT, reopen);
    return () => window.removeEventListener(OPEN_EVENT, reopen);
  }, []);

  function save(next: Choice) {
    const hadAnalytics = choice?.analytics === true;
    try {
      window.localStorage.setItem(KEY, JSON.stringify({ ...next, at: new Date().toISOString() }));
    } catch {
      /* storage blocked: the choice only lasts for this page view */
    }
    setChoice(next);
    setAnalytics(next.analytics);
    setOpen(false);
    setPanel(false);
    if (hadAnalytics && !next.analytics) {
      clearAnalyticsCookies();
      window.location.reload(); // drops the already-loaded analytics script
    }
  }

  if (!SITE.analyticsId || !ready) return null;

  return (
    <>
      {choice?.analytics ? (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${SITE.analyticsId}`} strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${SITE.analyticsId}');`}
          </Script>
        </>
      ) : null}

      {open ? (
        <div className="cookie-banner" role="dialog" aria-modal="false" aria-labelledby="cookie-title">
          <h2 id="cookie-title">Cookies</h2>
          <p>
            Usamos cookies necesarias para mantener tu sesión abierta. Con tu permiso usamos también
            cookies de analítica para ver cómo se usa la web. Lee nuestra{" "}
            <Link href="/cookies">política de cookies</Link>.
          </p>

          {panel ? (
            <div style={{ marginBottom: 14 }}>
              <label className="cookie-option">
                <input type="checkbox" checked disabled />
                <span>
                  <strong>Necesarias</strong>
                  <br />
                  Inicio de sesión y seguridad. Siempre activas.
                </span>
              </label>
              <label className="cookie-option">
                <input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} />
                <span>
                  <strong>Analítica</strong>
                  <br />
                  Google Analytics: estadísticas de visita anónimas.
                </span>
              </label>
              <div style={{ marginTop: 10 }}>
                <button type="button" className="btn btn-primary" onClick={() => save({ analytics })}>
                  Guardar preferencias
                </button>
              </div>
            </div>
          ) : null}

          <div className="cookie-actions">
            <button type="button" className="btn btn-secondary" onClick={() => save({ analytics: true })}>
              Aceptar todo
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => save({ analytics: false })}>
              Rechazar todo
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setPanel((p) => !p)} aria-expanded={panel}>
              Ajustes
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
