import type { Metadata } from "next";
import SiteHeader from "../components/SiteHeader";

export const metadata: Metadata = {
  title: "Configurar el asistente",
  description:
    "Crea tu clínica, recibe tu asistente y pega una línea en tu web. Se tarda unos minutos.",
  alternates: { canonical: "/signup" },
};

/** Igual que /login: cabecera pública para que siempre haya salida. */
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      {children}
    </>
  );
}
