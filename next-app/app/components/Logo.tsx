/**
 * Logotipo de Citanova.
 *
 * Concepto: la marca es una **cita que se abre en abanico** — una hoja de
 * calendario que se despliega en tres radios. Las tres hojas dibujan una N
 * implícita y, a la vez, la idea del producto: un hueco que se convierte en
 * varios huecos disponibles.
 *
 * - `Mark`: el símbolo suelto (favicon, cabecera, arranque).
 * - `Wordmark`: "citanova" con la N convertida en el símbolo, así que la palabra
 *   se lee entera y el ojo cae en la marca.
 * - `Logo`: los dos juntos.
 *
 * Todo en SVG con `currentColor` para que herede el color del sitio.
 */

type MarkProps = { size?: number; className?: string; accent?: string };

/** El símbolo: tres hojas de agenda que se abren desde un mismo punto. */
export function Mark({ size = 28, className, accent = "currentColor" }: MarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      role="img"
      aria-label="Citanova"
    >
      {/* el punto de la cita */}
      <circle cx="7.4" cy="16" r="3" fill="currentColor" />
      {/* las tres hojas, en abanico: 0°, 42° y -42° */}
      <path
        d="M12.6 16h13"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M12.4 14.2 23 7.1"
        stroke={accent}
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M12.4 17.8 23 24.9"
        stroke={accent}
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      {/* el pulso de la agenda llena: un punto al final de la hoja central */}
      <circle cx="27.4" cy="16" r="2" fill="currentColor" opacity="0.45" />
    </svg>
  );
}

/** "citanova" con la N hecha abanico. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={`wm${className ? ` ${className}` : ""}`}>
      <span aria-hidden="true">
        <span className="wm-lead">cita</span>
        <span className="wm-n">
          <svg viewBox="0 0 30 40" fill="none">
            {/* N: dos astas + la diagonal convertida en las hojas */}
            <path d="M5 34V6" stroke="currentColor" strokeWidth="3.6" strokeLinecap="round" />
            <path d="M25 6v28" stroke="currentColor" strokeWidth="3.6" strokeLinecap="round" />
            <path d="M5 6 25 34" stroke="currentColor" strokeWidth="3.6" strokeLinecap="round" opacity="0.42" />
            {/* el abanico, en el cruce de la diagonal */}
            <circle cx="15" cy="20" r="2.6" fill="currentColor" />
            <path d="M17.6 19 25.5 13" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" opacity="0.7" />
            <path d="M17.6 21 25.5 27" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" opacity="0.7" />
          </svg>
        </span>
        <span className="wm-tail">nova</span>
      </span>
      <span className="sr-only">Citanova</span>
    </span>
  );
}

/** Símbolo + nombre, para cabeceras y pies. */
export function Logo({
  size = 26,
  showWord = true,
  className,
}: {
  size?: number;
  showWord?: boolean;
  className?: string;
}) {
  return (
    <span className={`logo${className ? ` ${className}` : ""}`}>
      <Mark size={size} />
      {showWord ? <Wordmark /> : null}
    </span>
  );
}
