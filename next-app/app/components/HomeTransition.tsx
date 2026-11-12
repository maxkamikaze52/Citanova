"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "./Logo";

/**
 * Transición de vuelta a la portada.
 *
 * Al pulsar un enlace a "/", en lugar de navegar en seco, se levanta una capa
 * con el logo (como el arranque de una app), y cuando la portada ya está
 * montada la capa sube y se va.
 *
 * - Respeta `prefers-reduced-motion`: en ese caso navega sin animación.
 * - No secuestra el clic con modificadores (⌘/Ctrl/clic central abren pestaña).
 * - Si algo falla, la navegación ocurre igualmente.
 */
const ENTER_MS = 620;
const EXIT_MS = 620;

export default function HomeTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<"idle" | "enter" | "exit">("idle");
  const timers = useRef<number[]>([]);
  const pending = useRef(false);

  const clear = useCallback(() => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  }, []);

  // Cuando la ruta ya es la portada, se retira la capa.
  useEffect(() => {
    if (!pending.current) return;
    if (pathname !== "/") return;
    pending.current = false;
    const t = window.setTimeout(() => {
      setPhase("exit");
      const t2 = window.setTimeout(() => setPhase("idle"), EXIT_MS);
      timers.current.push(t2);
    }, 90);
    timers.current.push(t);
  }, [pathname]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as HTMLElement | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      if (anchor.dataset.noTransition === "true") return;

      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      // Solo la portada, y solo si no estamos ya en ella.
      if (url.pathname !== "/" || window.location.pathname === "/") return;

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) return; // navegación normal

      event.preventDefault();
      clear();
      pending.current = true;
      setPhase("enter");

      const t = window.setTimeout(() => {
        router.push("/");
      }, ENTER_MS);
      timers.current.push(t);
    }

    // Fase de captura: hay que adelantarse al onClick de next/link, que si no
    // navega primero y deja la animación sin hacer.
    document.addEventListener("click", onClick, { capture: true });
    return () => {
      document.removeEventListener("click", onClick, { capture: true } as EventListenerOptions);
      clear();
    };
  }, [router, clear]);

  return (
    <div className={`home-veil${phase === "idle" ? "" : ` is-${phase}`}`} aria-hidden="true">
      <div className="home-veil-inner">
        <Logo size={40} className="logo-draw" />
      </div>
    </div>
  );
}
