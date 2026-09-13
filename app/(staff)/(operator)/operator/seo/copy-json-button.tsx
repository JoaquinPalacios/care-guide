"use client";

import { useState } from "react";

export function CopyJsonButton({
  label,
  text,
}: {
  label: string;
  text: string;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      className="staffBtn staffBtnSecondary"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 2000);
        } catch {
          setCopied(false);
        }
      }}
    >
      {copied ? `${label} copied` : `Copy ${label}`}
    </button>
  );
}
