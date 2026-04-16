import type { Metadata } from "next";

import { auth } from "@/auth";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Temporary dashboard landing page for Care Guide staff.",
};

export default async function DashboardPage() {
  const session = await auth();

  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-50 px-6 py-16">
      <div className="w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.14em] text-zinc-500">
          Care Guide
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950">
          Dashboard
        </h1>
        <p className="mt-3 text-sm leading-6 text-zinc-600">
          This is a temporary post-login landing page for Issue #4. Protected
          dashboard behavior starts in Issue #5.
        </p>
        {session?.user ? (
          <p className="mt-6 rounded-md bg-zinc-100 px-4 py-3 text-sm text-zinc-700">
            Signed in as {session.user.email}.
          </p>
        ) : (
          <p className="mt-6 rounded-md bg-zinc-100 px-4 py-3 text-sm text-zinc-700">
            No active session detected.
          </p>
        )}
      </div>
    </main>
  );
}
