/**
 * Logotipo de Citanova.
 *
 * La marca es **una C que es a la vez un bocadillo**: el anillo abierto por la
 * derecha es la C del nombre, el rabillo de abajo a la izquierda la convierte en
 * burbuja de conversación, y dentro del hueco va un tick: la conversación que
 * termina en cita reservada.
 *
 * Un solo contorno, dos acentos. Se lee a 16 px porque no hay detalle fino: el
 * anillo, el rabillo y el tick. Nada de letras dibujadas dentro de la palabra.
 */

type MarkProps = {
  size?: number;
  className?: string;
  /** Color del tick. Por defecto, el azul de acción del sitio. */
  accent?: string;
  /** Versión de un solo color, para fondos claros o sellos. */
  mono?: boolean;
};

/** Geometría compartida con el favicon: si cambia aquí, cámbiala en icon.svg. */
export function Mark({ size = 28, className, accent = "#2997ff", mono = false }: MarkProps) {
  const tickColor = mono ? "currentColor" : accent;
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
      {/* La C: anillo grueso abierto por la derecha */}
      <path
        d="M22.6 9.6a9.3 9.3 0 1 0 0 12.9"
        stroke="currentColor"
        strokeWidth="3.6"
        strokeLinecap="round"
      />
      {/* El rabillo: lo que la convierte en bocadillo */}
      <path
        d="M10.1 21.9 7.3 26.4l5.6-1.5"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      {/* El tick, en el hueco de la C: la conversación que acaba en cita */}
      <path
        d="m18.6 15.4 2.1 2.3 4.4-5.2"
        stroke={tickColor}
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** El nombre: minúsculas, sin adornos, legible a cualquier tamaño. */
export function Wordmark({ className }: { className?: string }) {
  return <span className={`wm${className ? ` ${className}` : ""}`}>citanova</span>;
}

/** Símbolo + nombre, para cabeceras y pies. */
export function Logo({
  size = 26,
  showWord = true,
  className,
  mono = false,
}: {
  size?: number;
  showWord?: boolean;
  className?: string;
  mono?: boolean;
}) {
  return (
    <span className={`logo${className ? ` ${className}` : ""}`}>
      <Mark size={size} mono={mono} />
      {showWord ? <Wordmark /> : null}
    </span>
  );
}
