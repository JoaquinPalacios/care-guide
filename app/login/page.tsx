import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { LoginForm } from "@/app/login/login-form";

export const metadata: Metadata = {
  title: "Staff Sign In",
  description: "Sign in to the Care Guide staff dashboard.",
};

export default async function LoginPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-50 px-6 py-16">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <div className="mb-8 flex flex-col gap-2">
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-zinc-500">
            Care Guide
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">
            Staff sign in
          </h1>
          <p className="text-sm leading-6 text-zinc-600">
            Use your staff email and password to continue to the dashboard.
          </p>
        </div>

        <LoginForm />
      </div>
    </main>
  );
}
