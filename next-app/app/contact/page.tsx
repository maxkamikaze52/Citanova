import type { Metadata } from "next";
import SiteHeader from "../components/SiteHeader";
import { CONTACT } from "../../lib/site";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Cómo escribirnos para dudas de soporte, facturación o privacidad.",
  alternates: { canonical: "/contact" },
};

export default function Contact() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="narrow prose">
        <h1 className="serif">Contacto</h1>
        <p className="meta">Contestamos a todos los mensajes, normalmente en un día laborable.</p>
        <h2>Correo</h2>
        <p><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></p>
        <h2>Teléfono</h2>
        <p>{CONTACT.phone}</p>
        <h2>Horario de soporte</h2>
        <p>{CONTACT.hours}</p>
        <h2>Dirección postal</h2>
        <p>{CONTACT.address}</p>
      </main>
    </>
  );
}
