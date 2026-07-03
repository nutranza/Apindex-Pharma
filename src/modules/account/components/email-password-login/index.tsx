"use client"

import { useActionState } from "react"

import { loginAdminWithPassword } from "@/lib/data/admin-auth"
import Input from "@modules/common/components/input"
import { SubmitButton } from "@modules/checkout/components/submit-button"

type Props = {
  next?: string
  returnUrl?: string
  initialError?: string
}

const LOGIN_ERROR_MESSAGES: Record<string, string> = {
  admin_only: "Please sign in with an administrator account.",
  invalid_or_expired_link: "That sign-in link is invalid or expired.",
}

function resolveInitialError(error?: string): string | null {
  if (!error) {
    return null
  }

  return LOGIN_ERROR_MESSAGES[error] || "Please sign in again."
}

const EmailPasswordLogin = ({ next, returnUrl, initialError }: Props) => {
  const [state, formAction, isPending] = useActionState(
    loginAdminWithPassword,
    null
  )
  const errorMessage =
    state && !state.success ? state.error : resolveInitialError(initialError)

  return (
    <form className="w-full flex flex-col gap-y-5" action={formAction}>
      <input type="hidden" name="returnUrl" value={returnUrl || ""} />
      <input type="hidden" name="next" value={next || ""} />

      {errorMessage && (
        <div
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          role="alert"
        >
          {errorMessage}
        </div>
      )}

      <Input
        label="Email ID"
        name="email"
        type="email"
        required
        autoComplete="email"
        disabled={isPending}
        data-testid="admin-email-input"
      />

      <Input
        label="Password"
        name="password"
        type="password"
        required
        autoComplete="current-password"
        disabled={isPending}
        data-testid="admin-password-input"
      />

      <SubmitButton
        data-testid="admin-login-button"
        isLoading={isPending}
        className="w-full rounded-xl py-4 bg-primary border-primary shadow-none hover:bg-foreground transition-all"
      >
        Submit
      </SubmitButton>
    </form>
  )
}

export default EmailPasswordLogin
