import { redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { PageHeader } from '@/components/ui/PageHeader'
import { BillingActions } from '@/components/billing/BillingActions'
import { db } from '@/lib/db'
import { getCurrentDbUser } from '@/lib/get-current-db-user'
import { subscriptions, tenants } from '@/db/schema'

export default async function BillingPage() {
  const dbUser = await getCurrentDbUser()
  if (!dbUser) {
    redirect('/sign-in')
  }

  const [tenant] = await db
    .select()
    .from(tenants)
    .where(eq(tenants.id, dbUser.tenantId))
    .limit(1)

  if (!tenant) {
    redirect('/dashboard')
  }

  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.tenantId, dbUser.tenantId))
    .limit(1)

  const currentPlan = (tenant.plan as 'free' | 'starter' | 'pro') ?? 'free'

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing"
        description="View your current plan and manage billing through Stripe."
      />

      <section className="grid gap-4 lg:grid-cols-[0.9fr_0.5fr]">
        <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
              Current plan
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">
              {currentPlan === 'free'
                ? 'Free'
                : currentPlan === 'starter'
                  ? 'Starter'
                  : 'Pro'}
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Plan status</p>
              <p className="mt-2 font-semibold text-slate-900">
                {subscription?.status ?? 'Active'}
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Next billing date</p>
              <p className="mt-2 font-semibold text-slate-900">
                {subscription?.currentPeriodEnd
                  ? new Date(subscription.currentPeriodEnd).toLocaleDateString()
                  : 'Not set'}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            Billing is managed through Stripe. Use the portal to update payment
            methods or subscription settings.
          </p>
        </div>
      </section>

      <BillingActions
        currentPlan={currentPlan}
        starterPriceId={process.env.STRIPE_PRICE_STARTER ?? ''}
        proPriceId={process.env.STRIPE_PRICE_PRO ?? ''}
      />
    </div>
  )
}
