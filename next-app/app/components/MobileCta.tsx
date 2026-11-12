"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Llamada a la acción fija abajo, solo en móvil (el CSS la oculta por encima de 640px). */
const SHOW_ON = new Set(["/", "/pricing"]);

export default function MobileCta() {
  const pathname = usePathname();
  if (!SHOW_ON.has(pathname)) return null;
  return (
    <>
      <div className="mobile-cta-spacer" aria-hidden="true" />
      <div className="mobile-cta">
        <Link href="/signup" className="btn btn-primary">
          Configurar tu asistente
        </Link>
      </div>
    </>
  );
}
