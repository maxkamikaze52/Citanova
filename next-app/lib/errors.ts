/**
 * Un solo sitio para los mensajes de error que ve el usuario.
 *
 * Las rutas de API devuelven códigos (`invalid_body`, `backend_unreachable`…)
 * porque son estables para el registro y para las pruebas. Aquí se traducen al
 * español antes de pintarlos. Si llega un texto ya escrito, se respeta.
 */

const MESSAGES: Record<string, string> = {
  invalid_body: "Los datos no tienen el formato esperado. Repasa el formulario.",
  backend_unreachable: "No hay conexión con el servidor del asistente. Inténtalo en un minuto.",
  unauthorized: "Tu sesión ha caducado. Vuelve a entrar.",
  forbidden_origin: "Esa dirección no está autorizada.",
  no_practice: "Todavía no hay ninguna clínica en esta cuenta. Termina el alta primero.",
  login_required: "Tienes que entrar para hacer esto.",
  db_update_failed: "No hemos podido guardar el cambio. Inténtalo otra vez.",
  bad_upstream_response: "El servidor ha respondido algo que no entendemos. Inténtalo otra vez.",
  email_required: "Escribe tu correo y tu contraseña.",
  practice_name_required: "Escribe el nombre de la clínica.",
  invalid_timezone: "Elige una zona horaria válida.",
  email_in_use: "Ese correo ya tiene cuenta. Entra en lugar de crear otra.",
  account_exists: "Ese correo ya tiene cuenta. Entra en lugar de crear otra.",
  could_not_create: "No hemos podido crear la cuenta. Inténtalo otra vez.",
  could_not_check: "No hemos podido comprobar tu cuenta. Inténtalo otra vez.",
  already_has_practice: "Esta cuenta ya tiene una clínica. Entra en lugar de crear otra.",
  already_subscribed: "Esta clínica ya tiene una suscripción activa.",
  setup_incomplete: "Termina de configurar la clínica antes de pagar.",
  invalid_credentials: "El correo o la contraseña no son correctos.",
  rate_limited: "Demasiados intentos seguidos. Espera un momento e inténtalo de nuevo.",
  invalid_token: "La clave de operador no es válida.",
  not_found: "No lo hemos encontrado.",
  server_error: "Ha fallado algo por nuestra parte. Inténtalo otra vez.",
};

/** Código o texto → mensaje en español. Nunca devuelve una cadena vacía. */
export function userMessage(input: unknown, fallback = "Ha fallado algo. Inténtalo otra vez."): string {
  if (typeof input !== "string" || input.trim() === "") return fallback;
  const key = input.trim();
  const mapped = MESSAGES[key] ?? MESSAGES[key.toLowerCase()];
  if (mapped) return mapped;
  // Si ya viene redactado (tiene espacios), se muestra tal cual.
  if (/\s/.test(key)) return key;
  return fallback;
}
