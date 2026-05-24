import { useState } from "react";

const COPY_FEEDBACK_MS = 1400;

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      legacyCopy(text);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), COPY_FEEDBACK_MS);
  };

  return (
    <button
      type="button"
      className={`egkn-copy-btn ${copied ? "is-copied" : ""}`}
      onClick={onCopy}
      aria-label="Копировать ID"
      title="Копировать ID"
    >
      {copied ? "✓ Скопировано" : "📋 Копировать"}
    </button>
  );
}

function legacyCopy(text: string): void {
  const ta = document.createElement("textarea");
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand("copy");
  } finally {
    document.body.removeChild(ta);
  }
}
