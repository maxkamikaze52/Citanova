/**
 * Un solo sitio para todo lo que identifica al negocio detrás de la web.
 * Rellena los valores [FILL IN] una vez: el pie, la página de contacto y las páginas
 * legales leen de aquí. Busca lo que queda con:  grep -rn "FILL IN" app lib
 */
export const SITE = {
  name: "YourAI", // cámbialo cuando la marca sea definitiva (regenera también los iconos)
  tagline: "Asistentes de IA para clínicas dentales",
  description:
    "Una recepcionista con IA para clínicas dentales. Responde las dudas de los pacientes, reserva citas y se sincroniza con tu calendario, en tu propia web.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3002",
  locale: "es_ES",
  analyticsId: process.env.NEXT_PUBLIC_GA_ID || "", // id de GA4, p. ej. G-XXXXXXXXXX. Vacío = sin analítica.
} as const;

/** Identidad legal: la ley española la exige en la web (LSSI-CE, art. 10). */
export const LEGAL = {
  companyName: "[FILL IN: razón social o nombre completo si eres autónomo]",
  taxId: "[FILL IN: NIF / CIF]",
  address: "[FILL IN: domicilio fiscal, código postal, ciudad, España]",
  registry: "[FILL IN: datos del Registro Mercantil (tomo, folio, hoja), o bórralo si eres autónomo]",
  privacyEmail: "[FILL IN: correo de privacidad]",
  jurisdiction: "[FILL IN: ciudad cuyos juzgados son competentes, p. ej. Barcelona]",
  lastUpdated: "[FILL IN: fecha, DD/MM/AAAA]",
} as const;

export const CONTACT = {
  email: "[FILL IN: correo de soporte]",
  phone: "[FILL IN: teléfono, opcional]",
  hours: "[FILL IN: horario de soporte, p. ej. L–V 09:00–17:00 (CET)]",
  address: LEGAL.address,
} as const;

/**
 * Ponlo en true solo cuando un abogado haya revisado las páginas legales.
 * Mientras esté en false, cada página legal muestra un aviso visible de borrador.
 */
export const LEGAL_REVIEWED = false;
