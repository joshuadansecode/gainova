-- =============================================
-- GAINOVA — Schéma de base de données
-- Supabase / PostgreSQL
-- =============================================

-- 1. users
create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text not null,
  phone text not null,
  avatar_url text,
  role text not null default 'apprenant', -- 'apprenant' | 'admin'
  is_active boolean default true,
  referral_code text unique not null,
  referred_by uuid references users(id),
  balance numeric default 0,
  total_earned numeric default 0,
  pin_hash text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. payments
create table payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) not null,
  amount numeric not null,
  type text not null, -- 'inscription' | 'niveau_avance' | 'coaching' | 'boost' | 'prestation' | 'publicite'
  status text default 'pending', -- 'pending' | 'success' | 'failed'
  fedapay_transaction_id text unique,
  metadata jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. referrals
create table referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid references users(id) not null,
  referred_id uuid references users(id) not null,
  commission_amount numeric not null default 210,
  status text default 'pending', -- 'pending' | 'validated' | 'cancelled'
  created_at timestamptz default now(),
  validated_at timestamptz
);

-- 4. withdrawals
create table withdrawals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) not null,
  amount numeric not null,
  phone text not null,
  operator text not null, -- 'mtn' | 'moov'
  status text default 'pending', -- 'pending' | 'processing' | 'paid' | 'rejected'
  mode text not null, -- 'auto' | 'manual'
  fedapay_transaction_id text,
  processed_at timestamptz,
  created_at timestamptz default now()
);

-- 5. formations
create table formations (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text not null,
  cover_url text,
  is_published boolean default false,
  created_by uuid references users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 6. levels
create table levels (
  id uuid primary key default gen_random_uuid(),
  formation_id uuid references formations(id) on delete cascade not null,
  title text not null,
  level_order int not null,
  is_free boolean default true,
  price numeric default 0,
  created_at timestamptz default now()
);

-- 7. chapters
create table chapters (
  id uuid primary key default gen_random_uuid(),
  level_id uuid references levels(id) on delete cascade not null,
  title text not null,
  content_url text,
  chapter_order int not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 8. quizzes
create table quizzes (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid references chapters(id) on delete cascade not null,
  question text not null,
  option_a text not null,
  option_b text not null,
  option_c text not null,
  option_d text not null,
  correct_answer text not null, -- 'a' | 'b' | 'c' | 'd'
  created_at timestamptz default now()
);

-- 9. user_progress
create table user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade not null,
  chapter_id uuid references chapters(id) on delete cascade not null,
  is_completed boolean default false,
  quiz_passed boolean default false,
  completed_at timestamptz,
  unique(user_id, chapter_id)
);

-- 10. user_formations (niveaux payants débloqués)
create table user_formations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade not null,
  level_id uuid references levels(id) on delete cascade not null,
  payment_id uuid references payments(id),
  unlocked_at timestamptz default now(),
  unique(user_id, level_id)
);

-- 11. posts
create table posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade not null,
  content text,
  image_url text,
  type text default 'standard', -- 'standard' | 'sponsored' | 'pinned'
  status text default 'pending', -- 'pending' | 'approved' | 'rejected'
  expires_at timestamptz,
  is_pinned boolean default false,
  moderated_by uuid references users(id),
  moderated_at timestamptz,
  rejection_reason text,
  created_at timestamptz default now()
);

-- 12. post_boosts
create table post_boosts (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade not null,
  user_id uuid references users(id) not null,
  boost_type text not null, -- 'extra_post' | 'extend_48h' | 'pin'
  amount numeric not null,
  payment_id uuid references payments(id),
  created_at timestamptz default now()
);

-- 13. prestations
create table prestations (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text not null, -- 'document' | 'design' | 'web'
  price_min numeric not null,
  price_max numeric,
  is_on_quote boolean default false,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 14. orders
create table orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) not null,
  prestation_id uuid references prestations(id) not null,
  description text not null,
  amount numeric not null,
  status text default 'pending', -- 'pending' | 'in_progress' | 'delivered' | 'validated' | 'cancelled'
  payment_id uuid references payments(id),
  delivered_at timestamptz,
  validated_at timestamptz,
  revision_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 15. order_files
create table order_files (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade not null,
  file_url text not null,
  file_type text not null, -- 'brief' | 'deliverable' | 'revision'
  uploaded_by uuid references users(id),
  created_at timestamptz default now()
);

-- 16. coaching_sessions
create table coaching_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) not null,
  coach_id uuid references users(id) not null,
  type text default 'single', -- 'single' | 'pack'
  sessions_total int default 1,
  sessions_used int default 0,
  amount numeric not null,
  payment_id uuid references payments(id),
  status text default 'active', -- 'active' | 'completed' | 'cancelled'
  scheduled_at timestamptz,
  created_at timestamptz default now()
);

-- 17. notifications
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade not null,
  title text not null,
  message text not null,
  type text not null, -- 'commission' | 'retrait' | 'post' | 'order' | 'coaching' | 'system'
  is_read boolean default false,
  created_at timestamptz default now()
);

-- =============================================
-- INDEXES
-- =============================================
create index on users(referral_code);
create index on users(referred_by);
create index on referrals(referrer_id);
create index on user_progress(user_id);
create index on posts(status, expires_at);
create index on payments(user_id, status);
create index on withdrawals(user_id, status);
create index on notifications(user_id, is_read);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
alter table users enable row level security;
alter table payments enable row level security;
alter table withdrawals enable row level security;
alter table referrals enable row level security;
alter table user_progress enable row level security;
alter table user_formations enable row level security;
alter table posts enable row level security;
alter table post_boosts enable row level security;
alter table orders enable row level security;
alter table order_files enable row level security;
alter table coaching_sessions enable row level security;
alter table notifications enable row level security;

-- users : chacun voit son propre profil
create policy "users_own" on users for all using (auth.uid() = id);

-- payments
create policy "payments_own" on payments for all using (auth.uid() = user_id);

-- withdrawals
create policy "withdrawals_own" on withdrawals for all using (auth.uid() = user_id);

-- referrals
create policy "referrals_own" on referrals for select using (auth.uid() = referrer_id);

-- user_progress
create policy "progress_own" on user_progress for all using (auth.uid() = user_id);

-- user_formations
create policy "formations_own" on user_formations for all using (auth.uid() = user_id);

-- posts : approuvés visibles par tous les membres connectés
create policy "posts_approved_visible" on posts for select using (status = 'approved' and expires_at > now());
create policy "posts_own_insert" on posts for insert with check (auth.uid() = user_id);
create policy "posts_own_update" on posts for update using (auth.uid() = user_id);

-- post_boosts
create policy "boosts_own" on post_boosts for all using (auth.uid() = user_id);

-- orders
create policy "orders_own" on orders for all using (auth.uid() = user_id);

-- order_files
create policy "order_files_own" on order_files for select using (
  exists (select 1 from orders where orders.id = order_id and orders.user_id = auth.uid())
);

-- coaching_sessions
create policy "coaching_own" on coaching_sessions for all using (auth.uid() = user_id);

-- notifications
create policy "notifications_own" on notifications for all using (auth.uid() = user_id);
