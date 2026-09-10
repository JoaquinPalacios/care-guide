"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleLogout() {
    setError(null);

    startTransition(async () => {
      try {
        const response = await fetch("/api/auth/logout", {
          method: "POST",
        });

        if (!response.ok) {
          setError("Unable to sign out right now.");
          return;
        }

        router.replace("/login");
        router.refresh();
      } catch {
        setError("Unable to sign out right now.");
      }
    });
  }

  return (
    <div className={className ?? "flex flex-col items-start gap-2"}>
      <button
        type="button"
        onClick={handleLogout}
        disabled={isPending}
        className="staffBtn staffBtnQuiet px-0"
      >
        {isPending ? "Signing out..." : "Sign out"}
      </button>
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
