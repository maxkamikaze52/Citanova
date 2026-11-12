/**
 * Logotipo de Citadent.
 *
 * La idea: las dos primeras letras, C y D, se dibujan de forma que la C es un
 * diente (un arco con dos raíces abajo) y la D es la mitad del mismo diente.
 * Juntas forman una sola pieza, así que se lee "CD" pero se reconoce un molar.
 *
 * - `Mark` es el símbolo suelto (favicon, cabecera, capa de arranque).
 * - `Wordmark` es el nombre con la D convertida en el diente: se lee "Citadent"
 *   y el ojo cae justo en la marca.
 * - `Logo` junta los dos.
 *
 * Todo va en SVG con `currentColor`, así que hereda el color del sitio.
 */

type MarkProps = {
  size?: number;
  className?: string;
  /** El diente interior, en un color más claro que el trazo. */
  accent?: string;
};

/** El símbolo: un diente formado por la C y la D. */
export function Mark({ size = 28, className, accent = "currentColor" }: MarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      role="img"
      aria-label="Citadent"
    >
      {/* La C: arco del diente, abierto arriba a la derecha */}
      <path
        d="M23.5 6.4A10.2 10.2 0 1 0 23.5 23.6"
        stroke="currentColor"
        strokeWidth="3.1"
        strokeLinecap="round"
      />
      {/* La D: la otra mitad del diente, con el trazo recto a la izquierda */}
      <path
        d="M16 5.2h2.1a10.3 10.3 0 0 1 0 20.6H16"
        stroke={accent}
        strokeWidth="3.1"
        strokeLinecap="round"
      />
      {/* Las dos raíces: lo que lo convierte en diente y no en un círculo */}
      <path
        d="M12.4 22.2v3.9M19.6 22.2v3.9"
        stroke="currentColor"
        strokeWidth="3.1"
        strokeLinecap="round"
      />
      {/* El hueco de la muela, apenas insinuado */}
      <path d="M16 12.6v6.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.55" />
    </svg>
  );
}

/** El nombre con la D hecha diente. Se lee y se reconoce a la vez. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={`wm${className ? ` ${className}` : ""}`}>
      {/* Las letras visibles van ocultas al lector de pantalla: la D está
          dibujada, así que sin esto se oiría "Cita Citadent dent". */}
      <span aria-hidden="true">
        <span className="wm-lead">Cita</span>
        <span className="wm-d">
          <svg viewBox="0 0 26 40" fill="none">
            {/* D: asta recta + panza */}
            <path
              d="M4 4v32M4 4h4.5a16 16 0 0 1 0 32H4"
              stroke="currentColor"
              strokeWidth="3.4"
              strokeLinecap="round"
            />
            {/* dos raíces, para que la D sea también el diente */}
            <path d="M9 31.4v5.2M15.4 31.4v5.2" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" />
          </svg>
        </span>
        <span className="wm-tail">dent</span>
      </span>
      <span className="sr-only">Citadent</span>
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
