CREATE TABLE IF NOT EXISTS subscriptions (
  id text PRIMARY KEY,
  tenant_id text NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  stripe_customer_id text NOT NULL,
  stripe_price_id text,
  status text NOT NULL DEFAULT 'active',
  current_period_end timestamp,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_tenant_id_uidx ON subscriptions(tenant_id);
CREATE INDEX IF NOT EXISTS subscriptions_stripe_customer_id_idx ON subscriptions(stripe_customer_id);
