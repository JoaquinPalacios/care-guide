import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-50 px-6 py-16">
      <section className="w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.14em] text-zinc-500">
          Care Guide
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950">
          Internal staff workspace
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-600">
          This temporary landing page keeps local testing focused while the
          staff workflow is still being built. Use the login page to access the
          protected dashboard and procedure templates.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/login"
            className="inline-flex h-9 items-center justify-center rounded-md border border-zinc-300 bg-white px-3 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950"
          >
            Open login
          </Link>
          <Link
            href="/dashboard/procedures"
            className="inline-flex h-9 items-center justify-center rounded-md px-3 text-sm font-medium text-zinc-600 transition hover:text-zinc-950"
          >
            View procedures
          </Link>
        </div>
      </section>
    </main>
  );
}
