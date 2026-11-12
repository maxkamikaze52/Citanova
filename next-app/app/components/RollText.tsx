/**
 * Ported from Skiper UI #58 (text roll navigation): each letter rolls up and its
 * duplicate arrives from below, staggered from the centre outward. Pure CSS here,
 * so it works in a server component and costs no JavaScript.
 */
const STAGGER = 0.022;

export default function RollText({ text }: { text: string }) {
  const mid = (text.length - 1) / 2;

  return (
    <span className="roll" aria-hidden="true">
      {text.split("").map((char, i) => (
        <span
          key={i}
          className="roll-char"
          style={{ ["--rd" as string]: `${(STAGGER * Math.abs(i - mid)).toFixed(3)}s` }}
        >
          <span className="roll-a">{char === " " ? "\u00a0" : char}</span>
          <span className="roll-b">{char === " " ? "\u00a0" : char}</span>
        </span>
      ))}
    </span>
  );
}
