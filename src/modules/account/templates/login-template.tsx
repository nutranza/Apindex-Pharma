"use client"

import { Suspense } from "react"

import EmailPasswordLogin from "@modules/account/components/email-password-login"
import AuthShell from "@modules/account/components/auth-shell"

type LoginTemplateProps = {
  next?: string
  returnUrl?: string
  error?: string
  authError?: string
}

const LoginTemplateContent = ({
  next,
  returnUrl,
  error,
  authError,
}: LoginTemplateProps) => {
  return (
    <AuthShell
      title="Welcome to Apindex"
      subtitle="Enter your admin email ID and password to continue"
    >
      <EmailPasswordLogin
        next={next}
        returnUrl={returnUrl}
        initialError={error || authError}
      />
    </AuthShell>
  )
}

const LoginTemplate = (props: LoginTemplateProps) => {
  return (
    <Suspense
      fallback={
        <div className="w-full h-full flex items-center justify-center p-8">
          Loading...
        </div>
      }
    >
      <LoginTemplateContent {...props} />
    </Suspense>
  )
}

export default LoginTemplate
