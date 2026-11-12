/**
 * Logotipo de Citanova.
 *
 * Símbolo: una cita que se abre en abanico — un punto fijo (el hueco) y tres
 * hojas que salen de él. Sirve para una pizzería, una clínica o una veterinaria,
 * porque no dibuja ningún oficio.
 *
 * La palabra va limpia, sin letras dibujadas: a 17px en una cabecera, una N
 * convertida en abanico se convierte en una mancha. El símbolo es el que
 * identifica; el nombre es el que se lee.
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
      <circle cx="7.2" cy="16" r="3.1" fill="currentColor" />
      {/* las tres hojas: centro, arriba y abajo */}
      <path d="M12.8 16h12.4" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M12.2 14.1 22.6 7.2" stroke={accent} strokeWidth="3.2" strokeLinecap="round" />
      <path d="M12.2 17.9 22.6 24.8" stroke={accent} strokeWidth="3.2" strokeLinecap="round" />
    </svg>
  );
}

/** El nombre, tal cual: minúsculas, sin adornos, legible a cualquier tamaño. */
export function Wordmark({ className }: { className?: string }) {
  return <span className={`wm${className ? ` ${className}` : ""}`}>citanova</span>;
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
