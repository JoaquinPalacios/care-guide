import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ProductMark } from "@/app/(staff)/components/product-mark";
import { getAuthContext } from "@/lib/auth/session";
import { PRODUCT_NAME } from "@/lib/branding/product-name";

export const metadata: Metadata = {
  title: PRODUCT_NAME,
  description: "Staff workspace for Aftercare Guide.",
};

export default async function Home() {
  const authContext = await getAuthContext().catch(() => ({
    user: null,
    clinicMembership: null,
  }));

  if (authContext.user && authContext.clinicMembership) {
    redirect("/dashboard");
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-staff-canvas px-6 py-16">
      <section className="w-full max-w-2xl rounded-2xl border border-staff-line bg-staff-panel p-8 shadow-sm">
        <p className="flex items-center gap-2 text-sm font-semibold text-staff-brand">
          <ProductMark className="h-5 w-5" />
          {PRODUCT_NAME}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-staff-ink">
          Clinic portal
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-staff-muted">
          Sign in to manage your practice&apos;s patient aftercare guides.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/login"
            className="inline-flex h-10 items-center justify-center rounded-md bg-staff-brand px-4 text-sm font-medium text-staff-on-brand shadow-sm transition hover:bg-staff-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-staff-brand"
          >
            Staff sign in
          </Link>
        </div>
      </section>
    </main>
  );
}
