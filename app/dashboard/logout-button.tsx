"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function LogoutButton() {
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
    <div className="flex flex-col items-start gap-2 sm:items-end">
      <button
        type="button"
        onClick={handleLogout}
        disabled={isPending}
        className="inline-flex h-10 items-center justify-center rounded-md border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950 disabled:cursor-not-allowed disabled:opacity-60"
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
