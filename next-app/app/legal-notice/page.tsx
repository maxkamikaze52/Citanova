import type { Metadata } from "next";
import LegalPage from "../components/LegalPage";
import { CONTACT, LEGAL, SITE } from "../../lib/site";

export const metadata: Metadata = {
  title: "Aviso legal",
  description: "Identidad y datos de contacto del prestador del servicio, como exige la ley española.",
  alternates: { canonical: "/legal-notice" },
};

export default function LegalNotice() {
  return (
    <LegalPage title="Aviso legal">
      <p>Esta información se facilita conforme al artículo 10 de la Ley 34/2002 de servicios de la sociedad de la información y de comercio electrónico (LSSI-CE).</p>
      <ul>
        <li><strong>Prestador:</strong> {LEGAL.companyName}</li>
        <li><strong>NIF:</strong> {LEGAL.taxId}</li>
        <li><strong>Domicilio:</strong> {LEGAL.address}</li>
        <li><strong>Correo:</strong> <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></li>
        <li><strong>Teléfono:</strong> {CONTACT.phone}</li>
        <li><strong>Registro mercantil:</strong> {LEGAL.registry}</li>
        <li><strong>Web:</strong> {SITE.url}</li>
      </ul>
      <h2>Uso de la web</h2>
      <p>El acceso es gratuito. Usarla implica aceptar los <a href="/terms">términos y condiciones</a>.</p>
      <h2>Propiedad intelectual</h2>
      <p>Los textos, el diseño y el código de esta web pertenecen al prestador o a sus licenciantes y no pueden copiarse sin permiso.</p>
      <h2>Legislación aplicable</h2>
      <p>Se aplica la legislación española. Son competentes los juzgados y tribunales de {LEGAL.jurisdiction}, salvo que la ley disponga otra cosa.</p>
    </LegalPage>
  );
}
