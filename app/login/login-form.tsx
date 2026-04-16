"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { loginSchema, type LoginFormValues } from "@/app/login/login-schema";

interface LoginFormErrors {
  email?: string;
  password?: string;
  form?: string;
}

const initialValues: LoginFormValues = {
  email: "",
  password: "",
};

export function LoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<LoginFormErrors>({});

  function updateField<K extends keyof LoginFormValues>(
    field: K,
    value: LoginFormValues[K]
  ) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({
      ...current,
      [field]: undefined,
      form: undefined,
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedValues = loginSchema.safeParse(values);

    if (!parsedValues.success) {
      const fieldErrors = parsedValues.error.flatten().fieldErrors;

      setErrors({
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      });

      return;
    }

    setErrors({});

    startTransition(async () => {
      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(parsedValues.data),
        });

        if (response.ok) {
          router.push("/dashboard");
          router.refresh();
          return;
        }

        let errorMessage = "Unable to sign in right now. Try again.";

        try {
          const data = (await response.json()) as { error?: string };

          if (response.status === 401) {
            errorMessage = "Invalid email or password.";
          } else if (response.status === 400) {
            errorMessage = data.error || "Enter your email and password.";
          }
        } catch {
          if (response.status === 401) {
            errorMessage = "Invalid email or password.";
          }
        }

        setErrors({ form: errorMessage });
      } catch {
        setErrors({ form: "Unable to sign in right now. Try again." });
      }
    });
  }

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-zinc-900" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={values.email}
          onChange={(event) => updateField("email", event.target.value)}
          aria-invalid={errors.email ? "true" : "false"}
          aria-describedby={errors.email ? "email-error" : undefined}
          className="h-11 rounded-md border border-zinc-300 bg-white px-3 text-base text-zinc-950 outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10"
        />
        {errors.email ? (
          <p id="email-error" className="text-sm text-red-600">
            {errors.email}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-zinc-900" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={values.password}
          onChange={(event) => updateField("password", event.target.value)}
          aria-invalid={errors.password ? "true" : "false"}
          aria-describedby={errors.password ? "password-error" : undefined}
          className="h-11 rounded-md border border-zinc-300 bg-white px-3 text-base text-zinc-950 outline-none transition focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10"
        />
        {errors.password ? (
          <p id="password-error" className="text-sm text-red-600">
            {errors.password}
          </p>
        ) : null}
      </div>

      {errors.form ? (
        <div
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          role="alert"
        >
          {errors.form}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex h-11 items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
      >
        {isPending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
