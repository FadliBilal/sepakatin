-- ==============================================================================
-- Sepakatin — Migrasi 006: Penyelesaian Transaksi Pembayaran Atomik (Atomic Settlement)
-- Menghilangkan race condition & menjamin konsistensi ACID antara payment_orders dan profiles.
-- ==============================================================================

create or replace function public.settle_payment_order(
  p_order_id text,
  p_gateway_tx_id text default null,
  p_webhook_payload jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order record;
  v_now timestamptz := clock_timestamp();
  v_expires_at timestamptz := v_now + interval '30 days';
  v_profile record;
  v_new_credits integer;
begin
  -- 1. Kunci baris order untuk update (Row-level lock) guna mencegah pemrosesan paralel
  select * into v_order
  from public.payment_orders
  where order_id = p_order_id
  for update;

  if not found then
    return jsonb_build_object(
      'success', false,
      'code', 'ORDER_NOT_FOUND',
      'message', 'Order tidak ditemukan'
    );
  end if;

  -- 2. Jika sudah PAID, kembalikan status idempotensi tanpa mengubah data lagi
  if v_order.status = 'PAID' then
    return jsonb_build_object(
      'success', true,
      'status', 'ALREADY_PAID',
      'order_id', v_order.order_id,
      'user_id', v_order.user_id,
      'package_type', v_order.package_type,
      'message', 'Order sudah lunas sebelumnya'
    );
  end if;

  -- 3. Kunci profil pengguna
  select * into v_profile
  from public.profiles
  where id = v_order.user_id
  for update;

  if not found then
    return jsonb_build_object(
      'success', false,
      'code', 'PROFILE_NOT_FOUND',
      'message', 'Profil pengguna tidak ditemukan'
    );
  end if;

  -- 4. Update status order menjadi PAID
  update public.payment_orders
  set
    status = 'PAID',
    paid_at = v_now,
    gateway_transaction_id = coalesce(p_gateway_tx_id, v_order.gateway_transaction_id),
    metadata = jsonb_set(
      coalesce(v_order.metadata, '{}'::jsonb),
      '{webhook_payload}',
      coalesce(p_webhook_payload, '{}'::jsonb)
    ),
    updated_at = v_now
  where id = v_order.id;

  -- 5. Berikan hak akses sesuai package_type secara atomik
  if v_order.package_type = 'credit_1' then
    v_new_credits := coalesce(v_profile.project_credits, 0) + 1;
    update public.profiles
    set
      project_credits = v_new_credits,
      updated_at = v_now
    where id = v_profile.id;
  elsif v_order.package_type = 'pro_monthly' then
    update public.profiles
    set
      plan = 'pro',
      plan_expires_at = v_expires_at,
      updated_at = v_now
    where id = v_profile.id;
  end if;

  return jsonb_build_object(
    'success', true,
    'status', 'SETTLED',
    'order_id', v_order.order_id,
    'user_id', v_order.user_id,
    'user_email', v_order.user_email,
    'package_type', v_order.package_type,
    'amount', v_order.amount,
    'paid_at', v_now
  );
end;
$$;

revoke all on function public.settle_payment_order(text, text, jsonb) from public, anon;
grant execute on function public.settle_payment_order(text, text, jsonb) to service_role;
