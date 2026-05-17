/**
 * EmpireAuthRequest. Magic-link request form with success state.
 *
 * Owner: Empire Wireframe S197 (B1 Tab, Phase 3)
 * Routing: src/empire/AppRouter.tsx maps "/empire/auth/request" here.
 * Public surface (NOT wrapped by EmpireAuthGate). EmpireAuthGate redirects
 * unauthenticated visitors here with a ?next= deep-link target.
 *
 * Tonight: success state shows "Check your email" + a dev-mode console hint.
 * The Resend send is stubbed to a console.log inside sendMagicLink.ts so we
 * can smoke-test the gate end-to-end without a real send. Day 11 the same
 * form posts a real send through /api/empire/send-magic-link.
 *
 * Hard Rule #11: no em dashes.
 */

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, Terminal } from 'lucide-react'
import toast from 'react-hot-toast'
import { sendMagicLink } from './sendMagicLink'

const schema = z.object({
  email: z.string().email('Use a real email address.'),
})
type FormValues = z.infer<typeof schema>

type RequestState =
  | { phase: 'idle' }
  | { phase: 'sent'; email: string; devUrl?: string }

export function EmpireAuthRequest() {
  const [searchParams] = useSearchParams()
  const next = searchParams.get('next') ?? '/empire'
  const [state, setState] = useState<RequestState>({ phase: 'idle' })

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  })

  async function onSubmit(values: FormValues) {
    const result = await sendMagicLink({
      email: values.email,
      redirectUrl: next,
    })
    if (!result.ok) {
      toast.error(result.error ? `Could not send: ${result.error}.` : 'Could not send magic link.')
      return
    }
    toast.success('Magic link sent.')
    setState({ phase: 'sent', email: values.email, devUrl: result.magicLinkUrl })
  }

  if (state.phase === 'sent') {
    const devPathOnly = state.devUrl
      ? typeof window !== 'undefined'
        ? state.devUrl.replace(window.location.origin, '')
        : state.devUrl
      : null

    return (
      <div className="px-[6vw] py-24 max-w-xl" style={{ color: 'rgb(var(--color-fg))' }}>
        <div
          className="font-mono text-xs uppercase tracking-[0.2em] mb-4"
          style={{ color: 'rgb(var(--color-accent))' }}
        >
          Magic link sent
        </div>
        <h1 className="font-display text-4xl mb-3">Check your email.</h1>
        <p className="text-base mb-8" style={{ color: 'rgb(var(--color-fg-muted))' }}>
          We sent a sign-in link to <strong>{state.email}</strong>. Click it
          and you are in. Link expires in 30 minutes.
        </p>

        {devPathOnly ? (
          <div
            className="rounded-xl p-5 border"
            style={{
              background: 'rgb(var(--color-surface))',
              borderColor: 'rgb(var(--color-border))',
            }}
          >
            <div
              className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] mb-2"
              style={{ color: 'rgb(var(--color-accent))' }}
            >
              <Terminal className="w-3 h-3" aria-hidden="true" />
              Dev mode (S197 night)
            </div>
            <p className="text-sm mb-3" style={{ color: 'rgb(var(--color-fg-muted))' }}>
              Real Resend send wires Day 11. For tonight, the magic link was
              logged to your browser console. You can also click the link
              below to consume it directly.
            </p>
            <Link
              to={devPathOnly}
              className="font-mono text-xs break-all underline"
              style={{ color: 'rgb(var(--color-accent))' }}
            >
              {devPathOnly}
            </Link>
            <p
              className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em]"
              style={{ color: 'rgb(var(--color-fg-subtle))' }}
            >
              Console hint: open DevTools, expand "[Empire dev magic-link]" group.
            </p>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => setState({ phase: 'idle' })}
          aria-label="Resend a fresh magic link to the same email"
          className="mt-10 font-mono text-xs uppercase tracking-[0.2em] underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          style={{ color: 'rgb(var(--color-fg-subtle))' }}
        >
          Send a fresh link
        </button>
      </div>
    )
  }

  return (
    <div className="px-[6vw] py-24 max-w-xl" style={{ color: 'rgb(var(--color-fg))' }}>
      <div
        className="font-mono text-xs uppercase tracking-[0.2em] mb-4"
        style={{ color: 'rgb(var(--color-accent))' }}
      >
        Empire access
      </div>
      <h1 className="font-display text-4xl mb-3">Sign in.</h1>
      <p className="text-base mb-10" style={{ color: 'rgb(var(--color-fg-muted))' }}>
        Use your work email. We send a one-click magic link, no password to
        remember.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
        <div>
          <label
            className="block font-mono text-[10px] uppercase tracking-[0.18em] mb-2"
            style={{ color: 'rgb(var(--color-fg-subtle))' }}
            htmlFor="empire-email"
          >
            Work email
          </label>
          <input
            id="empire-email"
            type="email"
            autoComplete="email"
            placeholder="you@perennialempire.com"
            {...register('email')}
            className="w-full rounded-lg px-4 py-3 text-base outline-none transition-colors"
            style={{
              background: 'rgb(var(--color-surface-2))',
              border: '1px solid rgb(var(--color-border))',
              color: 'rgb(var(--color-fg))',
            }}
          />
          {errors.email ? (
            <p
              className="mt-2 text-xs"
              style={{ color: 'rgb(var(--color-accent))' }}
              role="alert"
            >
              {errors.email.message}
            </p>
          ) : null}
        </div>

        <button
          type="submit"
          className="btn btn-primary px-6 py-3 text-base"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Sending' : 'Send me the link'}
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </form>

      <p
        className="mt-12 font-mono text-xs uppercase tracking-[0.2em]"
        style={{ color: 'rgb(var(--color-fg-subtle))' }}
      >
        Returning here after sign-in: {next}
      </p>
    </div>
  )
}

export default EmpireAuthRequest
