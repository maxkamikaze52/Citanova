import type { Metadata } from "next";
import LegalPage from "../components/LegalPage";
import { LEGAL, SITE } from "../../lib/site";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description: "Cómo recogemos, usamos y protegemos los datos personales según el RGPD.",
  alternates: { canonical: "/privacy" },
};

export default function Privacy() {
  return (
    <LegalPage title="Política de privacidad">
      <p>
        Esta política explica cómo {SITE.name} trata los datos personales. Afecta a dos grupos de
        personas: el personal de el negocio que crea una cuenta (aquí somos responsables del
        tratamiento) y los clientes que hablan con un asistente en la web de un negocio (aquí el
        negocio es el responsable y nosotros sus encargados).
      </p>
      <h2>1. Quién es el responsable</h2>
      <p>
        {LEGAL.companyName}, {LEGAL.taxId}, {LEGAL.address}. Contacto de privacidad:{" "}
        <a href={`mailto:${LEGAL.privacyEmail}`}>{LEGAL.privacyEmail}</a>.
      </p>
      <h2>2. Datos que tratamos de las cuentas de negocio</h2>
      <ul>
        <li>Datos de la cuenta y de el negocio: nombre, correo, teléfono, dirección, web, zona horaria y contraseña (guardada con hash por nuestro proveedor de autenticación).</li>
        <li>Facturación: la gestiona Stripe. Recibimos el estado del plan y del pago, nunca el número completo de la tarjeta.</li>
        <li>Uso: número de mensajes, registros y eventos de seguridad necesarios para prestar y proteger el servicio.</li>
      </ul>
      <p>Finalidades y bases jurídicas: prestar el servicio y ejecutar el contrato (art. 6.1.b RGPD); seguridad, prevención del fraude y mejora del servicio (interés legítimo, art. 6.1.f); obligaciones fiscales y contables (obligación legal, art. 6.1.c); y analítica solo con tu consentimiento (art. 6.1.a).</p>
      <h2>3. Datos de clientes tratados por cuenta de un negocio</h2>
      <p>
        Cuando un cliente usa el chat, tratamos la conversación y los datos de la reserva (por
        ejemplo, nombre, teléfono, tratamiento solicitado y hora de la cita). Las conversaciones
        pueden contener información de salud, que es una categoría especial de datos (art. 9 RGPD).
        Solo la tratamos siguiendo las instrucciones de el negocio y al amparo de un contrato de
        encargo de tratamiento (art. 28 RGPD), y solo para responder al cliente y hacer la reserva.
        Los clientes deben dirigirse a el negocio para ejercer sus derechos.
      </p>
      <h2>4. Con quién compartimos datos</h2>
      <p>Usamos estos proveedores (encargados del tratamiento). [FILL IN: confirma y completa esta lista antes de publicar]</p>
      <ul>
        <li>Base de datos y autenticación: Supabase. [FILL IN: región]</li>
        <li>Procesamiento del modelo de lenguaje: OpenAI.</li>
        <li>Pagos: Stripe.</li>
        <li>Conexión con el calendario, si el negocio la activa: Google.</li>
        <li>Alojamiento web: [FILL IN: proveedor y región]</li>
      </ul>
      <h2>5. Transferencias internacionales</h2>
      <p>Algunos proveedores están fuera del Espacio Económico Europeo o acceden a datos desde allí. Cuando ocurre, nos amparamos en el Marco de Privacidad de Datos UE–EE. UU. o en las Cláusulas Contractuales Tipo. [FILL IN: confírmalo para cada proveedor]</p>
      <h2>6. Cuánto tiempo guardamos los datos</h2>
      <p>Los datos de la cuenta, mientras esté activa y durante los plazos legales de conservación posteriores. Los datos de conversaciones y citas, durante el periodo acordado con cada negocio. [FILL IN: plazos de conservación]</p>
      <h2>7. Tus derechos</h2>
      <p>
        Puedes solicitar acceso, rectificación, supresión, limitación, portabilidad y oposición, y
        retirar tu consentimiento en cualquier momento, escribiendo a{" "}
        <a href={`mailto:${LEGAL.privacyEmail}`}>{LEGAL.privacyEmail}</a>. También puedes reclamar
        ante la Agencia Española de Protección de Datos (AEPD),{" "}
        <a href="https://www.aepd.es">www.aepd.es</a>.
      </p>
      <h2>8. Cookies</h2>
      <p>Consulta nuestra <a href="/cookies">política de cookies</a>.</p>
      <h2>9. El asistente con IA</h2>
      <p>El chat es un sistema de IA. Se lo dice a los clientes, y no da consejo médico ni diagnósticos.</p>
      <h2>10. Cambios</h2>
      <p>
        Publicaremos aquí cualquier cambio y actualizaremos la fecha de arriba. Si el cambio es
        importante, avisaremos por correo a las clínicas con cuenta.
      </p>
    </LegalPage>
  );
}
