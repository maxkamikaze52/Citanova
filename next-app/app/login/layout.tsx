import type { Metadata } from "next";
import SiteHeader from "../components/SiteHeader";

export const metadata: Metadata = {
  title: "Entrar",
  description: "Entra en tu clínica para ver las citas y el uso que ha hecho tu asistente.",
  alternates: { canonical: "/login" },
};

/**
 * /login lleva la cabecera pública a propósito: antes era una pantalla sin
 * navegación, y quien entraba sin cuenta se quedaba atrapado sin salida.
 */
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      {children}
    </>
  );
}
