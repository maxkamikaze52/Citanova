"use client";

import { useEffect, useRef, useState } from "react";
import {
  COUNTRIES,
  countryByIso,
  countryForTimezone,
  formatNumber,
  placeholderFor,
  splitNumber,
  toE164,
} from "../../lib/countries";

type Props = {
  /** Stored E.164 value ("+34612345678"), or "" when empty. */
  value: string;
  /** Called with E.164, or "" when the field is cleared. */
  onChange: (next: string) => void;
  /** Which country the picker starts on; defaults to the practice timezone. */
  timeZone?: string | null;
  style?: React.CSSProperties;
  id?: string;
};

const field: React.CSSProperties = {
  padding: "10px 12px",
  border: "1px solid #dbe8e5",
  borderRadius: 9,
  fontSize: 14.5,
  fontFamily: "inherit",
  background: "#fff",
  color: "#0f2b2a",
  boxSizing: "border-box",
};

/**
 * A phone field that accepts any country on earth.
 *
 * People type numbers in whatever shape they know ("612 345 678", "0034 612…",
 * "+44 7700 900123"), so the picker is a convenience, not a requirement: paste a
 * full international number and the country switches itself. What leaves the
 * field is always E.164, which is what WhatsApp/SMS and the CRM expect.
 */
export default function PhoneField({ value, onChange, timeZone, style, id }: Props) {
  const fallbackIso = countryForTimezone(timeZone);
  const first = splitNumber(value, fallbackIso);
  const [iso, setIso] = useState(first.iso);
  const [national, setNational] = useState(first.national);

  // Remember what we last emitted, so a save round-trip does not fight typing.
  const emitted = useRef(value);
  useEffect(() => {
    if (value === emitted.current) return;
    const parsed = splitNumber(value, fallbackIso);
    setIso(parsed.iso);
    setNational(parsed.national);
    emitted.current = value;
  }, [value, fallbackIso]);

  const country = countryByIso(iso) ?? COUNTRIES[0];

  function emit(nextIso: string, nextNational: string) {
    const next = countryByIso(nextIso) ?? COUNTRIES[0];
    const e164 = toE164(next.dial, nextNational, next.iso);
    emitted.current = e164;
    onChange(e164);
  }

  function onNumberChange(raw: string) {
    // Pasting "+34 612 345 678" or "0044 7700 900123" should not need the picker.
    const looksInternational = /^\s*(\+|00)/.test(raw);
    if (looksInternational) {
      const parsed = splitNumber(raw, iso);
      setIso(parsed.iso);
      setNational(parsed.national);
      emit(parsed.iso, parsed.national);
      return;
    }
    const digits = raw.replace(/[^\d]/g, "").slice(0, 15);
    setNational(digits);
    emit(iso, digits);
  }

  const shown = value ? formatNumber(country.dial, national) : "";

  return (
    <div style={{ display: "grid", gap: 6 }}>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.6fr)", gap: 8 }}>
        <select
          aria-label="Country calling code"
          value={iso}
          onChange={(event) => {
            setIso(event.target.value);
            emit(event.target.value, national);
          }}
          style={{ ...field, ...style, cursor: "pointer" }}
        >
          {COUNTRIES.map((c) => (
            <option key={c.iso} value={c.iso}>
              {c.flag} {c.name} (+{c.dial})
            </option>
          ))}
        </select>

        <input
          id={id}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          value={national}
          onChange={(event) => onNumberChange(event.target.value)}
          placeholder={placeholderFor(iso)}
          style={{ ...field, ...style, width: "100%" }}
        />
      </div>

      <span style={{ fontSize: 12.5, color: shown ? "#0b5a54" : "#5b7573", fontWeight: 400 }}>
        {shown ? (
          <>
            Saved as <strong style={{ fontWeight: 600 }}>{shown}</strong>
          </>
        ) : (
          "Any country works — pick yours, or paste a number with +country code."
        )}
      </span>
    </div>
  );
}
