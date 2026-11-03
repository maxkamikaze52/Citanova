"use client";

import { useState } from "react";

/** A read-only value with a Copy button that tells you it worked. */
export default function CopyField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Clipboard blocked (insecure context): fall back to selecting the text.
      const area = document.createElement("textarea");
      area.value = value;
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div style={{ display: "grid", gap: 6 }}>
      <span style={{ fontSize: 12.5, color: "#5b7573", fontWeight: 600 }}>{label}</span>
      <div style={{ display: "flex", gap: 8, alignItems: "stretch" }}>
        <textarea
          readOnly
          value={value}
          rows={value.includes("\n") ? value.split("\n").length : 1}
          onFocus={(event) => event.currentTarget.select()}
          style={{
            flex: 1,
            padding: "10px 12px",
            border: "1px solid #dbe8e5",
            borderRadius: 9,
            fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace",
            fontSize: 12.5,
            lineHeight: 1.5,
            background: "#fff",
            color: "#0f2b2a",
            resize: "none",
          }}
        />
        <button
          type="button"
          onClick={copy}
          style={{
            padding: "0 16px",
            border: "1px solid #0f766e",
            background: copied ? "#0f766e" : "#fff",
            color: copied ? "#fff" : "#0f766e",
            borderRadius: 9,
            fontWeight: 600,
            fontSize: 13.5,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {copied ? "Copied ✓" : "Copy"}
        </button>
      </div>
    </div>
  );
}
