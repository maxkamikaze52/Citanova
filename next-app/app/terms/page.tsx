import type { Metadata } from "next";
import LegalPage from "../components/LegalPage";
import { LEGAL } from "../../lib/site";

export const metadata: Metadata = {
  title: "Términos y condiciones",
  description: "Las condiciones que se aplican cuando un negocio usa el servicio de recepcionista con IA.",
  alternates: { canonical: "/terms" },
};

export default function Terms() {
  return (
    <LegalPage title="Términos y condiciones">
      <h2>1. Quiénes somos</h2>
      <p>El servicio lo presta {LEGAL.companyName}, {LEGAL.taxId}, {LEGAL.address} («nosotros»). Se ofrece a empresas y profesionales, no a consumidores.</p>
      <h2>2. El servicio</h2>
      <p>{SITE_NAME} ofrece un asistente de chat con IA que el negocio coloca en su web para responder dudas de clientes y reservar citas, además de un panel y una fuente de calendario de solo lectura.</p>
      <h2>3. Cuentas</h2>
      <p>Debes dar datos veraces, mantener tus credenciales a salvo y responder de la actividad hecha con tu cuenta. Solo puede usarlo personal autorizado por el negocio.</p>
      <h2>4. Planes y pago</h2>
      <p>Los planes se facturan mensualmente con Stripe, a los precios que figuran en la página de precios. Los precios incluyen IVA. Las suscripciones se renuevan hasta que se cancelen. [FILL IN: condiciones de cancelación y devoluciones]</p>
      <h2>5. Datos de clientes</h2>
      <p>El negocio es el responsable del tratamiento de los datos de sus clientes y nosotros actuamos como encargados. Un contrato de encargo de tratamiento conforme al art. 28 RGPD forma parte de estas condiciones. [FILL IN: enlace o anexo del contrato]</p>
      <h2>6. Los límites del asistente</h2>
      <p>El asistente es automático y puede equivocarse. No da consejo médico, ni diagnósticos, ni indicaciones de urgencia. El negocio sigue siendo responsable de sus citas, de las decisiones sobre su servicio y de revisar las reservas en el panel.</p>
      <h2>7. Uso aceptable</h2>
      <p>No usarás el servicio de forma indebida, no intentarás romperlo ni sobrecargarlo, no accederás a datos de otras clínicas y no lo usarás para fines ilícitos.</p>
      <h2>8. Disponibilidad</h2>
      <p>Trabajamos para que el servicio esté siempre en marcha, pero no garantizamos que sea ininterrumpido ni que esté libre de errores. [FILL IN: compromiso de disponibilidad, si lo hay]</p>
      <h2>9. Propiedad intelectual</h2>
      <p>Conservamos todos los derechos sobre el servicio. Tú conservas los derechos sobre tu contenido y nos das el permiso necesario para prestar el servicio.</p>
      <h2>10. Responsabilidad</h2>
      <p>Nada limita la responsabilidad que la ley impide limitar. Fuera de eso, nuestra responsabilidad total se limita a [FILL IN: p. ej. las cuotas pagadas en los últimos 12 meses] y no respondemos de daños indirectos ni del lucro cesante.</p>
      <h2>11. Terminación</h2>
      <p>Puedes cancelar cuando quieras. Podemos suspender o dar de baja el servicio ante un incumplimiento grave, avisando cuando sea razonable.</p>
      <h2>12. Cambios</h2>
      <p>Podemos actualizar estas condiciones y te avisaremos con antelación de los cambios sustanciales.</p>
      <h2>13. Ley y tribunales</h2>
      <p>Se aplica la legislación española. Son competentes los juzgados y tribunales de {LEGAL.jurisdiction}, salvo que la ley disponga otra cosa.</p>
    </LegalPage>
  );
}

const SITE_NAME = "Citanova";
